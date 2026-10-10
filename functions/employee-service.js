export async function manageEmployee(request,{db,getAuth,HttpsError}){
 if(!request.auth)throw new HttpsError('unauthenticated','Bitte anmelden.');
 const caller=await db.doc(`users/${request.auth.uid}`).get();
 if(caller.data()?.role!=='admin'||caller.data()?.archived)throw new HttpsError('permission-denied','Nur die Verwaltung darf Mitarbeiter verwalten.');
 const{uid,action,confirmation}=request.data||{};
 if(typeof uid!=='string'||!uid||uid.includes('/')||!['archive','restore','delete'].includes(action))throw new HttpsError('invalid-argument','Ungültige Mitarbeiteraktion.');
 const ref=db.doc(`users/${uid}`),snapshot=await ref.get(),person=snapshot.data();
 if(!person)throw new HttpsError('not-found','Mitarbeiter nicht gefunden.');
 if(uid===request.auth.uid||person.role==='admin')throw new HttpsError('failed-precondition','Verwalterkonten können hier nicht archiviert oder gelöscht werden.');
 const auth=getAuth();
 if(action==='delete'&&confirmation!==person.name)throw new HttpsError('invalid-argument','Zum Löschen muss der Mitarbeitername bestätigt werden.');
 if(action==='restore'){
  if(person.deleting)throw new HttpsError('failed-precondition','Die Löschung muss zuerst abgeschlossen werden.');
  await auth.updateUser(uid,{disabled:false});
  await ref.update({archived:false});return{uid,action};
 }
 // Block existing sessions before removing any records. A failed deletion remains retryable.
 await ref.update({archived:true,...(action==='delete'?{deleting:true}:{})});
 try{await auth.updateUser(uid,{disabled:true});await auth.revokeRefreshTokens(uid);}catch(err){if(err.code!=='auth/user-not-found')throw err;}
 if(action==='archive')return{uid,action};
 for(const kind of ['records','requests','timers']){
  while(true){const rows=await db.collection(kind).where('person','==',uid).limit(400).get();if(rows.empty)break;const batch=db.batch();rows.docs.forEach(row=>batch.delete(row.ref));await batch.commit();}
 }
 await db.doc(`timers/${uid}`).delete();
 try{await auth.deleteUser(uid);}catch(err){if(err.code!=='auth/user-not-found')throw err;}
 await ref.delete();return{uid,action};
}
