CREATE TABLE public.user_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tag text NOT NULL,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tag)
);

GRANT SELECT ON public.user_tags TO authenticated;
GRANT ALL ON public.user_tags TO service_role;

ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags readable by authenticated" ON public.user_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins manage tags" ON public.user_tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_user_tags_user ON public.user_tags(user_id);

-- Admin: set another user's plan
CREATE OR REPLACE FUNCTION public.admin_set_user_plan(_user_id uuid, _plan text, _billing text DEFAULT 'monthly')
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.user_subscriptions;
  _expires timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _plan NOT IN ('free','lite','pro','lifetime') THEN
    RAISE EXCEPTION 'Invalid plan';
  END IF;

  IF _plan IN ('free','lifetime') THEN
    _expires := NULL;
  ELSIF _billing = 'yearly' THEN
    _expires := now() + interval '1 year';
  ELSE
    _expires := now() + interval '1 month';
  END IF;

  INSERT INTO public.user_subscriptions (user_id, plan, status, is_lifetime, started_at, expires_at, updated_at)
  VALUES (_user_id, _plan, 'active', _plan = 'lifetime', now(), _expires, now())
  ON CONFLICT (user_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        status = 'active',
        is_lifetime = EXCLUDED.is_lifetime,
        expires_at = EXCLUDED.expires_at,
        updated_at = now()
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_user_plan(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_plan(uuid, text, text) TO authenticated;

-- Admin: add tag
CREATE OR REPLACE FUNCTION public.admin_add_user_tag(_user_id uuid, _tag text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _tag IS NULL OR length(btrim(_tag)) = 0 OR length(btrim(_tag)) > 24 THEN
    RAISE EXCEPTION 'Invalid tag';
  END IF;
  INSERT INTO public.user_tags (user_id, tag, granted_by)
  VALUES (_user_id, btrim(_tag), auth.uid())
  ON CONFLICT (user_id, tag) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_add_user_tag(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_add_user_tag(uuid, text) TO authenticated;

-- Admin: remove tag
CREATE OR REPLACE FUNCTION public.admin_remove_user_tag(_user_id uuid, _tag text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM public.user_tags WHERE user_id = _user_id AND tag = _tag;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_remove_user_tag(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_remove_user_tag(uuid, text) TO authenticated;

-- Overview now includes tags
DROP FUNCTION IF EXISTS public.get_admin_users_overview();

CREATE FUNCTION public.get_admin_users_overview()
RETURNS TABLE(
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  plan text,
  plan_status text,
  is_lifetime boolean,
  plan_started_at timestamptz,
  plan_expires_at timestamptz,
  tags text[],
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  total_items bigint,
  active_items bigint,
  consumed_items bigint,
  tossed_items bigint,
  total_saved_kg numeric,
  total_wasted_kg numeric,
  last_activity timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text,
    p.display_name,
    p.avatar_url,
    COALESCE(s.plan, 'free') AS plan,
    COALESCE(s.status, 'active') AS plan_status,
    COALESCE(s.is_lifetime, false) AS is_lifetime,
    s.started_at AS plan_started_at,
    s.expires_at AS plan_expires_at,
    COALESCE((SELECT array_agg(t.tag ORDER BY t.created_at) FROM public.user_tags t WHERE t.user_id = u.id), '{}'::text[]) AS tags,
    u.created_at AS joined_at,
    u.last_sign_in_at,
    COUNT(p2.id) AS total_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'active') AS active_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'consumed') AS consumed_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'tossed') AS tossed_items,
    COALESCE(SUM(p2.weight_kg) FILTER (WHERE p2.status = 'consumed'), 0) AS total_saved_kg,
    COALESCE(SUM(p2.weight_kg) FILTER (WHERE p2.status = 'tossed'), 0) AS total_wasted_kg,
    MAX(p2.created_at) AS last_activity
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
  LEFT JOIN public.pantry_items p2 ON p2.user_id = u.id
  GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, p.display_name, p.avatar_url, s.plan, s.status, s.is_lifetime, s.started_at, s.expires_at;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_admin_users_overview() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_users_overview() FROM PUBLIC, anon;