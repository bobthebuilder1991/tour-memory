import {audioProvider} from './speech.js';
export function settings(env=process.env){
 const provider=env.AI_PROVIDER|| (env.ANTHROPIC_API_KEY?'claude':env.OPENAI_API_KEY?'openai':'offline');
 if(!['claude','openai','offline'].includes(provider))throw Error('Unsupported AI_PROVIDER');
 return {provider,ai:provider==='claude'?!!env.ANTHROPIC_API_KEY:provider==='openai'?!!env.OPENAI_API_KEY:false,audio:audioProvider(env)!=='offline'};
}
export async function complete(system,context,upstream,env=process.env){
 const {provider,ai}=settings(env);if(!ai)throw Error('AI unavailable');
 let output;
 if(provider==='claude'){
 const r=await upstream('https://api.anthropic.com/v1/messages',{headers:{'x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','Content-Type':'application/json'},body:JSON.stringify({model:env.ANTHROPIC_MODEL||'claude-sonnet-4-6',max_tokens:2048,system:system+' Return only valid JSON, without markdown.',messages:[{role:'user',content:JSON.stringify(context)}]})});output=r.content.filter(x=>x.type==='text').map(x=>x.text).join('');
 }else{
 const r=await upstream('https://api.openai.com/v1/chat/completions',{headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-4o-mini',response_format:{type:'json_object'},messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(context)}]})});output=r.choices[0].message.content;
 }
 return JSON.parse(output.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
}
