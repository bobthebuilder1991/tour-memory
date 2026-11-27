export function scanAlerts(store, rows, reminders, {now=Date.now(), minDrop=1, nearby=false, scope='default'}={}){
 const day=new Date(now);const today=[day.getFullYear(),String(day.getMonth()+1).padStart(2,'0'),String(day.getDate()).padStart(2,'0')].join('-');
 const next=structuredClone(store||{seen:{},alerts:[]});next.seen??={};next.alerts??=[];const fresh=[];
 const add=(key,text,id)=>{if(next.alerts.some(a=>a.key===key))return;const a={key,text,id,at:now,read:false};next.alerts.unshift(a);fresh.push(a)};
 const baseline=next.seen[scope];const prices=baseline||{};
 for(const h of rows){if(!h.id||!Number.isFinite(h.price))continue;const old=prices[h.id];if(baseline&&old===undefined)add(`new:${scope}:${h.id}`,`New matching listing: ${h.name} · $${h.price.toLocaleString()}`,h.id);if(old!==undefined&&old-h.price>=minDrop)add(`drop:${scope}:${h.id}:${h.price}`,`Price reduced: ${h.name} · $${(old-h.price).toLocaleString()} less`,h.id);if(nearby)add(`near:${h.id}`,`Matching listing nearby: ${h.name}. Confirm address.`,h.id);prices[h.id]=h.price;}
 next.seen[scope]=prices;
 for(const r of reminders){if(r.date&&r.date<=today)add(`due:${r.id}:${r.date}:${r.text}`,`Reminder: ${r.text} · ${r.date}`,r.id)}
 return {store:next,fresh};
}
