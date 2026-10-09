import test from 'node:test';
import assert from 'node:assert/strict';
import {createEmployee} from '../functions/invite-service.js';
class HttpsError extends Error {constructor(code,message){super(message);this.code=code}}
function setup(role='admin',fail=false){const calls=[];return {calls,db:{doc:path=>({get:async()=>({data:()=>({role})}),create:async data=>{calls.push(['profile',path,data]);if(fail)throw Error('offline')}})},getAuth:()=>({createUser:async data=>{calls.push(['auth',data]);return {uid:'new-id',email:data.email}},deleteUser:async uid=>calls.push(['delete',uid])}),HttpsError,randomBytes:()=>({toString:()=> 'random-secret'})}}
const request={auth:{uid:'admin-id'},data:{name:' Anna ',email:'Anna@example.com',hours:7.5}};
test('Einladung erfordert Anmeldung und Verwalterrolle',async()=>{for(const [req,deps,code] of [[{data:request.data},setup(),'unauthenticated'],[request,setup('employee'),'permission-denied']]){await assert.rejects(createEmployee(req,deps),e=>e.code===code);assert.deepEqual(deps.calls,[])}});
test('Ungültige Sollstunden legen keinen Zugang an',async()=>{const deps=setup();await assert.rejects(createEmployee({...request,data:{...request.data,hours:25}},deps),e=>e.code==='invalid-argument');assert.deepEqual(deps.calls,[])});
test('Profil nutzt automatisch erzeugte UID und Mitarbeiterrolle',async()=>{const deps=setup();assert.deepEqual(await createEmployee(request,deps),{uid:'new-id',email:'anna@example.com'});assert.deepEqual(deps.calls[1],['profile','users/new-id',{name:'Anna',email:'anna@example.com',daily:450,role:'employee'}])});
test('Fehlgeschlagenes Profil hinterlässt keinen neuen Auth-Zugang',async()=>{const deps=setup('admin',true);await assert.rejects(createEmployee(request,deps),e=>e.code==='internal');assert.deepEqual(deps.calls.at(-1),['delete','new-id'])});
