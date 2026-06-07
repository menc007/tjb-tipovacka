-- ============================================================
-- TJB TIPOVAČKA – DATABÁZOVÉ SCHÉMA
-- Verze: 1.0 | MS 2026
-- ============================================================

-- Rozšíření pro UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABULKA: groups
-- ============================================================
CREATE TABLE IF NOT EXISTS public.groups (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(10) UNIQUE NOT NULL,
  stage VARCHAR(20) NOT NULL DEFAULT 'group'
);

INSERT INTO public.groups (name) VALUES
  ('A'),('B'),('C'),('D'),('E'),('F'),
  ('G'),('H'),('I'),('J'),('K'),('L')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABULKA: profiles (rozšiřuje auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      VARCHAR(50) UNIQUE NOT NULL,
  display_name  VARCHAR(100),
  avatar_url    TEXT,
  role          VARCHAR(20) NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
  total_points  INTEGER NOT NULL DEFAULT 0,
  exact_hits    INTEGER NOT NULL DEFAULT 0,
  winner_hits   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_points
  ON public.profiles(total_points DESC);

-- ============================================================
-- TABULKA: matches
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_number   INTEGER UNIQUE NOT NULL,
  stage          VARCHAR(30) NOT NULL
                 CHECK (stage IN (
                   'group','round_of_32','round_of_16',
                   'quarter_final','semi_final','third_place','final'
                 )),
  group_id       INTEGER REFERENCES public.groups(id),
  home_team      VARCHAR(60),
  away_team      VARCHAR(60),
  home_team_flag VARCHAR(10),
  away_team_flag VARCHAR(10),
  home_flag_url  TEXT,
  away_flag_url  TEXT,
  venue          VARCHAR(100),
  city           VARCHAR(60),
  country        VARCHAR(10) CHECK (country IN ('USA','Canada','Mexico')),
  kickoff_time   TIMESTAMPTZ NOT NULL,
  lock_time      TIMESTAMPTZ
                 GENERATED ALWAYS AS
                   (kickoff_time - INTERVAL '60 minutes') STORED,
  home_score     INTEGER,
  away_score     INTEGER,
  status         VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                 CHECK (status IN (
                   'upcoming','locked','live','finished','postponed'
                 )),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  result_set_by  UUID REFERENCES public.profiles(id),
  result_set_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON public.matches(kickoff_time);
CREATE INDEX IF NOT EXISTS idx_matches_status  ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_stage   ON public.matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_group   ON public.matches(group_id);

-- ============================================================
-- TABULKA: predictions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.predictions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id       UUID NOT NULL REFERENCES public.matches(id)  ON DELETE CASCADE,
  predicted_home INTEGER NOT NULL CHECK (predicted_home >= 0),
  predicted_away INTEGER NOT NULL CHECK (predicted_away >= 0),
  points         INTEGER CHECK (points IN (0, 5, 10)),
  evaluated_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_user  ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON public.predictions(match_id);

-- ============================================================
-- TABULKA: time_offset_config (testovací režim)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.time_offset_config (
  id          INTEGER PRIMARY KEY DEFAULT 1,
  offset_ms   BIGINT  NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  set_by      UUID REFERENCES public.profiles(id),
  set_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.time_offset_config (id, offset_ms, is_active)
VALUES (1, 0, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_offset_config ENABLE ROW LEVEL SECURITY;

-- Profiles: číst mohou všichni, měnit jen vlastní
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  );

-- Matches: číst mohou všichni, zapisovat jen admin
DROP POLICY IF EXISTS "matches_select" ON public.matches;
CREATE POLICY "matches_select" ON public.matches
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "matches_admin_write" ON public.matches;
CREATE POLICY "matches_admin_write" ON public.matches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  );

-- Predictions: TAKTICKÉ SKRÝVÁNÍ
DROP POLICY IF EXISTS "predictions_select" ON public.predictions;
CREATE POLICY "predictions_select" ON public.predictions
  FOR SELECT USING (
    -- Vlastní tipy vždy viditelné
    user_id = auth.uid()
    OR
    -- Cizí tipy viditelné až po uzamčení
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
      AND (
        m.status IN ('locked','live','finished')
        OR NOW() >= m.lock_time
      )
    )
  );

DROP POLICY IF EXISTS "predictions_insert" ON public.predictions;
CREATE POLICY "predictions_insert" ON public.predictions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
      AND NOW() < m.lock_time
      AND m.status = 'upcoming'
    )
  );

DROP POLICY IF EXISTS "predictions_update" ON public.predictions;
CREATE POLICY "predictions_update" ON public.predictions
  FOR UPDATE USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
      AND NOW() < m.lock_time
      AND m.status = 'upcoming'
    )
  );

-- Time offset: číst mohou všichni, měnit jen admin
DROP POLICY IF EXISTS "time_offset_select" ON public.time_offset_config;
CREATE POLICY "time_offset_select" ON public.time_offset_config
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "time_offset_admin" ON public.time_offset_config;
CREATE POLICY "time_offset_admin" ON public.time_offset_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- FUNKCE A TRIGGERY
-- ============================================================

-- Automatická aktualizace updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_matches_updated ON public.matches;
CREATE TRIGGER trigger_matches_updated
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_predictions_updated ON public.predictions;
CREATE TRIGGER trigger_predictions_updated
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_profiles_updated ON public.profiles;
CREATE TRIGGER trigger_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Automatické vyhodnocení tipů po zadání výsledku
CREATE OR REPLACE FUNCTION evaluate_predictions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'finished'
     AND NEW.home_score IS NOT NULL
     AND NEW.away_score IS NOT NULL
     AND (OLD.status != 'finished'
          OR OLD.home_score IS DISTINCT FROM NEW.home_score
          OR OLD.away_score IS DISTINCT FROM NEW.away_score)
  THEN
    -- Výpočet bodů
    UPDATE public.predictions
    SET
      points = CASE
        WHEN predicted_home = NEW.home_score
             AND predicted_away = NEW.away_score
        THEN 10
        WHEN (
          (predicted_home > predicted_away AND NEW.home_score > NEW.away_score)
          OR (predicted_away > predicted_home AND NEW.away_score > NEW.home_score)
          OR (predicted_home = predicted_away AND NEW.home_score = NEW.away_score)
        ) THEN 5
        ELSE 0
      END,
      evaluated_at = NOW()
    WHERE match_id = NEW.id;

    -- Aktualizace statistik hráčů
    UPDATE public.profiles p
    SET
      total_points = (
        SELECT COALESCE(SUM(pr.points), 0)
        FROM public.predictions pr
        WHERE pr.user_id = p.id AND pr.points IS NOT NULL
      ),
      exact_hits = (
        SELECT COUNT(*) FROM public.predictions pr
        WHERE pr.user_id = p.id AND pr.points = 10
      ),
      winner_hits = (
        SELECT COUNT(*) FROM public.predictions pr
        WHERE pr.user_id = p.id AND pr.points = 5
      ),
      updated_at = NOW()
    WHERE EXISTS (
      SELECT 1 FROM public.predictions pr
      WHERE pr.user_id = p.id AND pr.match_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_evaluate ON public.matches;
CREATE TRIGGER trigger_evaluate
  AFTER UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION evaluate_predictions();

-- Funkce pro automatické zamykání (volejte jako scheduled job)
CREATE OR REPLACE FUNCTION auto_lock_matches()
RETURNS INTEGER AS $$
DECLARE
  locked_count INTEGER;
BEGIN
  UPDATE public.matches
  SET status = 'locked'
  WHERE status = 'upcoming'
    AND lock_time <= NOW();
  GET DIAGNOSTICS locked_count = ROW_COUNT;
  RETURN locked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Automatický profil při registraci (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();