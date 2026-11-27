import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

async function ask(page,text){
 await page.locator('#query').fill(text);
 await page.locator('#ask button').click();
}

test('search, approved multi-intent note and draft, reload, recall and neighborhood',async({page})=>{
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await ask(page,"I'm looking for a one-bedroom rental under eighteen hundred near a school and bus");
 await expect(page.locator('#lens')).toContainText('3450 Elm Ave');
 await expect(page.locator('#match-summary')).toContainText('$1,800');
 await ask(page,'Remember that I want to measure the sofa then draft a question asking what fees are required?');
 await expect(page.locator('#lens')).toContainText('Save note');
 await expect(page.locator('#notebook')).toBeEmpty();
 await ask(page,'yes please');
 await expect(page.locator('#lens')).toContainText('Prepare draft');
 await expect(page.locator('#drafts')).toHaveText('No questions drafted.');
 await ask(page,'confirm');
 await expect(page.locator('#drafts')).toContainText('what fees are required?');
 await page.reload();
 await ask(page,'What did I notice here?');
 await expect(page.locator('#lens')).toContainText('measure the sofa');
 await ask(page,'What schools are nearby?');
 await expect(page.locator('#lens')).toContainText('Hampden Elementary');
 expect(errors).toEqual([]);
});

test('phone speech result initiates search; canceled note discards queued draft',async({page})=>{
 await page.addInitScript(()=>{window.SpeechRecognition=class{
  start(){this.onresult({results:[[{transcript:'a rental under eighteen hundred near a bus'}]]})}
 }});
 await page.goto('/');
 await page.locator('#speak-preferences').click();
 await expect(page.locator('#lens')).toContainText('3450 Elm Ave');
 await ask(page,'Remember that I should check parking then draft a question asking about parking');
 await ask(page,'never mind');
 await expect(page.locator('#notebook')).toBeEmpty();
 await expect(page.locator('#drafts')).toHaveText('No questions drafted.');
 await page.locator('#alert-enabled').check();
 await expect(page.locator('#alert-status')).toContainText('Reminders only');
});

test('configured planner cannot approve a draft',async({page})=>{
 await page.route('**/api/config',r=>r.fulfill({json:{ai:true,gmail:false,provider:'openai'}}));
 await page.route('**/api/conversation',r=>r.fulfill({json:{actions:[{type:'draft',text:'Confirm the fee?'},{type:'confirm'}]}}));
 await page.goto('/');
 await expect(page.locator('#status')).toContainText('OpenAI');
 await ask(page,'Remember that I want to revisit');
 await expect(page.locator('#lens')).toContainText('Save note');
 await ask(page,'I am still thinking');
 await expect(page.locator('#notebook')).toBeEmpty();
 await expect(page.locator('#drafts')).toHaveText('No questions drafted.');
});

test('synthesized speech goes through the actual local HTTP recognizer',async({request})=>{
 test.skip(!process.env.TOUR_TEST_WAV,'Provide a 16 kHz mono WAV of “remember the kitchen” and local Vosk model');
 const r=await request.post('/api/audio',{headers:{'Content-Type':'audio/wav'},data:await readFile(process.env.TOUR_TEST_WAV)});
 expect(r.status()).toBe(200);
 expect((await r.json()).text).toBe('remember the kitchen');
});

test('budget follow-up preserves proximity and due reminders deduplicate',async({page})=>{
 await page.goto('/');
 await ask(page,"I'm looking for a one-bedroom rental under eighteen hundred near a school");
 await ask(page,'Actually make that seventeen hundred');
 await expect(page.locator('#match-summary')).toContainText('$1,700');
 await expect(page.locator('#match-summary')).toContainText('school');
 await page.locator('#journey-stage').selectOption('Tour');
 await page.locator('#journey-note').fill('Measure kitchen');
 await page.locator('#journey-date').fill('2020-01-01');
 await page.locator('#journey-form button').click();
 await page.locator('#alert-enabled').check();
 await expect(page.locator('#alert-list')).toContainText('Reminder: Measure kitchen');
 await page.locator('#alert-check').click();
 await expect(page.locator('#alert-status')).toContainText('0 new alerts');
 await expect(page.locator('#alert-list .entry')).toHaveCount(1);
});

test('text and email composers require approval and preserve recipient',async({page})=>{
 await page.goto('/');
 await ask(page,'Find me a rental under eighteen hundred');
 await page.locator('#contact-role').selectOption('Landlord');
 await page.locator('#contact-phone').fill('+12025550123');
 await page.locator('#contact-email').fill('tour@example.com');
 await page.locator('#contact-form button').click();
 await ask(page,'Text the landlord: Is parking included?');
 await expect(page.locator('#lens')).toContainText('Text draft');
 await expect(page.locator('#drafts a')).toHaveCount(0);
 await ask(page,'confirm');
 await expect(page.getByRole('link',{name:'Review in Messages'})).toHaveAttribute('href',/^sms:\+12025550123/);
 await ask(page,'Email the landlord: Can I schedule a tour?');
 await ask(page,'confirm');
 await expect(page.getByRole('link',{name:'Review in email app'})).toHaveAttribute('href',/^mailto:tour@example.com/);
});
