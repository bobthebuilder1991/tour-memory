import {stages} from './lifecycle.js';
export function concierge(input){
 const q=input.trim();
 if(/^(why (this (home|property)|does this match)|match score|how well does this match)/i.test(q))return {kind:'intelligence',topic:'match'};
 if(/^(what should i ask|missing information|red flags|follow.up questions)/i.test(q))return {kind:'intelligence',topic:'questions'};
 if(/^(true (monthly )?cost|total monthly cost|all.in cost)/i.test(q))return {kind:'intelligence',topic:'cost'};
 if(/^(confirm|yes|approve)( it)?[.!]?$/i.test(q))return {kind:'confirm'};
 if(/^(cancel|no|never mind)[.!]?$/i.test(q))return {kind:'cancel'};
 if(/^(what can (you|i) do|help|commands)[?!.]?$/i.test(q))return {kind:'help'};
 if(/^(what did (i|we) (say|note|remember)|recall|read (my |our )?notes|show (my |our )?notes)/i.test(q))return {kind:'recall'};
 if(/^(next match|next stop|compare|switch tour|find matches)[.!?]?$/i.test(q))return {kind:'action',action:q.replace(/[.!?]$/,'').toLowerCase()};
 const m=q.match(/^(?:add|save|remember|record)\s+(?:(?:a )?(?:note|task)\s+)?(?:for\s+)?(discover|qualify|explore|tour|remember|compare|act|move|live)\s*[:,-]\s*(.+)$/i);
 if(m)return {kind:'entry',stage:stages.find(s=>s.toLowerCase()===m[1].toLowerCase()),text:m[2].slice(0,1000)};
 if(/^(show|read|recall) (my )?(journey|tasks|journal)/i.test(q))return {kind:'journal'};
 if(/^(remember|note|save note)\s+(.+)/i.test(q))return {kind:'note',text:q.match(/^(?:remember|save note|note)\s+(.+)/i)[1]};
 return null;
}
