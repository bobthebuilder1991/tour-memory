import test from 'node:test';import assert from 'node:assert/strict';import {scanAlerts} from './alerts.js';
const h={id:'a',name:'Home',price:100};
test('first scan establishes baseline',()=>assert.equal(scanAlerts(null,[h],[]).fresh.length,0));
test('new match',()=>assert.equal(scanAlerts(scanAlerts(null,[h],[]).store,[h,{...h,id:'b'}],[]).fresh.length,1));
test('price drop and dedup',()=>{let s=scanAlerts(null,[h],[]).store;let r=scanAlerts(s,[{...h,price:90}],[]);assert.equal(r.fresh.length,1);assert.equal(scanAlerts(r.store,[{...h,price:90}],[]).fresh.length,0)});
test('nearby dedup',()=>{let r=scanAlerts(null,[h],[],{nearby:true});assert.equal(r.fresh.length,1);assert.equal(scanAlerts(r.store,[h],[],{nearby:true}).fresh.length,0)});
test('reminders due only',()=>assert.equal(scanAlerts(null,[],[{id:'a',date:'2020-01-01',text:'Tour'},{id:'b',date:'2099-01-01',text:'Move'}]).fresh.length,1));
test('scope isolation',()=>assert.equal(scanAlerts(scanAlerts(null,[h],[],{scope:'a'}).store,[h],[],{scope:'b'}).fresh.length,0));
