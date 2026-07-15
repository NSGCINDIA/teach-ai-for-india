-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0006 Seed: campuses + CMS content blocks
-- Idempotent (on conflict do nothing). Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 9 founding campuses (PRD: 9 campuses across Telangana & AP) ──────────────
insert into campuses (name, university_name, city, state, slug, quarter,
                      target_schools, target_students, target_sessions, description, is_active)
values
  ('NIAT × KKH',                                                        'KKH Campus',                                            'Hyderabad',     'Telangana',      'niat-kkh',          'Q3-2026',  8, 1000,  8, 'Driving AI literacy across regional government schools with 1,000+ students addressed.', true),
  ('NIAT × Chaitanya (Deemed to be University) (CDU)',                 'Chaitanya (Deemed to be University)',                    'Hyderabad',     'Telangana',      'niat-cdu',          'Q3-2026',  1,   30,  1, 'Active campus bringing foundational AI education to government schools.', true),
  ('NIAT × Chevella',                                                   'Chevella Campus',                                       'Chevella',      'Telangana',      'niat-chevella',     'Q3-2026',  1,   70,  1, 'Reaching classrooms in the Chevella region with AI awareness sessions.', true),
  ('NIAT × Aurora Deemed University',                                   'Aurora Deemed University',                              'Hyderabad',     'Telangana',      'niat-aurora',       'Q3-2026',  1,  200,  1, 'Empowering students through hands-on AI prompt and project sessions.', true),
  ('NIAT × Malla Reddy Vishwavidyapeeth (MRV)',                         'Malla Reddy Vishwavidyapeeth',                          'Hyderabad',     'Telangana',      'niat-mrv',          'Q3-2026',  2,    0,  0, 'Spreading digital awareness and outreaching local government schools.', true),
  ('NIAT × Chalapathi Institute of Technology (CIET)',                 'Chalapathi Institute of Technology',                     'Guntur',        'Andhra Pradesh', 'niat-ciet',         'Q3-2026',  2,  140,  2, 'Educating students on practical AI tools and safe utilization.', true),
  ('NIAT × NSRIT (Nadimpalli Satyanarayana Raju Institute of Tech)',   'Nadimpalli Satyanarayana Raju Institute of Technology', 'Visakhapatnam', 'Andhra Pradesh', 'niat-nsrit',        'Q3-2026',  4,  234,  4, 'Promoting applied AI literacy across Visakhapatnam government schools.', true),
  ('NIAT × NRI University',                                             'NRI University',                                        'Vijayawada',    'Andhra Pradesh', 'niat-nri',          'Q3-2026',  1,   80,  1, 'Empowering classrooms in the Vijayawada area with foundational AI literacy.', true),
  ('NIAT × Annamacharya University',                                     'Annamacharya University',                               'Kadapa',        'Andhra Pradesh', 'niat-annamacharya', 'Q3-2026',  1,   88,  2, 'Providing hands-on AI workshops for first-time digital learners.', true)
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
        jsonb_build_object('quote','The students showed strong interest and picked things up quickly. With proper teaching, they have clear potential to grow and perform well.','name','Balaji','role','Principal, ZPH High School Sontyam','photoUrl',null),
        jsonb_build_object('quote','All the volunteers did a solid job delivering the sessions clearly and effectively. The students were fully engaged and genuinely enjoyed the learning experience.','name','Srinivas','role','Principal, ZPH High School Pendurthi','photoUrl',null),
        jsonb_build_object('quote','The sessions were very interactive and our students were eager to participate in all the hands-on AI exercises.','name','Pushpa Latha','role','Principal, ZPHS Agiripalli','photoUrl',null)
      ))),

  ('faq', jsonb_build_object(
      'items', jsonb_build_array(
        jsonb_build_object('question','What is Teach AI for India?','answer','We are a student-led movement bringing applied AI literacy to government school students across Telangana and Andhra Pradesh, empowering the next generation of responsible digital creators.','visible',true),
        jsonb_build_object('question','Who can volunteer?','answer','Any university student at one of our participating partner campuses can volunteer. We recruit and train volunteers to facilitate interactive AI workshops in local schools.','visible',true),
        jsonb_build_object('question','How do campuses join?','answer','Higher education institutions can join the movement by establishing an official campus chapter. Student leads or college administrators can contact us to start onboarding.','visible',true),
        jsonb_build_object('question','How are schools selected?','answer','We focus where the digital divide is widest, partnering with government schools, state residential schools, and Gurukulams in collaboration with local education offices.','visible',true),
        jsonb_build_object('question','Is there any fee?','answer','No. Every session, curriculum material, and workshop delivered by Teach AI for India is completely free of charge to partner schools and students.','visible',true),
        jsonb_build_object('question','Who conducts sessions?','answer','Sessions are conducted on the ground by trained university volunteers organized into campus teams, led by an execution lead for each session.','visible',true),
        jsonb_build_object('question','How can organizations partner?','answer','We partner with educational institutions, NGOs, corporate sponsors, and government offices. Contact us or email partners@teachaiforindia.org to explore collaboration.','visible',true)
      ))),

  ('announcements', jsonb_build_object('items', jsonb_build_array())),

  ('partner_logos', jsonb_build_object('items', jsonb_build_array())),

  ('contact_info', jsonb_build_object(
      'email','hello@teachaiforindia.org',
      'phone','+91 90000 00000',
      'address','Hyderabad, Telangana, India',
      'social', jsonb_build_array(
        jsonb_build_object('label','Instagram','href','https://www.instagram.com/teachai_for.india?igsh=Mnh2OGg2Mjd2ajdh'),
        jsonb_build_object('label','LinkedIn','href','https://www.linkedin.com/company/teach-ai-for-india-tai/'),
        jsonb_build_object('label','Twitter','href','#'))))
on conflict (block_key) do nothing;
