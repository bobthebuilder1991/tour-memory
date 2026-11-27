import {test} from 'node:test';import assert from 'node:assert/strict';import {calendarFile,communicationStatus} from './scheduling.js';import {validatePlan} from './conversation.js';
test('tentative event export escapes text',()=>{const s=calendarFile('A, B','Tour','2026-12-01T10:00Z','2026-12-01T11:00Z');assert.match(s,/STATUS:TENTATIVE/);assert.match(s,/LOCATION:A\\, B/)});
test('reject backwards event',()=>assert.throws(()=>calendarFile('A','Tour','2026-12-01T11:00Z','2026-12-01T10:00Z')));
test('status is self reported',()=>assert.throws(()=>communicationStatus('delivered')));
test('outreach validates channel and target',()=>{assert.equal(validatePlan({actions:[{type:'outreach',topic:'email',text:'Can we tour?',target:'a'}]},['a'])[0].topic,'email');assert.throws(()=>validatePlan({actions:[{type:'outreach',topic:'send',text:'hi'}]},[]));});
