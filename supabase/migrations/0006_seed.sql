-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0006 Seed: campuses + CMS content blocks
-- Idempotent (on conflict do nothing). Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 9 founding campuses (PRD: 9 campuses across Telangana & AP) ──────────────
insert into campuses (name, university_name, city, state, slug, quarter,
                      target_schools, target_students, target_sessions, description, is_active)
values
  ('GRIET',    'Gokaraju Rangaraju Institute of Engineering and Technology', 'Hyderabad',     'Telangana',      'griet',    'Q3-2026', 10, 500, 20, 'Founding campus driving AI literacy across Hyderabad government schools.', true),
  ('CBIT',     'Chaitanya Bharathi Institute of Technology',                 'Hyderabad',     'Telangana',      'cbit',     'Q3-2026', 10, 500, 20, 'Strong outreach team reaching schools across the city outskirts.', true),
  ('VNR VJIET','VNR Vignana Jyothi Institute of Engineering & Technology',   'Hyderabad',     'Telangana',      'vnr-vjiet','Q3-2026',  8, 400, 16, 'Hands-on sessions with a focus on prompt-writing workshops.', true),
  ('MGIT',     'Mahatma Gandhi Institute of Technology',                     'Hyderabad',     'Telangana',      'mgit',     'Q3-2026',  8, 400, 16, 'Ethics-and-safety led curriculum for first-time AI learners.', true),
  ('CVR',      'CVR College of Engineering',                                 'Hyderabad',     'Telangana',      'cvr',      'Q3-2026',  6, 300, 12, 'Rapidly growing volunteer base across Ibrahimpatnam cluster.', true),
  ('Vasavi',   'Vasavi College of Engineering',                             'Hyderabad',     'Telangana',      'vasavi',   'Q3-2026',  6, 300, 12, 'Application-and-project sessions building real student portfolios.', true),
  ('SNIST',    'Sreenidhi Institute of Science and Technology',             'Hyderabad',     'Telangana',      'snist',    'Q3-2026',  6, 300, 12, 'Consistent weekly cadence across Ghatkesar schools.', true),
  ('MVSR',     'Maturi Venkata Subba Rao Engineering College',              'Hyderabad',     'Telangana',      'mvsr',     'Q3-2026',  5, 250, 10, 'Newest Telangana campus with high momentum.', true),
  ('AUCE',     'Andhra University College of Engineering',                  'Visakhapatnam', 'Andhra Pradesh', 'auce',     'Q3-2026',  6, 300, 12, 'Anchor campus expanding the movement into Andhra Pradesh.', true)
on conflict (slug) do nothing;

-- ─── CMS content blocks (PRD §7.10) — one JSONB blob per block_key ────────────
insert into content_blocks (block_key, content) values
  ('hero', jsonb_build_object(
      'eyebrow', 'Now live across Telangana & Andhra Pradesh',
      'headline', 'Building India''s first student-led AI education movement',
      'subheadline', 'We bring applied AI literacy to government school students across Telangana & Andhra Pradesh — run entirely by students.',
      'primaryCtaText', 'See our impact',
      'primaryCtaHref', '/impact',
      'secondaryCtaText', 'Join the movement',
      'secondaryCtaHref', '/join',
      'backgroundImageUrl', null )),

  ('mission', jsonb_build_object(
      'title', 'Why we exist',
      'items', jsonb_build_array(
        jsonb_build_object('icon','Sparkles','title','Applied AI literacy','description','Not theory — students build, prompt, and reason with real AI tools.'),
        jsonb_build_object('icon','MapPin','title','Where it''s needed most','description','Tier-2 and Tier-3 government schools with near-zero AI exposure.'),
        jsonb_build_object('icon','Users','title','Student-led, at scale','description','A multi-campus network that turns volunteer energy into lasting impact.')
      ))),

  ('how_it_works', jsonb_build_object(
      'title', 'How it works',
      'steps', jsonb_build_array(
        jsonb_build_object('step',1,'title','Identify','description','Outreach heads find government schools that need AI literacy.'),
        jsonb_build_object('step',2,'title','Outreach','description','We secure principal permission and schedule the visit.'),
        jsonb_build_object('step',3,'title','Approve','description','Campus leads confirm readiness and assign a team.'),
        jsonb_build_object('step',4,'title','Deliver','description','Volunteers run an interactive AI session with students.'),
        jsonb_build_object('step',5,'title','Report','description','Every session is documented with evidence before it closes.')
      ))),

  ('testimonials', jsonb_build_object(
      'items', jsonb_build_array(
        jsonb_build_object('quote','My students had never used an AI tool before. Now they ask me when the team is coming back.','name','Headmistress','role','Government High School','photoUrl',null),
        jsonb_build_object('quote','Teaching here changed how I see my own degree. This is the most meaningful thing I do.','name','Volunteer','role','GRIET','photoUrl',null)
      ))),

  ('faq', jsonb_build_object(
      'items', jsonb_build_array(
        jsonb_build_object('question','Who can volunteer?','answer','Any student at a participating campus. Apply through the Join page and your campus lead will onboard you.','visible',true),
        jsonb_build_object('question','Do students need prior AI knowledge?','answer','No. Sessions are designed for first-time learners in government schools.','visible',true),
        jsonb_build_object('question','How are sessions funded?','answer','Volunteer travel is reimbursed and every rupee is tracked transparently on this platform.','visible',true)
      ))),

  ('announcements', jsonb_build_object('items', jsonb_build_array())),

  ('partner_logos', jsonb_build_object('items', jsonb_build_array())),

  ('contact_info', jsonb_build_object(
      'email','hello@teachaiforindia.org',
      'phone','+91 90000 00000',
      'address','Hyderabad, Telangana, India',
      'social', jsonb_build_array(
        jsonb_build_object('label','Instagram','href','#'),
        jsonb_build_object('label','LinkedIn','href','#'),
        jsonb_build_object('label','Twitter','href','#'))))
on conflict (block_key) do nothing;
