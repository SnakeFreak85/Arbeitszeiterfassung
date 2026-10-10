import{fmt}from'./domain.js';
export const availableActions=timer=>({start:!timer,pause:!!timer&&!timer.pauseStart,resume:!!timer&&!!timer.pauseStart,stop:!!timer});
export function clockChange(state,uid,action,now=Date.now()){
 const p=state.people.find(p=>p.id===uid);if(!p||p.archived)throw Error('Dieser Zugang ist nicht für die Zeiterfassung freigegeben.');
 const timer=state.timers[uid];if(!availableActions(timer)[action])throw Error('Diese Aktion ist im aktuellen Status nicht möglich.');
 const next=structuredClone(state),dateOf=value=>new Date(value).toLocaleDateString('sv-SE'),timeOf=value=>new Date(value).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',hour12:false});
 if(action==='start'){
  if(state.records.some(r=>r.person===uid&&r.date===dateOf(now)))throw Error('Für diesen Tag existiert bereits ein Eintrag. Bitte eine Änderung beantragen.');
  if(state.requests.some(r=>r.person===uid&&r.date===dateOf(now)&&r.status==='pending'))throw Error('Für diesen Tag ist bereits ein Antrag offen.');
  next.timers[uid]={start:now,pauseMs:0};
 }else if(action==='pause')next.timers[uid].pauseStart=now;
 else if(action==='resume'){next.timers[uid].pauseMs+=Math.max(0,now-timer.pauseStart);delete next.timers[uid].pauseStart;}
 else{
  const pauseMs=timer.pauseMs+(timer.pauseStart?Math.max(0,now-timer.pauseStart):0),minutes=Math.floor((now-timer.start-pauseMs)/60000),date=dateOf(timer.start);
  if(minutes<1)throw Error('Mindestens eine Minute Arbeitszeit erforderlich.');
  if(minutes>1440)throw Error('Die Arbeitszeit überschreitet 24 Stunden. Bitte einen manuellen Eintrag erfassen.');
  if(state.records.some(r=>r.person===uid&&r.date===date))throw Error('Für diesen Tag existiert bereits ein Eintrag. Bitte eine Änderung beantragen.');
  if(state.requests.some(r=>r.person===uid&&r.date===date&&r.status==='pending'))throw Error('Für diesen Tag ist bereits ein Antrag offen.');
  next.records.push({id:uid+'_'+date,person:uid,date,type:'Arbeit',start:timeOf(timer.start),end:timeOf(now),pause:Math.round(pauseMs/60000),minutes,created:new Date(now).toISOString(),source:'timer'});delete next.timers[uid];
 }
 return{state:next,time:timeOf(now),duration:action==='stop'?fmt(next.records.at(-1).minutes):null};
}
