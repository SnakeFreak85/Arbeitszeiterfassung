import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {notifyNewRequest} from '../functions/push-service.js';

test('New approval pushes go only to active admins, use device language and remove invalid tokens',async()=>{
 const sent=[],deleted=[];
 const device=(id,language)=>({ref:{delete:async()=>deleted.push(id)},data:()=>({token:id,language})});
 const admin=(id,archived,list)=>({data:()=>({role:'admin',archived}),ref:{collection:kind=>{assert.equal(kind,'pushDevices');return{get:async()=>({docs:list})};}}});
 const db={doc:()=>({get:async()=>({data:()=>({name:'Valerio'})})}),collection:kind=>{assert.equal(kind,'users');return{where:(key,op,value)=>{assert.equal(key,'role');assert.equal(value,'admin');return{get:async()=>({docs:[admin('a',false,[device('de-token','de'),device('en-token','en')]),admin('b',true,[device('blocked','en')])]})}}};}};
 const messaging={sendEach:async messages=>{sent.push(...messages);return{responses:[{success:true},{success:false,error:{code:'messaging/registration-token-not-registered'}}]};}};
 await notifyNewRequest({id:'r',data:()=>({person:'worker',status:'pending'})},{db,messaging});
 assert.equal(sent.length,2);assert.match(sent[0].data.body,/Valerio hat/);assert.match(sent[1].data.body,/Valerio submitted/);assert.equal(sent[0].data.requestId,'r');assert.deepEqual(deleted,['en-token']);
 await notifyNewRequest({id:'old',data:()=>({status:'approved'})},{db,messaging});assert.equal(sent.length,2);
});

test('Push notification displays once and clicking focuses the app at approvals',async()=>{
 const handlers={},notifications=[],messages=[];let focused=false,closed=false;
 const client={url:'https://snakefreak85.github.io/Arbeitszeiterfassung/',focus:async()=>{focused=true},postMessage:v=>messages.push(v)};
 const context={URL,self:{location:{href:client.url+'sw.js'},addEventListener:(kind,fn)=>handlers[kind]=fn,registration:{showNotification:async(...args)=>notifications.push(args)},clients:{matchAll:async()=>[client],openWindow:()=>{throw Error('Should reuse the existing app');}}}};
 vm.runInNewContext(readFileSync(new URL('../sw.js',import.meta.url),'utf8'),context);
 let task;handlers.push({data:{json:()=>({data:{title:'New request',body:'Please review',requestId:'r'}})},waitUntil:p=>task=p});await task;
 assert.equal(notifications.length,1);assert.equal(notifications[0][1].tag,'approval-r');
 handlers.notificationclick({notification:{close:()=>closed=true},waitUntil:p=>task=p});await task;
 assert.ok(closed&&focused);assert.equal(messages.at(-1).type,'open-approvals');
});
