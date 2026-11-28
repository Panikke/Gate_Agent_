// Rule checks. Run with: node src/test.js
const C = require('./core.js'), assert = require('assert');
let n = 0; const ok = (name, fn) => { fn(); n++; console.log('pass  ' + name); };

ok('training day has the brief data', () => {
  assert.strictEqual(C.TRAINING.flights.length, 18);
  assert.strictEqual(C.TRAINING.desks, 14);
  assert.deepStrictEqual(C.TRAINING.flights.filter(f => f.high).map(f => f.id), ['AL220', 'CJ339', 'EZ458']);
});
ok('a stand clash is reported', () => {
  const sc = C.TRAINING, plan = C.housePlan(sc), [a, b] = sc.flights;
  plan[b.id].stand = plan[a.id].stand; plan[b.id].delay = 0; plan[a.id].delay = 0;
  assert(C.evaluate(sc, plan).flights[b.id].issues.some(i => i.includes('clashes')));
});
ok('a small stand cannot take a large aircraft', () => {
  const sc = C.TRAINING, plan = C.housePlan(sc), f = sc.flights.find(x => x.cls === 'L');
  plan[f.id].stand = 'S1';
  assert(C.evaluate(sc, plan).flights[f.id].issues.some(i => i.includes('too small')));
});
ok('house plan gets every training flight away', () => {
  const e = C.evaluate(C.TRAINING, C.housePlan(C.TRAINING));
  assert.strictEqual(e.departed, 18);
});
ok('the same shift and roll always deal the same wave', () => {
  assert.deepStrictEqual(C.shift(4, 2), C.shift(4, 2));
  assert.notDeepStrictEqual(C.shift(4, 1).flights, C.shift(4, 2).flights);
});
ok('gold is never below the house planner', () => {
  for (const lv of [1, 3, 5, 7]) { const t = C.targets(C.shift(lv, 0), 1500); assert(t.gold >= t.house && t.silver >= t.house); }
});
ok('cancelling costs more than the longest delay', () => {
  for (const f of C.TRAINING.flights) assert(C.failCost(f) + C.RULES.ptsNormal > C.RULES.maxDelay * C.RULES.delayHigh);
});
ok('disruptions only touch what can still be changed', () => {
  for (let lv = 1; lv <= 10; lv++) for (let roll = 0; roll < 3; roll++) {
    const sc = C.shift(lv, roll);
    assert(sc.events.length >= 1);
    for (const e of sc.events) {
      const f = e.flight && sc.flights.find(x => x.id === e.flight);
      if (['late', 'slot', 'crew'].includes(e.kind)) assert(e.at < f.dep - C.standBefore(f), e.kind + ' announced after stand time');
      if (e.kind === 'offload') assert(e.at < f.dep, 'offload announced after departure');
      if (e.kind === 'surge') assert(e.at < f.open, 'surge announced after check-in opened');
      if (e.kind === 'closure') assert(e.from > e.at, 'closure starts before it is announced');
    }
  }
});
ok('a closure spares a flight already on the stand when it is announced', () => {
  const sc = JSON.parse(JSON.stringify(C.TRAINING)), plan = C.housePlan(sc), f = sc.flights[5], p = plan[f.id], dep = f.dep + p.delay;
  sc.events = [{ at: dep - 30, kind: 'closure', fac: p.stand, from: dep - 20, to: dep + 30 }];
  assert(!C.evaluate(C.scenarioAt(sc, Infinity), plan).flights[f.id].issues.some(i => i.includes('closed')));
});
ok('the live house controller never scores above gold', () => {
  for (const lv of [2, 5, 8]) { const t = C.targets(C.shift(lv, 1), 1500); assert(t.gold >= t.house); }
});
ok('a flight with no stand or gate takes no desks or ground team', () => {
  const sc = C.shift(4, 0), plan = C.housePlan(sc), f = sc.flights[3], before = C.evaluate(sc, plan).peak;
  plan[f.id] = { stand: null, gate: null, delay: 0, desks: 6 };
  assert(C.evaluate(sc, plan).peak <= before);
});
ok('silver is never below the house and never above gold', () => {
  for (const lv of [1, 4, 9]) { const t = C.targets(C.shift(lv, 0), 1500); assert(t.house <= t.silver && t.silver <= t.gold); }
});
ok('stand time depends on aircraft size', () => {
  const sc = C.shift(1, 0), plan = C.housePlan(sc), e = C.evaluate(sc, plan);
  for (const f of sc.flights) { const w = e.win[f.id].stand; assert.strictEqual(e.flights[f.id].dep - w[0], C.RULES.stand[f.cls]); }
});
ok('check-in follows real timings', () => {
  const f = C.TRAINING.flights[0];
  assert.strictEqual(f.dep - f.open, 120);
  assert.strictEqual(C.closeBefore({ cls: 'M' }), 45); assert.strictEqual(C.closeBefore({ cls: 'L' }), 60);
});
ok('a cancellation costs more for a fuller flight', () => {
  assert(C.failCost({ pax: 280 }) > C.failCost({ pax: 90 }));
});
ok('shifts 6 to 8 open with their new disruption', () => {
  for (const [lv, kind] of [[6, 'slot'], [7, 'crew'], [8, 'offload']]) for (let roll = 0; roll < 3; roll++)
    assert(C.shift(lv, roll).events.some(e => e.kind === kind), 'shift ' + lv + ' roll ' + roll + ' has no ' + kind);
});
ok('a flight held past its crew limit or ATC slot is flagged', () => {
  const sc = JSON.parse(JSON.stringify(C.TRAINING)), plan = C.housePlan(sc), f = sc.flights[8];
  f.crew = 10; plan[f.id].delay = 20;
  assert(C.evaluate(sc, plan).flights[f.id].issues.some(i => i.startsWith('Crew out of hours')));
  delete f.crew; f.slotMax = 15;
  assert(C.evaluate(sc, plan).flights[f.id].issues.some(i => i.startsWith('Misses its ATC slot')));
});
ok('the gold plan never changes more flights at a disruption than a player could', () => {
  for (const lv of [2, 6, 9]) { const sc = C.shift(lv, 0), s = C.solution(sc, 1500), lim = C.budget(lv);
    for (let i = 1; i < s.steps.length; i++) assert(C.changed(s.steps[i - 1].plan, s.steps[i].plan).length <= lim); }
});
ok('a clearing plan reaches silver', () => {
  for (const lv of [1, 5]) { const sc = C.shift(lv, 0), t = C.targets(sc, 1500), c = C.clearingPlan(sc, C.housePlan(sc), t.silver, 1500);
    assert(c.score >= t.silver || c.score === Math.max(t.gold, c.score)); }
});
console.log(`\n${n} checks passed`);
