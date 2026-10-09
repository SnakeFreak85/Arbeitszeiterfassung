import{test}from'node:test';import assert from'node:assert/strict';import{minutes,holiday,escape,overtime}from'../domain.js';
test('Arbeitszeit inklusive Pause und Nachtschicht',()=>{assert.equal(minutes('08:00','16:30',30),480);assert.equal(minutes('22:00','06:00',30),450);assert.throws(()=>minutes('08:00','08:00',0));assert.throws(()=>minutes('08:00','09:00',60));assert.throws(()=>minutes('25:00','09:00',0))});
test('Bundesweite feste und bewegliche Feiertage',()=>{assert.equal(holiday('2026-10-03'),'Tag der Deutschen Einheit');assert.equal(holiday('2026-04-03'),'Karfreitag');assert.equal(holiday('2026-04-06'),'Ostermontag');assert.equal(holiday('2026-10-09'),'')});test('Namen werden HTML-sicher ausgegeben',()=>assert.equal(escape('<script>'),'&lt;script&gt;'));

test("Überstunden: Mehrarbeit, Wochenende und Abwesenheiten",()=>{const r={type:"Arbeit",date:"2026-10-08",minutes:510};assert.equal(overtime(r,480),30);assert.equal(overtime({...r,minutes:300},480),0);assert.equal(overtime({...r,date:"2026-10-10"},480),510);assert.equal(overtime({...r,date:"2026-10-03"},480),510);assert.equal(overtime({...r,type:"Urlaub"},480),0);});

test('Approval applies to vacation and every change, not new work or sick leave',async()=>{
 const {approvalRequired}=await import('../domain.js');
 assert.equal(approvalRequired('Arbeit',''),false);
 assert.equal(approvalRequired('Krankheit',''),false);
 assert.equal(approvalRequired('Urlaub',''),true);
 for(const type of ['Arbeit','Krankheit','Urlaub'])assert.equal(approvalRequired(type,'existing-record'),true);
});

test('Approval completes identical duplicates without duplicating or overwriting days',async()=>{
 const {approvedRecords}=await import('../domain.js');const entry={id:'p_2026-10-09',person:'p',date:'2026-10-09',type:'Arbeit',start:'07:30',end:'18:00',pause:30,minutes:600};const request={...entry,id:'request',recordId:'',status:'pending'};
 assert.deepEqual(approvedRecords([entry],request),[entry]);
 assert.throws(()=>approvedRecords([entry],{...request,minutes:590}),/abweichender Eintrag/);
 assert.equal(approvedRecords([],request)[0].id,entry.id);
 const changed={...request,recordId:entry.id,old:{...entry},minutes:590};assert.equal(approvedRecords([entry],changed)[0].minutes,590);
 assert.throws(()=>approvedRecords([{...entry,minutes:580}],changed),/inzwischen geändert/);
});
