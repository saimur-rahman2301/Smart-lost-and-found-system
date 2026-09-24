# FindX — C++ Edition
## API Reference

**Base URL:** `http://localhost:4000/api/v1`

All responses follow the shape:
```json
{ "success": true, "message": "...", "data": {...} }
{ "success": false, "message": "...", "error": { "code": "ERROR_CODE", "details": {...} } }
```

---

## Authentication

### POST /auth/register
Register a new student account.

**Body:**
```json
{ "name": "string (2-100 chars)", "email": "string (valid email)", "password": "string (min 8 chars)" }
```
**Response 201:**
```json
{ "success": true, "data": { "user": {...}, "accessToken": "jwt...", "refreshToken": "jwt..." } }
```
**Errors:** 409 EMAIL_IN_USE, 422 VALIDATION_ERROR

---

### POST /auth/login
**Body:** `{ "email": "...", "password": "..." }`
**Response 200:** `{ "user": {...}, "accessToken": "...", "refreshToken": "..." }`
**Errors:** 401 INVALID_CREDENTIALS

---

### POST /auth/refresh
**Body:** `{ "refreshToken": "..." }`
**Response 200:** `{ "accessToken": "...", "refreshToken": "..." }`
**Errors:** 401 INVALID_REFRESH_TOKEN

---

### POST /auth/logout
**Auth:** Bearer token required
**Body:** `{ "refreshToken": "..." }`
**Response 200:** `{ "success": true }`

---

### GET /auth/me
**Auth:** Bearer token required
**Response 200:** `{ "user": { "id", "name", "email", "role", "isVerified", "createdAt" } }`

---

## Items

### GET /items
List items with filters and pagination.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20, max: 100) |
| `type` | string | `LOST` or `FOUND` |
| `category` | string | Filter by category |
| `status` | string | Filter by status |
| `locationNodeId` | string | Filter by building ID |
| `dateFrom` | string | ISO date `YYYY-MM-DD` |
| `dateTo` | string | ISO date `YYYY-MM-DD` |
| `sort` | string | `date`, `createdAt` (default: `createdAt`) |
| `order` | string | `asc` or `desc` (default: `desc`) |
| `q` | string | Full-text search |

**Response 200:**
```json
{
  "success": true,
  "data": [ { item objects... } ],
  "pagination": { "page": 1, "limit": 20, "total": 120, "totalPages": 6 }
}
```

---

### POST /items/lost
**Auth:** Bearer required
**Content-Type:** `multipart/form-data`
**Fields:** `category*, brand, color, locationNodeId*, date* (YYYY-MM-DD), description*, hiddenDetail, photo (file)`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "item": { ...item object... },
    "duplicateWarning": {
      "isDuplicate": false,
      "maxSimilarity": 0.0,
      "candidateIds": []
    }
  }
}
```

---

### POST /items/found
Same as POST /items/lost but `type = FOUND`. `hiddenDetail` is the detail never shown publicly (for verification).

---

### GET /items/:id
**Response 200:** Item object (without `hiddenDetail`)

---

### PATCH /items/:id
**Auth:** Bearer required (reporter or ADMIN)
**Body:** Any subset of item fields.
**Response 200:** Updated item.

---

### DELETE /items/:id
**Auth:** Bearer required (reporter or ADMIN)
Sets `status = CLOSED`. Admin can hard delete.
**Response 200:** `{ "success": true }`

---

### GET /items/:id/matches
**Auth:** Bearer required

Returns top-K matches with full score breakdown.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "lostItemId": "uuid",
      "foundItemId": "uuid",
      "score": 87.5,
      "breakdown": {
        "category":    { "score": 1.0, "weight": 25, "contribution": 25.0 },
        "brand":       { "score": 0.7, "weight": 20, "contribution": 14.0 },
        "location":    { "score": 0.8, "weight": 20, "contribution": 16.0 },
        "date":        { "score": 0.857, "weight": 15, "contribution": 12.857 },
        "description": { "score": 0.982, "weight": 20, "contribution": 19.643 },
        "total": 87.5
      },
      "foundItem": { ...item... }
    }
  ]
}
```

---

## Claims

### POST /claims
**Auth:** Bearer required
**Body:** `{ "itemId": "uuid" }`
**Response 201:** Claim object with status `PENDING`

---

### GET /claims/me
**Auth:** Bearer required
**Response 200:** Array of user's claims with item details.

---

### GET /claims/:id
**Auth:** Bearer required
**Response 200:** Claim with item, claimant, verification breakdown (if exists).

---

### POST /claims/:id/verify
**Auth:** Bearer required (claimant only)

Submit verification answers:
```json
{
  "hiddenDetail": "The scratched left corner",
  "approximateLocation": "Main Library",
  "date": "2026-09-15",
  "category": "Electronics",
  "additionalEvidence": "It's a black laptop with a dinosaur sticker"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "claim": { ...updated claim... },
    "breakdown": {
      "hiddenDetail":        { "awarded": 30, "maxPoints": 30, "matched": true },
      "approximateLocation": { "awarded": 20, "maxPoints": 20, "matched": true },
      "date":                { "awarded": 15, "maxPoints": 15, "matched": true },
      "category":            { "awarded": 15, "maxPoints": 15, "matched": true },
      "additionalEvidence":  { "awarded": 18, "maxPoints": 20, "similarityScore": 0.9 },
      "total": 98,
      "verdict": "LIKELY_LEGITIMATE"
    }
  }
}
```

---

### PATCH /claims/:id/status
**Auth:** ADMIN only
**Body:** `{ "status": "APPROVED" | "REJECTED", "adminNote": "optional note" }`
**Response 200:** Updated claim.

> ⚠️ Claims are NEVER auto-approved regardless of verification score. A human admin always makes the final decision.

---

## Graph

### GET /graph/buildings
**Response 200:** Array of all campus buildings.

---

### POST /graph/buildings
**Auth:** ADMIN
**Body:** `{ "name": "...", "shortCode": "...", "latitude": 0.0, "longitude": 0.0 }`
**Response 201:** New building.

---

### DELETE /graph/buildings/:id
**Auth:** ADMIN

---

### POST /graph/edges
**Auth:** ADMIN
**Body:** `{ "fromBuildingId": "uuid", "toBuildingId": "uuid", "weight": 120.0 }`

---

### GET /graph/shortest-path?from=&to=
**Auth:** Bearer required
**Response 200:**
```json
{
  "success": true,
  "data": {
    "from": "LIB",
    "to": "ENG",
    "path": ["uuid-lib", "uuid-sci", "uuid-eng"],
    "pathNames": ["Main Library", "Science Complex", "Engineering Hall"],
    "totalWeight": 210.0,
    "found": true
  }
}
```

---

## Search

### GET /search/autocomplete?q=laptop
**Response 200:**
```json
{
  "success": true,
  "data": [
    { "word": "laptop", "itemIds": ["uuid1", "uuid2"] },
    { "word": "laptop charger", "itemIds": ["uuid3"] }
  ]
}
```

---

## Admin

### GET /admin/analytics
**Auth:** ADMIN
**Response 200:** Full analytics object including counts, charts data, heatmap.

### GET /admin/queue
**Auth:** ADMIN — Claims sorted by verificationScore descending.

### GET /admin/users?page=&limit=
**Auth:** ADMIN

### PATCH /admin/users/:id
**Auth:** ADMIN — `{ "role": "STUDENT" | "ADMIN" }`

### DELETE /admin/users/:id
**Auth:** ADMIN

### POST /admin/undo
**Auth:** ADMIN — Undoes last admin action from ActionHistoryManager stack.

### POST /admin/redo
**Auth:** ADMIN — Redoes last undone action.

---

## Debug (DSA Visualizer)

### GET /debug/engine-state
**Auth:** ADMIN only

Returns live internal state of all engine data structures for the visualizer panel:

```json
{
  "hashTable": {
    "itemCache": { "size": 120, "capacity": 256, "loadFactor": 0.47, "collisionCount": 8 },
    "userCache": { "size": 6, "capacity": 16, "loadFactor": 0.375, "collisionCount": 0 }
  },
  "trie": { "wordCount": 847, "nodeCount": 2341 },
  "bst": { "size": 120, "height": 12 },
  "heap": { "size": 15, "topScores": [96.4, 87.5, 82.1] },
  "queue": { "size": 3, "items": ["claim-uuid-1", "claim-uuid-2", "claim-uuid-3"] },
  "stack": {
    "undoSize": 4, "redoSize": 0,
    "undoStack": [{ "type": "APPROVE_CLAIM", "description": "...", "timestamp": "..." }]
  },
  "graph": {
    "nodeCount": 15, "edgeCount": 23,
    "nodes": [{ "id": "...", "name": "Main Library", "shortCode": "LIB" }],
    "adjacency": { "uuid-lib": [{ "to": "uuid-sci", "weight": 120.0 }] }
  }
}
```

---

## Notifications

### GET /notifications?page=&limit=
**Auth:** Bearer required

### PATCH /notifications/:id/read
**Auth:** Bearer required

### PATCH /notifications/read-all
**Auth:** Bearer required

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 422 | Request body/params failed validation |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Resource not found |
| `EMAIL_IN_USE` | 409 | Registration email already exists |
| `DUPLICATE_CONFLICT` | 409 | Unique constraint violation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `INVALID_REFRESH_TOKEN` | 401 | Expired or invalid refresh token |
