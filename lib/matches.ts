import { createClient } from './supabase'
import { getAppTime } from './time'

/**
 * Uloží nebo aktualizuje tip uživatele
 */
export async function upsertPrediction(
  userId:    string,
  matchId:   string,
  homeScore: number,
  awayScore: number
) {
  const supabase = createClient()
  const appTime  = await getAppTime()

  // Ověření: zápas musí být dostupný
  const { data: match } = await supabase
    .from('matches')
    .select('lock_time, status')
    .eq('id', matchId)
    .single()

  if (!match) {
    throw new Error('Zápas nenalezen')
  }

  if (appTime >= new Date(match.lock_time)) {
    throw new Error('Tipování pro tento zápas je již uzamčeno')
  }

  if (match.status !== 'upcoming') {
    throw new Error('Tento zápas není dostupný pro tipování')
  }

  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id:        userId,
        match_id:       matchId,
        predicted_home: homeScore,
        predicted_away: awayScore,
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'user_id,match_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Admin: zadá výsledek zápasu (spustí automatické bodování)
 */
export async function setMatchResult(
  adminId:   string,
  matchId:   string,
  homeScore: number,
  awayScore: number
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('matches')
    .update({
      home_score:     homeScore,
      away_score:     awayScore,
      status:         'finished',
      result_set_by:  adminId,
      result_set_at:  new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Načte žebříček – seřazeno dle bodů
 */
export async function getLeaderboard() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, total_points, exact_hits, winner_hits')
    .order('total_points', { ascending: false })
    .order('exact_hits',   { ascending: false })
    .order('username',     { ascending: true })

  if (error) throw error

  return (data ?? []).map((profile, index) => ({
    ...profile,
    rank: index + 1,
  }))
}