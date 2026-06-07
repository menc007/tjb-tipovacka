export type Stage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'

export type MatchStatus =
  | 'upcoming'
  | 'locked'
  | 'live'
  | 'finished'
  | 'postponed'

export type UserRole = 'user' | 'admin'

export interface Profile {
  id:           string
  username:     string
  display_name: string | null
  avatar_url:   string | null
  role:         UserRole
  total_points: number
  exact_hits:   number
  winner_hits:  number
  created_at:   string
  updated_at:   string
}

export interface Match {
  id:             string
  match_number:   number
  stage:          Stage
  group_id:       number | null
  home_team:      string | null
  away_team:      string | null
  home_team_flag: string | null
  away_team_flag: string | null
  home_flag_url:  string | null
  away_flag_url:  string | null
  venue:          string | null
  city:           string | null
  country:        'USA' | 'Canada' | 'Mexico' | null
  kickoff_time:   string
  lock_time:      string
  home_score:     number | null
  away_score:     number | null
  status:         MatchStatus
  result_set_by:  string | null
  result_set_at:  string | null
}

export interface Prediction {
  id:             string
  user_id:        string
  match_id:       string
  predicted_home: number
  predicted_away: number
  points:         number | null
  evaluated_at:   string | null
  created_at:     string
  updated_at:     string
}

export interface LeaderboardEntry extends Profile {
  rank: number
}

export interface TimeOffsetConfig {
  id:          number
  offset_ms:   number
  is_active:   boolean
  description: string | null
}