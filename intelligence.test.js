import test from 'node:test';import assert from 'node:assert/strict';import {intelligence,rentalCosts} from './intelligence.js';import {concierge} from './concierge.js';
const h={mode:'rent',price:1500,fee:null,beds:2,parking:'Unconfirmed',parkingFee:null};
test('unknown budget and parking are not treated as matches',()=>{const r=intelligence(h,{max:1800,beds:2,parking:true,want:[]});assert.equal(r.score,100);assert.equal(r.coverage,33);assert.equal(r.checks[0].status,'unknown')});
test('no criteria no score',()=>assert.equal(intelligence(h,{}).score,null));
test('distance misses and unknowns distinct',()=>{const r=intelligence(h,{want:['bus','school'],radius:.5},{bus:{d:1}});assert.equal(r.score,0);assert.equal(r.coverage,50)});
test('known subtotal does not invent fees',()=>assert.deepEqual(rentalCosts(h,{parking:true}),{subtotal:1500,missing:['mandatory fees','parking','utilities']}));
test('known fees and utilities included',()=>assert.equal(rentalCosts({...h,fee:50,parkingFee:100},{parking:true,utilities:80}).subtotal,1730));
test('invalid utilities rejected',()=>assert.throws(()=>rentalCosts(h,{utilities:-1})));
test('voice intelligence commands',()=>{assert.equal(concierge('Why this home?').topic,'match');assert.equal(concierge('What should I ask?').topic,'questions');assert.equal(concierge('True monthly cost').topic,'cost')});
