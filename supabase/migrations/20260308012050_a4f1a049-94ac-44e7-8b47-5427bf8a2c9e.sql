
CREATE TABLE public.pantry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL DEFAULT 0.2,
  shelf_life_days INTEGER NOT NULL DEFAULT 7,
  co2_impact TEXT NOT NULL DEFAULT 'low' CHECK (co2_impact IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'tossed')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items" ON public.pantry_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON public.pantry_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON public.pantry_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON public.pantry_items
  FOR DELETE USING (auth.uid() = user_id);
