# API Documentation: Saath

**API style:** REST over HTTPS, JSON request/response bodies  
**Base path:** `/api/v1`  
**Status:** Draft contract for the first version  
**Date:** 3 November 2026  
**Related design:** [SDA.md](SDA.md) · [DATABASE-DESIGN.md](DATABASE-DESIGN.md)

## 1. Conventions

- Authenticated routes use a secure session cookie created by passwordless email sign-in.
- All wedding-scoped routes include `weddingId`; the server verifies the signed-in user has active membership in that wedding.
- `owner`, `admin`, `manager`, and legacy `collaborator` members can read and update planning records. The owner has full access; admins can manage collaborator invitations but cannot invite another admin; managers have planning access; collaborators retain the legacy standard access. Workspace deletion remains owner-only.
- Guest RSVP routes use an opaque event/household token and do not require an account.
- IDs are MongoDB ObjectId strings in API payloads.
- Timestamps are ISO 8601 UTC strings. Event dates use `YYYY-MM-DD`; local event times use `HH:mm` with an IANA time zone.
- Monetary amounts use integer minor units. Example: `amountMinor: 125000` means ₹1,250.00 when `currency` is `INR`.
- Collections and field details are defined in [DATABASE-DESIGN.md](DATABASE-DESIGN.md).

### Standard response format

Successful single-resource responses return the resource directly. Lists use a pagination envelope:

```json
{
  "data": [],
  "page": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

Errors use a consistent JSON body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be completed.",
    "requestId": "req_abc123",
    "fields": {
      "name": "Name is required."
    }
  }
}
```

`fields` is optional. Do not include tokens, contact details, file URLs, or provider secrets in error messages.

## 2. Authentication and access

Family collaborator routes use the passwordless session. The UI may request a short email code or a magic link; the server validates it and sets an HTTP-only, secure, same-site session cookie.

### Auth endpoints

#### `POST /auth/email/request`

Request a one-time code or magic link.

Request:

```json
{ "email": "meera@example.com", "method": "magic_link" }
```

`method`: `magic_link` or `code`.

Response: `202 Accepted`

```json
{ "message": "If this email can sign in, instructions will be sent." }
```

Return the same response whether or not the email is registered, to avoid account enumeration.

#### `POST /auth/email/verify`

Verify the one-time credential and create the session.

Request:

```json
{ "email": "meera@example.com", "code": "123456" }
```

or:

```json
{ "token": "one-time-token-from-link" }
```

Response: `200 OK`, sets session cookie.

```json
{
  "user": { "id": "user_id", "displayName": "Meera Patel", "email": "meera@example.com" },
  "weddings": [{ "id": "wedding_id", "role": "owner", "coupleNames": ["Aarav Sharma", "Meera Patel"] }]
}
```

#### `POST /auth/logout`

Revoke the current session and clear the cookie. Response: `204 No Content`.

#### `GET /me`

Return the current collaborator and memberships. Response: `200 OK`.

## 3. Wedding workspace and collaborators

### `POST /weddings/:weddingId/invitations`

Owner or admin. Creates a seven-day invitation with role `admin`, `manager`, or `collaborator`. Only the owner can invite an admin. When `RESEND_API_KEY` is configured, the invitation is delivered through Resend; otherwise the response includes a development preview URL.

Request:

```json
{ "displayName": "Priya Patel", "email": "priya@example.com", "role": "manager" }
```

### `GET /weddings/:weddingId/invitations`

Owner-only. Lists pending invitations without exposing token hashes.

### `POST /weddings`

Create a wedding workspace. The authenticated user becomes its owner.

Request:

```json
{
  "title": "Aarav & Meera's Wedding",
  "coupleNames": ["Aarav Sharma", "Meera Patel"],
  "weddingDate": "2027-02-14",
  "timeZone": "Asia/Kolkata",
  "city": "Jaipur",
  "currency": "INR",
  "budgetMinor": 300000000
}
```

Response: `201 Created` with the wedding resource.

### `GET /weddings/{weddingId}`

Return workspace settings. Requires membership.

### `PATCH /weddings/{weddingId}`

Update couple names, wedding date, time zone, city, currency, or budget. Owner or collaborator.

### `DELETE /weddings/{weddingId}`

Request staged workspace deletion. Owner only. Response: `202 Accepted`; deletion/revocation status is handled asynchronously.

### Collaborator access

- `GET /weddings/{weddingId}/members` — list collaborators; owner or collaborator.
- `POST /weddings/{weddingId}/member-invitations` — invite a family collaborator by email; owner only.
- `DELETE /weddings/{weddingId}/members/{userId}` — remove a collaborator; owner only. The owner cannot remove themselves while they are the sole owner.
- `PATCH /weddings/{weddingId}/members/{userId}` — change role; owner only.

Invite request:

```json
{ "email": "family@example.com", "role": "collaborator" }
```

## 4. Dashboard

### `GET /weddings/{weddingId}/dashboard`

Return a computed summary. Counts and totals are derived from event, RSVP, task, and expense records.

Optional query: `?upcomingLimit=5&activityLimit=10`.

Response:

```json
{
  "wedding": { "id": "wedding_id", "currency": "INR", "budgetMinor": 300000000 },
  "upcomingEvents": [
    { "id": "event_id", "name": "Mehendi", "dateLocal": "2027-02-12", "startTimeLocal": "11:00", "timeZone": "Asia/Kolkata" }
  ],
  "guests": { "invited": 248, "confirmed": 186, "awaiting": 34, "declined": 28 },
  "tasks": { "open": 12, "dueSoon": 4, "overdue": 1 },
  "budget": { "spentMinor": 184000000, "remainingMinor": 116000000, "currency": "INR" },
  "recentExpenses": [],
  "recentActivity": []
}
```

Budget totals must clearly distinguish paid expenses from estimates or amounts due. RSVP totals are computed per event internally and may also be returned as an `eventCounts` array.

## 5. Events

All routes below are under `/weddings/{weddingId}`.

- `GET /events` — list events ordered by date and `sortOrder`.
- `POST /events` — create an event.
- `GET /events/{eventId}` — event detail.
- `PATCH /events/{eventId}` — update event.
- `DELETE /events/{eventId}` — archive event; do not hard-delete if it has guests, expenses, tasks, or media.
- `POST /events/reorder` — update event order.

Create/update fields:

```json
{
  "name": "Mehendi",
  "dateLocal": "2027-02-12",
  "startTimeLocal": "11:00",
  "endTimeLocal": "15:00",
  "timeZone": "Asia/Kolkata",
  "venue": { "name": "Garden Terrace", "address": "Jaipur, Rajasthan", "notes": "East entrance" },
  "description": "Welcome lunch and mehendi",
  "sortOrder": 10,
  "budgetMinor": 50000000,
  "livestream": { "url": null, "instructions": null }
}
```

`POST /events/reorder` request:

```json
{ "eventIdsInOrder": ["event_id_1", "event_id_2"] }
```

Event detail may include summary counts but should not return an unbounded list of guests, tasks, expenses, or media. Use their dedicated paginated endpoints.

## 6. Guest groups and guests

All routes are wedding-scoped.

### Guest groups

- `GET /guest-groups?search=&familySide=&limit=&cursor=` — search/list groups.
- `POST /guest-groups` — create a household/family group.
- `GET /guest-groups/{groupId}` — group and its guest roster.
- `PATCH /guest-groups/{groupId}` — update contact/family details.
- `DELETE /guest-groups/{groupId}` — archive group; preserve linked invitation history.

Create group request:

```json
{
  "name": "Rajesh Sharma household",
  "familySide": "groom",
  "contactName": "Rajesh Sharma",
  "email": "rajesh@example.com",
  "phoneE164": "+919876543210",
  "notes": "Call if the invitation email bounces"
}
```

`familySide`: `bride`, `groom`, `friends`, or `other`.

### Guests

- `POST /guest-groups/{groupId}/guests` — add a person to a group.
- `PATCH /guests/{guestId}` — update a guest’s name or private notes.
- `DELETE /guests/{guestId}` — archive a guest; preserve historical invitation data.
- `GET /guests?search=&eventId=&rsvpStatus=&limit=&cursor=` — filtered guest list with optional event RSVP state.

Guest create/update fields:

```json
{
  "displayName": "Rajesh Sharma",
  "relationship": "Uncle",
  "dietaryNotes": "Vegetarian",
  "accessibilityNotes": null
}
```

## 7. Event invitations and RSVP status

### `GET /weddings/{weddingId}/events/{eventId}/invitations`

List event invitees, delivery state, and RSVP state. Query options: `rsvpStatus`, `invitationStatus`, `familySide`, `limit`, `cursor`.

### `POST /weddings/{weddingId}/events/{eventId}/invitations`

Add guests to the event invitation list without sending a message.

Request:

```json
{ "guestIds": ["guest_id_1", "guest_id_2"] }
```

Response: `201 Created` with created/unchanged counts. Each invitation starts with `invitationStatus: not_sent` and `rsvpStatus: awaiting` unless the host explicitly records another state.

### `PATCH /weddings/{weddingId}/events/{eventId}/invitations/{guestId}`

Manually update invitation or RSVP state. Useful when the family receives a response by phone or in person.

Request:

```json
{ "rsvpStatus": "confirmed" }
```

Allowed `rsvpStatus`: `awaiting`, `confirmed`, `declined`. `not_invited` is represented by the absence of an invitation record.

## 8. Bulk invitations by email or WhatsApp

### `POST /weddings/{weddingId}/events/{eventId}/invitations/preview`

Validate recipients and render a message without sending it.

Request:

```json
{
  "channel": "email",
  "guestGroupIds": ["group_id_1", "group_id_2"],
  "templateKey": "event-invitation-en-v1",
  "customMessage": "We would love to celebrate with you."
}
```

Response includes recipient count, missing contact count, preview subject/body, and validation warnings. It must not return full contact details to an unauthorized role.

### `POST /weddings/{weddingId}/events/{eventId}/invitations/send`

Create and dispatch a confirmed batch. Requires an `Idempotency-Key` header.

Request:

```json
{
  "channel": "whatsapp",
  "guestGroupIds": ["group_id_1", "group_id_2"],
  "templateKey": "event-invitation-en-v1",
  "customMessage": "We would love to celebrate with you.",
  "confirmedRecipientCount": 2
}
```

Server revalidates recipient membership and count at send time; `confirmedRecipientCount` is a confirmation safeguard, not trusted authorization data.

Response: `202 Accepted`.

```json
{
  "batchId": "batch_id",
  "status": "queued",
  "recipientCount": 2,
  "channel": "whatsapp"
}
```

### `GET /weddings/{weddingId}/invitation-batches/{batchId}`

Return batch totals: queued, sent, delivered, failed, and RSVP counts.

### `POST /webhooks/email/{provider}` and `POST /webhooks/whatsapp/{provider}`

Provider callbacks. Validate signature, reject replayed event IDs, map provider states to internal states, and return `2xx` quickly. These endpoints do not use a family session cookie.

### `POST /weddings/{weddingId}/events/{eventId}/invitations/{guestGroupId}/resend`

Queue a resend for one household, reusing a valid RSVP link or revoking and replacing it according to host choice.

## 9. Guest RSVP without an account

### `GET /public/rsvp/{token}`

Resolve the private token and return only event details and the household’s invited names needed to complete the RSVP. Do not return email/phone, private family notes, other guests, or wedding financial data.

Response:

```json
{
  "event": {
    "name": "Mehendi",
    "dateLocal": "2027-02-12",
    "startTimeLocal": "11:00",
    "timeZone": "Asia/Kolkata",
    "venue": { "name": "Garden Terrace", "address": "Jaipur, Rajasthan" }
  },
  "guests": [
    { "id": "guest_id_1", "displayName": "Rajesh Sharma", "rsvpStatus": "awaiting" },
    { "id": "guest_id_2", "displayName": "Nisha Sharma", "rsvpStatus": "awaiting" }
  ],
  "expiresAt": "2027-02-20T00:00:00Z"
}
```

### `POST /public/rsvp/{token}`

Submit one response per invited guest. No login is required.

Request:

```json
{
  "responses": [
    { "guestId": "guest_id_1", "status": "confirmed" },
    { "guestId": "guest_id_2", "status": "declined" }
  ]
}
```

Allowed status: `confirmed` or `declined`. The token only authorizes guests in its linked household and event. Response: `200 OK` with updated statuses and a friendly confirmation message.

## 10. Tasks and shopping

All routes are wedding-scoped.

- `GET /tasks?eventId=&ownerUserId=&status=&kind=&dueBefore=&limit=&cursor=`
- `POST /tasks`
- `GET /tasks/{taskId}`
- `PATCH /tasks/{taskId}`
- `DELETE /tasks/{taskId}` — archive rather than erase history.
- `POST /tasks/{taskId}/complete`
- `POST /tasks/{taskId}/reopen`

Create request:

```json
{
  "eventId": "event_id",
  "kind": "shopping",
  "title": "Buy return gifts",
  "category": "gifting",
  "ownerUserId": "user_id",
  "dueAt": "2027-02-05T18:30:00Z",
  "quantity": 100,
  "estimatedCostMinor": 2500000,
  "notes": null
}
```

`kind`: `task` or `shopping`. `status`: `open`, `in_progress`, `done`, `cancelled`.

## 11. Expenses and budgets

All routes are wedding-scoped.

- `GET /expenses?eventId=&category=&paymentStatus=&paidBy=&from=&to=&limit=&cursor=`
- `POST /expenses`
- `GET /expenses/{expenseId}`
- `PATCH /expenses/{expenseId}`
- `DELETE /expenses/{expenseId}` — archive with audit history.
- `GET /budget/summary` — overall and event/category totals.
- `PATCH /events/{eventId}/budget` — set or update an event budget.

Create expense request:

```json
{
  "eventId": "event_id",
  "description": "Mehendi artist booking advance",
  "category": "ceremony",
  "amountMinor": 2500000,
  "currency": "INR",
  "paidBy": { "type": "family", "label": "Patel family" },
  "paymentStatus": "paid",
  "expenseDate": "2026-10-12",
  "receiptAssetId": null,
  "notes": null
}
```

Allowed `paymentStatus`: `estimated`, `due`, `paid`, `cancelled`. The summary response separates paid totals from estimated/due amounts.

## 12. Photos and bill uploads (Cloudflare R2)

### `POST /weddings/{weddingId}/media/upload-url`

Create a pending upload and return a short-lived R2 signed PUT URL.

Request:

```json
{
  "eventId": "event_id",
  "purpose": "gallery",
  "filename": "mehendi-flowers.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 1234567,
  "caption": "Decor setup"
}
```

`purpose`: `gallery` or `receipt`. Server validates event and expense access, allowed file type, and maximum size.

Response: `201 Created`.

```json
{
  "assetId": "asset_id",
  "uploadUrl": "https://signed-r2-url",
  "method": "PUT",
  "requiredHeaders": { "Content-Type": "image/jpeg" },
  "expiresAt": "2026-11-03T10:05:00Z"
}
```

### `POST /weddings/{weddingId}/media/{assetId}/confirm`

Confirm upload. Server checks the expected object key, content type, and object size before marking the asset available.

### Gallery and media endpoints

- `GET /weddings/{weddingId}/events/{eventId}/media?purpose=gallery&limit=&cursor=` — list metadata with short-lived view URLs issued after access checks.
- `GET /weddings/{weddingId}/media/{assetId}/url` — request a fresh short-lived view URL.
- `PATCH /weddings/{weddingId}/media/{assetId}` — update caption.
- `DELETE /weddings/{weddingId}/media/{assetId}` — remove metadata and delete the R2 object; owner/uploader permission applies.
- `PATCH /weddings/{weddingId}/expenses/{expenseId}/receipt` — attach an uploaded `receipt` asset to an expense.

Do not persist signed URLs. Treat them as temporary bearer credentials.

## 13. Livestream details

Livestream information is stored on the event and updated through:

- `PATCH /weddings/{weddingId}/events/{eventId}` with `livestream.url` and `livestream.instructions`.
- `DELETE` semantics are represented by setting both values to `null`.

The URL must use HTTPS. Validate/allowlist known streaming domains if required by product policy. Saath stores a link and instructions; it does not host the stream.

## 14. Activity history

### `GET /weddings/{weddingId}/activity?limit=&cursor=`

Return recent important changes (event edits, RSVP changes, task completion, expenses, invitation batches, media uploads/deletions). Activity data must not contain secret tokens or signed URLs.

## 15. Pagination, filtering, and sorting

- List routes accept `limit` (default 25, maximum 100) and opaque `cursor` parameters.
- Use stable sort order such as `(createdAt, _id)` to avoid duplicate/missing items between pages.
- Filters are validated against allowlisted fields; do not pass arbitrary client-provided MongoDB filters or sort expressions to the database.
- Event lists default to local date and `sortOrder`; expenses and activity default to newest first.

## 16. Error codes and HTTP status

| HTTP status | Code | Meaning |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Invalid body, query, enum, or field value |
| `401` | `AUTH_REQUIRED` | Family session is missing or invalid |
| `403` | `FORBIDDEN` | User lacks the needed membership/role |
| `404` | `NOT_FOUND` | Resource not found within the authorized wedding |
| `409` | `CONFLICT` | Duplicate/invalid state change or idempotency conflict |
| `404` | `LINK_NOT_FOUND` | RSVP token is invalid, expired, or revoked; use the same response to avoid confirming whether a token exists |
| `413` | `FILE_TOO_LARGE` | Upload exceeds the configured limit |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | File type is not allowed |
| `422` | `INVALID_STATE` | Request is well-formed but violates workflow rules |
| `429` | `RATE_LIMITED` | Caller exceeded route limits |
| `502` | `PROVIDER_ERROR` | Email/WhatsApp provider temporarily failed |
| `503` | `SERVICE_UNAVAILABLE` | Temporary database/storage/provider outage |

Return a request ID for support. Never leak whether an unrelated wedding, guest, or token exists.

## 17. Security requirements

- Use HTTPS and secure HTTP-only session cookies.
- Protect cookie-authenticated mutations against CSRF; validate origin and use framework CSRF protections where applicable.
- Rate-limit auth, anonymous RSVP, invitation send, and upload URL endpoints.
- Hash RSVP tokens before storage; redact tokens from logs and analytics.
- Validate webhook signatures and reject replayed event IDs.
- Check wedding membership on every private route, including media URL issuance.
- Keep R2 private and issue signed URLs only after server authorization.
- Require a final recipient/message preview and explicit confirmation before bulk sending.
- Use idempotency keys for invitation send operations and webhook processing.
- Never trust `weddingId`, `ownerUserId`, payer, provider status, or asset ownership sent by the browser without validation.

## 18. MVP API implementation order

1. Passwordless auth, workspace, members, and authorization middleware.
2. Events, guests, event invitations, and dashboard summaries.
3. Tasks/shopping and expenses/budget.
4. Account-free RSVP token routes.
5. Media upload URL/confirm/gallery routes using R2.
6. Email and WhatsApp invitation batches, callbacks, and delivery status.
7. Activity history, rate limits, retention controls, and operational monitoring.

## 19. Open implementation choices

- Authentication/email provider and exact code-vs-link UX.
- Email sending provider.
- WhatsApp Cloud API direct integration versus an approved provider.
- Message template management and supported languages.
- Maximum request, gallery image, and receipt sizes.
- Exact RSVP link expiry and resend/revocation policy.
- Whether event collaborators can be scoped more narrowly than wedding-wide access.
