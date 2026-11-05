# Product Requirements Document: Saath

**Product:** Simple Indian wedding planning website  
**Status:** Confirmed product direction; draft requirements  
**Version:** 1.0  
**Date:** 3 November 2026

## 1. Product summary

Saath is a simple website that helps a couple and their families organize an Indian wedding with multiple events. The dashboard is the home screen. From there, family members can open each event to manage its guests, tasks, expenses, photos, and livestream information.

The website should reduce the work of keeping separate chats, lists, and bills in sync. It should be easy to understand on a phone and flexible enough for weddings with different ceremonies and traditions.

**Product promise:** One shared place to see what is happening across the wedding and what each event needs.

## 2. Problem

Indian weddings often include several events, each with its own guest list, schedule, shopping, tasks, and costs. Couples and family members coordinate these details across messages, calls, paper lists, and spreadsheets. It is easy to lose track of who is coming to which event, who is handling a task, what has been paid, and where the latest details or photos are.

The product should give the couple and family a clear shared view without requiring them to learn a complicated planning system.

## 3. Goals

- Give the couple and family one dashboard for the full wedding.
- Organize planning details around individual events as well as the wedding overall.
- Track guests and attendance separately for each event.
- Make tasks and responsibilities visible.
- Track expenses and keep bill photos with the related record.
- Give each event a place for shared photos and its livestream link.
- Keep the experience simple, mobile-friendly, and adaptable to Indian wedding traditions.

## 4. Users

### Primary users

- **Couple / hosts:** Need an overall view, want to delegate tasks, and need to track guests and spending.
- **Family members:** Help organize ceremonies, invite guests, buy items, and update costs or photos.

The first version is for the couple and their family. It is not designed as a vendor or wedding planner portal.

## 5. Product principles

- **Dashboard first:** Show the most useful wedding-wide information immediately.
- **Event centered:** Each event has its own details and planning materials.
- **Flexible traditions:** Offer optional examples such as Haldi, Mehendi, Sangeet, Wedding, and Reception; users can rename, remove, reorder, or add events.
- **Simple collaboration:** Make it clear who can view and update the wedding workspace.
- **Private by default:** Wedding details, guest information, financial records, and photos are only available to invited people.
- **Useful on a phone:** Support quick updates during shopping and on wedding days.

## 6. First-version scope

### 6.1 Dashboard

The dashboard is the wedding home screen and shows:

- Upcoming events and dates.
- Total guest count and RSVP progress, with per-event breakdowns.
- Tasks due soon and their owners.
- Overall planned budget, amount recorded as spent, and remaining amount.
- Recent expenses and bill status.
- Recent family updates, photo activity, and a visible livestream link when available.
- Quick actions to add an event, guest, task, or expense.

### 6.2 Multiple events

Users can create and update events. An event includes:

- Event name, date, start time, end time (optional), and venue/location.
- Description or family notes.
- Estimated or confirmed guest count.
- Event-specific guests and RSVP statuses.
- Related tasks and shopping reminders.
- Related expenses and bill photos.
- Event photo gallery.
- Livestream link and viewing instructions, if applicable.

Users can add any event names and do not have to use a preset ceremony list.

### 6.3 Guest management

- Add a person or household, contact details (optional), family group, and notes.
- Track invitation/RSVP status separately for each event: not invited, invited, confirmed, declined, or awaiting response.
- Support household guest counts, plus dietary or accessibility notes.
- Show headcount by event and across the wedding.
- Search and filter the guest list.

### 6.4 Bulk invitations through WhatsApp and email

- Select guests or households by event and send invitations in bulk through WhatsApp or email.
- Provide editable invitation message templates with event name, date, time, venue, and a private RSVP link.
- Preview the message and recipient list before sending; allow the host to remove recipients from that send.
- Record invitation channel and sent status, and show each guest’s RSVP status alongside the invitation.
- Support sending in batches and clear feedback for messages that could not be sent.
- Ask the host to confirm that recipients may be contacted and use an approved sending method for each channel.

The website should not expose guest contact details to other guests. WhatsApp and email delivery may depend on approved provider integrations and account setup.

### 6.5 Tasks and shopping

- Add a task or shopping item with a title, event, owner, due date, optional notes, and status.
- Mark tasks complete and reopen them if needed.
- Show tasks by event, owner, due date, and status.
- Include a simple wedding checklist that users can customize.
- Shopping items may include quantity, estimated cost, actual cost, purchaser, and purchased/not purchased status.

### 6.6 Expense tracker and bill photos

- Set an overall wedding budget and optionally an event budget.
- Record expense description, amount, date, category, event, and who paid.
- Record whether an expense is estimated, due, or paid.
- Attach a bill or receipt photo to an expense.
- Show total spent and remaining budget overall and by event/category.
- Allow users to correct or remove an expense they added, with changes visible to workspace collaborators.

The first version records expenses; it does not process payments or settle money between family members.

### 6.7 Event photo galleries

- Provide a gallery for each event.
- Invited collaborators can add photos and captions.
- Show uploader and upload date.
- Allow an authorized user to remove a photo.
- Keep galleries private to the wedding workspace.

### 6.8 Livestream link

- Add an external livestream URL and short viewing instructions to an event.
- Display the link prominently on the event page and dashboard when the event is near.
- Allow the host to update or remove the link.

The website links to an existing streaming service; it does not host or broadcast the stream.

### 6.9 Family collaboration and access

- A host creates a private wedding workspace and invites family collaborators.
- The first version supports simple roles: **owner** (workspace and access control) and **collaborator** (view and update planning information).
- Show who added or last updated important records.
- Only invited people can access the wedding workspace.

## 7. Out of scope for the first version

- Vendor directory, vendor accounts, or marketplace.
- Travel planning, accommodation booking, or transport coordination.
- Downloadable or printable event summaries.
- Guest-facing public wedding website or self-service RSVP portal.
- Payment processing or contribution settlement.
- Hosting livestream video.
- Building a large photo storage or editing service.
- Automated SMS messaging.
- Required ceremony templates or assumptions about one regional tradition.

These may be considered after learning from first-version users.

## 8. Main user journeys

### Create and set up a wedding

1. Host creates a workspace with couple names, wedding date, and city (optional).
2. Host adds, removes, or renames events.
3. Host invites family collaborators.
4. Dashboard prompts the family to add guests, assign tasks, and enter the starting budget.

### Prepare for an event

1. Open an event to view its date, location, notes, headcount, and schedule details.
2. Add guests or set their RSVP for that event.
3. Select invitees, preview the invitation, and send it in bulk through WhatsApp or email.
4. Add and assign event tasks or shopping items.
5. Record expenses and attach bill photos.
6. Add photos and livestream details when available.

### Check wedding progress

1. Open the dashboard.
2. Review upcoming events, RSVP counts, tasks, budget, and recent updates.
3. Open an event or list to make a needed update.

### Add an expense

1. Choose the event and enter amount, description, category, payer, and payment status.
2. Attach a receipt image if available.
3. Save the record and see the updated event and overall budget totals.

## 9. Functional requirements and acceptance criteria

| Feature | Requirement | Acceptance criteria |
|---|---|---|
| Dashboard | Summarize wedding progress | Displays upcoming events, guest/RSVP summary, tasks, and budget; selecting a summary opens its relevant detail |
| Events | Support multiple editable events | A user can create, update, reorder, and remove events; each event keeps its own guests, tasks, expenses, gallery, and livestream information |
| Guest management | Track attendance per event | A guest may have different RSVP statuses for different events; each event headcount reflects confirmed guests and household counts |
| Bulk invitations | Invite selected guests by WhatsApp or email | Host can choose an event and recipients, preview/edit the message, confirm the send, and see sending status and RSVP status per recipient |
| Tasks | Assign and track work | A task supports event, owner, due date, status, and notes; completion is reflected on dashboard and event page |
| Shopping | Track needed and purchased items | An item can be associated with an event and marked purchased; optional actual cost can be connected to an expense |
| Expenses | Track planned and actual costs | Totals update from saved records and can be viewed by event and category; payer and payment status are visible |
| Bill photos | Attach receipts to expenses | Authorized collaborators can view an attached image; access follows workspace permissions |
| Gallery | Share photos by event | Authorized collaborators can upload and view photos in the correct event gallery and remove their own or permitted photos |
| Livestream | Store event stream details | A valid external link and instructions are visible to invited collaborators on the event page |
| Access | Keep workspace private | A person without an invitation cannot view wedding records, galleries, or receipts |
| Mobile use | Support common phone screens | Core dashboard and event actions are usable without horizontal scrolling on typical mobile widths |

## 10. Success measures

- New wedding workspaces add multiple events and invite at least one family collaborator.
- Active weddings maintain guest and RSVP information by event.
- Tasks have an owner and are completed or updated before their due date.
- Expenses are regularly recorded with payer and event/category details.
- Families use the event galleries and add livestream details when applicable.
- Couple and family feedback indicates they spend less time asking for the latest plan or tracking details across chats.

Avoid optimizing for time spent in the app. The goal is to make coordination clearer and take less effort.

## 11. Important product and technical considerations

- **Shared data is essential:** The existing `index.html` prototype saves changes only in one browser. Family collaboration requires user accounts or secure invitations, a shared database, and server-side access checks.
- **Privacy:** Guest contacts, dietary notes, expenses, receipts, and photos can be sensitive. Use private workspaces, role-based access, secure uploads, and deletion controls.
- **Storage limits:** Set sensible image size/type limits and clear handling for removal and storage retention.
- **Cost accuracy:** Budget totals should be calculated from expense records and clearly distinguish estimates from paid costs.
- **Regional flexibility:** Ceremony names, event order, and traditions should be configurable.
- **Data safety:** Provide recovery/backup practices before real wedding information is stored.
- **Invitation delivery:** Bulk WhatsApp and email depend on provider setup, delivery status support, recipient contact details, and host confirmation. Never send without a final recipient/message preview and confirmation.

## 12. Suggested delivery sequence

1. Validate the workflow with a few couples and family organizers.
2. Build private wedding workspaces and event management.
3. Add guest/event RSVP management, tasks, shopping, and budget/expense tracking.
4. Add secure bill and photo uploads, plus livestream links.
5. Pilot with a small number of weddings, fix usability issues, and decide which later features are most valuable.

## 13. Later feature candidates

Consider after the first version is in use:

- Vendor and venue contact management.
- Travel, accommodation, and transport planning.
- Downloadable or printable summaries.
- Guest self-service RSVP links.
- Calendar export and reminder integrations.
- Language options and regional event templates.
- Post-wedding archive or photo-sharing enhancements.

## 14. Open questions for a future product review

These questions are not blockers for the confirmed direction, but should be answered before implementation details are finalized:

1. Should guests RSVP through the site, or should family members enter responses they receive elsewhere?
2. Should a collaborator be able to see every expense, or should hosts be able to restrict financial details?
3. Which languages should the first release support?
4. How many photos and what file sizes should the initial gallery allow?
5. Should event updates notify all collaborators, or only people assigned to that event?

## 15. Prototype note

The current `index.html` is a visual prototype of the dashboard and planning sections. It includes sample content and browser-local interactions. It is not yet a shared or production-ready website: accounts, invitations, server storage, secure receipt/photo uploads, and robust budget and RSVP calculations still need to be implemented.
