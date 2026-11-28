# Rules and scoring

## The rules

| Rule | Detail |
| --- | --- |
| Aircraft size | Classes run S, M, L. A bigger stand or gate can take a smaller aircraft, never the reverse |
| Stand time | A stand is held for the turnaround: from 35 minutes before departure for class S, 45 for M and 75 for L, until 10 minutes after |
| Gate time | A gate is held from 35 minutes before departure until 10 minutes after |
| No sharing | A stand or gate cannot serve two flights whose times overlap |
| Opening hours | Nothing can use a stand or gate while it is shut (grey on the timeline) |
| Gate close | The gate closes to passengers 20 minutes before departure, as at British Airways' Gatwick gates |
| Check-in | Opens 2 hours before the scheduled time and closes 45 minutes before departure (60 for class L) |
| Desk speed | Most passengers checked in online, so each desk handles about 2 a minute. Desks are freed as soon as a flight's passengers are all through |
| Desk limit | The number of desks staffed is shown in the notices. Using more than that at once breaks the plan |
| Turnaround crews | From shift 3. Three crews are on duty. Each flight needs one for its last 12 to 20 minutes before departure, to load the bags and close up the aircraft, so no more than 3 flights can be in that final stretch at once. Delaying a flight moves that stretch later |
| Delay | Crew duty hours allow up to 60 minutes of delay. A crew short of hours, or an ATC slot, allows less: the flight editor shows the limit |

A flight that breaks any rule at the moment it departs is cancelled.

## During the shift

| Rule | Detail |
| --- | --- |
| Disruptions | Announced during the shift. Each one stops the clock for a set time (60 seconds on early shifts, down to 25 on the hardest). Each is a real kind of delay with its own IATA delay code, shown in the debrief |
| Late inbound aircraft (code 93) | The flight's departure time moves later. This delay is not charged to you |
| ATC departure slot (code 81) | From shift 6. The flight's departure moves later and it must leave within the next 15 minutes, so you can hold it no more than 15 minutes. Missing the slot cancels it. The slot delay is not charged |
| Crew short of duty hours | From shift 7. The flight can be held only a few minutes before its crew are out of hours, which cancels it |
| Bag offload (code 15) | From shift 8. A passenger did not board, so their bag comes off. The flight, already on stand, departs 10 to 20 minutes later. Not charged, but the flights after it on that stand, gate or crew may need moving |
| Stand or gate out of use | Any flight whose aircraft is already on stand when it is announced keeps its stand and gate. Every other flight must be moved off it |
| Extra passengers | Announced before check-in opens, so you can add desks in time |
| What you can change | Anything on a flight whose aircraft is not yet on stand. Desks are fixed once check-in opens. An aircraft on stand can only be held with more delay |

## Points

| Event | Points |
| --- | --- |
| Normal flight leaves on time | +100 |
| High-priority flight (★) leaves on time | +150 |
| First 15 minutes of delay on any flight | 0 (counts as on time, as in airline punctuality figures) |
| Each minute after that, normal flight | −1 |
| Each minute after that, high-priority flight | −2 |
| A flight is cancelled | −100, and −1 more for every passenger on board (so about −180 to −400), as compensation and rebooking would cost |
| Every flight leaves, for each desk you never needed at the busiest moment | +10 |
| Each use of Suggest a fix | −10 |

A delayed flight never scores below zero, so a delay is always better than a cancellation.

The debrief also lists your delay minutes by cause, in the IATA codes an operations log uses: 93 late inbound aircraft, 81 ATC slot, 15 bag offload, and 87 for holds you chose because of stand, gate, desk or crew limits.

## The house controller

The house controller is the computer's player. It plans by going down the departures board in time order and giving each flight the first stand, gate, desks and turnaround-crew slot that fit, adding delay a minute at a time when nothing does. At every disruption it re-plans only the flights that have broken, under the same rules as you. It never looks ahead and never makes room by moving a flight that is still fine, which is how you beat it.

## Gold and the time limit

At each disruption you only have time to change a handful of flights. The game's own solver, which sets gold, is held to the same limit: 7 flights on a 60-second pause, 5 on 45 seconds, 4 on 35 and 3 on 25. So any plan the game shows you is one you could have made in the time.
