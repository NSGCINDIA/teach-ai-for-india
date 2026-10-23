-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0071 Volunteer application pipeline
--
-- Turns the public /join form into a tracked hiring pipeline:
--
--   Applied → picked up by the campus Volunteer Lead → interview scheduled
--   → interview result recorded → "Selected" / "Rejected" email → done.
--
-- Status mapping (no new enum value — ALTER TYPE ADD VALUE cannot be used in
-- the transaction that adds it, and the existing values already fit):
--   new       = Applied, nobody has picked it up
--   reviewing = picked up by a Volunteer Lead (interview in progress)
--   invited   = selected (decision email sent)
--   rejected  = rejected (decision email sent)
--
-- Who may do what (Campus Lead sees the request, only the Volunteer Lead acts):
--   read   → super_admin, and the campus_lead / volunteer_lead of the
--            application's campus
--   act    → volunteer_lead of that campus, through the RPCs below only
--   direct UPDATE → super_admin only
--
-- Emails are sent from the Next.js server actions (Nodemailer); the database
-- only records the outcome. A decision RPC runs AFTER the email was accepted by
-- the SMTP server, so a failed send never marks an application as decided.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── columns ─────────────────────────────────────────────────────────────────
ALTER TABLE public.volunteer_applications
  ADD COLUMN IF NOT EXISTS campus_id                uuid REFERENCES public.campuses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_by               uuid REFERENCES public.users(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at               timestamptz,
  ADD COLUMN IF NOT EXISTS interview_at             timestamptz,
  ADD COLUMN IF NOT EXISTS interview_mode           text,
  ADD COLUMN IF NOT EXISTS interviewer_name         text,
  ADD COLUMN IF NOT EXISTS interview_invite_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS interview_result         text
    CONSTRAINT volunteer_applications_interview_result_check CHECK (interview_result IN ('selected', 'rejected')),
  ADD COLUMN IF NOT EXISTS interview_notes          text,
  ADD COLUMN IF NOT EXISTS decided_at               timestamptz;

COMMENT ON COLUMN public.volunteer_applications.campus_id IS
  'Resolved from campus_slug by route_volunteer_application(). NULL = no/unknown campus (admin-only).';
COMMENT ON COLUMN public.volunteer_applications.claimed_by IS
  'The Volunteer Lead who picked this application up. Set once, atomically, by claim_volunteer_application().';
COMMENT ON COLUMN public.volunteer_applications.interview_mode IS
  'Where the interview happens — a meeting link or a place.';
COMMENT ON COLUMN public.volunteer_applications.interviewer_name IS
  'Success coach who conducts the interview (not a platform user).';

-- Existing rows: resolve their campus from the slug the form already stored.
UPDATE public.volunteer_applications va
   SET campus_id = c.id
  FROM public.campuses c
 WHERE va.campus_id IS NULL
   AND va.campus_slug IS NOT NULL
   AND c.slug = va.campus_slug;

CREATE INDEX IF NOT EXISTS idx_applications_campus_status
  ON public.volunteer_applications (campus_id, status, created_at DESC);

-- ─── routing + "request reaches both leads" ──────────────────────────────────
-- BEFORE INSERT: derive campus_id from the slug and ignore anything the client
-- supplied for it (anon can insert, so the column cannot be trusted).
CREATE OR REPLACE FUNCTION public.route_volunteer_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.campus_id := NULL;
  IF NEW.campus_slug IS NOT NULL THEN
    SELECT id INTO NEW.campus_id FROM public.campuses WHERE slug = NEW.campus_slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_route_volunteer_application ON public.volunteer_applications;
CREATE TRIGGER trg_route_volunteer_application
  BEFORE INSERT ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.route_volunteer_application();

-- AFTER INSERT: tell the campus's Campus Lead and Volunteer Lead.
CREATE OR REPLACE FUNCTION public.notify_leads_of_volunteer_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rec record;
BEGIN
  IF NEW.campus_id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR rec IN
    SELECT id, role FROM public.users
     WHERE campus_id = NEW.campus_id
       AND role IN ('campus_lead', 'volunteer_lead')
       AND is_active
  LOOP
    PERFORM public.notify_user(
      rec.id,
      'volunteer_application_new',
      'New volunteer application',
      NEW.full_name || ' applied to volunteer on your campus.'
        || CASE WHEN rec.role = 'volunteer_lead' THEN ' Pick it up to start the interview process.' ELSE '' END,
      '/dashboard/volunteer-applications',
      'volunteer_application',
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_leads_of_volunteer_application ON public.volunteer_applications;
CREATE TRIGGER trg_notify_leads_of_volunteer_application
  AFTER INSERT ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_leads_of_volunteer_application();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
-- Insert: the public form may only create a fresh, untouched application. The
-- old policy was `with check (true)`, which let an anonymous caller insert a row
-- that is already 'invited' — and with the pipeline columns that matters more.
DROP POLICY IF EXISTS applications_insert ON public.volunteer_applications;
CREATE POLICY applications_insert ON public.volunteer_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND claimed_by IS NULL
    AND claimed_at IS NULL
    AND reviewed_by IS NULL
    AND interview_at IS NULL
    AND interview_invite_sent_at IS NULL
    AND interview_result IS NULL
    AND decided_at IS NULL
  );

DROP POLICY IF EXISTS applications_read ON public.volunteer_applications;
CREATE POLICY applications_read ON public.volunteer_applications
  FOR SELECT TO authenticated
  USING (
    (select is_admin())
    OR (
      (select auth_role()) IN ('campus_lead', 'volunteer_lead')
      AND campus_id IS NOT NULL
      AND campus_id = (select auth_campus())
    )
  );

-- Direct writes: super_admin only. Leads go through the RPCs below.
DROP POLICY IF EXISTS applications_manage ON public.volunteer_applications;
CREATE POLICY applications_manage ON public.volunteer_applications
  FOR UPDATE TO authenticated
  USING ((select is_admin()))
  WITH CHECK ((select is_admin()));

-- ─── RPCs (Volunteer Lead only) ──────────────────────────────────────────────

-- Step 5 — pick it up. The WHERE clause is the lock: of two leads clicking at
-- once, the second one's UPDATE re-checks `claimed_by IS NULL`, matches nothing,
-- and gets the "already picked up" error.
CREATE OR REPLACE FUNCTION public.claim_volunteer_application(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor        uuid := auth.uid();
  actor_campus uuid;
  v_name       text;
BEGIN
  IF actor IS NULL OR public.auth_role() IS DISTINCT FROM 'volunteer_lead' THEN
    RAISE EXCEPTION 'Only a Volunteer Lead can pick up a volunteer application' USING errcode = '42501';
  END IF;
  actor_campus := public.auth_campus();
  IF actor_campus IS NULL THEN
    RAISE EXCEPTION 'Your account is not linked to a campus' USING errcode = '42501';
  END IF;

  UPDATE public.volunteer_applications
     SET status      = 'reviewing',
         claimed_by  = actor,
         claimed_at  = now(),
         reviewed_by = actor
   WHERE id = p_id
     AND status = 'new'
     AND claimed_by IS NULL
     AND campus_id = actor_campus
  RETURNING full_name INTO v_name;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This application was already picked up, or it is not on your campus' USING errcode = '55000';
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'volunteer_application_claim', 'volunteer_application', p_id,
          jsonb_build_object('full_name', v_name));
END;
$$;

-- Step 6 — schedule (or reschedule) the interview. The invite email is sent by
-- the app afterwards; until then interview_invite_sent_at stays NULL.
CREATE OR REPLACE FUNCTION public.schedule_volunteer_interview(
  p_id          uuid,
  p_interview_at timestamptz,
  p_interviewer text,
  p_mode        text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF actor IS NULL OR public.auth_role() IS DISTINCT FROM 'volunteer_lead' THEN
    RAISE EXCEPTION 'Only a Volunteer Lead can schedule an interview' USING errcode = '42501';
  END IF;
  IF p_interview_at IS NULL THEN
    RAISE EXCEPTION 'Choose the interview date and time' USING errcode = '23514';
  END IF;
  IF coalesce(btrim(p_interviewer), '') = '' THEN
    RAISE EXCEPTION 'Enter the success coach who will take the interview' USING errcode = '23514';
  END IF;
  IF coalesce(btrim(p_mode), '') = '' THEN
    RAISE EXCEPTION 'Enter where the interview takes place (a meeting link or a place)' USING errcode = '23514';
  END IF;

  UPDATE public.volunteer_applications
     SET interview_at              = p_interview_at,
         interviewer_name          = btrim(p_interviewer),
         interview_mode            = btrim(p_mode),
         interview_invite_sent_at  = NULL,
         interview_result          = NULL,
         interview_notes           = NULL
   WHERE id = p_id
     AND status = 'reviewing'
     AND claimed_by = actor;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You can only schedule interviews for applications you picked up' USING errcode = '42501';
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'volunteer_interview_schedule', 'volunteer_application', p_id,
          jsonb_build_object('interview_at', p_interview_at, 'interviewer', btrim(p_interviewer)));
END;
$$;

-- Called by the app once the invite email was accepted by the mail server.
CREATE OR REPLACE FUNCTION public.mark_volunteer_invite_sent(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF actor IS NULL OR public.auth_role() IS DISTINCT FROM 'volunteer_lead' THEN
    RAISE EXCEPTION 'Only a Volunteer Lead can do this' USING errcode = '42501';
  END IF;

  UPDATE public.volunteer_applications
     SET interview_invite_sent_at = now()
   WHERE id = p_id
     AND status = 'reviewing'
     AND claimed_by = actor
     AND interview_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No scheduled interview found for this application' USING errcode = '42501';
  END IF;
END;
$$;

-- Step 7 — the success coach's verdict, entered on the website.
CREATE OR REPLACE FUNCTION public.record_volunteer_interview_result(
  p_id     uuid,
  p_result text,
  p_notes  text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF actor IS NULL OR public.auth_role() IS DISTINCT FROM 'volunteer_lead' THEN
    RAISE EXCEPTION 'Only a Volunteer Lead can record an interview result' USING errcode = '42501';
  END IF;
  IF p_result IS NULL OR p_result NOT IN ('selected', 'rejected') THEN
    RAISE EXCEPTION 'Result must be selected or rejected' USING errcode = '22023';
  END IF;

  UPDATE public.volunteer_applications
     SET interview_result = p_result,
         interview_notes  = nullif(btrim(coalesce(p_notes, '')), '')
   WHERE id = p_id
     AND status = 'reviewing'
     AND claimed_by = actor
     AND interview_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Schedule the interview before recording its result' USING errcode = '42501';
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'volunteer_interview_result', 'volunteer_application', p_id,
          jsonb_build_object('result', p_result));
END;
$$;

-- Step 8 — close the application after the Selected/Rejected email went out.
CREATE OR REPLACE FUNCTION public.finalize_volunteer_application(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor    uuid := auth.uid();
  v_result text;
BEGIN
  IF actor IS NULL OR public.auth_role() IS DISTINCT FROM 'volunteer_lead' THEN
    RAISE EXCEPTION 'Only a Volunteer Lead can finalize an application' USING errcode = '42501';
  END IF;

  UPDATE public.volunteer_applications
     SET status      = CASE interview_result WHEN 'selected' THEN 'invited'::application_status
                                              ELSE 'rejected'::application_status END,
         decided_at  = now(),
         reviewed_by = actor
   WHERE id = p_id
     AND status = 'reviewing'
     AND claimed_by = actor
     AND interview_result IS NOT NULL
  RETURNING interview_result INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Record the interview result before sending the decision email' USING errcode = '42501';
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, CASE v_result WHEN 'selected' THEN 'invite' ELSE 'reject' END,
          'volunteer_application', p_id, jsonb_build_object('result', v_result));
END;
$$;

REVOKE ALL ON FUNCTION public.claim_volunteer_application(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.schedule_volunteer_interview(uuid, timestamptz, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_volunteer_invite_sent(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_volunteer_interview_result(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_volunteer_application(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_volunteer_application(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_volunteer_interview(uuid, timestamptz, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_volunteer_invite_sent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_volunteer_interview_result(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_volunteer_application(uuid) TO authenticated;

COMMIT;
