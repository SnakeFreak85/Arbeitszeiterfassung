import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {approvedRecords} from '../domain.js';

test('Approval and rejection persist after reloading, including an already saved record',async()=>{
 const source=readFileSync(new URL('../cloud.js',import.meta.url),'utf8').replace(/^import.*\n/gm,'').replace(/export /g,'');
 for(const mode of ['new','existing','reject']){
 const request={id:'request',person:'worker',date:'2026-10-09',type:'Arbeit',start:'07:30',end:'18:00',pause:30,minutes:600,status:'pending',recordId:''};
 const database=new Map([['users/admin',{name:'Admin',daily:480,role:'admin'}],['requests/request',structuredClone(request)]]);
 if(mode==='existing')database.set('records/worker_2026-10-09',{...request,id:'worker_2026-10-09'});
 const snapshot=path=>({id:path.split('/').at(-1),exists:()=>database.has(path),data:()=>structuredClone(database.get(path))});
 const dependencies={getLanguage:()=> 'de',initializeApp:()=>({}),firebaseConfig:{},getAuth:()=>({currentUser:{uid:'admin'}}),getFirestore:()=>({}),getFunctions:()=>({}),httpsCallable:()=>()=>{},doc:(_db,...parts)=>parts.join('/'),getDoc:async path=>snapshot(path),collection:(_db,kind)=>kind,getDocs:async kind=>({docs:[...database.keys()].filter(path=>path.startsWith(kind+'/')).map(snapshot)}),runTransaction:async(_db,fn)=>{const writes=[];await fn({get:async path=>snapshot(path),set:(path,value)=>writes.push([path,structuredClone(value)]),delete:path=>writes.push([path,undefined])});for(const[path,value]of writes)value?database.set(path,value):database.delete(path);}};
 const api=new Function(...Object.keys(dependencies),source+';return{loadCloud,persistCloud};')(...Object.values(dependencies));
 const{state}=await api.loadCloud();const r=state.requests[0];if(mode!=='reject')state.records=approvedRecords(state.records,r);r.status=mode==='reject'?'rejected':'approved';r.decided='2026-10-10T11:00:00Z';r.decidedBy='admin';await api.persistCloud(state);
 const reloaded=await api.loadCloud();assert.equal(reloaded.state.requests[0].status,r.status);assert.equal(reloaded.state.requests[0].decidedBy,'admin');assert.equal(reloaded.state.records.length,mode==='reject'?0:1);
 }
});
