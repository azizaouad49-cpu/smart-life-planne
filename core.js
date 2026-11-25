// Pure scheduling utilities. Dates are handled as local calendar dates (not UTC strings).
export const CYCLE = ['day', 'restBeforeNight', 'night', 'recovery', 'rest2'];
export const PHASE_LABELS = {
  day: 'Service de jour', restBeforeNight: 'Repos avant nuit', night: 'Service de nuit',
  recovery: 'Récupération', rest2: 'Deuxième repos', leave: 'Congé', absence: 'Absence', reinforcementDay: 'Renfort de jour', reinforcementNight: 'Renfort de nuit'
};
export const pad = n => String(n).padStart(2, '0');
export function dateKey(date) { return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
export function parseDate(key) { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d,12); }
export function addDays(date, n) { const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12); d.setDate(d.getDate()+n); return d; }
export function dayDiff(a,b) { return Math.round((parseDate(dateKey(b))-parseDate(dateKey(a)))/86400000); }
export function phaseForDate(date, referenceDate, referencePhase='day') {
  const offset = dayDiff(parseDate(referenceDate), date);
  const start = CYCLE.indexOf(referencePhase);
  return CYCLE[((offset + start) % 5 + 5) % 5];
}
export function getShift(date, referenceDate, referencePhase='day', overrides={}) {
  const key=dateKey(date);
  if (overrides[key]) return overrides[key];
  return phaseForDate(date, referenceDate, referencePhase);
}
export function intervalForShift(date, phase) {
  const d=parseDate(typeof date==='string'?date:dateKey(date));
  if (phase==='day'||phase==='reinforcementDay') return {start:new Date(d.getFullYear(),d.getMonth(),d.getDate(),9),end:new Date(d.getFullYear(),d.getMonth(),d.getDate(),21)};
  if (phase==='night'||phase==='reinforcementNight') return {start:new Date(d.getFullYear(),d.getMonth(),d.getDate(),21),end:new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,9)};
  return null;
}
export function overlaps(a,b) { return a.start < b.end && b.start < a.end; }
export function academicSessions(date) {
  const day=date.getDay();
  if(day!==1 && day!==2) return [];
  return [{date:dateKey(date),weekday:day,start:new Date(date.getFullYear(),date.getMonth(),date.getDate(),19),end:new Date(date.getFullYear(),date.getMonth(),date.getDate(),21),title:day===1?'Cours Full Stack — Lundi':'Cours Full Stack — Mardi'}];
}
export function classifyClass(session, referenceDate, referencePhase, overrides={}) {
  const d=parseDate(session.date), phase=getShift(d,referenceDate,referencePhase,overrides);
  const shift=intervalForShift(d,phase);
  if(shift && overlaps(session,shift)) return {status:'conflict',label:'Conflit avec le service'};
  const yesterday=addDays(d,-1), prev=getShift(yesterday,referenceDate,referencePhase,overrides);
  if(prev==='night') return {status:'afterNight',label:'Après un service de nuit'};
  return {status:'clear',label:'Sans conflit'};
}
export function generateClasses(from,to,settings,overrides={},statuses={}) {
  const out=[];
  for(let d=parseDate(from); d<=parseDate(to); d=addDays(d,1)) for(const s of academicSessions(d)) {
    const c=classifyClass(s,settings.referenceDate,settings.referencePhase,overrides);
    const id=`class-${s.date}-${s.weekday}`;
    out.push({...s,id,...c,attendance:statuses[id]||'planned',needsCatchup:(statuses[id]==='absent'||c.status==='conflict')});
  }
  return out;
}
export function localDateTime(dateKeyValue,hour,minute=0) { const d=parseDate(dateKeyValue); d.setHours(hour,minute,0,0); return d; }
export function buildSuggestedActivities(date, settings, overrides={}, existing=[]) {
  const key=dateKey(date), phase=getShift(date,settings.referenceDate,settings.referencePhase,overrides);
  const list=[];
  const add=(title,category,start,duration,detail='')=>list.push({id:`auto-${key}-${category}-${list.length}`,date:key,title,category,start,duration,status:'planned',detail,automatic:true});
  if(phase==='day') add('Repos / détente','recovery','21:30',20,'Journée de service : activité facultative et courte.');
  else if(phase==='restBeforeNight') add('Repos et préparation du service','recovery','14:00',30,'Éviter les efforts ; préserver une plage de sommeil avant 21h.');
  else if(phase==='night') add('Repos avant le service de nuit','recovery','14:00',30,'Priorité à la sieste et à la préparation du service.');
  else if(phase==='recovery') add('Sommeil et récupération','recovery','16:00',30,'Aucune activité intensive après la nuit.');
  else {
    add('Français','language','10:00',60,'Objectif hebdomadaire : 2 h.');
    add('Anglais','language','11:15',60,'Objectif hebdomadaire : 2 h.');
    add('Intelligence artificielle','ai','14:00',60,'Objectif hebdomadaire : 2 h.');
    add('Formation Full Stack','study','15:15',120,'Travail personnel en complément des cours fixes.');
    add('Sport — séance','sport','17:45',60,'Objectif : 2 séances par semaine.');
  }
  return list.filter(a=>!existing.some(e=>e.date===a.date&&e.title===a.title));
}
export function getWeekStart(date) { const d=parseDate(dateKey(date)); const shift=(d.getDay()+6)%7; return addDays(d,-shift); }
export function minutesBetween(start,end) { return Math.max(0,(end-start)/60000); }
