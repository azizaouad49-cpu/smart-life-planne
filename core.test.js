import test from 'node:test';
import assert from 'node:assert/strict';
import {phaseForDate,intervalForShift,overlaps,parseDate,addDays,dateKey,academicSessions,classifyClass,generateClasses} from '../src/core.js';
const ref='2026-01-10';
test('cycle follows the exact five phases from configurable reference date',()=>{
 const phases=['day','restBeforeNight','night','recovery','rest2','day','restBeforeNight'];
 phases.forEach((p,i)=>assert.equal(phaseForDate(addDays(parseDate(ref),i),ref,'day'),p));
});
test('cycle works when reference is a night or rest phase',()=>{
 assert.equal(phaseForDate(parseDate(ref),ref,'night'),'night');
 assert.equal(phaseForDate(addDays(parseDate(ref),1),ref,'night'),'recovery');
 assert.equal(phaseForDate(addDays(parseDate(ref),-1),ref,'day'),'rest2');
});
test('night shift correctly ends next day at 09:00',()=>{
 const iv=intervalForShift('2026-01-10','night');
 assert.equal(dateKey(iv.start),'2026-01-10');assert.equal(iv.start.getHours(),21);
 assert.equal(dateKey(iv.end),'2026-01-11');assert.equal(iv.end.getHours(),9);
});
test('overlap treats end-to-start boundary as non-conflicting',()=>{
 const a={start:new Date(2026,0,10,19),end:new Date(2026,0,10,21)};
 const b={start:new Date(2026,0,10,21),end:new Date(2026,0,11,9)};
 assert.equal(overlaps(a,b),false);
});
test('fixed Monday/Tuesday classes remain at 19-21 and conflicts detected for day service',()=>{
 const monday=parseDate('2026-01-12');assert.equal(monday.getDay(),1);
 const session=academicSessions(monday)[0];assert.equal(session.start.getHours(),19);assert.equal(session.end.getHours(),21);
 const result=classifyClass(session,'2026-01-12','day');assert.equal(result.status,'conflict');
});
test('class following a night shift is flagged as post-night',()=>{
 // Reference night on Monday: Tuesday is recovery, so Tuesday's fixed class is marked after-night.
 const tuesday=parseDate('2026-01-13'),session=academicSessions(tuesday)[0];
 assert.equal(classifyClass(session,'2026-01-12','night').status,'afterNight');
});
test('classes are generated only on Monday and Tuesday',()=>{
 const result=generateClasses('2026-01-12','2026-01-18',{referenceDate:'2026-01-12',referencePhase:'day'});
 assert.equal(result.length,2);assert.deepEqual(result.map(x=>x.weekday),[1,2]);
});
