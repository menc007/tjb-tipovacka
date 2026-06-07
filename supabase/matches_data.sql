-- ============================================================
-- MS 2026 – VZOROVÁ DATA ZÁPASŮ
-- Skupiny A a B + šablona pro ostatní
-- Doplň dle oficálního rozpisu FIFA po zveřejnění
-- ============================================================

-- Legenda vlajek (emoji):
-- 🇺🇸 USA | 🇲🇽 Mexiko | 🇨🇦 Kanada | 🇧🇷 Brazílie | 🇦🇷 Argentina
-- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Anglie | 🇫🇷 Francie | 🇩🇪 Německo | 🇪🇸 Španělsko
-- 🇵🇹 Portugalsko | 🇮🇹 Itálie | 🇳🇱 Nizozemsko

-- ============================================================
-- SKUPINA A (vzorová)
-- ============================================================
INSERT INTO public.matches
  (match_number, stage, group_id, home_team, away_team,
   home_team_flag, away_team_flag, venue, city, country, kickoff_time, status)
VALUES
  (1,  'group', 1, 'Mexiko',    'Ekvádor',       '🇲🇽','🇪🇨',
   'Estadio Azteca',       'Mexico City', 'Mexico',
   '2026-06-11 21:00:00+00', 'upcoming'),

  (2,  'group', 1, 'USA',       'Irsko',          '🇺🇸','🇮🇪',
   'SoFi Stadium',          'Los Angeles', 'USA',
   '2026-06-12 00:00:00+00', 'upcoming'),

  (3,  'group', 1, 'Ekvádor',   'Irsko',          '🇪🇨','🇮🇪',
   'MetLife Stadium',       'New York',    'USA',
   '2026-06-16 20:00:00+00', 'upcoming'),

  (4,  'group', 1, 'USA',       'Mexiko',         '🇺🇸','🇲🇽',
   'AT&T Stadium',          'Dallas',      'USA',
   '2026-06-16 23:00:00+00', 'upcoming'),

  (5,  'group', 1, 'Ekvádor',   'USA',            '🇪🇨','🇺🇸',
   'Levi''s Stadium',       'San Francisco','USA',
   '2026-06-20 22:00:00+00', 'upcoming'),

  (6,  'group', 1, 'Irsko',     'Mexiko',         '🇮🇪','🇲🇽',
   'BC Place',              'Vancouver',   'Canada',
   '2026-06-20 22:00:00+00', 'upcoming'),

-- ============================================================
-- SKUPINA B (vzorová)
-- ============================================================
  (7,  'group', 2, 'Argentina', 'Nigérie',        '🇦🇷','🇳🇬',
   'MetLife Stadium',       'New York',    'USA',
   '2026-06-12 20:00:00+00', 'upcoming'),

  (8,  'group', 2, 'Japonsko',  'Chorvatsko',     '🇯🇵','🇭🇷',
   'Rose Bowl',             'Los Angeles', 'USA',
   '2026-06-12 23:00:00+00', 'upcoming'),

  (9,  'group', 2, 'Argentina', 'Japonsko',       '🇦🇷','🇯🇵',
   'Hard Rock Stadium',     'Miami',       'USA',
   '2026-06-17 00:00:00+00', 'upcoming'),

  (10, 'group', 2, 'Nigérie',   'Chorvatsko',     '🇳🇬','🇭🇷',
   'Gillette Stadium',      'Boston',      'USA',
   '2026-06-17 20:00:00+00', 'upcoming'),

  (11, 'group', 2, 'Chorvatsko','Argentina',      '🇭🇷','🇦🇷',
   'Cowboys Stadium',       'Dallas',      'USA',
   '2026-06-21 22:00:00+00', 'upcoming'),

  (12, 'group', 2, 'Nigérie',   'Japonsko',       '🇳🇬','🇯🇵',
   'BMO Field',             'Toronto',     'Canada',
   '2026-06-21 22:00:00+00', 'upcoming'),

-- ============================================================
-- SKUPINA C (šablona – doplň týmy)
-- ============================================================
  (13, 'group', 3, 'Brazílie',  'Srbsko',         '🇧🇷','🇷🇸',
   'Lincoln Financial',     'Philadelphia','USA',
   '2026-06-13 20:00:00+00', 'upcoming'),

  (14, 'group', 3, 'Švýcarsko', 'Kamerun',        '🇨🇭','🇨🇲',
   'NRG Stadium',           'Houston',     'USA',
   '2026-06-13 23:00:00+00', 'upcoming'),

  (15, 'group', 3, 'Brazílie',  'Švýcarsko',      '🇧🇷','🇨🇭',
   'SoFi Stadium',          'Los Angeles', 'USA',
   '2026-06-18 20:00:00+00', 'upcoming'),

  (16, 'group', 3, 'Srbsko',    'Kamerun',        '🇷🇸','🇨🇲',
   'Lumen Field',           'Seattle',     'USA',
   '2026-06-18 23:00:00+00', 'upcoming'),

  (17, 'group', 3, 'Kamerun',   'Brazílie',       '🇨🇲','🇧🇷',
   'BMO Field',             'Toronto',     'Canada',
   '2026-06-22 22:00:00+00', 'upcoming'),

  (18, 'group', 3, 'Srbsko',    'Švýcarsko',      '🇷🇸','🇨🇭',
   'Estadio AKRON',         'Guadalajara', 'Mexico',
   '2026-06-22 22:00:00+00', 'upcoming');

-- ============================================================
-- SKUPINY D–L: Zkopíruj strukturu výše a doplň
--   match_number: 19–72 (skupinová fáze = 72 zápasů)
--   group_id:     4–12 (skupiny D–L)
-- ============================================================
-- Příklad skupiny D:
-- INSERT INTO public.matches (match_number, stage, group_id, ...) VALUES
-- (19, 'group', 4, 'Francie', 'Austrálie', '🇫🇷','🇦🇺', ...),
-- ...

-- ============================================================
-- PLAY-OFF (šablona – týmy budou doplněny po skupinách)
-- Výsledky losování určí, kdo hraje s kým.
-- ============================================================

-- Osmnáctifinále (32 → 16): zápasy 73–88
INSERT INTO public.matches
  (match_number, stage, group_id, home_team, away_team,
   home_team_flag, away_team_flag, venue, city, country,
   kickoff_time, status)
VALUES
  (73, 'round_of_32', NULL, '1. skupina A', '2. skupina B', '🏴','🏴',
   'MetLife Stadium', 'New York', 'USA',
   '2026-06-29 20:00:00+00', 'upcoming'),

  (74, 'round_of_32', NULL, '1. skupina C', '2. skupina D', '🏴','🏴',
   'SoFi Stadium', 'Los Angeles', 'USA',
   '2026-06-29 23:00:00+00', 'upcoming'),

  (75, 'round_of_32', NULL, '1. skupina E', '2. skupina F', '🏴','🏴',
   'AT&T Stadium', 'Dallas', 'USA',
   '2026-06-30 20:00:00+00', 'upcoming'),

  (76, 'round_of_32', NULL, '1. skupina G', '2. skupina H', '🏴','🏴',
   'Hard Rock Stadium', 'Miami', 'USA',
   '2026-06-30 23:00:00+00', 'upcoming'),

  (77, 'round_of_32', NULL, '1. skupina I', '2. skupina J', '🏴','🏴',
   'Lumen Field', 'Seattle', 'USA',
   '2026-07-01 20:00:00+00', 'upcoming'),

  (78, 'round_of_32', NULL, '1. skupina K', '2. skupina L', '🏴','🏴',
   'BC Place', 'Vancouver', 'Canada',
   '2026-07-01 23:00:00+00', 'upcoming'),

  (79, 'round_of_32', NULL, '1. skupina B', '2. skupina A', '🏴','🏴',
   'Estadio Azteca', 'Mexico City', 'Mexico',
   '2026-07-02 20:00:00+00', 'upcoming'),

  (80, 'round_of_32', NULL, '1. skupina D', '2. skupina C', '🏴','🏴',
   'NRG Stadium', 'Houston', 'USA',
   '2026-07-02 23:00:00+00', 'upcoming'),

  (81, 'round_of_32', NULL, '1. skupina F', '2. skupina E', '🏴','🏴',
   'Rose Bowl', 'Los Angeles', 'USA',
   '2026-07-03 20:00:00+00', 'upcoming'),

  (82, 'round_of_32', NULL, '1. skupina H', '2. skupina G', '🏴','🏴',
   'Gillette Stadium', 'Boston', 'USA',
   '2026-07-03 23:00:00+00', 'upcoming'),

  (83, 'round_of_32', NULL, 'TBD', 'TBD', '🏴','🏴',
   'Lincoln Financial', 'Philadelphia', 'USA',
   '2026-07-04 20:00:00+00', 'upcoming'),

  (84, 'round_of_32', NULL, 'TBD', 'TBD', '🏴','🏴',
   'BMO Field', 'Toronto', 'Canada',
   '2026-07-04 23:00:00+00', 'upcoming'),

  (85, 'round_of_32', NULL, 'TBD', 'TBD', '🏴','🏴',
   'Estadio AKRON', 'Guadalajara', 'Mexico',
   '2026-07-05 20:00:00+00', 'upcoming'),

  (86, 'round_of_32', NULL, 'TBD', 'TBD', '🏴','🏴',
   'Levi''s Stadium', 'San Francisco', 'USA',
   '2026-07-05 23:00:00+00', 'upcoming'),

  (87, 'round_of_32', NULL, 'TBD', 'TBD', '🏴','🏴',
   'Arrowhead Stadium', 'Kansas City', 'USA',
   '2026-07-06 20:00:00+00', 'upcoming'),

  (88, 'round_of_32', NULL, 'TBD', 'TBD', '🏴','🏴',
   'SoFi Stadium', 'Los Angeles', 'USA',
   '2026-07-06 23:00:00+00', 'upcoming'),

-- Osmifinále (16 → 8): zápasy 89–96
  (89,  'round_of_16', NULL, 'TBD','TBD','🏴','🏴',
   'MetLife Stadium','New York','USA','2026-07-10 20:00:00+00','upcoming'),
  (90,  'round_of_16', NULL, 'TBD','TBD','🏴','🏴',
   'AT&T Stadium','Dallas','USA','2026-07-10 23:00:00+00','upcoming'),
  (91,  'round_of_16', NULL, 'TBD','TBD','🏴','🏴',
   'SoFi Stadium','Los Angeles','USA','2026-07-11 20:00:00+00','upcoming'),
  (92,  'round_of_16', NULL, 'TBD','TBD','🏴','🏴',
   'Hard Rock Stadium','Miami','USA','2026-07-11 23:00:00+00','upcoming'),
  (93,  'round_of_16', NULL, 'TBD','TBD','🏴','🏴',
   'NRG Stadium','Houston','USA','2026-07-12 20:00:00+00','upcoming'),
  (94,  'round_of_16', NULL, 'TBD','TBD','🏴','🏴',
   'BC Place','Vancouver','Canada','2026-07-12 23:00:00+00','upcoming'),
  (95,  'round_of_16', NULL, 'TBD','TBD','🏴','🏴',
   'Estadio Azteca','Mexico City','Mexico','2026-07-13 20:00:00+00','upcoming'),
  (96,  'round_of_16', NULL, 'TBD','TBD','🏴','🏴',
   'Lumen Field','Seattle','USA','2026-07-13 23:00:00+00','upcoming'),

-- Čtvrtfinále (8 → 4): zápasy 97–100
  (97,  'quarter_final', NULL, 'TBD','TBD','🏴','🏴',
   'MetLife Stadium','New York','USA','2026-07-17 20:00:00+00','upcoming'),
  (98,  'quarter_final', NULL, 'TBD','TBD','🏴','🏴',
   'SoFi Stadium','Los Angeles','USA','2026-07-17 23:00:00+00','upcoming'),
  (99,  'quarter_final', NULL, 'TBD','TBD','🏴','🏴',
   'AT&T Stadium','Dallas','USA','2026-07-18 20:00:00+00','upcoming'),
  (100, 'quarter_final', NULL, 'TBD','TBD','🏴','🏴',
   'Hard Rock Stadium','Miami','USA','2026-07-18 23:00:00+00','upcoming'),

-- Semifinále (4 → 2): zápasy 101–102
  (101, 'semi_final', NULL, 'TBD','TBD','🏴','🏴',
   'MetLife Stadium','New York','USA','2026-07-22 20:00:00+00','upcoming'),
  (102, 'semi_final', NULL, 'TBD','TBD','🏴','🏴',
   'Rose Bowl','Los Angeles','USA','2026-07-22 23:00:00+00','upcoming'),

-- O 3. místo: zápas 103
  (103, 'third_place', NULL, 'TBD','TBD','🏴','🏴',
   'Hard Rock Stadium','Miami','USA','2026-07-25 20:00:00+00','upcoming'),

-- FINÁLE: zápas 104
  (104, 'final', NULL, 'TBD','TBD','🏴','🏴',
   'MetLife Stadium','New York','USA','2026-07-26 20:00:00+00','upcoming');