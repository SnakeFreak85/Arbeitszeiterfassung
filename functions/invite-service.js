export async function createEmployee(request,{db,getAuth,HttpsError,randomBytes}){
 if(!request.auth)throw new HttpsError('unauthenticated','Bitte anmelden.');
 const caller=await db.doc(`users/${request.auth.uid}`).get();
 if(caller.data()?.role!=='admin')throw new HttpsError('permission-denied','Nur die Verwaltung darf Mitarbeiter einladen.');
 const {name,email,hours}=request.data||{};
 if(typeof name!=='string'||!name.trim()||name.trim().length>80||typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||typeof hours!=='number'||!Number.isFinite(hours)||hours<0.5||hours>24)throw new HttpsError('invalid-argument','Bitte Name, E-Mail und gültige Sollstunden eingeben.');
 let user;
 try{user=await getAuth().createUser({email:email.trim().toLowerCase(),displayName:name.trim(),password:randomBytes(32).toString('base64url')});}
 catch(err){if(err.code==='auth/email-already-exists')throw new HttpsError('already-exists','Für diese E-Mail existiert bereits ein Zugang. Bitte den vorhandenen Mitarbeiter verwenden.');throw new HttpsError('internal','Der Zugang konnte nicht angelegt werden.');}
 try{await db.doc(`users/${user.uid}`).create({name:name.trim(),email:user.email,daily:Math.round(hours*60),role:'employee'});}
 catch(err){await getAuth().deleteUser(user.uid);throw new HttpsError('internal','Das Mitarbeiterprofil konnte nicht gespeichert werden. Bitte erneut versuchen.');}
 return {uid:user.uid,email:user.email};
}
