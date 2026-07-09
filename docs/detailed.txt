================================================================================
TEACH AI FOR INDIA — COMPLETE PLATFORM WORKFLOW & PERMISSIONS DOCUMENT
================================================================================
Purpose of this document:
  This file is written so that ANYONE reviewing this website/platform — a
  founder, investor, auditor, new team member, or technical reviewer — can
  understand, end to end, WHO can do WHAT, and HOW work actually flows through
  the system, without needing to read the code.

What this platform is:
  Teach AI for India runs a student-led AI-literacy movement across multiple
  university campuses in Telangana & Andhra Pradesh. Student volunteers visit
  government schools and run AI-literacy sessions for school students. This
  website is the internal "operating system" that manages that entire
  operation: finding schools, planning and running sessions, tracking who
  attended, collecting photo/document evidence, reimbursing volunteer travel
  costs, and reporting impact — plus a public-facing marketing website.

Tech snapshot (for technical reviewers):
  Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage). All business
  rules (who can do what, valid status transitions, approval logic) are
  enforced in TWO places at once: the Postgres database (Row Level Security +
  triggers/functions) AND the application code — so even a bug in the app
  code cannot bypass the underlying rules.

--------------------------------------------------------------------------------
TABLE OF CONTENTS
--------------------------------------------------------------------------------
  1. The 9 Roles — who they are, in plain English
  2. Full Permission Matrix
  3. How a Person Gets an Account (Sign-up / Invite / Login)
  4. Site Map — every screen, grouped by who can see it
  5. The Core Workflow: A School's Journey From Lead to Impact
     5a. School status pipeline
     5b. Session planning → scheduling handoff
     5c. Volunteer assignment
     5d. Running the session: attendance & the "reported" gate
     5e. Session review & verification
  6. Evidence Vault (photos/documents) & the Public Gallery
  7. Reimbursements / Finance
  8. Certificates
  9. Announcements, Calendar, Availability
  10. Analytics & Reporting
  11. Admin Panel & Content Management (CMS)
  12. Notifications — every automatic alert in the system
  13. Security Notes (sessions, rate-limiting, privilege escalation protection)
  14. Glossary of Status Values

================================================================================
1. THE 9 ROLES — WHO THEY ARE, IN PLAIN ENGLISH
================================================================================
Every user of the internal system (not the public website) has exactly ONE
role. The role decides which pages they can open and which actions they can
perform.

  1. SUPER ADMIN
     Full control of the entire platform. The only role that can change
     anyone's role, promote someone to admin, or touch a claim after it has
     been paid. There is at least one super admin seeded when the platform
     launches; more should be added for redundancy.

  2. MANAGEMENT ADMIN ("mgmt_admin")
     Organization leadership. Sees everything, approves/pays all
     reimbursements, edits the public website content, but — unlike Super
     Admin — CANNOT change a user's role or deactivate an account, and cannot
     submit a reimbursement claim for themselves.

  3. CAMPUS LEAD
     Runs one campus end-to-end: their own campus's schools, sessions,
     volunteers, evidence, finance, and local approvals. Can also promote
     other users within their own campus (but never to Super Admin/Mgmt
     Admin level).

  4. OUTREACH LEAD ("outreach_head")
     Owns the relationship with schools — finding them, following up, getting
     the paperwork approved, and filling in the session-planning form once a
     school signs on. Does not manage volunteers, finance, or analytics.

  5. EXECUTION LEAD ("exec_lead")
     Plans and reports on sessions once they've been scheduled — the person
     "on the ground" responsible for making sure a visit actually happens and
     is documented (attendance, evidence, the completion report).

  6. VOLUNTEER LEAD
     Recruits and coordinates the volunteer bench for a campus: assigns
     volunteers to sessions, tracks who's available, and issues recognition
     certificates.

  7. VOLUNTEER
     The student who actually shows up and teaches. Accepts/declines session
     assignments, records their own availability, and submits their own
     travel-reimbursement claims.

  8. SCHOOL POC
     Reserved for a future school-side contact who interacts by email link
     rather than logging into the portal. Today this role exists in the
     system but has almost no built functionality — think of it as a
     placeholder for a later phase.

  9. VIEWER
     Read-only access to impact numbers and analytics — intended for
     partners, funders, or donors who need visibility but should never touch
     operational data.

================================================================================
2. FULL PERMISSION MATRIX
================================================================================
"ALL" = works anywhere in the org. "OWN CAMPUS" = only for their own campus's
data (enforced by the database itself, not just hidden in the UI). "—" = no
access at all.

┌─────────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Permission               │Super │Mgmt  │Campus│Outrch│Exec  │Vol.  │Volun-│School│View- │
│                          │Admin │Admin │Lead  │Lead  │Lead  │Lead  │teer  │POC   │er    │
├─────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ View all campuses        │ ALL  │ ALL  │  —   │  —   │  —   │  —   │  —   │  —   │ ALL  │
│ Add/edit a school        │ ALL  │ ALL  │ OWN  │ OWN  │  —   │  —   │  —   │  —   │  —   │
│ Create a session         │ ALL  │ ALL  │ OWN  │  —   │ OWN  │  —   │  —   │  —   │  —   │
│ Submit a reimbursement    │ ALL  │  —   │  —   │ OWN  │ OWN  │  —   │ OWN  │  —   │  —   │
│ Approve a reimbursement   │ ALL  │ ALL  │  —   │  —   │  —   │  —   │  —   │  —   │  —   │
│ View analytics (org-wide) │ ALL  │ ALL  │  —   │  —   │  —   │  —   │  —   │  —   │ ALL  │
│ View analytics (campus)   │ ALL  │ ALL  │ OWN  │ OWN  │ OWN  │ OWN  │  —   │  —   │ ALL  │
│ Upload evidence           │ ALL  │ ALL  │ OWN  │ OWN  │ OWN  │  —   │ OWN  │  —   │  —   │
│ Assign volunteers*        │ ALL  │ ALL  │ OWN  │  —   │  —   │ OWN  │  —   │  —   │  —   │
│ Edit public website (CMS)│ ALL  │ ALL  │  —   │  —   │  —   │  —   │  —   │  —   │  —   │
│ Manage user roles/access  │ ALL  │  —   │ OWN  │  —   │  —   │  —   │  —   │  —   │  —   │
│ Export data               │ ALL  │ ALL  │ OWN  │  —   │  —   │  —   │  —   │  —   │  —   │
└─────────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
* "Assign volunteers" also doubles as the permission used to issue/revoke
  volunteer certificates.

Things worth flagging to a reviewer because they are easy to assume wrong:
  - Management Admin cannot manage user roles or deactivate accounts — only
    Super Admin (anywhere) and Campus Lead (within their own campus) can.
  - Management Admin cannot submit a reimbursement for themselves, even
    though they approve everyone else's.
  - Campus Lead and Volunteer Lead are NOT allowed to submit reimbursement
    claims — only Super Admin, Outreach Lead, Exec Lead, and Volunteer can.
  - A Campus Lead can promote/edit users, but ONLY within their own campus,
    and can NEVER grant Super Admin or Management Admin — that ceiling is
    enforced by the database itself, not just the UI (see §13).

================================================================================
3. HOW A PERSON GETS AN ACCOUNT
================================================================================
There are three ways into the system:

  A) ADMIN INVITE (most common for staff)
     A Super Admin or Management Admin sends an invite (name, email, role,
     campus). The invitee receives an email, clicks the link, sets a
     password, and lands in the app with the role already assigned.

  B) PUBLIC SELF-SIGNUP REQUEST ("/signup")
     Anyone can request an account for one of these roles: Volunteer,
     Volunteer Lead, Exec Lead, Outreach Lead, or Campus Lead. (Super Admin,
     Management Admin, Viewer, and School POC can NEVER be self-requested —
     this is enforced at the database level, not just hidden in the form.)
     The request sits as "pending" and every active admin is notified
     in-app and by email. An admin then either:
       - Approves it → the account is activated with the requested role
         (the system re-checks server-side that the role is actually one of
         the allowed self-signup roles, even if someone tampered with the
         request), and the applicant is emailed to log in.
       - Rejects it → the applicant is emailed and may re-apply.
     Signup is rate-limited (5 attempts per IP per 24 hours) to prevent abuse.

  C) SEEDED FOUNDER ACCOUNT
     The very first Super Admin account is created directly in the database
     when the platform is first set up, with a placeholder password that
     must be changed immediately on first login.

LOGIN
  Standard email + password. Login attempts are rate-limited (8 failed tries
  per account per 15 minutes, 30 failed tries per IP per 15 minutes) to
  resist brute-force and password-spray attacks. If an account has been
  deactivated by an admin, login is blocked with a clear message. On success,
  the user is sent to the homepage appropriate to their role (admins →
  Admin Panel overview, Viewer → Analytics, everyone else → their Dashboard).

SESSION LENGTH
  A login session is valid for 8 hours before the access token must silently
  refresh, and a user is fully logged out and must re-enter their password
  after 30 days regardless of activity.

================================================================================
4. SITE MAP — EVERY SCREEN, GROUPED BY WHO CAN SEE IT
================================================================================
PUBLIC WEBSITE (no login required — marketing site)
  Home, About, Campuses (list + individual campus pages with real session
  history & team roster), Contact form, FAQ, Photo Gallery, Impact numbers,
  "Join as a Volunteer" application form, Success Stories.

LOGIN / ACCOUNT PAGES
  Login, Sign Up (request access), Forgot Password, Reset Password, Accept
  Invite, and a "403 – not allowed" page shown whenever someone tries to open
  a screen their role doesn't permit.

TEAM DASHBOARD ("/dashboard/...") — the day-to-day workspace, tailored per role
  Campus Lead sees: Overview, Schools, Sessions, Assignments, Volunteers,
    Attendance, Evidence, Finance, Analytics, Calendar, Announcements,
    Notifications, Settings.
  Outreach Lead sees: Overview, Schools, Outreach Forms, Approval Letters,
    Calendar, Announcements, Notifications.
  Volunteer Lead sees: Overview, Volunteers, Assignments, Availability,
    Calendar, Certificates, Attendance, Announcements, Notifications.
  Exec Lead sees: Overview, Today's Sessions, Reports, Calendar, Attendance,
    Evidence, Reimbursements, Announcements, Notifications.
  Volunteer sees: Overview, My Sessions, My Assignments, Availability,
    Attendance, Evidence, Reimbursements, Certificates, Announcements,
    Profile.
  School POC sees: Overview, Notifications only (placeholder role today).
  Viewer sees: Overview only (their real work happens in Analytics, below).
  Super Admin / Management Admin: work primarily from the Admin Panel, not
    this dashboard.

  Note: the sidebar itself is filtered so it never shows a link the role
  isn't actually allowed to open — there is no "greyed out" link that leads
  to a dead end.

ADMIN PANEL ("/admin/...") — Super Admin & Management Admin (Viewer gets
Analytics only)
  Overview (org KPIs + alert feed), Campuses, Schools, Sessions, Volunteers,
  Finance, Evidence, Reports, Analytics (+ printable one-page summary),
  Content (website CMS), Settings.

================================================================================
5. THE CORE WORKFLOW: A SCHOOL'S JOURNEY FROM LEAD TO IMPACT
================================================================================
This is the spine of the entire platform. Every school record moves through a
strict, enforced sequence of statuses. No one can skip a step or move
backwards illegally — the database itself rejects invalid moves.

--------------------------------------------------------------------------------
5a. SCHOOL STATUS PIPELINE
--------------------------------------------------------------------------------
  lead_identified → contacted → followup_pending → approval_requested →
  approval_received → session_scheduled → session_in_progress → completed
  → archived

  Allowed moves at each stage:
    lead_identified      → contacted, or archived
    contacted            → followup_pending, approval_requested,
                             back to lead_identified, or archived
    followup_pending     → contacted, approval_requested, or archived
    approval_requested   → approval_received, back to followup_pending,
                             or archived
    approval_received    → session_scheduled, back to approval_requested,
                             or archived
    session_scheduled    → session_in_progress, back to approval_received,
                             or archived
    session_in_progress  → completed, back to session_scheduled, or archived
    completed            → archived
    archived             → lead_identified (re-opening a closed school —
                             SUPER ADMIN / MANAGEMENT ADMIN ONLY)

  Who can move a school between statuses: Super Admin, Management Admin, or
  the Campus Lead / Outreach Lead of that specific campus.
  Archiving a school always requires typing a reason — it cannot be a silent
  action.
  Every single status change is permanently logged (who, when, what, why) in
  an append-only history table that nobody — not even a Super Admin — can
  edit or delete after the fact. This is the audit trail.

  Duplicate protection: when someone adds a new school, the system checks for
  similarly-named schools in the same district and warns before letting the
  record be created twice.

--------------------------------------------------------------------------------
5b. SESSION PLANNING → SCHEDULING HANDOFF
--------------------------------------------------------------------------------
  Once a school reaches "approval_received", the Outreach Lead fills in a
  detailed planning form: coordinator's contact, number of students,
  classrooms/sections available, whether there's a lab/projector/internet,
  the proposed date (plus a backup date), and the signed approval letter.

  A Campus Lead, Outreach Lead (of that campus), or an admin then APPROVES
  the plan. The moment that happens, the system automatically:
    1. Creates the actual session record (status: "planned").
    2. Advances the school to "session_scheduled".
    3. Notifies every active Exec Lead and Volunteer Lead on that campus that
       a team now needs to be assigned.
  A plan can only be approved once, and only while the school is still in
  "approval_received" — this prevents double-booking or approving a plan for
  a school that already moved on.

--------------------------------------------------------------------------------
5c. VOLUNTEER ASSIGNMENT
--------------------------------------------------------------------------------
  A Campus Lead or Volunteer Lead assigns specific volunteers to the newly
  created session. Each volunteer is notified and must respond:
    accepted / declined / replacement_requested
  Declining or requesting a replacement REQUIRES a written reason — it can't
  be a silent no. Every response notifies both the person who made the
  assignment and every active Volunteer Lead on the campus, so gaps get
  noticed immediately. A lead can also remove/clear an assignment (e.g. after
  a decline) to free up the slot for someone else.

--------------------------------------------------------------------------------
5d. RUNNING THE SESSION: ATTENDANCE & THE "REPORTED" GATE
--------------------------------------------------------------------------------
  Session statuses: planned → in_progress → reported → campus_approved →
  verified (cancelled is possible from most stages).

  On the day of the visit, someone marks the session "in_progress", then
  records attendance for every team member present (present / absent / late
  / left_early). Attendance numbers feed directly into two things: the
  session's own volunteer count, and — later — whether a reimbursement claim
  is flagged as suspicious (see §7).

  To move a session to "reported", the system enforces a hard quality gate —
  it will refuse the move unless ALL of the following are true:
    - Student count is filled in and greater than zero
    - Volunteer count is filled in and greater than zero
    - A topic/description has been entered
    - At least one PHOTO has been uploaded as evidence
    - At least one DOCUMENT (e.g. attendance sheet) has been uploaded
  This means a session literally cannot be marked as delivered without proof
  it happened. There is no way around this gate in the UI or the database.

  Cancelling a session is restricted to Super Admin / Management Admin /
  Campus Lead, and always requires a written reason.

--------------------------------------------------------------------------------
5e. SESSION REVIEW & VERIFICATION
--------------------------------------------------------------------------------
  Once "reported", a Campus Lead (or the original creator, or an admin)
  reviews the report and evidence and marks it "campus_approved". A further
  review marks it "verified" — this is the final state, and ONLY verified
  sessions are counted in school totals, campus rollups, and the public
  impact numbers shown on the website. This two-step review (report →
  campus-approved → verified) exists specifically so impact numbers can't be
  inflated by a single person's say-so.

================================================================================
6. EVIDENCE VAULT (PHOTOS/DOCUMENTS) & THE PUBLIC GALLERY
================================================================================
  Any team member can upload evidence (photos, videos, documents, receipts,
  approval letters) tied to a school/session. Files first land in a PRIVATE
  storage area and sit as "pending".

  An admin (or the original uploader, or that campus's Campus Lead) reviews
  each file and either:
    - Approves it (stays private, just marked verified), or
    - Rejects it, or
    - Approves it AND makes it public — this is a separate, explicit action
      that only an admin or Campus Lead can take, and only for photos (not
      documents, receipts, or letters — those can never be made public).
      "Making public" physically copies the file into a separate public
      storage bucket that powers the public photo gallery on the website.

  Deleting evidence normally just hides it (soft-delete, reversible);
  permanently destroying a file is restricted to Super Admin only.

================================================================================
7. REIMBURSEMENTS / FINANCE
================================================================================
  Statuses: draft → submitted → under_review → approved/rejected → paid.
  (A rejected claim can be edited and resubmitted from draft. A paid claim is
  frozen — only a Super Admin can touch it again after payment.)

  Who can submit a claim for themselves: Super Admin, Outreach Lead, Exec
  Lead, and Volunteer. (Campus Lead and Volunteer Lead cannot submit their
  own travel claims.)

  Who reviews/approves/pays: Super Admin and Management Admin only, from the
  Admin Panel's Finance section.

  Automatic checks the system runs the moment a claim is submitted:
    - The claim MUST be linked to a real session.
    - CLAIM WINDOW: it must be submitted within a configurable number of days
      of the session date (default 14 days) — after that, submission is
      rejected outright. Admins can adjust this window in Settings.
    - ANOMALY DETECTION — a claim is automatically routed to "under_review"
      (not blocked, just flagged for a human to check) if ANY of these are
      true:
        • The amount is over ₹500 and the travel mode is "auto" (unusually
          high for that mode).
        • The claimant has already filed 3+ claims in the same week.
        • The linked session hasn't yet been campus-approved/verified.
        • The claimant has no attendance record showing they were actually
          present at that session.
  This means suspicious or risky claims are never silently approved — a
  human always has to look at them, without blocking legitimate claims from
  being submitted in the first place.

  Every claim gets an auto-generated reference number (e.g. REIMB-2026-00042)
  so it can be tracked/reconciled externally.

================================================================================
8. CERTIFICATES
================================================================================
  Campus Leads, Volunteer Leads, and admins can issue a certificate to a
  volunteer — Participation, Milestone, Excellence, or Completion. The
  system auto-generates a unique serial number and automatically notifies
  the volunteer the moment it's issued. Certificates can be revoked by the
  same set of people if issued in error. Volunteers can view and print their
  own certificates.

================================================================================
9. ANNOUNCEMENTS, CALENDAR, AVAILABILITY
================================================================================
  ANNOUNCEMENTS — Leads (Campus/Outreach/Exec/Volunteer Lead) can post a
  message visible to their own campus; only admins can post an org-wide
  announcement visible to everyone. Everyone sees org-wide announcements
  plus whatever is posted for their own campus.

  CALENDAR — A shared team calendar that simply displays scheduled sessions
  by date; there's no separate data to manage here, it's a live view of the
  Sessions data.

  AVAILABILITY — Volunteers mark themselves available / unavailable /
  tentative for specific dates. This is purely informational — leadership
  uses it to decide who to assign to upcoming sessions, but there's no
  approval step involved.

================================================================================
10. ANALYTICS & REPORTING
================================================================================
  Three levels of numbers are available, all built from the same underlying
  verified data so numbers always tie out to the operational records:
    - Org-wide summary (total schools, sessions, students reached, etc.)
    - Per-campus performance vs. target
    - Operational drill-downs: session funnel (how many sessions are stuck at
      each stage), school pipeline (how many schools are stuck at each
      stage), and month-by-month activity trends.

  Super Admin and Management Admin see everything at "/admin/analytics";
  Viewer sees the same screen (read-only, that's their entire job); Campus
  Lead gets a scoped version limited to their own campus at
  "/dashboard/analytics". A printable one-page management summary and a
  scheduled monthly email digest to all admins are both available.

================================================================================
11. ADMIN PANEL & CONTENT MANAGEMENT (CMS)
================================================================================
  Restricted to Super Admin and Management Admin (unless noted otherwise):
    - Manage the list of participating campuses.
    - Edit the public website's content blocks (hero text, mission
      statement, FAQ answers, etc.) without needing a developer.
    - Configure finance rules (e.g. the reimbursement claim window).
    - Review and triage public "Join as a Volunteer" applications and
      "Contact Us" messages.
    - Approve/reject self-signup account requests.
    - Manage user roles and activate/deactivate accounts (Super Admin
      anywhere; Campus Lead within their own campus only — see §13).

================================================================================
12. NOTIFICATIONS — EVERY AUTOMATIC ALERT IN THE SYSTEM
================================================================================
  These fire automatically, in-app and (for most) by email, with no human
  needing to remember to send them:

  Event                                    → Who is notified
  ------------------------------------------------------------------------
  Someone submits a signup request         → every active Super/Mgmt Admin
  Admin approves a signup request          → the new user
  A session plan is approved (school       → every active Exec Lead +
    advances to session_scheduled)            Volunteer Lead on that campus
  Volunteers are assigned to a session     → each newly-assigned volunteer
  A volunteer accepts/declines/requests    → the person who made the
    a replacement for an assignment           assignment + every active
                                               Volunteer Lead on that campus
  A certificate is issued                  → the volunteer who received it

================================================================================
13. SECURITY NOTES
================================================================================
  - ROLE CHANGES TAKE EFFECT IMMEDIATELY: the system never trusts a cached
    login token for permissions — it re-reads the user's current role from
    the database on every single request. If an admin changes someone's role
    or deactivates them, that takes effect on their very next click, not
    after they happen to log out and back in.
  - PRIVILEGE ESCALATION IS BLOCKED AT THE DATABASE LEVEL, not just the UI:
    a user can never edit their own role, campus, or active-status. A Campus
    Lead can only edit users within their own campus and can never grant
    Super Admin or Management Admin to anyone, even by accident or by
    directly calling the underlying system — the database itself refuses it.
  - RATE LIMITING protects login (8 failed tries/account/15min, 30/IP/15min),
    signup (5/IP/24h), and general form submissions (10 POSTs/min on
    sensitive pages) against automated abuse.
  - AUDIT TRAIL: school status changes and key administrative actions are
    written to an append-only log that cannot be edited or deleted by anyone,
    including Super Admin — it's a permanent record for later review.
  - Every dashboard/admin page checks permission TWICE — once when the
    request first arrives (before any page even loads) and again inside the
    page itself — so a bug or a bypassed link can't accidentally expose data.

================================================================================
14. GLOSSARY OF STATUS VALUES
================================================================================
  SCHOOL STATUS:
    lead_identified, contacted, followup_pending, approval_requested,
    approval_received, session_scheduled, session_in_progress, completed,
    archived

  SESSION STATUS:
    planned, in_progress, reported, campus_approved, verified, cancelled

  SESSION PLAN STATUS:
    draft, approved, cancelled

  ASSIGNMENT STATUS:
    assigned, accepted, declined, replacement_requested, cancelled

  REIMBURSEMENT STATUS:
    draft, submitted, under_review, approved, rejected, paid

  EVIDENCE APPROVAL STATUS:
    pending, approved, rejected  (separately: is_public true/false)

  AVAILABILITY STATUS:
    available, unavailable, tentative

  CERTIFICATE KINDS:
    participation, milestone, excellence, completion

================================================================================
END OF DOCUMENT
================================================================================
