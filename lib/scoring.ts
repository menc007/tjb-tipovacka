export type ScoreResult = {
  points: 0 | 5 | 10
  label:  string
  color:  string
  emoji:  string
}

/**
 * Vypočítá body za tip
 * 10b = přesný výsledek
 *  5b = správný vítěz nebo remíza (ale špatné skóre)
 *  0b = špatný tip
 */
export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome:    number,
  actualAway:    number
): ScoreResult {
  // 10 bodů – přesná shoda
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return {
      points: 10,
      label:  'Přesný výsledek!',
      color:  '#22C55E',
      emoji:  '🎯',
    }
  }

  // Výsledek skutečného zápasu
  const actualResult =
    actualHome > actualAway ? 'home' :
    actualAway > actualHome ? 'away' :
    'draw'

  // Výsledek tipu
  const predictedResult =
    predictedHome > predictedAway ? 'home' :
    predictedAway > predictedHome ? 'away' :
    'draw'

  // 5 bodů – správný vítěz/remíza
  if (predictedResult === actualResult) {
    const label = actualResult === 'draw'
      ? 'Správná remíza'
      : 'Správný vítěz'
    return {
      points: 5,
      label,
      color:  '#F59E0B',
      emoji:  '✅',
    }
  }

  // 0 bodů – špatný tip
  return {
    points: 0,
    label:  'Špatný tip',
    color:  '#EF4444',
    emoji:  '❌',
  }
}

/**
 * Vrátí barvu dle počtu bodů
 */
export function getPointsColor(points: number | null): string {
  if (points === null) return '#6B7280'
  if (points === 10)   return '#22C55E'
  if (points === 5)    return '#F59E0B'
  return '#EF4444'
}

/**
 * Vrátí český název fáze turnaje
 */
export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    group:          'Skupinová fáze',
    round_of_32:    'Osmnáctifinále',
    round_of_16:    'Osmifinále',
    quarter_final:  'Čtvrtfinále',
    semi_final:     'Semifinále',
    third_place:    'Zápas o 3. místo',
    final:          'Finále 🏆',
  }
  return labels[stage] ?? stage
}