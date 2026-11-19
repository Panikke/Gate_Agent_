const C = require('../src/core.js');
for (let lv = 0; lv <= 10; lv++) for (let roll = 0; roll < (lv ? 3 : 1); roll++) {
  const sc = lv ? C.shift(lv, roll) : C.TRAINING, t0 = Date.now(), t = C.targets(sc), h = C.evaluate(sc, C.housePlan(sc));
  console.log(('L' + lv + ' r' + roll).padEnd(7), 'n', sc.flights.length, 'desks', sc.desks, `| house ${t.house} (${h.departed}/${h.total}) silver ${t.silver} gold ${t.gold}`, Date.now() - t0, 'ms');
}
