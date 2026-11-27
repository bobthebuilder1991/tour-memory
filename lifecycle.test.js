import test from 'node:test';import assert from 'node:assert/strict';import {estimate,addEntry,report} from './lifecycle.js';
test('zero interest and extras',()=>assert.equal(estimate({price:120000,years:10,extras:100}),1100));
test('mortgage estimate',()=>assert.ok(Math.abs(estimate({price:300000,down:60000,rate:6,years:30})-1438.92)<.02));
test('invalid down payment rejected',()=>assert.throws(()=>estimate({price:10,down:20})));
test('entries remain property specific',()=>{let s=addEntry({},'a','Tour','Kitchen');s=addEntry(s,'b','Move','Keys');assert.equal(s.a.length,1);assert.match(report({name:'A',price:10},s.a),/Kitchen/);assert.doesNotMatch(report({name:'A',price:10},s.a),/Keys/)});
