# Mapping original Java CLI semantics to mobile/API skeleton

The two supplied Java ZIPs were inspected for architecture and behaviour. This is a *clean implementation* in JS/TS, not a file-for-file copy.

| Java CLI concept | Starter counterpart | Status |
|---|---|---|
| `model.Activity`: name/date/start/end/demand/isDone | `Activity` TS interface, server JSON record | Basic implementation |
| Optional importance, urgency, commitment 1–5 | Plan screen controls; server validates optional ratings | Implemented |
| `Activity.getPriorityScore()` | `priorityScore()` in Node, `urgency² × (importance + commitment)` | Implemented and tested |
| `ActivityList` canonical sorting / demand / priority | `sortActivities()` Node function; `GET /api/activities?order=...` | Implemented |
| `AddCommand`, `MarkCommand`, `UnmarkCommand`, `DeleteCommand` | `POST`, `PATCH`, `DELETE /api/activities` | Implemented basic cases |
| `Facility`, `FacilityFeature` | Facility and feature records; Map screen | Synthetic only |
| `Connection`, `AccessibilityStatus` YES / NO / UNKNOWN | Link graph with explicit evidence status | Synthetic only |
| `DijkstraShortestPath` route logic | `findRoute()` Dijkstra with nonnegative distances | Implemented; no live navigation |
| Original CLI `facilities.txt` and `connections.txt` | `createSeed()` fictional facilities/links | Original NUS data deliberately NOT copied |
| UniEnable V2 preferences, recommendations, recurring schedule | Future modules | TODO |
| Activity conflicts, date picker, recurring timetable | Future planner enhancements | TODO |
| Accessible navigation and HCI evaluation | Large controls, meaningful text, TalkBack/VoiceOver workplan | Initial scaffold |
| Communication phrase cards in AT meeting deck | Communicate screen | Display works; speech TODO |
| Teammate's sensor/algorithm proposal | `/api/sensors/*`, isolated `algorithm.js` | Synthetic bridge; actual sensors TODO |

## Data validation details

- Priority scores are `null` unless all three ratings are present, identical to the sampled Java CLI's basic rule. Completed activities still retain a score; the Home view excludes completed items from its upcoming summary.
- `date`, `startTime` and `endTime` are stored as strings; all valid example activities occupy one day. Timezone, DST, cross-midnight tasks and conflict checks are future work.
- A new activity must have a valid date, HH:mm times, strictly increasing start/end, and one of LOW/MEDIUM/HIGH demand. Past-activity rejection is intentionally not enforced in this skeleton; it should be decided with users before porting.
- Routes are undirected for demonstration, reflecting the Java CLI's documented bidirectional connections. Real-world one-way or conditional paths require enhanced modelling.
