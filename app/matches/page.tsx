'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { MatchCard } from '@/components/MatchCard'
import { getAppTime } from '@/lib/time'
import { getStageLabel } from '@/lib/scoring'

const STAGES = [
  { key: 'all',           label: 'Vše' },
  { key: 'group',         label: 'Skupiny' },
  { key: 'round_of_32',   label: 'Osmnáctifinále' },
  { key: 'round_of_16',   label: 'Osmifinále' },
  { key: 'quarter_final', label: 'Čtvrtfinále' },
  { key: 'semi_final',    label: 'Semifinále' },
  { key: 'final',         label: 'Finále' },
]

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function MatchesPage() {
  const [matches,     setMatches]     = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [userId,      setUserId]      = useState<string>('')
  const [loading,     setLoading]     = useState(true)
  const [stageFilter, setStageFilter] = useState('all')
  const [groupFilter, setGroupFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [appTime,     setAppTime]     = useState(new Date())

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Načtení zápasů
      const { data: matchData } = await supabase
        .from('matches')
        .select('*, groups(name)')
        .order('kickoff_time', { ascending: true })

      // Načtení mých tipů
      const { data: predData } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)

      setMatches(matchData ?? [])
      setPredictions(predData ?? [])
      setLoading(false)
    }

    init()

    // Aktualizace času každou minutu
    const timeInterval = setInterval(async () => {
      setAppTime(await getAppTime())
    }, 60000)

    return () => clearInterval(timeInterval)
  }, [])

  // Mapování tipů na zápasy
  const predictionMap = useMemo(() => {
    const map = new Map<string, any>()
    predictions.forEach(p => map.set(p.match_id, p))
    return map
  }, [predictions])

  // Filtrování zápasů
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const stageOk = stageFilter === 'all' || m.stage === stageFilter
      const groupOk = groupFilter === 'all' || m.groups?.name === groupFilter
      const searchOk = searchQuery === '' ||
        m.home_team?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.away_team?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city?.toLowerCase().includes(searchQuery.toLowerCase())
      return stageOk && groupOk && searchOk
    })
  }, [matches, stageFilter, groupFilter, searchQuery])

  // Seskupení po dnech
  const matchesByDay = useMemo(() => {
    const groups = new Map<string, any[]>()
    filteredMatches.forEach(m => {
      const day = new Date(m.kickoff_time).toLocaleDateString('cs-CZ', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
      if (!groups.has(day)) groups.set(day, [])
      groups.get(day)!.push(m)
    })
    return groups
  }, [filteredMatches])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-tjb-blue border-t-transparent
                          rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40">Načítám zápasy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hlavička */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">⚽ Zápasy MS 2026</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {matches.length} zápasů · {filteredMatches.length} zobrazeno
          </p>
        </div>
      </div>

      {/* Filtry */}
      <div className="card-glass p-4 space-y-3">
        {/* Hledání */}
        <input
          type="text"
          placeholder="🔍 Hledat tým nebo město..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input-field w-full"
        />

        {/* Fáze turnaje */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STAGES.map(s => (
            <button
              key={s.key}
              onClick={() => {
                setStageFilter(s.key)
                setGroupFilter('all')
              }}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200
                ${stageFilter === s.key
                  ? 'bg-tjb-blue text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Skupiny (jen při filtru "skupiny") */}
        {stageFilter === 'group' && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setGroupFilter('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium
                ${groupFilter === 'all'
                  ? 'bg-tjb-gold text-tjb-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
            >
              Všechny skupiny
            </button>
            {GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`flex-shrink-0 w-9 py-1.5 rounded-lg text-xs font-bold
                  ${groupFilter === g
                    ? 'bg-tjb-gold text-tjb-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zápasy seskupené po dnech */}
      {matchesByDay.size === 0 ? (
        <div className="card-glass p-12 text-center text-white/30">
          <div className="text-5xl mb-3">🔍</div>
          <p>Žádné zápasy neodpovídají filtru</p>
        </div>
      ) : (
        Array.from(matchesByDay.entries()).map(([day, dayMatches]) => (
          <div key={day}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-white/50 text-xs font-medium uppercase
                               tracking-wider px-2 py-1 bg-white/5 rounded-full">
                {day}
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="space-y-3">
              {dayMatches.map((match: any) => (
                <div key={match.id} id={`match-${match.id}`}>
                  <MatchCard
                    match={{
                      ...match,
                      myPrediction: predictionMap.get(match.id) ?? null,
                    }}
                    userId={userId}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}