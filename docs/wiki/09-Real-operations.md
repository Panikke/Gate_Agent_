# How the game matches real airport operations

Morning Wave is a puzzle, not a simulator, but its rules are drawn from how a UK airport such as Gatwick runs its morning departures. This page says where each rule comes from, and where the game simplifies.

## What is taken from real practice

| In the game | In real operations | Source |
| --- | --- | --- |
| Stand held 35 (S), 45 (M) or 75 (L) minutes before departure | A stand is occupied for the turnaround, roughly 30 to 45 minutes for an A320-sized aircraft and 60 to 90 for a wide-body | Airbus aircraft characteristics documents (turnaround charts) |
| Check-in opens 2 hours before, closes 45 minutes before (60 for class L) | British Airways at Gatwick closes check-in 45 minutes before short-haul and 60 before long-haul; economy bag drop opens 2 hours before | [BA, London Gatwick](https://www.britishairways.com/content/information/airport-information/london-gatwick) |
| Gate closes 20 minutes before departure | BA asks passengers to be at the gate at least 20 minutes before departure and will not hold the aircraft for late passengers | As above |
| First 15 minutes of delay are free | UK and industry punctuality figures count a flight within 15 minutes as on time | UK CAA punctuality statistics |
| Turnaround crews | A dispatcher and ramp team load the bags and close up the aircraft before departure | IATA Airport Handling Manual |
| Late inbound aircraft, stand closure, extra passengers, bag offload, ATC slot | Common causes of departure delay, each with an IATA delay code: 93, 87 or 89, 11 to 19, 15, 81 | [IATA delay codes](https://en.wikipedia.org/wiki/IATA_delay_codes) |
| ATC slot window of 15 minutes | When airspace is congested, EUROCONTROL gives a flight a take-off time (CTOT) it must meet within 5 minutes early to 10 late | EUROCONTROL Network Manager |
| Crew short of duty hours | Every crew has a maximum flight duty period under UK flight time limitations; a long ground delay can push it past the limit | UK CAA, ORO.FTL |
| Cancellation costs more for a fuller flight | Under UK261, a cancellation can cost £220 to £520 per passenger in compensation, plus rebooking | UK261 (retained EU261) |
| Only so many changes at each disruption | Controllers re-plan under the clock and cannot rebuild the whole board at once | Design choice |

## Where the game simplifies

| Simplification | Real practice |
| --- | --- |
| Stands and gates are chosen separately | Contact stands sit on a pier with their own gate; remote stands need buses |
| Every stand takes one aircraft | Some stands (MARS) take one wide-body or two narrow-bodies |
| Crews are needed only for the last 12 to 20 minutes | The turnaround crew works the whole turn; fuel and catering are separate companies |
| An ATC slot sets a departure window | The slot is a take-off time; pushback is planned through A-CDM (TOBT and TSAT) to meet it |
| Your own holds are logged as code 87 | A real log would pick the code for the exact cause |

These may become later shifts.
