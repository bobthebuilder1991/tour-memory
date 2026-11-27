import {waitForEvenAppBridge,AudioInputSource,OsEventTypeList as E} from '@evenrealities/even_hub_sdk';
export function glasses({display,tap,cycle,transcribe,status,canSpeak}){
 let bridge,queue=Promise.resolve(),record=false,locking=false,timer,captured=0,chunks=[];
 const draw=()=>{if(!bridge)return;const content=record?'Listening…\nTap to finish.':display();queue=queue.then(()=>bridge.textContainerUpgrade({containerID:1,containerName:'tour',content})).catch(()=>{bridge=null;status('Display disconnected. Use the phone controls.')})};
 async function voice(){
  if(locking)return;locking=true;
  try{
   if(!record){if(!canSpeak()){status('G2 voice needs a configured transcription service. Typed input is available.');return}chunks=[];captured=0;if(!await bridge.audioControl(true,AudioInputSource.Glasses))throw Error();record=true;timer=setTimeout(()=>void voice(),10000);draw();return}
   record=false;clearTimeout(timer);await bridge.audioControl(false);const pcm=new Blob(chunks);chunks=[];if(!pcm.size)throw Error();
   const b=new ArrayBuffer(44),v=new DataView(b);const tag=(i,s)=>Array.from(s).forEach((c,n)=>v.setUint8(i+n,c.charCodeAt(0)));
   tag(0,'RIFF');v.setUint32(4,36+pcm.size,true);tag(8,'WAVE');tag(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);tag(36,'data');v.setUint32(40,pcm.size,true);
   await transcribe(new Blob([b,pcm],{type:'audio/wav'}));
  }catch{status('Voice unavailable. Use the tour controls.')}finally{locking=false;draw()}
 }
 waitForEvenAppBridge().then(async b=>{
 const box={containerID:1,containerName:'tour',xPosition:0,yPosition:0,width:576,height:288,paddingLength:8,isEventCapture:1,content:display()};
 if(await b.createStartUpPageContainer({containerTotalNum:1,textObject:[box]})!==0)return;
 bridge=b;b.onEvenHubEvent(e=>{
 if(e.audioEvent){if(record){
  const samples=new Uint8Array(e.audioEvent.audioPcm);
  const remaining=320000-captured;
  if(remaining>0){const part=samples.slice(0,remaining);chunks.push(part);captured+=part.length}
  if(captured>=320000)void voice();
 }return}
 const event=e.textEvent||e.sysEvent;if(!event)return;
 switch(event.eventType??E.CLICK_EVENT){
 case E.CLICK_EVENT:record?void voice():tap();break;
 case E.SCROLL_TOP_EVENT:if(!record)cycle(-1);break;
 case E.SCROLL_BOTTOM_EVENT:if(!record)cycle(1);break;
 case E.LONG_PRESS_EVENT:if(!record)void voice();break;
 case E.SYSTEM_EXIT_EVENT:case E.FOREGROUND_EXIT_EVENT:clearTimeout(timer);if(record){record=false;chunks=[];void b.audioControl(false)}break;
 }
 });draw()}).catch(()=>{});
 return draw;
}
