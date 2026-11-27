import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const worker=fileURLToPath(new URL('./scripts/transcribe.py',import.meta.url));
let running=false;

export async function recognizeLocally(raw,env){
 if(running)throw Error('Recognizer busy');
 if(raw.length<44||raw.length>600000)throw Error('Invalid audio length');
 running=true;
 try{
  return await new Promise((resolve,reject)=>{
   const child=execFile(env.VOSK_PYTHON||'python3',[worker],{env,timeout:20000,maxBuffer:65536},(error,stdout)=>{
    if(error)reject(Error('Local recognizer unavailable'));
    else resolve(stdout.trim());
   });
   child.stdin.on('error',reject);
   child.stdin.end(raw);
  });
 }finally{running=false}
}
