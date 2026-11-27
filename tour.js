import {sourced} from './discovery.js';
export const homes = [
  {id:'b1',mode:'buy',name:'The Brick Row',block:'East block',price:365000,beds:3,parking:'Unconfirmed',yard:'Fenced yard',tour:'Sat 1–3 pm'},
  {id:'b2',mode:'buy',name:'The Corner House',block:'West block',price:383000,beds:3,parking:'One garage space',yard:'Patio',tour:'Sat 2–4 pm'},
  {id:'b3',mode:'buy',name:'The Blue Door',block:'East block',price:415000,beds:4,parking:'Driveway',yard:'Small garden',tour:'By appointment'},
  {id:'r1',mode:'rent',name:'The Mill Loft',block:'East block',price:1650,fee:75,parkingFee:100,beds:2,parking:'Garage available',lease:'12 months',pets:'Cats allowed'},
  {id:'r2',mode:'rent',name:'The Garden Flat',block:'West block',price:1725,fee:25,parkingFee:0,beds:2,parking:'One space included',lease:'12 months',pets:'Ask the agent'},
  {id:'r3',mode:'rent',name:'The Studio',block:'East block',price:1375,fee:35,parkingFee:null,beds:1,parking:'Unconfirmed',lease:'6 months',pets:'Cats allowed'}
];
homes.push(...sourced);
export const find=id=>homes.find(h=>h.id===id);
export const money=n=>'$'+n.toLocaleString('en-US');
export const monthly=h=>h.price+h.fee;
export const initial=()=>({mode:'buy',current:{buy:'b1',rent:'r1'},saved:{buy:['b2'],rent:['r2']},notes:{b2:['Liked the garage.'],r2:['Parking included.']},drafts:[]});
export function baseline(s,h){return s.saved[h.mode].map(find).find(x=>x&&x.id!==h.id&&Boolean(x.source)===Boolean(h.source))}
export function cost(h){return h.mode==='buy'?money(h.price):money(monthly(h))+(h.fee==null?' base/mo':'/mo')}
export function compare(h,other){
 if(!other)return 'Save another '+(h.mode==='buy'?'home':'rental')+' to compare.';
 if(h.mode==='rent'&&(h.fee==null||other.fee==null))return 'Base rents: '+money(h.price)+' vs '+money(other.price)+'. Confirm required fees before comparing totals.';
 const d=(h.mode==='buy'?h.price-other.price:monthly(h)-monthly(other));
 const head=d===0?'Same price':money(Math.abs(d))+' '+(d<0?'less':'more');
 if(h.mode==='buy')return head+' than '+other.name+'. '+h.yard+' vs '+other.yard.toLowerCase()+'.';
 const parking=h.parkingFee==null||other.parkingFee==null?'Parking cost unconfirmed.':'With parking: '+money(monthly(h)+h.parkingFee)+' vs '+money(monthly(other)+other.parkingFee)+'/mo.';
 return head+'/mo vs '+other.name+' before optional parking. '+parking;
}
export function interpretLocal(q){
 const s=q.toLowerCase().trim();
 if(/^(save|remember|note)\b/.test(s))return {action:'save',detail:q.replace(/^(save|remember|note)\s*(this home|this rental)?[\s,:-]*/i,'').slice(0,180)};
 if(/draft|ask (the |my )?agent|email/.test(s))return {action:'draft',detail:q.replace(/^.*?(about|whether|if)\s+/i,'').slice(0,180)};
 if(/compare|yesterday|previous|cheaper|last (home|place)/.test(s))return {action:'compare'};
 if(/what.*(remember|like|note)|my notes/.test(s))return {action:'notes'};
 if(/under|below|nearby|on this block/.test(s)){const n=s.match(/(?:under|below)\s*\$?([\d,]+(?:\.\d+)?)(k)?/);return {action:'search',limit:n?Number(n[1].replaceAll(',',''))*(n[2]?1000:1):null}}
 if(/park|garage/.test(s))return {action:'parking'};
 if(/lease|pets?|cats?|dogs?/.test(s))return {action:'lease'};
 if(/cost|price|rent|fees|monthly/.test(s))return {action:'cost'};
 if(/open house|tour time/.test(s))return {action:'tour'};
 return {action:'unknown'};
}
export function answer(s,h,cmd){
 switch(cmd.action){
 case 'compare':return compare(h,baseline(s,h));
 case 'notes':return (s.notes[h.id]||[]).join(' ')||'No tour notes saved here.';
 case 'parking':return h.parking+(h.mode==='rent'&&h.parkingFee>0?' · '+money(h.parkingFee)+'/mo extra':'')+'.';
 case 'cost':return h.mode==='buy'?money(h.price)+' asking price.':h.fee==null?money(h.price)+' base rent. Required fees and utilities need confirmation.':money(h.price)+' rent + '+money(h.fee)+' required fees = '+cost(h)+'. Utilities excluded.';
 case 'lease':return h.mode==='rent'?h.lease+' · '+h.pets+'.':'Lease details apply to rental tours.';
 case 'tour':return h.tour||'Tour time unconfirmed.';
 case 'search':{const hits=homes.filter(x=>x.mode===h.mode&&x.block===h.block&&(!Number.isFinite(cmd.limit)||(x.mode==='buy'?x.price:monthly(x))<cmd.limit));return hits.length?hits.map(x=>x.name+' '+cost(x)).join(' · '):'No matching sample listings on this block.'}
 default:return 'Try “compare”, “parking”, “save a note”, or “draft a question”.';
 }
}
