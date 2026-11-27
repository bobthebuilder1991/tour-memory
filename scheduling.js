export function calendarFile(home,title,start,end){
 const a=new Date(start),b=new Date(end);if(!Number.isFinite(+a)||!Number.isFinite(+b)||b<=a)throw Error('Choose a valid start and end');
 const esc=x=>String(x).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
 const stamp=x=>x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Tour Memory//Tours//EN','BEGIN:VEVENT','UID:'+crypto.randomUUID()+'@tour-memory','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(a),'DTEND:'+stamp(b),'SUMMARY:'+esc(title),'LOCATION:'+esc(home),'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
export function communicationStatus(value){if(!['draft','sent (self-reported)','reply received (self-reported)','closed'].includes(value))throw Error('Invalid status');return value;}
