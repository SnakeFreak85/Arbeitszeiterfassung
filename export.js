import{t,locale,getLanguage}from'./i18n.js';
import {overtime} from './domain.js';
export function buildWorkbook(ExcelJS,person,records,from,to){
 const wb=new ExcelJS.Workbook();wb.creator='Zeitwerk';const ws=wb.addWorksheet(t("Arbeitszeitnachweis"),{views:[{state:'frozen',ySplit:7}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0},properties:{defaultRowHeight:23}});
 ws.columns=[{width:16},{width:23},{width:13},{width:13},{width:18},{width:18},{width:18}];
 ws.mergeCells('A1:G1');ws.getCell('A1').value=t("ARBEITSZEITNACHWEIS");ws.getRow(1).height=38;ws.getCell('A1').font={name:'Calibri',size:20,bold:true,color:{argb:'FFFFFFFF'}};ws.getCell('A1').fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF163D36'}};
 ws.getCell('A3').value=t("Mitarbeiter");ws.mergeCells('B3:G3');ws.getCell('B3').value=person.name;ws.getCell('B3').font={bold:true,size:14};ws.getCell('A4').value=t("Zeitraum");ws.mergeCells('B4:G4');const date=d=>new Date(d+'T12:00:00').toLocaleDateString(locale());ws.getCell('B4').value=date(from)+t(" bis ")+date(to);
 ws.mergeCells('A5:G5');ws.getCell('A5').value=t("Freigegebene Einträge · Zeitangaben in Stunden:Minuten");ws.getCell('A5').font={size:10,color:{argb:'FF64756B'}};
 ws.getRow(7).values=[t("Datum"),t("Art"),t("Beginn"),t("Ende"),t("Pause (Min.)"),t("Arbeitszeit"),t("Überstunden")];ws.getRow(7).height=28;
 const tm=t=>{if(!t)return null;const[h,m]=t.split(':').map(Number);return(h*60+m)/1440};
 records.forEach((r,i)=>{const n=i+8;ws.getRow(n).values=[new Date(r.date+'T12:00:00Z'),t(r.type),tm(r.start),tm(r.end),r.type==='Arbeit'?r.pause:null,r.minutes/1440,overtime(r,person.daily)/1440];ws.getCell('A'+n).numFmt=getLanguage()==='en'?'dd/mm/yyyy':'dd.mm.yyyy';for(const c of ['C','D'])ws.getCell(c+n).numFmt='hh:mm';for(const c of ['F','G'])ws.getCell(c+n).numFmt='[h]:mm';ws.getRow(n).eachCell({includeEmpty:true},cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2?'FFF2F5F0':'FFFFFFFF'}};cell.border={bottom:{style:'hair',color:{argb:'FFDDE4DA'}}}})});
 const total=records.length+9;ws.mergeCells(`A${total}:E${total}`);ws.getCell('A'+total).value=t("Gesamt geleistete Arbeit / Überstunden");ws.getCell('F'+total).value=records.filter(r=>r.type==='Arbeit').reduce((s,r)=>s+r.minutes,0)/1440;ws.getCell('G'+total).value=records.reduce((s,r)=>s+overtime(r,person.daily),0)/1440;for(const c of ['F','G'])ws.getCell(c+total).numFmt='[h]:mm';
 for(const n of [7,total])ws.getRow(n).eachCell({includeEmpty:true},c=>{c.font={name:'Calibri',bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF254F43'}}});
 ws.mergeCells(`A${total+2}:G${total+2}`);ws.getCell('A'+(total+2)).value=t("Überstunden: positive Mehrarbeit zum Tagessoll; Wochenende/bundesweite Feiertage: Soll 0.");ws.getCell('A'+(total+2)).font={size:10,color:{argb:'FF64756B'}};
 ws.eachRow(row=>row.eachCell(cell=>{cell.alignment={vertical:'middle',horizontal:cell.col>=3?'center':'left'};if(!cell.font)cell.font={name:'Calibri',size:11}}));ws.autoFilter='A7:G'+Math.max(7,records.length+7);ws.pageSetup.printArea=`A1:G${total+2}`;ws.pageSetup.printTitlesRow='1:7';return wb;
}
