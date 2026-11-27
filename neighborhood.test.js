import {test} from 'node:test';import assert from 'node:assert/strict';import {summarizePlaces,commute,neighborhoodText,position} from './neighborhood.js';import {lookupNeighborhood} from './neighborhood-service.js';import {validatePlan,informal} from './conversation.js';
const p={latitude:39,longitude:-76};
test('nearest indexed grocery',()=>assert.equal(summarizePlaces([{lat:39.01,lon:-76,tags:{shop:'supermarket',name:'Far'}},{lat:39,lon:-76,tags:{shop:'supermarket',name:'Near'}}],p).grocery.name,'Near'));
test('missing data not inferred',()=>assert.match(neighborhoodText({places:{}},'school'),/unconfirmed/));
test('commute estimate',()=>assert.deepEqual(commute({minutes:30,miles:10,days:200,rate:.5,parking:2}),{hours:200,cost:2400}));
test('invalid commute rejected',()=>assert.throws(()=>commute({minutes:30,miles:10,days:366,rate:.5})));
test('fictional listing has no lookup coordinates',()=>assert.equal(position({}),null));
test('mock map provider',async()=>assert.equal((await lookupNeighborhood(p,async()=>({ok:true,json:async()=>({elements:[]})}))).source,'OpenStreetMap contributors'));
test('neighborhood intent',()=>assert.equal(validatePlan(informal('any daycare nearby?'),[])[0].topic,'childcare'));
