// Morning Wave core rules. Pure functions, no DOM. Shared by the game and the tests.
const CLS = { S: 0, M: 1, L: 2 };
const t = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const RULES = { standBefore: 50, gateBefore: 35, after: 10, closeBefore: 10, maxDelay: 60, maxDesks: 6,
  ptsNormal: 100, ptsHigh: 150, grace: 15, delayNormal: 1, delayHigh: 2, failPenalty: 200, deskBonus: 10 };

const TRAINING = {
  id: 'training', name: 'Training day', level: 0, teams: 0, desks: 12, rate: 4,
  stands: [['S1','S','07:00'],['S2','M','07:00'],['S3','M','07:00'],['S4','L','07:00'],['S5','L','07:30'],['S6','L','08:00']]
    .map(([id, cls, f]) => ({ id, cls, from: t(f), to: t('11:30') })),
  gates: [['A1','S','07:00'],['A2','M','07:00'],['A3','M','07:00'],['B1','L','07:00'],['B2','L','07:30']]
    .map(([id, cls, f]) => ({ id, cls, from: t(f), to: t('11:30') })),
  flights: [
    ['AL220','Madrid','07:35',152,'M',15,1],['BR237','Paris CDG','07:49',109,'S',20,0],['CJ254','Rome FCO','07:56',130,'M',18,0],
    ['DX271','Paris CDG','08:07',163,'M',15,0],['EZ288','Rome FCO','08:17',85,'S',18,0],['AL305','Paris CDG','08:26',170,'M',12,0],
    ['BR322','Berlin','08:38',114,'S',15,0],['CJ339','Paris CDG','08:49',186,'M',15,1],['DX356','Rome FCO','08:56',178,'M',12,0],
    ['EZ373','Lisbon','09:09',285,'L',15,0],['AL390','Copenhagen','09:19',167,'M',20,0],['BR407','Paris CDG','09:26',126,'M',20,0],
    ['CJ424','Rome FCO','09:38',162,'M',18,0],['DX441','Dublin','09:45',187,'M',20,0],['EZ458','Berlin','09:55',264,'L',15,1],
    ['AL475','Amsterdam','10:08',173,'M',12,0],['BR492','Dublin','10:17',169,'M',20,0],['CJ509','Rome FCO','10:25',174,'M',20,0]
  ].map(([id, dest, dep, pax, cls, svc, hi]) => ({ id, dest, dep: t(dep), pax, cls, svc, high: !!hi, open: t(dep) - 60 }))
};

function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  let a = h >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
}

// Shift ladder: each level adds a complication and keeps the earlier ones. A roll gives a different wave at the same level.
const TWISTS = ['', 'a plain wave', 'short on check-in desks', 'ground service teams', 'a closure mid-wave', 'late inbound aircraft'];
const twist = n => n <= 5 ? TWISTS[n] : 'everything at once, tighter each shift';
function shift(n, roll) {
  const r = rng('shift-' + n + '-' + (roll || 0)), ri = (a, b) => a + Math.floor(r() * (b - a + 1)), pick = a => a[Math.floor(r() * a.length)];
  const sc = JSON.parse(JSON.stringify(TRAINING)), x = Math.max(0, n - 5);
  sc.id = 'shift-' + n + '-' + (roll || 0); sc.name = 'Shift ' + n; sc.level = n; sc.notes = [];
  sc.desks = n >= 2 ? Math.max(7, 8 - Math.floor(x / 2)) : 10;
  sc.teams = n >= 3 ? 3 : 0;
  const facs = [...sc.stands.slice(1), ...sc.gates.slice(1)];
  const late = pick(facs.slice(0, 3).concat(facs.slice(5, 7)));
  late.from = t('07:00') + ri(4, 9) * 10; sc.notes.push(late.id + ' out of use until ' + hhmm(late.from) + '.');
  sc.notes.push(sc.desks + ' check-in desks staffed.');
  if (sc.teams) sc.notes.push('Only ' + sc.teams + ' ground teams (fuel, catering, cleaning, bags). Every flight needs one for its last 12 to 20 minutes before departure, so no more than ' + sc.teams + ' flights can be in that final stretch at once. See the Team lanes on the timeline.');
  for (let i = 0, used = [late.id]; i < (n >= 4 ? (x >= 3 ? 2 : 1) : 0); i++) {
    let f; do f = pick(facs); while (used.includes(f.id)); used.push(f.id);
    const a = t('08:10') + ri(0, 9) * 10; f.shuts = [[a, a + ri(4, 6) * 10, -1e9]];
    sc.notes.push(f.id + ' closed ' + hhmm(f.shuts[0][0]) + ' to ' + hhmm(f.shuts[0][1]) + '.');
  }
  const air = ['AL','BR','CJ','DX','EZ','FN','GK'], dest = ['Madrid','Paris CDG','Rome FCO','Berlin','Lisbon','Dublin','Amsterdam','Copenhagen','Vienna','Athens','Oslo','Zurich'];
  const count = 15 + Math.min(x, 4) + ri(0, 1); let dep = t('07:52') + ri(0, 8), num = ri(200, 260); sc.flights = [];
  for (let i = 0; i < count; i++) {
    const v = r(), cls = v < 0.2 ? 'S' : v < 0.78 ? 'M' : 'L';
    const pax = cls === 'S' ? ri(80, 120) : cls === 'M' ? ri(125, 190) : ri(240, 300);
    sc.flights.push({ id: pick(air) + num, dest: pick(dest), dep, pax, cls, svc: pick([12, 15, 18, 20]), high: r() < 0.2, open: dep - 60 });
    dep += x >= 2 ? ri(7, 13) : ri(8, 14); num += ri(11, 19);
  }
  if (n >= 5) for (let i = 0, done = []; i < 2 + Math.min(x, 2); i++) {
    let f; do f = sc.flights[ri(1, count - 1)]; while (done.includes(f.id)); done.push(f.id);
    f.dep += ri(10, 25); f.late = true; sc.notes.push(f.id + ' aircraft arrived late, now departs ' + hhmm(f.dep) + '.');
  }
  sc.flights.sort((p, q) => p.dep - q.dep);
  sc.events = makeEvents(sc, n <= 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 3 + Math.min(x, 2), rng('events-' + sc.id));
  return sc;
}

// Live disruptions, announced during the run. Every event is chosen so that it only touches what a planner
// can still change at the moment it is announced: a late aircraft is announced before its stand time, a surge
// before check-in opens, and a closure spares any flight already on that stand or gate when it is announced.
function makeEvents(sc, n, r) {
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1)), pick = a => a[Math.floor(r() * a.length)], ev = [], used = new Set();
  const far = at => at >= t('07:10') && at <= t('10:40') && ev.every(e => Math.abs(e.at - at) >= 10);
  for (let tries = 0; ev.length < n && tries < 200; tries++) {
    const kind = pick(['late', 'late', 'closure', 'closure', 'surge']);
    if (kind === 'late') {
      const f = pick(sc.flights); if (used.has(f.id)) continue;
      const at = f.dep - RULES.standBefore - ri(12, 30); if (!far(at)) continue;
      used.add(f.id); ev.push({ at, kind, flight: f.id, mins: ri(15, 35) });
    } else if (kind === 'surge') {
      const f = pick(sc.flights); if (used.has(f.id)) continue;
      const at = f.open - ri(8, 20); if (!far(at)) continue;
      used.add(f.id); ev.push({ at, kind, flight: f.id, extra: Math.round(f.pax * ri(25, 45) / 100) });
    } else {
      const fac = pick([...sc.stands, ...sc.gates]), at = t('07:20') + ri(0, 18) * 10; if (!far(at) || used.has(fac.id)) continue;
      const from = at + ri(15, 30); used.add(fac.id);
      ev.push({ at, kind, fac: fac.id, from, to: from + ri(3, 6) * 10 });
    }
  }
  return ev.sort((a, b) => a.at - b.at);
}
TRAINING.events = makeEvents(TRAINING, 2, rng('events-training'));

function describe(e, sc) {
  const f = e.flight && sc.flights.find(x => x.id === e.flight);
  if (e.kind === 'late') return `${e.flight}'s inbound aircraft is running ${e.mins} min late. It now departs ${hhmm(f.dep + e.mins)} at the earliest.`;
  if (e.kind === 'surge') return `${e.flight} has ${e.extra} extra passengers from a cancelled flight elsewhere: ${f.pax + e.extra} to check in.`;
  return `${e.fac[0] === 'S' ? 'Stand' : 'Gate'} ${e.fac} is unserviceable from ${hhmm(e.from)} to ${hhmm(e.to)}. Flights whose aircraft are already on stand are not affected.`;
}

// The scenario as known at minute `upto` (-Infinity = before the shift, Infinity = everything).
function scenarioAt(sc, upto) {
  const s = JSON.parse(JSON.stringify(sc));
  for (const e of sc.events || []) if (e.at <= upto) {
    if (e.kind === 'late') { const f = s.flights.find(x => x.id === e.flight); f.dep += e.mins; f.late = true; }
    else if (e.kind === 'surge') s.flights.find(x => x.id === e.flight).pax += e.extra;
    else { const fac = [...s.stands, ...s.gates].find(x => x.id === e.fac); (fac.shuts = fac.shuts || []).push([e.from, e.to, e.at]); }
  }
  return s;
}
// A closure spares any flight whose aircraft was already on stand when it was announced (standStart before c[2]).
const blockedBy = (fac, w, standStart) => (fac.shuts || []).find(c => w[0] < c[1] && c[0] < w[1] && (standStart === undefined ? w[0] : standStart) >= c[2]);

// Industry practice counts a departure within 15 minutes as on time, so the first 15 minutes of delay are free.
const delayCost = (f, delay) => Math.max(0, delay - RULES.grace) * (f.high ? RULES.delayHigh : RULES.delayNormal);
const minDesks = (sc, f, delay) => Math.max(1, Math.ceil(f.pax / (sc.rate * (f.dep + delay - RULES.closeBefore - f.open))));

function evaluate(sc, plan) {
  const res = {}, load = new Array(24 * 60).fill(0), teamLoad = new Array(24 * 60).fill(0);
  const win = {};
  for (const f of sc.flights) {
    const p = plan[f.id] || {}, delay = p.delay || 0, dep = f.dep + delay, desks = p.desks || 0;
    const ciEnd = desks ? f.open + Math.ceil(f.pax / (sc.rate * desks)) : Infinity, close = dep - RULES.closeBefore;
    win[f.id] = { stand: [dep - RULES.standBefore, dep + RULES.after], gate: [dep - RULES.gateBefore, dep + RULES.after] };
    res[f.id] = { dep, delay, close, ciEnd, desks, stand: p.stand || null, gate: p.gate || null, issues: [] };
    // A flight with no stand or gate is not operating, so it takes no desks or ground team.
    const operating = !!(p.stand && p.gate);
    if (desks && operating) for (let m = f.open; m < Math.min(ciEnd, close); m++) load[m] += desks;
    if (sc.teams && operating) for (let m = dep - f.svc; m < dep; m++) teamLoad[m]++;
  }
  const overMin = m => load[m] > sc.desks;
  for (const f of sc.flights) {
    const r = res[f.id];
    for (const [kind, list] of [['stand', sc.stands], ['gate', sc.gates]]) {
      const Kind = kind[0].toUpperCase() + kind.slice(1), id = r[kind], w = win[f.id][kind];
      if (!id) { r.issues.push('No ' + kind + ' assigned'); continue; }
      const fac = list.find(x => x.id === id);
      if (CLS[fac.cls] < CLS[f.cls]) r.issues.push(Kind + ' ' + id + ' is too small (' + fac.cls + ' < ' + f.cls + ')');
      if (w[0] < fac.from) r.issues.push(Kind + ' ' + id + ' not open until ' + hhmm(fac.from) + ', needed ' + hhmm(w[0]));
      if (w[1] > fac.to) r.issues.push(Kind + ' ' + id + ' closes at ' + hhmm(fac.to));
      const c = blockedBy(fac, w, win[f.id].stand[0]); if (c) r.issues.push(Kind + ' ' + id + ' closed ' + hhmm(c[0]) + ' to ' + hhmm(c[1]));
      for (const g of sc.flights) if (g.id !== f.id && res[g.id][kind] === id) {
        const v = win[g.id][kind]; if (w[0] < v[1] && v[0] < w[1]) r.issues.push(Kind + ' ' + id + ' clashes with ' + g.id);
      }
    }
    if (!r.desks) r.issues.push('No check-in desks');
    else if (r.ciEnd > r.close) r.issues.push('Check-in overruns close by ' + (r.ciEnd - r.close) + ' min');
    else { for (let m = f.open; m < r.ciEnd; m++) if (overMin(m)) { r.issues.push('Desks over capacity at ' + hhmm(m)); break; } }
    if (sc.teams && r.stand && r.gate) for (let m = r.dep - f.svc; m < r.dep; m++) if (teamLoad[m] > sc.teams) {
      const busy = sc.flights.filter(g => g.id !== f.id && res[g.id].stand && res[g.id].gate && m >= res[g.id].dep - g.svc && m < res[g.id].dep).map(g => g.id);
      r.issues.push(`At ${hhmm(m)}, ${busy.length + 1} flights need a ground team but only ${sc.teams} exist (also ${busy.join(', ')})`); break; }
    r.ok = r.issues.length === 0;
    r.points = r.ok ? Math.max(0, (f.high ? RULES.ptsHigh : RULES.ptsNormal) - delayCost(f, r.delay)) : -RULES.failPenalty;
  }
  const peak = Math.max(...load), all = sc.flights.map(f => res[f.id]);
  const departed = all.filter(r => r.ok).length, onTime = all.filter(r => r.ok && r.delay <= RULES.grace).length;
  const bonus = departed === all.length ? Math.max(0, sc.desks - peak) * RULES.deskBonus : 0;
  const score = all.reduce((s, r) => s + r.points, 0) + bonus;
  return { flights: res, win, load, peak, teamLoad, teamPeak: Math.max(...teamLoad), departed, onTime, total: all.length, bonus, score,
    delayMin: all.reduce((s, r) => s + (r.ok ? r.delay : 0), 0) };
}

// House planner: works down the board in departure order and takes the first stand, gate, desk count and
// service slot that fit, adding delay a minute at a time when nothing does. Competent, never looks ahead.
function housePlan(sc, order, deskPref, fixed) {
  const plan = {}, used = { stand: [], gate: [] }, load = new Array(24 * 60).fill(0), team = new Array(24 * 60).fill(0);
  fixed = fixed || {};
  for (const f of sc.flights) { const x = fixed[f.id]; if (!x || !x.all) continue; const p = x.plan, dep = f.dep + p.delay;
    plan[f.id] = Object.assign({}, p);
    if (p.stand) used.stand.push({ id: p.stand, w: [dep - RULES.standBefore, dep + RULES.after] });
    if (p.gate) used.gate.push({ id: p.gate, w: [dep - RULES.gateBefore, dep + RULES.after] });
    if (!p.stand || !p.gate) continue;
    for (let m = f.open; m < f.open + Math.ceil(f.pax / (sc.rate * (p.desks || 1))); m++) load[m] += p.desks || 0;
    for (let m = dep - f.svc; m < dep; m++) team[m]++; }
  const free = (kind, fac, f, dep) => {
    const w = [dep - (kind === 'stand' ? RULES.standBefore : RULES.gateBefore), dep + RULES.after];
    return CLS[fac.cls] >= CLS[f.cls] && w[0] >= fac.from && w[1] <= fac.to && !blockedBy(fac, w, dep - RULES.standBefore) &&
      !used[kind].some(u => u.id === fac.id && w[0] < u.w[1] && u.w[0] < w[1]) && w;
  };
  for (const f of order || [...sc.flights].sort((a, b) => a.dep - b.dep)) {
    if (plan[f.id]) continue; const fx = fixed[f.id];
    for (let d = fx ? fx.minDelay : 0; d <= RULES.maxDelay && !plan[f.id]; d++) {
      const dep = f.dep + d, s = sc.stands.find(x => free('stand', x, f, dep)), g = sc.gates.find(x => free('gate', x, f, dep));
      if (!s || !g) continue;
      if (sc.teams) { let ok = true; for (let m = dep - f.svc; m < dep; m++) if (team[m] >= sc.teams) ok = false; if (!ok) continue; }
      const desks = (fx && fx.desks ? [fx.desks] : deskPref || [2, 3, 1, 4, 5, 6]).find(k => { const end = f.open + Math.ceil(f.pax / (sc.rate * k));
        if (end > dep - RULES.closeBefore) return false; for (let m = f.open; m < end; m++) if (load[m] + k > sc.desks) return false; return true; });
      if (!desks) continue;
      used.stand.push({ id: s.id, w: free('stand', s, f, dep) }); used.gate.push({ id: g.id, w: free('gate', g, f, dep) });
      for (let m = f.open; m < f.open + Math.ceil(f.pax / (sc.rate * desks)); m++) load[m] += desks;
      for (let m = dep - f.svc; m < dep; m++) team[m]++;
      plan[f.id] = { stand: s.id, gate: g.id, delay: d, desks };
    }
    if (!plan[f.id]) plan[f.id] = { stand: null, gate: null, delay: fx ? fx.minDelay : 0, desks: fx && fx.desks || 1 };
  }
  return plan;
}

// Reference solver: annealing over delays and desk counts with best-fit stands and gates. Sets the silver and gold targets.
function assign(sc, delays, desks) {
  const plan = {};
  for (const f of sc.flights) plan[f.id] = { delay: delays[f.id], desks: desks[f.id], stand: null, gate: null };
  for (const [kind, list, before] of [['stand', sc.stands, RULES.standBefore], ['gate', sc.gates, RULES.gateBefore]]) {
    const lastEnd = {}; list.forEach(x => lastEnd[x.id] = -1);
    const fl = sc.flights.map(f => ({ f, a: f.dep + delays[f.id] - before, b: f.dep + delays[f.id] + RULES.after })).sort((x, y) => x.a - y.a);
    for (const { f, a, b } of fl) {
      const ok = list.filter(x => CLS[x.cls] >= CLS[f.cls] && a >= x.from && b <= x.to && lastEnd[x.id] <= a && !blockedBy(x, [a, b], f.dep + delays[f.id] - RULES.standBefore))
        .sort((x, y) => CLS[x.cls] - CLS[y.cls] || lastEnd[y.id] - lastEnd[x.id]);
      if (ok[0]) { plan[f.id][kind] = ok[0].id; lastEnd[ok[0].id] = b; }
    }
  }
  return plan;
}
function solve(sc, iters) {
  let s = 12345, best = -1e9, bestPlan = null; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  // 1) reorder the house planner's queue (who gets first pick) under three desk habits
  for (const pref of [[2, 3, 1, 4, 5, 6], [1, 2, 3, 4, 5, 6], [3, 2, 4, 1, 5, 6]]) {
    let order = [...sc.flights].sort((a, b) => a.dep - b.dep), cp = housePlan(sc, order, pref), cur = evaluate(sc, cp).score;
    if (cur > best) { best = cur; bestPlan = cp; }
    for (let i = 0; i < iters / 10; i++) {
      const a = Math.floor(rnd() * order.length), b = Math.max(0, Math.min(order.length - 1, a + Math.round((rnd() - 0.5) * 6))), o = order.slice();
      [o[a], o[b]] = [o[b], o[a]]; const np = housePlan(sc, o, pref), v = evaluate(sc, np).score;
      if (v >= cur) { cur = v; order = o; if (v > best) { best = v; bestPlan = np; } }
    }
  }
  // 2) anneal delays and desk counts directly
  const delays = {}, desks = {}, hp = housePlan(sc); sc.flights.forEach(f => { delays[f.id] = hp[f.id].delay; desks[f.id] = hp[f.id].desks; });
  let cur = evaluate(sc, assign(sc, delays, desks)).score;
  for (let i = 0; i < iters; i++) {
    const f = sc.flights[Math.floor(rnd() * sc.flights.length)], od = delays[f.id], ok = desks[f.id];
    if (rnd() < 0.6) delays[f.id] = Math.max(0, Math.min(RULES.maxDelay, od + Math.round((rnd() - 0.5) * 12)));
    else desks[f.id] = Math.max(1, Math.min(RULES.maxDesks, ok + (rnd() < 0.5 ? -1 : 1)));
    const ap = assign(sc, delays, desks), v = evaluate(sc, ap).score, T = 60 * (1 - i / iters) + 1;
    if (v >= cur || rnd() < Math.exp((v - cur) / T)) { cur = v; if (cur > best) { best = cur; bestPlan = ap; } }
    else { delays[f.id] = od; desks[f.id] = ok; }
  }
  return { score: best, plan: bestPlan };
}

// Re-plan only the flights a planner may still change, searching over who gets first pick.
function replan(s, plan, c, iters, seed) {
  let x = seed; const rnd = () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296, fixed = {};
  for (const f of s.flights) { const p = plan[f.id], L = lockAt(f, p, c);
    fixed[f.id] = L.state === 'free' ? { minDelay: L.minDelay, desks: L.desks } : { all: true, plan: p }; }
  let best = plan, bestV = evaluate(s, plan).score;
  for (const pref of [[2, 3, 1, 4, 5, 6], [1, 2, 3, 4, 5, 6]]) {
    let order = [...s.flights].sort((a, b) => a.dep - b.dep), cp = housePlan(s, order, pref, fixed), cur = evaluate(s, cp).score;
    if (cur > bestV) { bestV = cur; best = cp; }
    for (let i = 0; i < iters; i++) {
      const a = Math.floor(rnd() * order.length), b = Math.max(0, Math.min(order.length - 1, a + Math.round((rnd() - 0.5) * 6))), o = order.slice();
      [o[a], o[b]] = [o[b], o[a]]; const np = housePlan(s, o, pref, fixed), v = evaluate(s, np).score;
      if (v >= cur) { cur = v; order = o; if (v > bestV) { bestV = v; best = np; } }
    }
  }
  return best;
}
// What a planner may still change at minute c. Departed: nothing. On stand: hold it (more delay) only.
// Otherwise anything, except desks once check-in has opened, and no delay that would put it on stand in the past.
function lockAt(f, p, c) {
  const dep = f.dep + (p.delay || 0);
  if (c >= dep) return { state: 'gone' };
  if (c >= dep - RULES.standBefore) return { state: 'stand', minDelay: p.delay || 0 };
  return { state: 'free', minDelay: Math.max(0, c + 1 - (f.dep - RULES.standBefore)), desks: c >= f.open ? p.desks : 0 };
}

// The house controller plans before the shift, then at each disruption re-plans every flight it may still change.
// The live solver: a strong plan made before the shift, then a careful re-plan at each disruption,
// knowing no more than the player does at that moment. Its score is gold.
// Play a shift live from a starting plan, re-planning at each disruption with what is known then.
// Returns the final plan and the plan after each step, so a debrief can show what changed and when.
function liveRun(sc, start, step) {
  let plan = start; const steps = [{ at: null, plan: start }];
  for (const e of sc.events || []) {
    const s = scenarioAt(sc, e.at), fixed = {};
    for (const f of s.flights) { const p = plan[f.id], L = lockAt(f, p, e.at);
      fixed[f.id] = L.state === 'free' ? { minDelay: L.minDelay, desks: L.desks } : { all: true, plan: p }; }
    plan = step(s, plan, e, fixed); steps.push({ at: e.at, event: e, plan });
  }
  return { plan, steps, score: evaluate(scenarioAt(sc, Infinity), plan).score };
}
// The live solver: a strong plan made before the shift, then a careful re-plan at each disruption,
// knowing no more than the player does at that moment. Its score is gold.
function liveSolveRun(sc, iters) {
  const base = scenarioAt(sc, -Infinity); let best = null, k = 1;
  // Two starting plans: the solver's tightest, and the house planner's, which leaves more slack for surprises.
  for (const start of [solve(base, iters).plan, housePlan(base)]) {
    const r = liveRun(sc, start, (s, plan, e) => replan(s, plan, e.at, Math.round(iters / 10), 777 + k++));
    if (!best || r.score > best.score) best = r;
  }
  return best;
}
const liveHouseRun = sc => liveRun(sc, housePlan(scenarioAt(sc, -Infinity)), (s, plan, e, fixed) => housePlan(s, null, null, fixed));
const liveHouse = sc => liveHouseRun(sc).plan;
// The best live play found for a wave: what the gold target is set from, and what a debrief shows as the solution.
function solution(sc, iters) { const a = liveSolveRun(sc, iters || 4000), b = liveHouseRun(sc); return a.score >= b.score ? a : b; }

// Targets: bronze beats the live house controller. Gold is the live solver, which learns of each
// disruption only when it is announced, as the player does. Silver clears the shift: halfway to gold,
// but never less than 40 points above the house unless gold itself is closer.
function targets(sc, iters) {
  const house = liveHouseRun(sc).score, gold = Math.max(house, solution(sc, iters).score), gap = gold - house;
  return { house, silver: house + Math.max(Math.round(gap / 2), Math.min(gap, 40)), gold };
}

const Core = { CLS, RULES, TRAINING, t, hhmm, shift, twist, evaluate, housePlan, minDesks, delayCost, targets, scenarioAt, describe, lockAt, liveHouse, solution };
if (typeof module !== 'undefined') module.exports = Core;
