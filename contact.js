export const roles=['Landlord','Property manager','Leasing agent','Listing agent','Other tenancy contact'];
export function composeLink(channel,contact,home,body){
 if(channel==='text'){
  const number=contact.phone.trim().replace(/[ ().-]/g,'');
  return /^\+?\d{7,15}$/.test(number)?'sms:'+number+'?body='+encodeURIComponent(body):null;
 }
 const email=contact.email.trim();
 return /^[^\s@,;:?&#<>]+@[^\s@,;:?&#<>]+\.[^\s@,;:?&#<>]+$/.test(email)?'mailto:'+encodeURIComponent(email).replace('%40','@')+'?subject='+encodeURIComponent('Question about '+home)+'&body='+encodeURIComponent(body):null;
}
export function outreach(q){
 const match=q.trim().match(/^(?:please\s+)?(?:draft\s+(?:an?\s+)?)?(text|sms|email)\b\s*(.*)$/i);
 if(!match)return null;
 const rest=match[2].replace(/^(?:message\s+)?(?:to\s+)?(?:the\s+|my\s+)?(landlord|property manager|leasing agent|listing agent|tenancy contact)\b\s*[,.:–-]?\s*/i,'');
 const role=rest!==match[2]?match[2].match(/landlord|property manager|leasing agent|listing agent|tenancy contact/i)?.[0]:null;
 const topic=rest.replace(/^(?:and\s+)?(?:ask(?:ing)?\s+)?(?:about|if|whether)\s+/i,'').trim();
 let question='';
 if(topic&&topic!==rest)question='Could you confirm '+topic.replace(/[?.!]+$/,'')+'?';
 else if(topic)question=topic;
 return {channel:/email/i.test(match[1])?'email':'text',question,role};
}
