export const stages=['Discover','Qualify','Explore','Tour','Remember','Compare','Act','Move','Live'];
export function estimate({price,down=0,rate=0,years=30,extras=0}){
 for(const n of [price,down,rate,years,extras])if(!Number.isFinite(n)||n<0)throw Error('Enter nonnegative numbers');
 if(down>price||years<=0)throw Error('Check down payment and term');
 const p=price-down,r=rate/1200,n=years*12;
 return (r===0?p/n:p*r/(-Math.expm1(-n*Math.log1p(r))))+extras;
}
export function addEntry(store,id,stage,text,date=''){
 if(!stages.includes(stage)||!id||!text.trim())throw Error('Choose a stage and enter a note');
 return {...store,[id]:[...(store[id]||[]),{stage,text:text.trim().slice(0,1000),date}]};
}
export function report(home,entries){return `${home.name}\n${home.source||'Fictional practice property'}\nListed price: $${home.price}\n`+entries.map(e=>`${e.stage}: ${e.text}${e.date?' — '+e.date:''}`).join('\n');}
