import test from 'node:test';import assert from 'node:assert/strict';import {evaluateHousehold,householdRank,householdSummary} from './household.js';
const h={id:'x',name:'Home',mode:'buy',price:300000,beds:3};const m=(preferences,required=[],weight=1)=>({name:'Member',preferences,required,weight});
test('equal weighting',()=>assert.equal(evaluateHousehold(h,[m('under $400k'),m('under $200k')]).score,50));
test('weighted fit',()=>assert.equal(evaluateHousehold(h,[m('under $400k',[],3),m('under $200k')]).score,75));
test('must-have miss',()=>assert.equal(evaluateHousehold(h,[m('4 bedrooms',['Bedrooms'])]).blocked,true));
test('unknown must-have',()=>assert.equal(evaluateHousehold(h,[m('parking',['Parking'])]).unverified,true));
test('rank avoids blocked',()=>assert.equal(householdRank([h,{...h,id:'y',beds:4}],[m('4 bedrooms',['Bedrooms'])])[0].h.id,'y'));
test('no evidence not scored',()=>assert.equal(evaluateHousehold(h,[m('nice home')]).score,null));
test('summary exposes gap',()=>assert.match(householdSummary(householdRank([h],[m('under $400k'),m('under $200k')])),/100 point preference gap/));
