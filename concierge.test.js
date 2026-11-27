import test from 'node:test';import assert from 'node:assert/strict';import {concierge} from './concierge.js';
test('journal stage and text',()=>assert.deepEqual(concierge('Add Move: book movers'),{kind:'entry',stage:'Move',text:'book movers'}));
test('voice confirmation',()=>assert.equal(concierge('Confirm it!').kind,'confirm'));
test('voice cancellation',()=>assert.equal(concierge('Never mind').kind,'cancel'));
test('recall',()=>assert.equal(concierge('Read my notes').kind,'recall'));
test('unknown commands fall through',()=>assert.equal(concierge('How much is parking?'),null));
test('note',()=>assert.equal(concierge('Remember the kitchen').text,'the kitchen'));
test('next match',()=>assert.equal(concierge('Next match').action,'next match'));
