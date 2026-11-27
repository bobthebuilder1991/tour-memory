import area from './area.json' with {type:'json'};
const sales=['https://www.c21nm.com/property/baltimore/3348-chestnut-avenue-baltimore-md-21211/MDBA2237976/','https://www.atproperties.com/MDBA2235634/1214-w-40th-street-baltimore-maryland-21211-brightmls','https://www.coldwellbankerhomes.com/md/baltimore/3632-keswick-rd/pid_74590250/'];
const rental='https://www.forrent.com/md/baltimore/3450-elm-ave/07sjzx2';
const examples=[['3348 Chestnut Ave','buy',469900,3],['1214 W 40th St','buy',399900,3],['3632 Keswick Rd','buy',375000,3],['3450 Elm Ave','rent',1600,1]];
export const sourced=examples.map(([name,mode,price,beds],i)=>({
 id:'published-'+i,name,mode,price,beds,coords:area.points[name],source:'Published snapshot · Nov 26, 2026',url:mode==='buy'?sales[i]:rental,block:'Hampden',fee:null,parkingFee:mode==='rent'?0:null,parking:mode==='rent'?'One rear space included':'Unconfirmed',yard:'Outdoor space unconfirmed',lease:mode==='rent'?'12 months':'Unconfirmed',pets:mode==='rent'?'Pets allowed for an additional fee':'Unconfirmed'
}));
const pins={b1:[39.3305,-76.634],b2:[39.335,-76.640],b3:[39.329,-76.629],r1:[39.332,-76.64],r2:[39.33,-76.631],r3:[39.336,-76.636]};
const landmarks=[
 ['school','Hampden Elementary/Middle School','3608 Chestnut Ave'],
 ['food','The Food Market','1017 W 36th St'],
 ['attraction','Baltimore Museum of Art','10 Art Museum Dr']
];
export const categories=['bus','school','food','attraction'];
export function miles(a,b){
 const rad=Math.PI/180,dp=(a[0]-b[0])*rad,dl=(a[1]-b[1])*rad;
 return 3958.8*2*Math.asin(Math.min(1,Math.sqrt(Math.sin(dp/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin(dl/2)**2)));
}
export function nearby(h,line=null){
 const pin=h.coords||pins[h.id];if(!pin)return {};
 const places=Object.fromEntries(landmarks.map(([key,name,address])=>[key,{name,d:miles(pin,area.points[address])}]));
 for(const [name,lat,lon,lines] of area.stops){if(line&&!lines.split(', ').some(x=>x.toLowerCase()===line.toLowerCase()))continue;const d=miles(pin,[lat,lon]);if(!places.bus||d<places.bus.d)places.bus={name:name+' · '+lines,d}}
 return places;
}
const matchers={bus:/\bbus|transit/i,school:/school/i,food:/restaurant|\bfood|dining/i,attraction:/attraction|museum|culture/i};
export function parsePrefs(input){
 const words='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
 const tens='twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
 input=input.replace(/\b(under|below|up to|at most|budget of)\s+([a-z -]+)/gi,(phrase,prefix,rest)=>{
  let group=0,total=0,count=0;
  for(const token of rest.toLowerCase().trim().split(/[ -]+/)){
   if(words.includes(token))group+=words.indexOf(token);
   else if(tens.includes(token))group+=(tens.indexOf(token)+2)*10;
   else if(token==='hundred'&&group)group*=100;
   else if(token==='thousand'&&group){total+=group*1000;group=0;}
   else break;
   count++;
  }
  return count?prefix+' '+(total+group)+' '+rest.trim().split(/[ -]+/).slice(count).join(' '):phrase;
 });
 const m=input.match(/(?:under|below|up to|max(?:imum)?|budget(?: of)?|at most)\s*\$?\s*([\d,]+(?:\.\d+)?)(k)?/i)||input.match(/\$([\d,]+(?:\.\d+)?)(k)?/i);
 const bedrooms=input.match(/(\d+|one|two|three|four|five)[ -]*(?:bed|br\b)/i);
 const dist=input.match(/(\d*\.?\d+)\s*(?:mi\b|mile)/i);
 const line=input.match(/(?:bus|line|route)\s*(?:line|route)?\s*#?(\d+[a-z]?|blue|red|gold|green|silver|yellow|purple|navy|orange|pink|lime|brown)\b/i);
 return {line:line?.[1]||null,max:m?Number(m[1].replaceAll(',',''))*(m[2]?1000:1):null,beds:bedrooms?(Number(bedrooms[1])||({one:1,two:2,three:3,four:4,five:5})[bedrooms[1].toLowerCase()]):0,parking:/parking|garage/i.test(input)&&!/no parking (needed|required)/i.test(input),want:categories.filter(k=>matchers[k].test(input)||(line&&k==='bus')),radius:dist?Number(dist[1]):0.5};
}
export function rank(list,p){
 return list.flatMap(h=>{
 if((p.beds&&h.beds!=null&&h.beds<p.beds)||p.max!=null&&h.price>p.max)return [];
 const gaps=[],places=nearby(h,p.line);
 if(p.beds&&h.beds==null)gaps.push('bedroom count');
 let total=h.price;
 if(h.mode==='rent'){if(h.fee!=null)total+=h.fee;else if(p.max)gaps.push('required fees')}
 if(p.parking){if(h.parking==='Unconfirmed')gaps.push('parking');else if(h.mode==='rent'){if(h.parkingFee==null)gaps.push('parking cost');else total+=h.parkingFee}}
 if(p.max!=null&&total>p.max)return [];
 const hits=p.want.filter(k=>places[k]?.d<=p.radius);
 return [{h,total,hits,gaps,places}];
 }).sort((a,b)=>Number(!!a.gaps.length)-Number(!!b.gaps.length)||b.hits.length-a.hits.length||a.total-b.total);
}
export function context(h){const near=nearby(h);return categories.map(k=>near[k]?k+': '+near[k].name+' ('+near[k].d.toFixed(2)+' mi)':k+': unconfirmed').join('\n')}
export const crime='Hampden · 2025: 710 reported NIBRS Group A records. BPD data; a record count, not unique incidents.';
