import {test} from 'node:test';import assert from 'node:assert/strict';import {settings,complete} from './providers.js';
test('offline needs no keys',()=>assert.deepEqual(settings({}),{provider:'offline',ai:false,audio:false}));
test('Claude without OpenAI',()=>assert.deepEqual(settings({ANTHROPIC_API_KEY:'test'}),{provider:'claude',ai:true,audio:false}));
test('explicit OpenAI overrides Claude',()=>assert.equal(settings({AI_PROVIDER:'openai',OPENAI_API_KEY:'x',ANTHROPIC_API_KEY:'y'}).provider,'openai'));
test('Claude adapter mocked',async()=>{const r=await complete('system',{query:'hey'},async(url,o)=>{assert.match(url,/anthropic/);assert.equal(o.headers['x-api-key'],'x');return {content:[{type:'text',text:'{"actions":[]}'}]}},{ANTHROPIC_API_KEY:'x'});assert.deepEqual(r,{actions:[]})});
test('OpenAI adapter mocked',async()=>{const r=await complete('system',{},async(url,o)=>{assert.match(url,/openai/);return {choices:[{message:{content:'{"actions":[]}'}}]}},{OPENAI_API_KEY:'x'});assert.deepEqual(r,{actions:[]})});
