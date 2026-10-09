import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {t,setLanguage,getLanguage,locale,errorText,staticText} from '../i18n.js';
import {buildWorkbook} from '../export.js';
test('DE/EN interface, holiday and error translations',()=>{
 setLanguage('en');assert.equal(getLanguage(),'en');assert.equal(locale(),'en-GB');assert.equal(t('Krankheit'),'Sick leave');assert.equal(t('Tag der Deutschen Einheit'),'German Unity Day');assert.equal(staticText('<button>Ändern</button>'),'<button>Edit</button>');assert.match(errorText({code:'permission-denied'}),/Access denied/);
 setLanguage('de');assert.equal(t('Krankheit'),'Krankheit');assert.equal(locale(),'de-DE');
});
test('Both Excel languages preserve employee data and numeric durations',async()=>{
 const person={name:'Urlaub Name',daily:480},rows=[{date:'2026-10-02',type:'Arbeit',start:'08:00',end:'17:00',pause:0,minutes:540}];
 for(const lang of ['de','en']){setLanguage(lang);const wb=buildWorkbook(ExcelJS,person,rows,'2026-10-01','2026-10-31');const reload=new ExcelJS.Workbook();await reload.xlsx.load(await wb.xlsx.writeBuffer());const ws=reload.worksheets[0];assert.equal(ws.getCell('B3').value,person.name);assert.equal(ws.getCell('B8').value,lang==='en'?'Work':'Arbeit');assert.equal(ws.getCell('G7').value,lang==='en'?'Overtime':'Überstunden');assert.equal(wb.worksheets[0].getCell('F8').value,540/1440);assert.equal(wb.worksheets[0].getCell('G8').value,60/1440);assert.equal(ws.getCell('G8').numFmt,'[h]:mm');assert.equal(rows[0].type,'Arbeit');}setLanguage('de');
});
