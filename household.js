import {parsePrefs,nearby} from './discovery.js';
import {intelligence} from './intelligence.js';
export function evaluateHousehold(h,members){
 const people=members.map(m=>{const p=parsePrefs(m.preferences),r=intelligence(h,p,nearby(h,p.line));const required=r.checks.filter(c=>(m.required||[]).includes(c.name));return {name:m.name,weight:m.weight,score:r.score,coverage:r.coverage,checks:r.checks,blocked:required.some(c=>c.status==='miss'),unverified:required.some(c=>c.status==='unknown')};});
 const known=people.filter(p=>p.score!==null),sum=known.reduce((a,p)=>a+p.weight,0);const score=sum?Math.round(known.reduce((a,p)=>a+p.score*p.weight,0)/sum):null;
 const coverage=people.length?Math.round(people.reduce((a,p)=>a+(p.coverage??0),0)/people.length):null;
 return {people,score,coverage,blocked:people.some(p=>p.blocked),unverified:people.some(p=>p.unverified),spread:known.length>1?Math.max(...known.map(p=>p.score))-Math.min(...known.map(p=>p.score)):null};
}
export function householdRank(homes,members){return homes.map(h=>({h,...evaluateHousehold(h,members)})).sort((a,b)=>Number(a.blocked)-Number(b.blocked)||Number(a.unverified)-Number(b.unverified)||(b.score??-1)-(a.score??-1)||(b.coverage??0)-(a.coverage??0));}
export function householdSummary(rows){return rows.length?rows.slice(0,3).map(r=>`${r.h.name}: ${r.score===null?'unscored':r.score+'% known fit'}, ${r.coverage??0}% evidence${r.blocked?', must-have unmet':r.unverified?', must-have unverified':''}${r.spread!==null?', '+r.spread+' point preference gap':''}`).join('\n'):'No homes to compare.';}
