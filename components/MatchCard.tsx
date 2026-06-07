'use client'

import { useState, useEffect, useCallback } from 'react'
import { upsertPrediction } from '@/lib/matches'
import {
  isMatchLocked,
  arePredictionsVisible,
  formatCountdown,
  secondsUntilLock,
  getAppTime,
} from '@/lib/time'
import { calculatePoints, getStageLabel } from '@/lib/scoring'

interface MatchCardProps {
  match: any
  userId: string
}

export function MatchCard({ match, userId }: MatchCardProps) {
  const [homeInput,  setHomeInput]  = useState(
    match.myPrediction?.predicted_home?.toString() ?? ''
  )
  const [awayInput,  setAwayInput]  = useState(
    match.myPrediction?.predicted_away?.toString() ?? ''
  )
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [countdown,  setCountdown]  = useState<number>(0)
  const [appTime,    setAppTime]    = useState(new Date())
  const [expanded,   setExpanded]   = useState(false)

  // Aktualizace odpočtu každou sekundu
  useEffect(() => {
    const update = async () => {
      const t = await getAppTime()
      setAppTime(t)
      setCountdown(secondsUntilLock(match.lock_time, t))
    }
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [match.lock_time])

  const locked     = isMatchLocked(match.lock_time, appTime)
  const revealed   = arePredictionsVisible(match.lock_time, match.status, appTime)
  const isFinished = match.status === 'finished'

  // Výsledek mého tipu
  const myResult =
    isFinished &&
    match.myPrediction &&
    match.home_score !== null
      ? calculatePoints(
          match.myPrediction.predicted_home,
          match.myPrediction.predicted_away,
          match.home_score,
          match.away_score
        )
      : null

  // Uložení tipu
  const handleSave = useCallback(async () => {
    const home = parseInt(homeInput)
    const away = parseInt(awayInput)

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setError('Zadej platné skóre (číslo 0 a více)')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await upsertPrediction(userId, match.id, home, away)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }, [homeInput, awayInput, userId, match.id])

  // Datum/čas výkopu
  const kickoff = new Date(match.kickoff_time)
  const dateStr = kickoff.toLocaleDateString('cs-CZ', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const timeStr = kickoff.toLocaleTimeString('cs-CZ', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className={`
        card-glass overflow-hidden transition-all duration-300
        ${myResult?.points === 10
          ? 'ring-1 ring-green-500/50'
          : myResult?.points === 5
            ? 'ring-1 ring-yellow-500/50'
            : myResult?.points === 0
              ? 'ring-1 ring-red-500/20'
              : ''
        }
      `}
    >
      {/* Hlavička karty */}
      <div
        className="flex items-center justify-between px-4 py-2
                   bg-white/5 border-b border-white/10 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: '#C9A84C' }}>
            {match.groups?.name
              ? `Skupina ${match.groups.name}`
              : getStageLabel(match.stage)
            }
          </span>
          <span className="text-white/20">·</span>
          <span className="text-white/30">#{match.match_number}</span>
        </div>

        <div className="flex items-center gap-2">
          {!locked && match.status === 'upcoming' && (
            <span className="badge-upcoming">Otevřeno</span>
          )}
          {locked && !['finished','live'].includes(match.status) && (
            <span className="badge-locked">🔒 Uzamčeno</span>
          )}
          {match.status === 'live' && (
            <span className="badge-live">🔴 LIVE</span>
          )}
          {match.status === 'finished' && (
            <span className="badge-finished">✓ Konec</span>
          )}
          <span className="text-white/30 text-xs ml-1">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Tělo karty */}
      <div className="p-4">
        {/* Datum a místo */}
        <div className="text-center text-white/40 text-xs mb-3">
          📅 {dateStr} &nbsp;·&nbsp; ⏰ {timeStr}
          {match.city && ` · 📍 ${match.city}`}
        </div>

        {/* Týmy */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Domácí */}
          <div className="flex-1 text-center">
            <div className="text-4xl mb-1">
              {match.home_team_flag ?? '🏴'}
            </div>
            <div className="font-bold text-sm text-white truncate px-1">
              {match.home_team ?? 'TBD'}
            </div>
          </div>

          {/* Výsledek nebo VS */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            {isFinished && match.home_score !== null ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-white">
                  {match.home_score}
                </span>
                <span className="font-black text-2xl" style={{ color: '#C9A84C' }}>
                  :
                </span>
                <span className="text-3xl font-black text-white">
                  {match.away_score}
                </span>
              </div>
            ) : match.status === 'live' ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-orange-400">
                  {match.home_score ?? 0}
                </span>
                <span className="font-black text-orange-400">:</span>
                <span className="text-2xl font-black text-orange-400">
                  {match.away_score ?? 0}
                </span>
              </div>
            ) : (
              <span className="font-black text-xl" style={{ color: '#C9A84C' }}>
                VS
              </span>
            )}

            {/* Odpočet */}
            {!locked && match.status === 'upcoming' && (
              <div
                className={`
                  text-xs font-mono font-bold px-2 py-0.5 rounded-full
                  ${countdown <= 300
                    ? 'text-red-400 bg-red-400/10 animate-pulse'
                    : countdown <= 3600
                      ? 'text-orange-400 bg-orange-400/10'
                      : 'text-white/30 bg-white/5'
                  }
                `}
              >
                🔒 {formatCountdown(countdown)}
              </div>
            )}
          </div>

          {/* Hosté */}
          <div className="flex-1 text-center">
            <div className="text-4xl mb-1">
              {match.away_team_flag ?? '🏴'}
            </div>
            <div className="font-bold text-sm text-white truncate px-1">
              {match.away_team ?? 'TBD'}
            </div>
          </div>
        </div>

        {/* Formulář pro tipování */}
        {!locked && match.status === 'upcoming' && (
          <div
            className="mt-2 p-3 rounded-xl border space-y-3"
            style={{
              background: 'rgba(74,144,217,0.05)',
              borderColor: 'rgba(74,144,217,0.2)',
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <input
                type="number"
                min="0" max="99"
                value={homeInput}
                onChange={e => setHomeInput(e.target.value)}
                placeholder="–"
                className="input-field w-16 text-center text-xl font-black"
              />
              <span className="font-black text-xl" style={{ color: '#C9A84C' }}>
                :
              </span>
              <input
                type="number"
                min="0" max="99"
                value={awayInput}
                onChange={e => setAwayInput(e.target.value)}
                placeholder="–"
                className="input-field w-16 text-center text-xl font-black"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !homeInput || !awayInput}
              className={`
                w-full py-2 rounded-xl font-semibold text-sm transition-all
                ${saved
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'btn-primary'
                }
              `}
            >
              {saving
                ? '⏳ Ukládám...'
                : saved
                  ? '✓ Uloženo!'
                  : match.myPrediction
                    ? '✏️ Aktualizovat tip'
                    : '💾 Uložit tip'
              }
            </button>
          </div>
        )}

        {/* Uzamčeno – zobrazit můj tip */}
        {locked && match.myPrediction && (
          <div
            className="mt-2 p-3 rounded-xl border text-center"
            style={
              myResult
                ? {
                    borderColor: myResult.color + '50',
                    background: myResult.color + '15',
                  }
                : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }
            }
          >
            <div className="text-white/40 text-xs mb-1">Můj tip:</div>
            <div className="text-2xl font-black text-white">
              {match.myPrediction.predicted_home} : {match.myPrediction.predicted_away}
            </div>
            {myResult && (
              <div className="mt-1.5 flex items-center justify-center gap-1.5">
                <span>{myResult.emoji}</span>
                <span
                  className="font-bold text-sm"
                  style={{ color: myResult.color }}
                >
                  {myResult.label}
                </span>
                <span
                  className="font-black text-lg"
                  style={{ color: myResult.color }}
                >
                  +{myResult.points}b
                </span>
              </div>
            )}
          </div>
        )}

        {/* Uzamčeno – bez tipu */}
        {locked && !match.myPrediction && (
          <div
            className="mt-2 p-3 rounded-xl border text-center text-sm"
            style={{
              borderColor: 'rgba(239,68,68,0.2)',
              background: 'rgba(239,68,68,0.05)',
              color: 'rgba(239,68,68,0.5)',
            }}
          >
            🔒 Tip nebyl zadán
          </div>
        )}
      </div>

      {/* Rozbalená část: tipy ostatních */}
      {expanded && (
        <div className="border-t border-white/10 p-4">
          {revealed ? (
            <div>
              <h4 className="text-white/50 text-xs font-semibold uppercase
                             tracking-wider mb-2">
                👥 Tipy ostatních hráčů
              </h4>
              <p className="text-white/30 text-xs">
                (Načítání tipů ostatních je dostupné na stránce Zápasy)
              </p>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🔐</div>
              <p className="text-white/30 text-sm">
                Tipy ostatních se zobrazí po uzamčení zápasu
              </p>
              {countdown > 0 && (
                <p className="text-white/20 text-xs mt-0.5">
                  Za {formatCountdown(countdown)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}