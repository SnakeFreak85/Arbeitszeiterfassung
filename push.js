import{getApps}from'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import{getMessaging,getToken,deleteToken,isSupported}from'https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js';
import{getAuth}from'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import{getFirestore,doc,setDoc,deleteDoc}from'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';
import{webPushKey}from'./push-config.js';
import{getLanguage}from'./i18n.js';
let device=null;
export const pushEnabled=()=>!!device&&device.uid===getAuth(getApps()[0]).currentUser?.uid;
export async function enablePush(){
 if(!webPushKey)throw Error('Push-Benachrichtigungen müssen noch in Firebase eingerichtet werden.');
 if(!('Notification'in window)||!('serviceWorker'in navigator))throw Error('Push wird auf diesem Gerät nicht unterstützt. Auf dem iPhone bitte die installierte App verwenden.');
 const permission=await Notification.requestPermission();
 if(permission!=='granted')throw Error('Bitte Benachrichtigungen in den Geräteeinstellungen erlauben.');
 if(!await isSupported())throw Error('Push wird auf diesem Gerät nicht unterstützt. Auf dem iPhone bitte die installierte App verwenden.');
 const app=getApps()[0],uid=getAuth(app).currentUser?.uid;
 if(!uid)throw Error('Bitte anmelden.');
 const registration=await navigator.serviceWorker.ready;
 const token=await getToken(getMessaging(app),{vapidKey:webPushKey,serviceWorkerRegistration:registration});
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 if(getAuth(app).currentUser?.uid!==uid)throw Error('Bitte anmelden.');
 await setDoc(doc(getFirestore(app),'users',uid,'pushDevices',id),{token,language:getLanguage(),updated:new Date().toISOString()});
 device={uid,id};localStorage.setItem('zeitwerk-push-device',JSON.stringify(device));
}
export async function disablePush(){
 const app=getApps()[0],uid=getAuth(app).currentUser?.uid;
 let saved=device;try{saved=saved||JSON.parse(localStorage.getItem('zeitwerk-push-device')||'null');}catch{}
 if(saved?.uid===uid)await deleteDoc(doc(getFirestore(app),'users',uid,'pushDevices',saved.id));
 if(await isSupported())await deleteToken(getMessaging(app));
 device=null;localStorage.removeItem('zeitwerk-push-device');
}
export function restorePush(uid){try{const saved=JSON.parse(localStorage.getItem('zeitwerk-push-device'));device=saved?.uid===uid?saved:null;}catch{device=null;}}
export async function updatePushLanguage(){if(pushEnabled()){const app=getApps()[0];await setDoc(doc(getFirestore(app),'users',device.uid,'pushDevices',device.id),{language:getLanguage(),updated:new Date().toISOString()},{merge:true});}}
