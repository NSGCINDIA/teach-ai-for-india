# Teach AI for India (TAI) — Asset & Data Verification Checklist (TODO.md)

This document catalogs every placeholder (`[REAL PHOTO]`, `[VERIFY: ...]`, names, metrics, and contacts) across the landing page that needs to be replaced with verified assets or confirmed data.

---

## 1. Statistics & Operational Metrics

These numbers appear on the **Hero Proof Line** and **Section 8: The Numbers Behind the Work**. Verify them against your central attendance logs and chapter audit sheets:

- [ ] `[VERIFY: 1,842+]` **Students Addressed**: Replace with latest confirmed total across all delivered cohorts.
  - *Location*: `content.json` -> `hero.proofLine` and `numbers.stats[0]`.
- [ ] `[VERIFY: 20+]` **Government Schools**: Confirm the exact number of unique school campuses that have hosted sessions.
  - *Location*: `content.json` -> `numbers.stats[1]`.
- [ ] `[VERIFY: 9]` **Active NIAT Campus Chapters**: Confirm current active collegiate teams.
  - *Location*: `content.json` -> `numbers.stats[2]`.
- [ ] `[VERIFY: 35+]` **Classroom Sessions Delivered**: Confirm total number of discrete 60–90 min workshops completed.
  - *Location*: `content.json` -> `numbers.stats[3]`.
- [ ] `[VERIFY: 120+]` **Student Volunteers**: Confirm count of registered NIAT undergraduate volunteers who have entered classrooms.
  - *Location*: `content.json` -> `numbers.stats[4]`.
- [ ] `[VERIFY: 2]` **States Active**: Confirm current states (Telangana and Andhra Pradesh).
  - *Location*: `content.json` -> `numbers.stats[5]`.

---

## 2. Student Leader & Volunteer Profiles (Section 3)

Confirm names, roles, study specializations, and replace placeholder avatar photography for the student cards in `content.json` -> `whoAreTheStudents.profiles`:

- [ ] **Profile 1**:
  - Name: `[VERIFY: Sneha Reddy]`
  - Role: `Chapter Lead & Curriculum Facilitator`
  - Campus: `NIAT Hyderabad (KKH Campus)`
  - Headshot/Classroom Photo: Replace with high-resolution 4:3 or 16:10 JPEG/WebP.
- [ ] **Profile 2**:
  - Name: `[VERIFY: Ravi Teja]`
  - Role: `Outreach & School Relations Coordinator`
  - Campus: `NIAT Visakhapatnam (NSRIT Campus)`
  - Headshot/Classroom Photo: Replace with real photo.
- [ ] **Profile 3**:
  - Name: `[VERIFY: Karthik Mohan]`
  - Role: `Session Lead & Tablet Lab Manager`
  - Campus: `NIAT Vijayawada (CDU Campus)`
  - Headshot/Classroom Photo: Replace with real photo.
- [ ] **Profile 4**:
  - Name: `[VERIFY: Ananya Sharma]`
  - Role: `Curriculum Co-Lead & Ethics Facilitator`
  - Campus: `NIAT Hyderabad (Aurora Campus)`
  - Headshot/Classroom Photo: Replace with real photo.
- [ ] **Profile 5**:
  - Name: `[VERIFY: Ahladini Sindhu Sri]`
  - Role: `Rural School Liaison & Logistics Lead`
  - Campus: `NIAT Chevella Campus`
  - Headshot/Classroom Photo: Replace with real photo.
- [ ] **Profile 6**:
  - Name: `[VERIFY: Jahnavi Chandra]`
  - Role: `Classroom Facilitator & Student Mentor`
  - Campus: `NIAT Guntur (CIET Campus)`
  - Headshot/Classroom Photo: Replace with real photo.

---

## 3. Real Photography & Media Assets

Verify and optionally swap Cloudinary URLs in `content.json` with higher-resolution or updated field photos:

### Hero Photo Sequence (Section 1)
- [ ] `Fig. 01`: Classroom setup before session starts (Current: `ZPHS Bachupally`).
- [ ] `Fig. 02`: Student typing prompt on shared tablet (Current: `MPPS Nandakramaguda`).
- [ ] `Fig. 03`: Bilingual prompt engineering in Telugu (Current: `NIAT × Aurora`).
- [ ] `Fig. 04`: Students surrounding mentors after class (Current: `MPPS Nandakramaguda`).

### The Human Story (Section 2)
- [ ] Feature Photo: `content.json` -> `humanStory.photoSlot.url` (Middle-school students and college volunteers on wooden classroom benches).

### See Teach AI in Action — 45s Field Reel (Section 7)
- [ ] Chapter 01 Image: Morning classroom arrival at government school compound.
- [ ] Chapter 02 Image: Students typing their first prompt in pairs.
- [ ] Chapter 03 Image: The moment the image generation appears on screen.
- [ ] Chapter 04 Image: The post-session huddle asking volunteers to return.
- [ ] Optional: If you produce an actual `.mp4` / `.webm` raw field documentary reel, embed the `<video>` element inside `see-in-action-section.tsx`.

### Classroom Moments Gallery (Section 7)
- [ ] Moment 1: ZPHS Bachupally (`Prompting`).
- [ ] Moment 2: NIAT × CDU (`Hands-On`).
- [ ] Moment 3: NIAT × Aurora (`Bilingual AI`).
- [ ] Moment 4: MPPS Nandakramaguda (`First Output`).
- [ ] Moment 5: NIAT × Chevella (`Rural Outreach`).
- [ ] Moment 6: Post-session discussion (`Mentorship`).

### Stories From the Field (Section 10)
- [ ] Story 1 Photo: Raju and classmates celebrating the Allu Arjun portrait generation.
- [ ] Story 2 Photo: Kavitha taking notes in her bilingual prompt guide.
- [ ] Story 3 Photo: Headmaster Balaji observing the session from the classroom doorway.

---

## 4. Contact Details & Official Coordinates (Section 14 & Footer)

- [ ] **Phone Number**: Replace `+91 90000 00000 [VERIFY]` with the confirmed chapter coordination contact line in `content.json` -> `finalCta.phone`.
- [ ] **Email Mailbox**: Confirm `hello@teachaiforindia.org` has MX records and forwarding setup to the student coordinator team.
- [ ] **Social Handles**: Verify links in `CONTACT_INFO_FALLBACK` (Instagram, LinkedIn).
- [ ] **Resend / Email API Key**: In `.env`, ensure `RESEND_API_KEY` is configured if you wish to receive form submissions directly in your team inbox in addition to Supabase storage.

---

## 5. How to Edit Copy & Data

All text, numbers, and image URLs are centralized in:
`app/(public)/content.json`

You can edit any line of copy, replace any photo URL, or update any stat without modifying TypeScript or React layout code.
