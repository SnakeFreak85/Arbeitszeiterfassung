export async function notifyNewRequest(snapshot,{db,messaging}){
 const request=snapshot.data();if(!request||request.status!=='pending')return;
 const worker=await db.doc(`users/${request.person}`).get(),name=worker.data()?.name||'Zeitwerk';
 const admins=await db.collection('users').where('role','==','admin').get();
 const devices=[];
 for(const admin of admins.docs){if(admin.data().archived)continue;const list=await admin.ref.collection('pushDevices').get();for(const device of list.docs){const d=device.data();if(typeof d.token==='string'&&d.token)devices.push({ref:device.ref,...d});}}
 for(let offset=0;offset<devices.length;offset+=500){const batch=devices.slice(offset,offset+500);const result=await messaging.sendEach(batch.map(d=>({token:d.token,data:{title:d.language==='en'?'Zeitwerk · New approval request':'Zeitwerk · Neuer Freigabeantrag',body:d.language==='en'?`${name} submitted a request. Open approvals to review it.`:`${name} hat einen Antrag eingereicht. Bitte die Freigaben prüfen.`,requestId:snapshot.id},webpush:{headers:{TTL:'86400'}}})));
 await Promise.all(result.responses.map((r,i)=>!r.success&&['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(r.error?.code)?batch[i].ref.delete():Promise.resolve()));}
}
