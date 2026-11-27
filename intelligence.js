export function intelligence(h,p,places={}){
 const checks=[];const add=(name,status,question)=>checks.push({name,status,question});
 if(p.max!=null){const known=h.mode==='rent'?h.price+(h.fee??0)+(p.parking?(h.parkingFee??0):0):h.price;add('Budget',known>p.max?'miss':h.mode==='rent'&&(h.fee==null||(p.parking&&h.parkingFee==null))?'unknown':'match','Confirm required fees and parking charges.');}
 if(p.beds)add('Bedrooms',h.beds==null?'unknown':h.beds>=p.beds?'match':'miss','Confirm bedroom count.');
 if(p.parking)add('Parking',!h.parking||/unconfirmed|ask/i.test(h.parking)?'unknown':/no parking|not available/i.test(h.parking)?'miss':'match','Is parking included and guaranteed?');
 for(const k of p.want||[])add(k,places[k]==null?'unknown':places[k].d<=p.radius?'match':'miss',`Verify ${k} access and actual travel time.`);
 const known=checks.filter(c=>c.status!=='unknown');const matches=known.filter(c=>c.status==='match').length;
 const score=known.length?Math.round(100*matches/known.length):null;
 const coverage=checks.length?Math.round(100*known.length/checks.length):null;
 const questions=checks.filter(c=>c.status!=='match').map(c=>c.question);
 if(h.mode==='rent'){if(h.fee==null)questions.push('What mandatory monthly fees apply?');questions.push('Which utilities are included?','What are the deposit and move-in fees?');}else questions.push('What are the property taxes, insurance, HOA and inspection findings?');
 return {score,coverage,checks,questions:[...new Set(questions)]};
}
export function rentalCosts(h,{parking=false,utilities=null}={}){
 if(h.mode!=='rent')throw Error('Rental only');
 if(utilities!==null&&(!Number.isFinite(utilities)||utilities<0))throw Error('Invalid utilities');
 const missing=[];if(h.fee==null)missing.push('mandatory fees');if(parking&&h.parkingFee==null)missing.push('parking');if(utilities==null)missing.push('utilities');
 return {subtotal:h.price+(h.fee??0)+(parking?(h.parkingFee??0):0)+(utilities??0),missing};
}
export function intelligenceText(h,p,places){const r=intelligence(h,p,places);return `${r.score==null?'Match not scored':r.score+'% known preference match'} · ${r.coverage==null?'no criteria':r.coverage+'% evidence coverage'}. ${r.checks.map(c=>c.name+': '+c.status).join('; ')}. Ask: ${r.questions[0]||'Confirm availability.'}`;}
