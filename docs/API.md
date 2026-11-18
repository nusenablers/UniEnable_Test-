# Local REST API (v0.1, no authentication)

Default base URL: `http://127.0.0.1:3001`. All JSON is fictional or mock data unless explicitly created in the local dev database. **Do not deploy publicly.**

| Method | Path | Function |
|---|---|---|
| GET | `/api/health` | Demo server health |
| GET | `/api/activities?order=chronological` | Activities; order may be `chronological`, `demand`, `priority` |
| POST | `/api/activities` | Add activity |
| PATCH | `/api/activities/:id` | Set `{ "completed": true }` or false |
| DELETE | `/api/activities/:id` | Remove by stable ID |
| GET | `/api/facilities` | Fictional facility list |
| GET | `/api/routes?from=hub-a&to=hub-c` | **Verified-mode** routing; synthetic seeds give no path |
| GET | `/api/routes?from=hub-a&to=hub-c&demo=true` | **Synthetic demo** route, never valid navigation advice |
| GET | `/api/phrases` | Fixed communication cards |
| GET | `/api/surveys` | Unverified survey placeholders |
| POST | `/api/surveys` | Record unverified observation; not added to route graph |
| GET | `/api/sensors/readings?limit=30` | Most recent capped sensor observations |
| POST | `/api/sensors/readings` | Ingest one opt-in sensor sample |
| GET | `/api/sensors/summary` | Aggregate per sensor type; EWMA 0.3 |
| POST | `/api/dev/reset` | Only when env `ENABLE_DEV_RESET=true`; wipes local dummy data |

## Add activity example

```json
{
  "name": "Tutorial preparation",
  "date": "2026-12-07",
  "startTime": "10:00",
  "endTime": "11:00",
  "demand": "MEDIUM",
  "importance": 4,
  "urgency": 5,
  "commitment": 3
}
```

Score: `5² × (4+3) = 175`, ranging from 2 to 250; all numeric ratings can independently be null.

## Survey payload

```json
{
  "facilityId": "hub-a",
  "featureType": "RAMP",
  "observedStatus": "UNKNOWN",
  "evidenceNote": "Placeholder note; actual survey still needed"
}
```

The server creates `verificationStatus: "UNVERIFIED"`. The route engine never interprets this as verified.

## Sensor payload

```json
{
  "sensorType": "light_lux",
  "value": 315,
  "timestamp": "2026-11-18T11:00:00.000Z",
  "source": "simulator",
  "consent": true
}
```

Supported types: `temperature_c`, `light_lux`, `noise_db`, `motion_index`. `source: "device"` is accepted for future adapters, but a true hardware reading must only be submitted after consent and validation. No identifying metadata is stored in v0.1.

## Error contract

- Validation errors: 400 JSON `{ "error": "..." }`.
- Missing resource: 404 JSON `{ "error": "..." }`.
- Route failure: HTTP 200 with `{ "found": false, "reason": "...", "demo": false }`, so the UI distinguishes graph results from transport errors.

Examples:

```bash
curl http://127.0.0.1:3001/api/health
curl 'http://127.0.0.1:3001/api/routes?from=hub-a&to=hub-c&demo=true'
curl http://127.0.0.1:3001/api/sensors/summary
```
