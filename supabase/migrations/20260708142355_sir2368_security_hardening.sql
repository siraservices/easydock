-- SIR-2368: EasyDock Supabase hardening (WARN-level advisor findings)
-- Child of SIR-2364. Applied to project ompeoptbtfszxedbamxz.
-- All changes verified against src usage before applying (no client read paths broken).

-- (1) Pin search_path on trigger functions [lint 0011].
--     handle_new_user already references public.profiles fully-qualified;
--     update_updated_at references no schema objects. Both safe with ''.
ALTER FUNCTION public.update_updated_at() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- (2) Trigger functions must not be directly callable via /rest/v1/rpc
--     [lints 0028/0029]. Triggers fire as the table owner regardless of
--     these EXECUTE grants, so revoking them does not affect the triggers.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon, authenticated, public;

-- (3) Internal lead tables: no client read path (all reads via service-role
--     admin client). Remove GraphQL/PostgREST discoverability [lints 0026/0027].
REVOKE SELECT ON public.calculator_leads FROM anon, authenticated;
REVOKE SELECT ON public.marina_leads     FROM anon, authenticated;
REVOKE SELECT ON public.marina_prospects FROM anon, authenticated;

-- (4) Auth-only tables: anon never reads these (RLS is row-scoped to
--     auth.uid()). Keep authenticated SELECT so the app can query its own
--     rows via PostgREST; drop anon exposure [lint 0026].
REVOKE SELECT ON public.bookings FROM anon;
REVOKE SELECT ON public.profiles FROM anon;

-- (5) waitlist_signups: landing-page counters read only the `region` column.
--     Restrict to column-level SELECT so emails/PII are no longer exposed to
--     anon/authenticated, while keeping the counter feature working.
REVOKE SELECT ON public.waitlist_signups FROM anon, authenticated;
GRANT  SELECT (region) ON public.waitlist_signups TO anon, authenticated;

-- (6) marina-photos storage: remove broad public listing policy [lint 0025].
--     Public object URLs (getPublicUrl) are served without a SELECT policy on
--     a public bucket, so downloads are unaffected. Scope listing to owners.
DROP POLICY IF EXISTS "Public read access for marina photos" ON storage.objects;
CREATE POLICY "Owners can list own marina photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'marina-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
