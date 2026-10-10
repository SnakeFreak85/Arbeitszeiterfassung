import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {randomBytes} from 'node:crypto';
initializeApp();
import {createEmployee} from './invite-service.js';
export const inviteEmployee=onCall({region:'europe-west3',maxInstances:3},request=>createEmployee(request,{db:getFirestore(),getAuth,HttpsError,randomBytes}));
import {manageEmployee as manageEmployeeAccount} from './employee-service.js';
export const manageEmployee=onCall({region:'europe-west3',maxInstances:3,timeoutSeconds:120},request=>manageEmployeeAccount(request,{db:getFirestore(),getAuth,HttpsError}));

import {getMessaging} from 'firebase-admin/messaging';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import {notifyNewRequest} from './push-service.js';
export const notifyApprovalRequest=onDocumentCreated({document:'requests/{requestId}',region:'europe-west3',maxInstances:3},event=>event.data?notifyNewRequest(event.data,{db:getFirestore(),messaging:getMessaging()}):undefined);
