import test from 'node:test';import assert from 'node:assert/strict';import {validatePlan,informal} from './conversation.js';
test('multi intent preserves order',()=>assert.deepEqual(validatePlan({actions:[{type:'note',text:'Love the yard'},{type:'search',text:'Under $300k'},{type:'draft',text:'Is price negotiable?'}]},[]).map(a=>a.type),['note','search','draft']));
test('reject unknown target',()=>assert.throws(()=>validatePlan({actions:[{type:'select',target:'fake'}]},['b1'])));
test('reject unapproved action',()=>assert.throws(()=>validatePlan({actions:[{type:'send'}]},[])));
test('pending gate',()=>assert.throws(()=>validatePlan({actions:[{type:'note',text:'test'}]},[],true)));
test('informal confirmation',()=>assert.equal(informal('yeah',true).actions[0].type,'confirm'));
test('informal observation',()=>assert.equal(informal('This kitchen is way too small').actions[0].type,'note'));
test('informal comparison',()=>assert.equal(informal('How does this stack up against the last one?').actions[0].type,'compare'));
