'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface LeaderboardEntry {
  id:           string
  username:     string
  display_name: string | null
  total_points: number
  exact_hits:   number
  winner_hits:  number
  rank:         number
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

interface DashboardProps {
  currentUserId?: string
}

export function Dashboard({ currentUserId }: DashboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading,     setLoading]     = useState(true)
  const supabase = createClient()

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, total_points, exact_hits, winner_hits')
      .order('total_points', { ascending: false })
      .order('exact_hits',   { ascending: false })
      .order('username',     { ascending: true })

    setLeaderboard(
      (data ?? []).map((p, i) => ({ ...p, rank: i + 1 }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLeaderboard()

    // Real-time aktualizace při změně bodů
    const channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        fetchLeaderboard
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchLeaderboard])

  if (loading) {
    return (
      <div className="card-glass p-6 space-y-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-5 bg-white/10 rounded" />
            <div className="w-10 h-10 bg-white/10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-white/10 rounded w-28" />
              <div className="h-3 bg-white/10 rounded w-40" />
            </div>
            <div className="w-10 h-7 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="card-glass p-4 md:p-5">
      {/* Hlavička */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-gold-gradient">
            🏆 Žebříček
          </h2>
          <p className="text-white/30 text-xs mt-0.5">
            {leaderboard.length} hráčů
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-medium">LIVE</span>
        </div>
      </div>

      {/* Žebříček */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const isMe = entry.id === currentUserId
          return (
            <div
              key={entry.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl
                transition-all duration-200
                ${isMe
                  ? 'border border-tjb-blue/40 bg-tjb-blue/10'
                  : 'border border-transparent bg-white/5 hover:bg-white/10'
                }
                ${entry.rank <= 3 ? 'ring-1 ring-tjb-gold/20' : ''}
              `}
            >
              {/* Rank */}
              <div className="w-7 text-center flex-shrink-0">
                {MEDALS[entry.rank] ? (
                  <span className="text-lg">{MEDALS[entry.rank]}</span>
                ) : (
                  <span className="text-white/30 font-bold text-xs">
                    {entry.rank}.
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center
                           font-bold text-sm flex-shrink-0"
                style={
                  entry.rank === 1
                    ? { background: 'linear-gradient(135deg, #C9A84C, #F0D080)',
                        color: '#0D0D0D' }
                    : { background: 'rgba(74,144,217,0.25)', color: '#4A90D9' }
                }
              >
                {(entry.display_name ?? entry.username)
                  .charAt(0).toUpperCase()}
              </div>

              {/* Jméno a statistiky */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold text-sm truncate
                    ${isMe ? 'text-sky-300' : 'text-white'}`}>
                    {entry.display_name ?? entry.username}
                  </span>
                  {isMe && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: 'rgba(74,144,217,0.2)',
                        color: '#4A90D9',
                      }}
                    >
                      Vy
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-green-400">
                    🎯 {entry.exact_hits}
                  </span>
                  <span className="text-xs text-yellow-400">
                    ✅ {entry.winner_hits}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="text-right flex-shrink-0">
                <div
                  className={`text-xl font-black
                    ${entry.rank === 1
                      ? 'text-gold-gradient'
                      : entry.rank <= 3
                        ? 'text-tjb-gold-light'
                        : 'text-white'
                    }`}
                >
                  {entry.total_points}
                </div>
                <div className="text-white/30 text-xs">b</div>
              </div>
            </div>
          )
        })}

        {leaderboard.length === 0 && (
          <div className="text-center py-10 text-white/20">
            <div className="text-4xl mb-2">🏟️</div>
            <p className="text-sm">Žebříček je prázdný</p>
          </div>
        )}
      </div>
    </div>
  )
}