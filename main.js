import {householdRank,householdSummary} from './household.js';
import {calendarFile,communicationStatus} from './scheduling.js';
import {scanAlerts} from './alerts.js';
import {position,commute,resources,neighborhoodText} from './neighborhood.js';
import {nearestListings} from './location.js';
import {validatePlan,informal} from './conversation.js';
import {compare} from './tour.js';
import {intelligence,intelligenceText,rentalCosts} from './intelligence.js';
import {concierge} from './concierge.js';
import {stages,estimate,addEntry,report} from './lifecycle.js';
import {roles,composeLink,outreach} from './contact.js';
import {parsePrefs,rank,context,crime,nearby} from './discovery.js';
import {initial,homes,find,baseline,cost,answer,interpretLocal} from './tour.js';
import {glasses} from './glasses.js';
const $=id=>document.getElementById(id);
let liveRows=[];
try{liveRows=JSON.parse(localStorage.getItem('tour-inventory')||'[]');for(const h of liveRows)if(h.id?.startsWith('rc-')&&!find(h.id))homes.push(h)}catch{liveRows=[]}
let s={...initial(),current:{buy:'published-2',rent:'published-3'},saved:{buy:[],rent:[]},notes:{}};try{const x=JSON.parse(localStorage.getItem('tour-memory-v1'));if(x&&find(x.current?.[x.mode])&&Array.isArray(x.drafts)&&x.notes&&Array.isArray(x.saved?.buy)&&Array.isArray(x.saved?.rent))s=x}catch{}
let feedback='',pending=null,busy=false,index=0,config={ai:false,gmail:false},draw=()=>{};
const current=()=>find(s.current[s.mode]);
const state=()=>{try{localStorage.setItem('tour-memory-v1',JSON.stringify(s))}catch{$('status').textContent='Storage unavailable for this session.'}};
s.preferences??={buy:'Under $400k, 3 bedrooms, near a bus and school',rent:'Under $1800 with parking, near food and a bus'};
let source=current().source?'published':'demo',resultIndex=-1,viewMode='',activeLive={buy:[],rent:[]};
$('inventory').value=source;
function myPrefs(){const prefs=parsePrefs(s.preferences[s.mode]);prefs.max=s.budgetOverrides?.[s.mode]??prefs.max;return prefs}
function shortlist(){
 const pool=homes.filter(h=>h.mode===s.mode&&(source==='live'?activeLive[s.mode].includes(h.id):source==='published'?h.id.startsWith('published-'):!h.source));
 return rank(pool,myPrefs());
}
function showResult(i){
 const list=shortlist();if(!list.length){feedback='No matching homes. Adjust your budget or bedrooms.';render();return}
 resultIndex=(i+list.length)%list.length;const r=list[resultIndex];s.current[s.mode]=r.h.id;pending=null;index=0;
 feedback=(resultIndex+1)+' of '+list.length+' · '+cost(r.h)+'\n'+(r.hits.join(' + ')||'Listed price fits')+(r.gaps.length?' · Confirm '+r.gaps.join(', '):'');state();render();
}
function renderDiscovery(){
 const list=shortlist(),pref=myPrefs();if(viewMode!==s.mode){$('preferences').value=s.preferences[s.mode];viewMode=s.mode}
 $('match-summary').textContent=list.length+' result'+(list.length===1?'':'s')+' · '+(pref.max?'up to $'+pref.max.toLocaleString()+' · ':'')+(pref.beds?pref.beds+'+ bedrooms · ':'')+(pref.parking?'parking requested · ':'')+(pref.want.length?pref.want.join(', ')+' within '+pref.radius+' mi preferred':'price order');
 const panel=$('matches');panel.replaceChildren();
 list.forEach((r,i)=>{const row=document.createElement('div');row.className='result';const title=document.createElement('strong');title.textContent=r.h.name+' · '+cost(r.h);const intel=intelligence(r.h,pref,r.places);const summary=document.createElement('p');summary.textContent=intelligenceText(r.h,pref,r.places);
 const reason=document.createElement('p');reason.textContent=[...r.hits.map(k=>k+' '+r.places[k].d.toFixed(2)+' mi'),...pref.want.filter(k=>!r.hits.includes(k)).map(k=>k+' outside radius or unconfirmed'),...(r.gaps.length?['Verify '+r.gaps.join(', ')]:[]),r.h.source||'Fictional listing'].join(' · ');
 const tour=document.createElement('button');tour.textContent='Tour this home';tour.disabled=busy;tour.onclick=()=>{queue=[];showResult(i)};row.append(title,summary,reason,tour);
 if(r.h.url){const a=document.createElement('a');a.href=r.h.url;a.textContent='Check listing';a.target='_blank';a.rel='noopener';row.append(a)}panel.append(row)});
 $('around').textContent=context(current())+(current().source?'':'\nPractice tour uses an illustrative map pin.');
 $('inventory').disabled=busy;$('preferences').disabled=busy;
}
$('matchform').onsubmit=e=>{e.preventDefault();if(busy)return;queue=[];pending=null;delete s.budgetOverrides?.[s.mode];s.preferences[s.mode]=$('preferences').value.slice(0,240);state();showResult(0)};
$('inventory').onchange=async e=>{queue=[];pending=null;source=e.target.value;if(source==='live'){busy=true;render();try{const data=await request('/api/inventory',{mode:s.mode});activeLive[s.mode]=data.homes.map(h=>h.id);for(const h of data.homes){const old=find(h.id);if(old)Object.assign(old,h);else homes.push(h)}localStorage.setItem('tour-inventory',JSON.stringify(homes.filter(h=>h.id.startsWith('rc-'))))}
 catch{activeLive[s.mode]=[];$('status').textContent='Could not retrieve live inventory. Select another source or retry.'}finally{busy=false}}
 showResult(0)};
s.contacts??={};
let contactHome='';
$('contact-role').replaceChildren(...roles.map(r=>new Option(r,r)));
const contactFor=h=>s.contacts[h.id]||{role:h.mode==='rent'?'Property manager':'Listing agent',name:'',phone:'',email:''};
function renderContact(){
 const h=current();if(contactHome===h.id)return;contactHome=h.id;
 const c=contactFor(h);for(const k of ['role','name','phone','email'])$('contact-'+k).value=c[k];
}
$('contact-form').onsubmit=e=>{e.preventDefault();if(busy)return;const c={};for(const k of ['role','name','phone','email'])c[k]=$('contact-'+k).value.trim();
 if(c.phone&&!composeLink('text',c,'','')||c.email&&!composeLink('email',c,'','')){feedback='Check the contact number or email.';render();return}
 s.contacts[current().id]=c;pending=null;index=0;feedback='Contact saved for '+current().name+'.';state();render()};
function prepareOutreach(c,home=current()){
 const h=home,contact=contactFor(h),role=c.role==='tenancy contact'?'Other tenancy contact':c.role;
 if(role&&role.toLowerCase()!==contact.role.toLowerCase()){feedback='Select '+role+' and save their details under Property contact.';render();return}
 const channel=c.channel,recipient=channel==='text'?contact.phone:contact.email;
 if(!composeLink(channel,contact,h.name,'')||!recipient){feedback='Add the '+contact.role.toLowerCase()+'’s '+(channel==='text'?'text number':'email')+' under Property contact first.';render();return}
 const detail='Hi'+(contact.name?' '+contact.name:'')+', I’m interested in '+h.name+'. '+(c.question||'Could you confirm availability and any required fees?');
 pending={kind:'outreach',homeId:h.id,channel,contact:{...contact},detail,preview:(channel==='text'?'Text':'Email')+' draft to '+recipient+'\n'+detail};index=0;render();
}
const actions=()=>pending?['Confirm','Cancel']:['Compare','Save home','Ask about parking','Next stop','Switch tour','Find matches','Next match','Nearby places','Crime statistics','Draft text','Draft email'];
function display(){const h=current();return (h.source?'':'Practice · ')+h.name+'\n'+(busy?'Working…':pending?pending.preview:feedback||cost(h)+' · '+h.beds+' bedrooms')+'\n› '+actions()[index]}
function textBox(parent,title,body){const card=document.createElement('div');card.className='entry';const t=document.createElement('strong'),p=document.createElement('p');t.textContent=title;p.textContent=body;card.append(t,p);parent.append(card)}
function render(){
 renderJourney();renderNeighborhood();renderAlerts();renderHousehold();
 renderContact();renderDiscovery();renderIntelligence();
 $('buy').setAttribute('aria-pressed',s.mode==='buy');$('rent').setAttribute('aria-pressed',s.mode==='rent');$('property').replaceChildren(...homes.filter(h=>h.mode===s.mode).map(h=>new Option((h.source?'':'Practice · ')+h.name+' · '+cost(h)+' · '+h.block,h.id)));$('property').value=current().id;
 $('lens').textContent=display();$('actions').replaceChildren(...actions().map((a,i)=>{const b=document.createElement('button');b.textContent=a;b.className=i===index?'primary':'';b.disabled=busy;b.onclick=()=>void act(a);return b}));
 for(const id of ['buy','rent','property','query'])$(id).disabled=busy;
 $('notebook').replaceChildren();for(const id of s.saved[s.mode]){const h=find(id);if(h)textBox($('notebook'),h.name,(s.notes[id]||[]).join(' ')||'Saved on tour.')}
 $('drafts').replaceChildren();const drafts=s.drafts.filter(d=>find(d.id)?.mode===s.mode);for(const d of drafts){const h=find(d.id);textBox($('drafts'),d.where+' · '+h.name,d.text);
 if(d.contact&&d.channel){const link=composeLink(d.channel,d.contact,h.name,d.text);if(link){const box=$('drafts').lastElementChild,who=document.createElement('p'),a=document.createElement('a');who.textContent=d.contact.role+' · '+(d.channel==='text'?d.contact.phone:d.contact.email);a.href=link;a.textContent=d.channel==='text'?'Review in Messages':'Review in email app';box.append(who,a);const status=document.createElement('select');for(const v of ['draft','sent (self-reported)','reply received (self-reported)','closed'])status.add(new Option(v,v));status.value=d.status||'draft';status.onchange=()=>{d.status=communicationStatus(status.value);state()};box.append(status)}}}if(!drafts.length)$('drafts').textContent='No questions drafted.';draw();
}
function resetView(){feedback='';pending=null;index=0;state();render()}
function mode(m){s.mode=m;if(source==='live'){source='published';$('inventory').value=source}resultIndex=-1;resetView()}
$('buy').onclick=()=>{queue=[];mode('buy')};$('rent').onclick=()=>{queue=[];mode('rent')};$('property').onchange=e=>{queue=[];s.current[s.mode]=e.target.value;source=current().id.startsWith('rc-')?'live':current().source?'published':'demo';$('inventory').value=source;resetView()};
async function request(path,body,type='application/json'){const r=await fetch(path,{method:'POST',headers:{'Content-Type':type},body:type==='application/json'?JSON.stringify(body):body});if(!r.ok)throw Error('Service unavailable.');return r.json()}
function command(c){
 const h=current();pending=null;index=0;
 if(c.action==='save'){const detail=String(c.detail||'').slice(0,180);pending={kind:'save',detail,preview:'Save '+(detail?'note: '+detail:'this home?')}}
 else if(c.action==='draft'){const detail=String(c.detail||'Could you confirm the parking arrangements?').slice(0,240);pending={kind:'draft',detail,preview:(config.gmail?'Gmail draft':'Local draft')+'? '+detail}}
 else feedback=c.action==='answer'?String(c.detail||'Unconfirmed.').slice(0,180):answer(s,h,c);
 render()
}
let queue=[];
s.conversation??=[];
async function runPlan(){while(queue.length&&!pending){const a=queue.shift();const h=a.target?find(a.target):current();if(!h)continue;
 if(a.type==='confirm'||a.type==='cancel'){await act(a.type==='confirm'?'Confirm':'Cancel');continue;}
 if(a.type==='select'){mode(h.mode);s.current[h.mode]=h.id;feedback='Selected '+h.name;}
 else if(a.type==='outreach'){prepareOutreach({channel:a.topic,question:a.text},h);}
 else if(a.type==='note'||a.type==='draft'){pending={kind:a.type==='note'?'save':'draft',detail:a.text.slice(0,240),homeId:h.id,preview:(a.type==='note'?'Save note':'Prepare draft')+' for '+h.name+'? '+a.text};index=0;}
 else if(a.type==='revise-budget'){
  const budget=parsePrefs(a.text).max;
  if(!budget){feedback='What is your new maximum budget?';}
  else {
   s.budgetOverrides??={};
   s.budgetOverrides[s.mode]=budget;
   showResult(0);
  }
 }
 else if(a.type==='search'){if(a.mode&&a.mode!==s.mode)mode(a.mode);delete s.budgetOverrides?.[s.mode];s.preferences[s.mode]=(a.budget?'Under $'+a.budget+'; ':'')+a.text;$('preferences').value=s.preferences[s.mode];showResult(0);}
 else if(a.type==='compare')feedback=compare(current(),a.target?h:baseline(s,current()));
 else if(a.type==='recall')feedback=(s.notes[h.id]||[]).join(' · ')||'No notes saved for '+h.name;
 else if(a.type==='neighborhood'){feedback=neighborhoodCache.has(h.id)?neighborhoodText(neighborhoodCache.get(h.id),a.topic):['overview','school','food','transit','attraction'].includes(a.topic)?context(h):'Local coverage unconfirmed. Use neighborhood lookup on your phone.';}
 else if(a.type==='intelligence')feedback=propertyIntelligence(a.topic,h);
 else feedback=a.text;
 state();render();}}
async function ask(q){if(busy||!q.trim())return;if(!pending&&/household|both of us|both my|everyone|our family|roommates/i.test(q)&&/match|compare|best|fit|which/i.test(q)){feedback=householdSummary(householdRows());render();return;}let plan=informal(q,!!pending);if(config.ai&&!pending){busy=true;render();try{const properties=homes.filter(h=>h.mode===s.mode||s.saved[h.mode].includes(h.id)).slice(0,100).map(h=>({...h,notes:s.notes[h.id]||[]}));const ctx={query:q.slice(0,1000),properties,current:current().id,mode:s.mode,preferences:s.preferences,effectiveBudget:myPrefs().max,shortlist:shortlist().map(r=>r.h.id),saved:s.saved,history:s.conversation.slice(-8),pending:pending?{kind:pending.kind,preview:pending.preview}:null};const proposed=await request('/api/conversation',ctx);plan={actions:validatePlan(proposed,properties.map(h=>h.id),!!pending)};}catch{feedback='AI unavailable; using offline commands.';}finally{busy=false;}}
 if(!plan){await legacyAsk(q);return;}
 s.conversation.push({query:q.slice(0,1000),actions:plan.actions});s.conversation=s.conversation.slice(-20);state();
 if(pending){const a=plan.actions[0];if(a.type==='confirm'||a.type==='cancel')await act(a.type==='confirm'?'Confirm':'Cancel');else{feedback=a.text||'Please confirm or cancel.';render();}return;}
 queue=plan.actions;await runPlan();}
async function legacyAsk(q){if(busy||!q.trim())return;
 const c=concierge(q);
 if(pending){if(c?.kind==='confirm'||c?.kind==='cancel')await act(c.kind==='confirm'?'Confirm':'Cancel');else{feedback='Say confirm or cancel first.';render()}return}
 if(c){const h=current();
 if(c.kind==='intelligence'){feedback=propertyIntelligence(c.topic);render();return}
 if(c.kind==='entry'){pending={kind:'entry',stage:c.stage,detail:c.text,preview:'Save '+c.stage+': '+c.text+'?'};index=0;render();return}
 if(c.kind==='note'){command({action:'save',detail:c.text});return}
 if(c.kind==='action'){await act({'next match':'Next match','next stop':'Next stop','compare':'Compare','switch tour':'Switch tour','find matches':'Find matches'}[c.action]);return}
 if(c.kind==='recall')feedback=(s.notes[h.id]||[]).join(' · ')||'No tour notes for this home.';
 else if(c.kind==='journal')feedback=(s.journey?.[h.id]||[]).map(e=>e.stage+': '+e.text).join(' · ')||'No journal entries for this home.';
 else if(c.kind==='help')feedback='Say find matches, next stop, compare, remember a note, add Move: book movers, or read my notes.';
 else feedback='No action awaiting confirmation.';
 render();return;
 }
 const message=outreach(q);if(message){prepareOutreach(message);return}
 if(/registry|sex offender|sexual predator/i.test(q)){feedback='Official registry search is available under Public safety on your phone.';render();return}
 if(/crime|public safety/i.test(q)){feedback=current().block==='Hampden'?crime:'No local crime statistics verified for this property. See official sources.';render();return}
 if(/before I (leave|go)|what should I ask/i.test(q)){const pr=myPrefs(),gaps=rank([current()],pr)[0]?.gaps||[];feedback=gaps.length?'Ask the agent to confirm '+gaps[0]+'.':current().parking==='Unconfirmed'?'Ask: Is parking included with this home?':'Ask: Is the home still available at the listed price?';render();return}
 if(/^(find|match|show me|my preferences|i want|i need)/i.test(q)){if(/\brent(?:al|als)?\b/i.test(q)&&s.mode!=='rent')mode('rent');else if(/for sale|to buy/i.test(q)&&s.mode!=='buy')mode('buy');delete s.budgetOverrides?.[s.mode];s.preferences[s.mode]=q;$('preferences').value=q;state();showResult(0);return}
 if(/nearby|nearest|bus line|near.*(school|food|attraction)/i.test(q)){feedback=context(current());render();return}
 busy=true;render();try{const h=current();command(config.ai?await request('/api/ask',{id:h.id,previous:baseline(s,h)?.id,notes:s.notes[h.id]||[],query:q.slice(0,240)}):interpretLocal(q))}
 catch{feedback='AI unavailable. Try a tour button.'}finally{busy=false;render()}}
async function act(a){
 if(busy)return;const h=current();
 if(a==='Draft text'||a==='Draft email'){prepareOutreach({channel:a==='Draft text'?'text':'email'});return}
 if(a==='Confirm'&&pending){const p=pending;const h=p.homeId?find(p.homeId):current();busy=true;render();try{
 if(p.kind==='outreach'){s.drafts.unshift({id:h.id,text:p.detail,channel:p.channel,contact:p.contact,where:p.channel==='text'?'Text draft':'Email draft'});feedback='Draft ready. Review in the phone app to send.'}
 else if(p.kind==='entry'){s.journey=addEntry(s.journey||{},h.id,p.stage,p.detail);feedback='Saved to '+p.stage+' journal.'}
 else if(p.kind==='save'){s.saved[h.mode]=[h.id,...s.saved[h.mode].filter(id=>id!==h.id)];const notes=s.notes[h.id]||[];if(p.detail&&!notes.includes(p.detail))s.notes[h.id]=[...notes,p.detail];feedback='Saved to tour notebook.'}
 else{if(config.gmail)await request('/api/draft',{id:h.id,question:p.detail});s.drafts.unshift({id:h.id,text:p.detail,where:config.gmail?'Gmail draft':'Local draft'});feedback=config.gmail?'Gmail draft created.':'Draft saved on this device.'}
 pending=null;index=0;state()
 }catch{$('status').textContent='Draft creation unverified. Check Gmail before retrying.'}finally{busy=false;render()}if(!pending)await runPlan();return}
 if(a==='Cancel'){queue=[];pending=null;feedback='Canceled.';index=0;render();return}
 if(a==='Find matches'||a==='Next match'){showResult(a==='Next match'?resultIndex+1:0);return}
 if(a==='Nearby places'||a==='Crime statistics'){feedback=a==='Nearby places'?context(h):(h.block==='Hampden'?crime:'No local crime statistics verified for this property.');render();return}
 if(a==='Switch tour'){mode(s.mode==='buy'?'rent':'buy');return}
 if(a==='Next stop'){const stops=homes.filter(x=>x.mode===s.mode&&(source==='live'?x.id.startsWith('rc-'):source==='demo'?!x.source:x.id.startsWith('published-')));if(!stops.length)return;s.current[s.mode]=stops[(stops.findIndex(x=>x.id===h.id)+1)%stops.length].id;resetView();return}
 const commands={'Compare':{action:'compare'},'Save home':{action:'save',detail:''},'Ask about parking':{action:'draft',detail:'Could you confirm the parking arrangements for '+h.name+'?'}};
 command(commands[a])
}
$('ask').onsubmit=e=>{e.preventDefault();void ask($('query').value)};
$('status').textContent='Tour notebook · published snapshots and labeled practice homes · drafts stay here.';
draw=glasses({display,tap:()=>void act(actions()[index]),cycle:d=>{if(!busy){index=(index+d+actions().length)%actions().length;render()}},canSpeak:()=>config.audio&&!busy,status:t=>{feedback=t;render()},transcribe:async blob=>{const r=await request('/api/audio',blob,'audio/wav');if(!r.text?.trim()){feedback='No speech recognized. Try again.';render();return}await ask(r.text)}});
const neighborhoodCache=new Map();
render();if(location.protocol!=='file:')fetch('/api/config').then(r=>r.json()).then(c=>{if(typeof c.ai==='boolean'){config=c;if(c.inventory){const opt=$('inventory').querySelector('[value=live]');opt.disabled=false;opt.textContent='Refresh active listings · RentCast'};$('status').textContent=(c.ai?(c.provider==='claude'?'Claude connected':'OpenAI connected'):'Offline commands')+' · tour notebook · '+(c.gmail?'Gmail drafts enabled':'local drafts');render()}}).catch(()=>{});

function renderJourney(){const h=current();if(!h)return;const list=$('journey-list');list.replaceChildren();for(const e of s.journey?.[h.id]||[]){const p=document.createElement('p');p.textContent=e.stage+' · '+e.text+(e.date?' · '+e.date:'');list.append(p)}if($('est-price').dataset.home!==h.id){$('est-price').dataset.home=h.id;$('est-price').value=h.mode==='buy'?h.price:'';$('estimate-result').textContent='Illustrative purchase estimate, not a lending offer.'}}
$('journey-stage').replaceChildren(...stages.map(x=>new Option(x,x)));
$('journey-form').onsubmit=e=>{e.preventDefault();s.journey=addEntry(s.journey||{},current().id,$('journey-stage').value,$('journey-note').value,$('journey-date').value);state();$('journey-note').value='';renderJourney()};
$('estimate-form').onsubmit=e=>{e.preventDefault();try{const v=id=>Number($(id).value);$('estimate-result').textContent='Estimated monthly total: $'+estimate({price:v('est-price'),down:v('est-down'),rate:v('est-rate'),years:v('est-years'),extras:v('est-extra')}).toFixed(2)+' · excludes any costs not entered.'}catch(err){$('estimate-result').textContent=err.message}};
$('export-report').onclick=()=>{const h=current(),blob=new Blob([report(h,s.journey?.[h.id]||[]),'\nTour notes: '+(s.notes[h.id]||[]).join('; ')],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tour-memory-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('clear-memory').onclick=()=>{if(confirm('Clear local preferences, notes, contacts and drafts?')){localStorage.removeItem('tour-memory-v1');localStorage.removeItem('tour-inventory');location.reload()}};

function propertyIntelligence(topic,h=current()){const p=myPrefs(),places=nearby(h,p.line),r=intelligence(h,p,places);if(topic==='questions')return r.questions.join(' · ');if(topic==='cost'&&h.mode==='rent'){const c=rentalCosts(h,{parking:p.parking});return '$'+c.subtotal.toLocaleString()+'/mo known subtotal'+(c.missing.length?' · excludes unknown '+c.missing.join(', '):'');}if(topic==='cost')return 'Use the purchase estimate with your down payment, rate, taxes and insurance.';return intelligenceText(h,p,places);}
function renderIntelligence(){ $('intel-match').textContent=propertyIntelligence('match');$('intel-cost').textContent=propertyIntelligence('cost');$('intel-questions').textContent=propertyIntelligence('questions');}

function listenForSpeech(preferences=false){const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){$('status').textContent='Phone speech recognition unavailable; type instead.';return}if(busy)return;const r=new Speech();r.lang=navigator.language||'en-US';r.onresult=e=>{const q=e.results[0][0].transcript;if(preferences){$('preferences').value=q;void ask('Find me '+q)}else{$('query').value=q;void ask(q)}};r.onerror=()=>{$('status').textContent='Speech unavailable; type instead.'};try{r.start()}catch{$('status').textContent='Could not start microphone.'}};
$('phone-voice').onclick=()=>listenForSpeech();
$('speak-preferences').onclick=()=>listenForSpeech(true);
$('locate').onclick=()=>{if(busy)return;const panel=$('nearby-listings'),status=$('location-status');panel.replaceChildren();if(!navigator.geolocation){status.textContent='Location unavailable.';return}status.textContent='Requesting location permission…';navigator.geolocation.getCurrentPosition(async ({coords})=>{const position={latitude:coords.latitude,longitude:coords.longitude};let rows=homes.filter(h=>h.mode===s.mode&&h.id.startsWith('published-'));let label='Published snapshot';const requestedMode=s.mode;if(config.inventory){try{const data=await request('/api/inventory',{mode:requestedMode,position});rows=data.homes;label='Live listings';}catch{label='Live search unavailable; published snapshot only'}}if(s.mode!==requestedMode){status.textContent='Search mode changed; retry.';return}const matches=nearestListings(rows,position);if(s.alertEnabled&&label==='Live listings'){const eligible=rank(matches.map(x=>x.h),parsePrefs(s.preferences[requestedMode])).map(x=>x.h);const r=scanAlerts(s.alertStore,eligible,[],{nearby:true,scope:'nearby:'+requestedMode});s.alertStore=r.store;state();renderAlerts();if(r.fresh.length&&!pending&&!busy){feedback=r.fresh[0].text;render()}}status.textContent=label+' · GPS accuracy approximately '+Math.round(coords.accuracy)+' m. Confirm the address; distance is not proof of identity.';if(!matches.length)status.textContent+=' No indexed listings within one mile.';for(const {h,distance} of matches){const b=document.createElement('button');b.textContent=h.name+' · '+Math.round(distance)+' m · '+cost(h);b.onclick=()=>{if(busy||s.mode!==h.mode)return;const old=find(h.id);if(old)Object.assign(old,h);else homes.push(h);s.current[s.mode]=h.id;resetView();status.textContent='Selected '+h.name+'; verify the physical address.'};panel.append(b)}},()=>{status.textContent='Location denied or unavailable. Use manual search.'},{enableHighAccuracy:true,timeout:12000,maximumAge:0})};

function renderNeighborhood(){const h=current(),data=neighborhoodCache.get(h.id);$('neighborhood-result').textContent=neighborhoodText(data);$('neighborhood-source').textContent=data?data.source+' · retrieved '+data.retrieved+' · incomplete map coverage; verify independently.':'No live neighborhood data loaded.';$('neighborhood-load').disabled=!position(h)||busy;}
$('neighborhood-load').onclick=async()=>{const h=current();if(!position(h))return;busy=true;render();try{neighborhoodCache.set(h.id,await request('/api/neighborhood',{id:h.id}));}catch{$('status').textContent='Neighborhood provider unavailable. Use official source links.';}finally{busy=false;render();}};
for(const [name,url] of resources){const a=document.createElement('a');a.href=url;a.textContent=name;a.target='_blank';a.rel='noopener noreferrer';const p=document.createElement('p');p.append(a);$('neighborhood-resources').append(p)}
$('commute-form').onsubmit=e=>{e.preventDefault();try{const v=id=>Number($(id).value);const r=commute({minutes:v('commute-min'),miles:v('commute-mi'),days:v('commute-days'),rate:v('commute-rate'),parking:v('commute-parking')});$('commute-result').textContent='Estimated annual travel: '+r.hours.toFixed(1)+' hours · $'+r.cost.toFixed(2)+' based on your inputs.';}catch(err){$('commute-result').textContent=err.message}};

function renderAlerts(){const panel=$('alert-list');if(!panel)return;panel.replaceChildren();$('alert-enabled').checked=!!s.alertEnabled;for(const a of (s.alertStore?.alerts||[]).slice(0,30)){const row=document.createElement('div');row.className='entry';const p=document.createElement('p');p.textContent=(a.read?'':'New · ')+a.text;const b=document.createElement('button');b.textContent='Mark read';b.onclick=()=>{a.read=true;state();renderAlerts()};row.append(p,b);panel.append(row)}}
async function checkAlerts(){if(!s.alertEnabled||busy||document.hidden)return;const m=s.mode,p=s.preferences[m],prefs=myPrefs();let rows=[];let label='Reminders only';if(config.inventory){try{const data=await request('/api/inventory',{mode:m});rows=rank(data.homes,prefs).map(r=>r.h);label='Live listing check';}catch{label='Live listing check failed; reminders only'}}if(!s.alertEnabled||s.mode!==m||s.preferences[m]!==p)return;const reminders=Object.entries(s.journey||{}).flatMap(([id,es])=>es.map(e=>({...e,id})));const result=scanAlerts(s.alertStore,rows,reminders,{scope:label==='Live listing check'?m+':'+p+':'+prefs.max:'reminders-only'});s.alertStore=result.store;state();$('alert-status').textContent=label+' · '+result.fresh.length+' new alerts';if(result.fresh.length&&!pending&&!busy){feedback=result.fresh[0].text;render()}else renderAlerts()}
$('alert-enabled').onchange=e=>{s.alertEnabled=e.target.checked;state();if(s.alertEnabled)void checkAlerts()};$('alert-check').onclick=()=>void checkAlerts();setInterval(()=>void checkAlerts(),15*60*1000);

$('tour-calendar').onsubmit=e=>{e.preventDefault();if(busy||pending)return;try{const h=current(),start=$('tour-start').value,end=$('tour-end').value;const data=calendarFile(h.name,'Tentative property tour',start,end);const url=URL.createObjectURL(new Blob([data],{type:'text/calendar'}));const a=document.createElement('a');a.href=url;a.download='tour-memory-tour.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('tour-calendar-status').textContent='Tentative calendar file exported. Import it into your calendar; the agent has not confirmed.';}catch(err){$('tour-calendar-status').textContent=err.message}};

function householdMembers(){return (s.household?.[s.mode]||[])}
function householdRows(){return householdMembers().length?householdRank(homes.filter(h=>h.mode===s.mode&&(source==='live'?activeLive[s.mode].includes(h.id):source==='published'?h.id.startsWith('published-'):!h.source)),householdMembers()):[];}
function renderHousehold(){const members=householdMembers(),panel=$('hh-members'),results=$('hh-results'),person=$('hh-person'),prev=person.value;panel.replaceChildren();results.replaceChildren();person.replaceChildren(...members.map(m=>new Option(m.name,m.name)));if(members.some(m=>m.name===prev))person.value=prev;
 for(const m of members){const row=document.createElement('div');row.className='entry';const p=document.createElement('p');p.textContent=m.name+' · '+m.preferences+' · weight '+m.weight+' · required: '+(m.required.join(', ')||'none');const b=document.createElement('button');b.textContent='Remove member';b.onclick=()=>{s.household[s.mode]=members.filter(x=>x.name!==m.name);state();renderHousehold()};row.append(p,b);panel.append(row)}
 for(const r of householdRows()){const p=document.createElement('p');p.textContent=householdSummary([r])+' | '+r.people.map(x=>x.name+': '+(x.score??'unknown')+' · '+x.checks.map(c=>c.name+' '+c.status).join(', ')).join(' | ');results.append(p)}
 if(!members.length)results.textContent='Add household members to compare homes.';const ratings=$('hh-ratings');ratings.replaceChildren();for(const r of s.householdRatings?.[current().id]||[]){const p=document.createElement('p');p.textContent=r.name+' · '+r.stars+'/5 · '+r.note;ratings.append(p)}$('hh-rating').querySelector('button').disabled=!members.length;
}
for(const name of ['Budget','Bedrooms','Parking','bus','school','food','attraction']){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=name;label.append(input,document.createTextNode(' '+name));$('hh-required').append(label)}
$('household-form').onsubmit=e=>{e.preventDefault();const name=$('hh-name').value.trim(),preferences=$('hh-pref').value.trim(),weight=Number($('hh-weight').value),required=[...$('hh-required').querySelectorAll(':checked')].map(x=>x.value);if(!name||!preferences||!Number.isInteger(weight)||weight<1||weight>5)return;const p=parsePrefs(preferences),available=[...(p.max!==null?['Budget']:[]),...(p.beds?['Bedrooms']:[]),...(p.parking?['Parking']:[]),...p.want];if(required.some(x=>!available.includes(x))){$('hh-results').textContent='Include every selected must-have in the preference text.';return;}s.household??={};s.household[s.mode]=[...householdMembers().filter(m=>m.name!==name),{name,preferences,weight,required}];state();renderHousehold();};
$('hh-rating').onsubmit=e=>{e.preventDefault();const name=$('hh-person').value,stars=Number($('hh-stars').value),note=$('hh-note').value.trim();if(!householdMembers().some(m=>m.name===name)||!Number.isInteger(stars)||stars<1||stars>5)return;s.householdRatings??={};const id=current().id;s.householdRatings[id]=[...(s.householdRatings[id]||[]).filter(r=>r.name!==name),{name,stars,note}];state();renderHousehold()};
$('hh-export').onclick=()=>{const rows=householdRows();const text=['Tour Memory household decision report','Known preference fit; not a guarantee. Verify missing evidence.',...rows.map(r=>householdSummary([r])+'\n'+r.people.map(p=>p.name+': '+p.checks.map(c=>c.name+' '+c.status).join(', ')).join('\n')+'\n'+(s.householdRatings?.[r.h.id]||[]).map(x=>x.name+' '+x.stars+'/5 '+x.note).join('\n'))].join('\n\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='tour-memory-household.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
renderHousehold();

import {readiness,checklists} from './readiness.js';
const readinessFields=[['income','Monthly take-home income'],['housing','Total monthly housing cost'],['debt','Monthly debt payments'],['expenses','Other monthly living expenses'],['savings','Available savings'],['upfront','Total upfront costs (deposit, closing, moving)'],['ratio','Illustrative rental screening multiplier']];
for(const [key,label] of readinessFields){const l=document.createElement('label'),i=document.createElement('input');i.type='number';i.min='0';i.step='any';i.required=true;i.id='ready-'+key;if(key==='ratio')i.value='3';l.append(document.createTextNode(label),i);$('readiness-fields').append(l)}
$('readiness-form').onsubmit=e=>{e.preventDefault();try{const r=readiness(Object.fromEntries(readinessFields.map(([k])=>[k,Number($('ready-'+k).value)])));$('readiness-result').textContent=`Monthly cash remaining: $${r.remaining.toFixed(2)} · Savings after upfront costs: $${r.cash.toFixed(2)} · Illustrative gross income screening threshold: $${r.screeningIncome.toFixed(2)} · Reserve months: ${r.reserveMonths===null?'not applicable':r.reserveMonths.toFixed(1)}. Verify actual lender or landlord requirements.`}catch(err){$('readiness-result').textContent=err.message}};
for(const [group,items] of Object.entries(checklists)){const d=document.createElement('details'),summary=document.createElement('summary');summary.textContent=group;d.append(summary);for(const item of items){const b=document.createElement('button');b.type='button';b.textContent='Add task: '+item;b.onclick=()=>{const stage={Lease:'Act',Inspection:'Tour',Move:'Move',Live:'Live'}[group];$('journey-stage').value=stage;$('journey-note').value=item;$('journey-date').value='';$('journey-form').requestSubmit()};const p=document.createElement('p');p.append(b);d.append(p)}$('lifecycle-checklists').append(d)}
