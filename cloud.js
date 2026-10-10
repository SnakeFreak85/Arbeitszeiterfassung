import{getLanguage}from'./i18n.js';
import{initializeApp}from'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import{getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,sendPasswordResetEmail}from'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import{getFirestore,doc,getDoc,getDocs,collection,query,where,runTransaction,onSnapshot}from'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';
import{getFunctions,httpsCallable}from'https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js';
import{firebaseConfig}from'./firebase-config.js';
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);let baseline={},profile;
export const watchAuth=callback=>onAuthStateChanged(auth,callback);
export const login=(email,password)=>signInWithEmailAndPassword(auth,email,password);
const invite= httpsCallable(getFunctions(app,'europe-west3'),'inviteEmployee');
export async function inviteEmployee(data){return(await invite(data)).data}
const manage=httpsCallable(getFunctions(app,'europe-west3'),'manageEmployee');
export async function manageEmployee(data){return(await manage(data)).data}
export const logout=()=>signOut(auth);
export const resetPassword=email=>{auth.languageCode=getLanguage();return sendPasswordResetEmail(auth,email)};
export function currentUid(){return auth.currentUser?.uid}
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v}const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
function entities(state){const m={};for(const p of state.people)m['users/'+p.id]={name:p.name,daily:p.daily,role:p.role||'employee',...(p.email?{email:p.email}:{}),...(p.archived!==undefined?{archived:p.archived}:{}),...(p.deleting!==undefined?{deleting:p.deleting}:{})};for(const kind of ['records','requests'])for(const r of state[kind])m[kind+'/'+r.id]=r;for(const[id,t]of Object.entries(state.timers))m['timers/'+id]={...t,person:id};if(profile?.role==='admin')m['settings/export']={email:state.email};return m}
export async function loadCloud(){const uid=currentUid();if(!uid)throw Error('Bitte anmelden.');const user=await getDoc(doc(db,'users',uid));if(!user.exists())throw Error('Für diesen Zugang fehlt das Mitarbeiterprofil. Bitte die Verwaltung kontaktieren.');profile={id:uid,...user.data()};const admin=profile.role==='admin';const list=async kind=>{const q=admin?collection(db,kind):query(collection(db,kind),where('person','==',uid));return(await getDocs(q)).docs.map(d=>({...d.data(),id:d.id}))};const people=admin?(await getDocs(collection(db,'users'))).docs.map(d=>({id:d.id,...d.data()})):[profile];const [records,requests,timers]=await Promise.all(['records','requests','timers'].map(list));let email='';if(admin){const s=await getDoc(doc(db,'settings','export'));email=s.data()?.email||''}const state={people,records,requests,timers:Object.fromEntries(timers.map(t=>{const{id,person,...v}=t;return[id,v]})),email};baseline=structuredClone(entities(state));return{state,profile}}
export async function persistCloud(state){const next=structuredClone(entities(state)),paths=[...new Set([...Object.keys(baseline),...Object.keys(next)])].filter(p=>!equal(baseline[p],next[p]));if(!paths.length)return;const previous=structuredClone(baseline);await runTransaction(db,async tx=>{const docs=await Promise.all(paths.map(p=>tx.get(doc(db,p))));docs.forEach((snapshot,i)=>{const old=previous[paths[i]];if(!equal(snapshot.exists()?snapshot.data():undefined,old))throw Error('Daten wurden auf einem anderen Gerät geändert. Bitte neu laden und erneut versuchen.')});paths.forEach(p=>next[p]?tx.set(doc(db,p),next[p]):tx.delete(doc(db,p)))});baseline=structuredClone(next)}

export const watchRequests=(callback,onError)=>onSnapshot(profile?.role==='admin'?collection(db,'requests'):query(collection(db,'requests'),where('person','==',currentUid())),snapshot=>callback(snapshot.docs.map(d=>({...d.data(),id:d.id}))),onError);
