// ===================== КАРМИОН: РАСЧЁТНЫЙ ДВИЖОК =====================
// Точный перенос формул из авторского Python-скрипта системы «Кармион».

const ARCANA_NAMES = {
  1:"Маг",2:"Жрица",3:"Императрица",4:"Император",5:"Иерофант",6:"Влюблённые",
  7:"Колесница",8:"Справедливость",9:"Отшельник",10:"Колесо Фортуны",11:"Сила",
  12:"Повешенный",13:"Смерть",14:"Умеренность",15:"Дьявол",16:"Башня",17:"Звезда",
  18:"Луна",19:"Солнце",20:"Суд",21:"Мир",22:"Шут"
};
const MONTHS = ["","Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

function digitSum(n){
  return String(Math.abs(n)).split('').reduce((a,d)=>a+parseInt(d,10),0);
}
function reduceUntil(n, max){
  let v = n;
  while (v > max){ v = digitSum(v); }
  return v;
}

function calcKarmion(day, month, year){
  // Родовая задача
  const rodMonth = month;

  // dt приведение
  let dt = day;
  while (dt > 22) dt -= 22;

  // СЖ
  const difference = Math.abs(dt - month);
  let sj = difference + dt;
  while (sj > 22) sj -= 22;

  // ОПВ
  let opv = Math.abs(dt - month);
  if (opv > 22) opv -= 22;
  if (opv === 0) opv = 22;

  // Луч 1
  let luch1;
  if (day <= 22) luch1 = day;
  else luch1 = Math.floor(day/10) + (day % 10);

  let textKey1;
  if (day === 11) textKey1 = 2;
  else if (day <= 9) textKey1 = day;
  else {
    let tempSum = Math.floor(day/10) + (day % 10);
    textKey1 = tempSum <= 9 ? tempSum : reduceUntil(tempSum, 9);
  }
  const dayKey = `day_${day}`;

  // Луч 2
  const luch2 = month;

  // Луч 3
  let luch3 = year;
  while (luch3 > 22) luch3 = digitSum(luch3);

  // Луч 4
  let luch4 = luch1 + luch2 + luch3;
  while (luch4 > 9) luch4 = digitSum(luch4);

  // Луч 5
  let luch5 = luch1 + luch2 + luch3 + luch4;
  while (luch5 > 22) luch5 = digitSum(luch5);

  // Луч 6
  let luch3Reduced = luch3;
  while (luch3Reduced > 9) luch3Reduced = digitSum(luch3Reduced);
  let luch6 = luch1 + luch2 + luch3Reduced;
  while (luch6 > 22) luch6 = digitSum(luch6);

  return { rodMonth, sj, opv, luch1, textKey1, dayKey, luch2, luch3, luch4, luch5, luch6 };
}

function calcProgn(day, month, year, age){
  const codeNumber = day * month * year;
  const targetAge = age;
  let workNum = targetAge <= 0 ? codeNumber : Math.trunc(codeNumber / targetAge);
  let workStr = String(Math.abs(workNum));
  if (workStr.length < 4) workStr = workStr + "0".repeat(4 - workStr.length);

  let luna = parseInt(workStr.slice(0,2), 10);
  if (luna > 22){ const s = String(luna); luna = parseInt(s[0],10)+parseInt(s[1],10); }
  if (luna === 0) luna = 22;

  let solnce = parseInt(workStr.slice(2,4), 10);
  if (solnce > 22){ const s = String(solnce); solnce = parseInt(s[0],10)+parseInt(s[1],10); }
  if (solnce === 0) solnce = 22;

  let rawItog = -luna + solnce;
  let itog = rawItog === 0 ? 22 : Math.abs(rawItog);
  if (itog > 22){ const s = String(itog); itog = parseInt(s[0],10)+parseInt(s[1],10); }
  if (luna === solnce) itog = 22;

  return { workStr, luna, solnce, itog };
}

// ---- Классификация ----
const KARMIC_SET = [8,20];
const MAGIC_SET = [15,16,17,18];
const FAMILY_SET = [3,4,5,6];
const LEADER_SET = [11,7,4,13];

// ---- Связки: явный перенос условий из Python ----
function evalCombos(allVectors, data){
  const has = (n)=>allVectors.includes(n);
  const countOf = (n)=>allVectors.filter(v=>v===n).length;
  const countMagic = allVectors.filter(v=>MAGIC_SET.includes(v)).length;
  const hasKarma = has(8) || has(20);
  const userHasMagic = allVectors.some(v=>MAGIC_SET.includes(v));
  const userHasFamily = allVectors.some(v=>FAMILY_SET.includes(v));
  const userHasLeaders = allVectors.some(v=>LEADER_SET.includes(v));
  const count10 = countOf(10);

  const checks = [
    has(9) && has(19),
    count10 === 2,
    count10 >= 3,
    has(11) && has(2),
    has(10) && userHasMagic,
    has(9) && userHasFamily,
    hasKarma && userHasLeaders,
    hasKarma && has(10),
    hasKarma && userHasFamily,
    hasKarma && userHasMagic,
    has(21) && userHasMagic,
    countMagic === 2,
    countOf(5) >= 3,
    has(21) && hasKarma,
    countOf(6) >= 3,
    countOf(7) >= 3,
    has(14),
    has(22),
    has(12),
    countOf(7) === 2,
    countOf(8) >= 3,
    has(15),
    has(16),
    has(17),
    has(18),
    has(20),
  ];

  const matched = [];
  data.combos.forEach((combo, i) => {
    if (checks[i]) matched.push(combo.text);
  });
  return matched;
}

// ===================== UI =====================

function populateDayOptions(){
  const sel = document.getElementById('in-day');
  sel.innerHTML = '';
  for (let d=1; d<=31; d++){
    const opt = document.createElement('option');
    opt.value = d; opt.textContent = d;
    sel.appendChild(opt);
  }
  sel.value = 14;
  document.getElementById('in-month').value = 3;
  document.getElementById('in-year').value = 1994;
}

function showError(msg){
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

function cardHTML({label, num, arcName, body, formula}){
  return `<div class="card indicator-card">
    <div class="row1">
      <h3>${label}</h3>
      <div class="num">${num}${arcName ? ` <span class="arcname">· ${arcName}</span>` : ''}</div>
    </div>
    <div class="body">${body || '<span class="empty-note">Описание уточняется.</span>'}</div>
    ${formula ? `<div class="formula">${formula}</div>` : ''}
  </div>`;
}

function classificationTags(value){
  const tags = [];
  if (KARMIC_SET.includes(value)) tags.push('<span class="tag tag-karma">Кармический аркан</span>');
  if (MAGIC_SET.includes(value)) tags.push('<span class="tag tag-magic">Магический аркан</span>');
  if (FAMILY_SET.includes(value)) tags.push('<span class="tag tag-family">Родовой аркан</span>');
  return tags.join('');
}

function renderStar(vals){
  // vals: {luch1..luch6, rodMonth(МВ), sj, opv}
  const svg = document.getElementById('star');
  const cx = 260, cy = 300, R = 190, r = 62;
  // Points of hexagram: top (Луч6), bottom (Луч2), and 4 side points
  const pointAngles = {
    top: -90, upperLeft: -150, upperRight: -30, lowerLeft: 150, lowerRight: 30, bottom: 90
  };
  function pt(angleDeg, radius){
    const a = angleDeg * Math.PI/180;
    return [cx + radius*Math.cos(a), cy + radius*Math.sin(a)];
  }
  const top = pt(pointAngles.top, R);
  const upperLeft = pt(pointAngles.upperLeft, R);
  const upperRight = pt(pointAngles.upperRight, R);
  const lowerLeft = pt(pointAngles.lowerLeft, R);
  const lowerRight = pt(pointAngles.lowerRight, R);
  const bottom = pt(pointAngles.bottom, R);

  const triUp = `${top[0]},${top[1]} ${lowerRight[0]},${lowerRight[1]} ${lowerLeft[0]},${lowerLeft[1]}`;
  const triDown = `${bottom[0]},${bottom[1]} ${upperLeft[0]},${upperLeft[1]} ${upperRight[0]},${upperRight[1]}`;

  function innerPt(angleDeg){ return pt(angleDeg, r); }
  const iTop = innerPt(-90), iLeft = innerPt(210), iRight = innerPt(-30);
  const triInner = `${iTop[0]},${iTop[1]} ${iRight[0]},${iRight[1]} ${iLeft[0]},${iLeft[1]}`;

  svg.innerHTML = `
    <polygon points="${triUp}" class="star-line"/>
    <polygon points="${triDown}" class="star-line"/>
    <polygon points="${triInner}" class="star-line"/>
    <text x="${top[0]}" y="${top[1]-58}" text-anchor="middle" class="star-num">${vals.luch6}</text>
    <text x="${top[0]}" y="${top[1]-78}" text-anchor="middle" class="star-label">ЛУЧ 6</text>

    <text x="${upperLeft[0]-8}" y="${upperLeft[1]-10}" text-anchor="middle" class="star-num">${vals.luch4}</text>
    <text x="${upperLeft[0]-30}" y="${upperLeft[1]-34}" text-anchor="middle" class="star-label">ЛУЧ 4</text>

    <text x="${upperRight[0]+8}" y="${upperRight[1]-10}" text-anchor="middle" class="star-num">${vals.luch5}</text>
    <text x="${upperRight[0]+30}" y="${upperRight[1]-34}" text-anchor="middle" class="star-label">ЛУЧ 5</text>

    <text x="${lowerLeft[0]-8}" y="${lowerLeft[1]+30}" text-anchor="middle" class="star-num">${vals.luch1}</text>
    <text x="${lowerLeft[0]-30}" y="${lowerLeft[1]+52}" text-anchor="middle" class="star-label">ЛУЧ 1</text>

    <text x="${lowerRight[0]+8}" y="${lowerRight[1]+30}" text-anchor="middle" class="star-num">${vals.luch3}</text>
    <text x="${lowerRight[0]+30}" y="${lowerRight[1]+52}" text-anchor="middle" class="star-label">ЛУЧ 3</text>

    <text x="${bottom[0]}" y="${bottom[1]+42}" text-anchor="middle" class="star-num">${vals.luch2}</text>
    <text x="${bottom[0]}" y="${bottom[1]+62}" text-anchor="middle" class="star-label">ЛУЧ 2</text>

    <text x="${iTop[0]}" y="${iTop[1]+6}" text-anchor="middle" class="star-num-karma">${vals.rodMonth}</text>
    <text x="${iTop[0]}" y="${iTop[1]+22}" text-anchor="middle" class="star-label">МВ</text>

    <text x="${iLeft[0]}" y="${iLeft[1]+30}" text-anchor="middle" class="star-num-karma">${vals.sj}</text>
    <text x="${iLeft[0]}" y="${iLeft[1]+46}" text-anchor="middle" class="star-label">СЖ</text>

    <text x="${iRight[0]}" y="${iRight[1]+30}" text-anchor="middle" class="star-num-karma">${vals.opv}</text>
    <text x="${iRight[0]}" y="${iRight[1]+46}" text-anchor="middle" class="star-label">ОПВ</text>
  `;
}

let lastCalc = null;

function runCalculation(){
  showError('');
  const day = parseInt(document.getElementById('in-day').value, 10);
  const month = parseInt(document.getElementById('in-month').value, 10);
  const year = parseInt(document.getElementById('in-year').value, 10);

  if (!year || year < 1900 || year > 2100){
    showError('Пожалуйста, укажите год рождения в диапазоне 1900–2100.');
    return;
  }

  const r = calcKarmion(day, month, year);
  lastCalc = { day, month, year, r };
  const data = KARMION_DATA;

  document.getElementById('date-echo').textContent =
    `${String(day).padStart(2,'0')}.${String(month).padStart(2,'0')}.${year}`;

  renderStar({ luch1:r.luch1, luch2:r.luch2, luch3:r.luch3, luch4:r.luch4, luch5:r.luch5, luch6:r.luch6, rodMonth:r.rodMonth, sj:r.sj, opv:r.opv });

  // Родовая задача / СЖ / ОПВ
  const task = data.tasks[String(r.rodMonth)];
  let karmaHTML = '';
  karmaHTML += cardHTML({
    label: `Родовая задача — ${MONTHS[r.rodMonth]}`,
    num: r.rodMonth,
    body: task ? task[1] : null,
    formula: `Родовая задача = номер месяца рождения (${r.rodMonth})`
  });
  karmaHTML += cardHTML({
    label: 'СЖ — Сожаление прошлого воплощения',
    num: r.sj,
    arcName: ARCANA_NAMES[r.sj],
    body: data.sj_texts[String(r.sj)],
    formula: `difference = |день−месяц|; СЖ = difference + день (÷22)`
  });
  karmaHTML += cardHTML({
    label: 'ОПВ — Ошибка прошлого воплощения',
    num: r.opv,
    arcName: ARCANA_NAMES[r.opv],
    body: data.opv_texts[String(r.opv)],
    formula: `ОПВ = |день−месяц| (÷22, 0→22)`
  });
  document.getElementById('karma-block').innerHTML = karmaHTML;

  // Лучи
  let raysHTML = '';
  let luch1Body = data.luch1_texts[String(r.textKey1)] || '';
  if (data.luch1_texts[r.dayKey]) luch1Body += `<br><br>${data.luch1_texts[r.dayKey]}`;
  raysHTML += cardHTML({
    label: 'Луч №1 — Число Сознания', num: r.luch1,
    body: luch1Body, formula: `день рождения ≤22 → Луч1 = день; ключ текста = ${r.textKey1}`
  });
  raysHTML += cardHTML({
    label: 'Луч №2 — Число Характера', num: r.luch2, arcName: ARCANA_NAMES[r.luch2],
    body: data.luch2_texts[String(r.luch2)], formula: `Луч2 = номер месяца рождения`
  });
  raysHTML += cardHTML({
    label: 'Луч №3 — Число Судьбы', num: r.luch3, arcName: ARCANA_NAMES[r.luch3],
    body: data.luch3_texts[String(r.luch3)], formula: `Луч3 = сумма цифр года рождения (÷22)`
  });
  raysHTML += cardHTML({
    label: 'Луч №4 — Число Жизненного Пути', num: r.luch4,
    body: data.luch4_texts[String(r.luch4)], formula: `Луч4 = Луч1+Луч2+Луч3 (÷9)`
  });
  raysHTML += cardHTML({
    label: 'Луч №5 — Ядро Личной Силы', num: r.luch5, arcName: ARCANA_NAMES[r.luch5],
    body: data.luch5_texts[String(r.luch5)], formula: `Луч5 = Луч1+Луч2+Луч3+Луч4 (÷22)`
  });
  raysHTML += cardHTML({
    label: 'Луч №6 — Глобальный Вектор', num: r.luch6, arcName: ARCANA_NAMES[r.luch6],
    body: data.luch6_texts[String(r.luch6)], formula: `Луч6 = Луч1+Луч2+Луч3(редуц.) (÷22)`
  });
  document.getElementById('rays-block').innerHTML = raysHTML;

  // Классификация
  const allVectors = [r.luch1, r.luch2, r.luch3, r.luch4, r.luch5, r.luch6];
  let classHTML = '';
  const seen = new Set();
  allVectors.forEach(v=>{
    if (seen.has(v)) return;
    if (KARMIC_SET.includes(v) || MAGIC_SET.includes(v) || FAMILY_SET.includes(v)){
      seen.add(v);
      let desc = '';
      if (KARMIC_SET.includes(v)) desc = data.karmic_descriptions[String(v)];
      else if (MAGIC_SET.includes(v)) desc = data.magic_descriptions[String(v)];
      else if (FAMILY_SET.includes(v)) desc = data.family_descriptions[String(v)];
      classHTML += cardHTML({
        label: `Аркан ${v} — ${ARCANA_NAMES[v]}`,
        num: '',
        body: `${classificationTags(v)}<br><br>${desc||''}`
      });
    }
  });
  document.getElementById('classification-block').innerHTML =
    classHTML || '<p class="empty-note">Среди ваших шести Лучей нет кармических, магических или родовых арканов.</p>';

  // Связки
  const combos = evalCombos(allVectors, data);
  document.getElementById('combos-block').innerHTML = combos.length
    ? combos.map(t => {
        const m = t.match(/^\s*\[(.*?)\]\s*\n?([\s\S]*)$/);
        const title = m ? m[1] : 'Связка векторов';
        const body = (m ? m[2] : t).trim().replace(/\n/g,'<br>');
        return `<div class="card indicator-card"><h3 style="margin-bottom:10px;">${title}</h3><div class="body">${body}</div></div>`;
      }).join('')
    : '<p class="empty-note">Явных особых связок среди шести Лучей не обнаружено.</p>';

  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({behavior:'smooth'});

  // сброс прогноза
  document.getElementById('prognosis-result').style.display = 'none';
  document.getElementById('prognosis-result').innerHTML = '';

  // авто-возраст (с учётом того, был ли уже день рождения в этом году)
  const now = new Date();
  let age = now.getFullYear() - year;
  const nowMonth = now.getMonth() + 1, nowDay = now.getDate();
  if (nowMonth < month || (nowMonth === month && nowDay < day)) age -= 1;
  document.getElementById('in-age').value = age;
}

function runPrognosis(){
  if (!lastCalc) return;
  const { day, month, year } = lastCalc;
  const age = parseInt(document.getElementById('in-age').value, 10) || 0;
  const p = calcProgn(day, month, year, age);
  const data = KARMION_DATA.prognosis;

  const html = `
    <div class="prognosis-triad">
      <div class="card pill"><div class="label">Луна · внутренний план</div><div class="val">${p.luna}</div></div>
      <div class="card pill"><div class="label">Солнце · внешний план</div><div class="val">${p.solnce}</div></div>
      <div class="card pill"><div class="label">Итог года</div><div class="val">${p.itog}</div></div>
    </div>
    ${cardHTML({label:`Итоговая энергия года (возраст ${age})`, num:p.itog, arcName:ARCANA_NAMES[p.itog], body:data.itog[String(p.itog)]})}
    ${cardHTML({label:'Влияние Луны (внутренний план)', num:p.luna, arcName:ARCANA_NAMES[p.luna], body:data.luna[String(p.luna)]})}
    ${cardHTML({label:'Влияние Солнца (внешний план / ресурс)', num:p.solnce, arcName:ARCANA_NAMES[p.solnce], body:data.solnce[String(p.solnce)]})}
  `;
  const el = document.getElementById('prognosis-result');
  el.innerHTML = html;
  el.style.display = 'block';
  el.scrollIntoView({behavior:'smooth', block:'nearest'});
}

document.addEventListener('DOMContentLoaded', () => {
  populateDayOptions();
  document.getElementById('btn-calc').addEventListener('click', runCalculation);
  document.getElementById('btn-prognosis').addEventListener('click', runPrognosis);
});
