'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { calculatePoints, getPointsColor } from '@/lib/scoring'

export default function MyTipsPage() {
  const [data,    setData]    = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: predsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('predictions')
          .select('*, matches(*, groups(name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setProfile(profileData)
      setData(predsData ?? [])
      setLoading(false)
    }

    fetchData()
  }, [])

  // Statistiky
  const stats = useMemo(() => {
    const evaluated = data.filter(d => d.points !== null)
    const total     = evaluated.reduce((s, d) => s + d.points, 0)
    const exact     = evaluated.filter(d => d.points === 10).length
    const winner    = evaluated.filter(d => d.points === 5).length
    const miss      = evaluated.filter(d => d.points === 0).length
    return { evaluated: evaluated.length, total, exact, winner, miss }
  }, [data])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-2 border-tjb-blue border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-black text-white">📝 Moje tipy</h1>

      {/* Statistiky */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Celkem bodů',    value: profile?.total_points ?? 0, color: 'text-tjb-gold',  emoji: '🏆' },
          { label: 'Přesný výsledek', value: stats.exact,               color: 'text-green-400', emoji: '🎯' },
          { label: 'Správný vítěz',  value: stats.winner,               color: 'text-yellow-400',emoji: '✅' },
          { label: 'Špatný tip',     value: stats.miss,                 color: 'text-red-400',   emoji: '❌' },
        ].map(stat => (
          <div key={stat.label} className="card-glass p-4 text-center">
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <div className={`text-2xl font-black ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Seznam tipů */}
      <div className="space-y-2">
        {data.length === 0 ? (
          <div className="card-glass p-12 text-center text-white/30">
            <div className="text-5xl mb-3">📭</div>
            <p>Zatím žádné tipy</p>
            <p className="text-sm mt-1">
              <a href="/matches" className="text-tjb-blue hover:underline">
                Přejdi na zápasy a začni tipovat →
              </a>
            </p>
          </div>
        ) : (
          data.map((pred: any) => {
            const match = pred.matches
            if (!match) return null

            const isFinished = match.status === 'finished'
            const result = isFinished && match.home_score !== null
              ? calculatePoints(
                  pred.predicted_home, pred.predicted_away,
                  match.home_score, match.away_score
                )
              : null

            return (
              <div
                key={pred.id}
                className={`card-glass p-4 flex items-center justify-between
                  ${result?.points === 10 ? 'ring-1 ring-green-500/40' :
                    result?.points === 5  ? 'ring-1 ring-yellow-500/40' :
                    result?.points === 0  ? 'ring-1 ring-red-500/20' : ''}
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/40 mb-0.5">
                    {match.groups?.name
                      ? `Skupina ${match.groups.name}`
                      : match.stage?.replace(/_/g, ' ')
                    }
                    {' · '}
                    {new Date(match.kickoff_time).toLocaleDateString('cs-CZ')}
                  </div>
                  <div className="font-semibold text-white text-sm truncate">
                    {match.home_team ?? 'TBD'} vs {match.away_team ?? 'TBD'}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  {/* Můj tip */}
                  <div className="text-center">
                    <div className="text-xs text-white/40 mb-0.5">Tip</div>
                    <div className="font-black text-white">
                      {pred.predicted_home}:{pred.predicted_away}
                    </div>
                  </div>

                  {/* Výsledek */}
                  {isFinished && (
                    <div className="text-center">
                      <div className="text-xs text-white/40 mb-0.5">Výsledek</div>
                      <div className="font-black text-white/70">
                        {match.home_score}:{match.away_score}
                      </div>
                    </div>
                  )}

                  {/* Body */}
                  {result !== null ? (
                    <div className="text-center min-w-[48px]">
                      <div className="text-xs text-white/40 mb-0.5">Body</div>
                      <div
                        className="font-black text-lg"
                        style={{ color: result.color }}
                      >
                        {result.emoji} {result.points}
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 text-center">
                      <div className="text-white/20 text-xs">čeká se</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}