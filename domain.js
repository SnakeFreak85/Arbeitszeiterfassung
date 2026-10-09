export function minutes(start,end,pause=0){const p=Number(pause);if(!start||!end||!Number.isFinite(p)||p<0)throw Error('Bitte gültige Zeiten und Pause eingeben.');const toMin=t=>{if(!/^\d{2}:\d{2}$/.test(t))throw Error('Ungültige Uhrzeit.');const[h,m]=t.split(':').map(Number);if(h>23||m>59)throw Error('Ungültige Uhrzeit.');return h*60+m};let d=toMin(end)-toMin(start);if(d<0)d+=1440;if(d===0||p>=d)throw Error('Ende und Pause ergeben keine positive Arbeitszeit.');return d-p}
export const fmt=m=>`${Math.floor(m/60)}:${String(Math.round(m%60)).padStart(2,'0')}`;
export const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function holiday(date){const y=Number(date.slice(0,4));const fixed={'01-01':'Neujahr','05-01':'Tag der Arbeit','10-03':'Tag der Deutschen Einheit','12-25':'1. Weihnachtstag','12-26':'2. Weihnachtstag'};if(fixed[date.slice(5)])return fixed[date.slice(5)];const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;const easter=new Date(Date.UTC(y,Math.floor(n/31)-1,n%31+1));for(const[offset,name]of[[-2,'Karfreitag'],[1,'Ostermontag'],[39,'Christi Himmelfahrt'],[50,'Pfingstmontag']]){const x=new Date(easter);x.setUTCDate(x.getUTCDate()+offset);if(x.toISOString().slice(0,10)===date)return name}return ''}

export function overtime(record,daily){if(record.type!=='Arbeit')return 0;const day=new Date(record.date+'T12:00:00').getDay();const target=day===0||day===6||holiday(record.date)?0:daily;return Math.max(0,record.minutes-target)}

export const approvalRequired=(type,existingId)=>type==='Urlaub'||Boolean(existingId);

export function approvedRecords(records,request){
 const same=(a,b)=>JSON.stringify(Object.entries(a||{}).sort(([a],[b])=>a.localeCompare(b)))===JSON.stringify(Object.entries(b||{}).sort(([a],[b])=>a.localeCompare(b)));
 if(request.recordId){const current=records.find(r=>r.id===request.recordId);if(!current||!same(current,request.old))throw Error('Der ursprüngliche Eintrag wurde inzwischen geändert. Antrag bitte ablehnen und neu stellen.');}
 else{const existing=records.filter(r=>r.person===request.person&&r.date===request.date);if(existing.length){const fields=['person','date','type','start','end','pause','minutes'];if(existing.length===1&&fields.every(key=>existing[0][key]===request[key])&&(existing[0].fraction||1)===(request.fraction||1))return records;throw Error('Für diesen Tag existiert ein abweichender Eintrag. Bitte den Antrag ablehnen und Änderungen über den vorhandenen Eintrag beantragen.');}}
 const entry={...request,id:request.recordId||request.person+'_'+request.date};delete entry.old;return [...records.filter(r=>r.id!==request.recordId),entry];
}
