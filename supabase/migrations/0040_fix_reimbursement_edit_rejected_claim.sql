-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0040 Fix editing a rejected reimbursement claim
--
-- reimb_update's USING clause lets the claimant target a 'draft' or
-- 'rejected' row, but WITH CHECK only allowed the resulting row's status to
-- be 'draft'/'submitted'. updateClaim() (actions/finance.ts) never touches
-- status, so saving an edit to a claim that's currently 'rejected' leaves it
-- 'rejected' — which WITH CHECK then rejects, 100% of the time. The UI
-- (components/finance/claim-actions.tsx: "Edit draft" + a separate "Submit
-- for review" button, both shown while status is 'draft' or 'rejected')
-- confirms editing a rejected claim is meant to leave it at 'rejected' until
-- the claimant explicitly resubmits — so WITH CHECK must allow 'rejected' as
-- a resulting status, not just as a USING (targetable) one.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy reimb_update on reimbursements;
create policy reimb_update on reimbursements for update to authenticated
  using ( is_admin() or (claimant_id = auth.uid() and status in ('draft','rejected')) )
  with check ( is_admin() or (claimant_id = auth.uid() and status in ('draft','submitted','rejected')) );
