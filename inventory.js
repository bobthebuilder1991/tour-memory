import {homes} from './tour.js';
export async function inventory(mode,position){
 const key=process.env.RENTCAST_API_KEY;
 if(!key)throw Error('RentCast key required');
 const query=new URLSearchParams({latitude:String(position?.latitude??39.331),longitude:String(position?.longitude??-76.635),radius:'1',status:'Active',limit:'50'});
 const endpoint=mode==='buy'?'sale':'rental/long-term';
 const res=await fetch('https://api.rentcast.io/v1/listings/'+endpoint+'?'+query,{headers:{'X-Api-Key':key},signal:AbortSignal.timeout(12000)});
 if(!res.ok)throw Error('Listing provider unavailable');
 const rows=await res.json();if(!Array.isArray(rows))throw Error('Invalid listing response');
 const results=rows.filter(r=>r.id&&r.formattedAddress&&Number.isFinite(r.price)&&r.price>0).map(r=>({
 id:'rc-'+mode+'-'+r.id,name:r.formattedAddress,mode,price:r.price,beds:r.bedrooms??null,coords:Number.isFinite(r.latitude)&&Number.isFinite(r.longitude)?[r.latitude,r.longitude]:null,block:'Listing search area',source:'RentCast · '+new Date().toISOString().slice(0,10),fee:null,parkingFee:null,parking:'Unconfirmed',yard:'Outdoor space unconfirmed',lease:'Lease term unconfirmed',pets:'Pet terms unconfirmed'
 }));
 for(const h of results){const old=homes.find(x=>x.id===h.id);if(old)Object.assign(old,h);else homes.push(h)}
 return results;
}
