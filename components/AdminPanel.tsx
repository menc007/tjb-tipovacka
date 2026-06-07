'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { setMatchResult } from '@/lib/matches'

interface AdminPanelProps {
  adminId: string
}

export function AdminPanel({ adminId }: AdminPanelProps) {
  const [matches,   setMatches]   = useState<any[]>([])
  const [users,     setUsers]     = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'results' | 'users' | 'testmode'>('results')
  const [loading,   setLoading]   = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: m }, { data: u }] = await Promise.all([
        supabase.from('matches').select('*, groups(name)').order('kickoff_time'),
        supabase.from('profiles').select('*').order('username'),
      ])
      setMatches(m ?? [])
      setUsers(u ?? [])
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-tjb-blue border-t-transparent
                        rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Admin hlavička */}
      <div className="card-glass p-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'rgba(201,168,76,0.15)' }}
        >
          ⚙️
        </div>
        <div>
          <h2 className="text-xl font-black text-gold-gradient">Admin Panel</h2>
          <p className="text-white/30 text-sm">TJB Tipovačka – MS 2026</p>
        </div>
        <span className="ml-auto badge-upcoming">ADMIN</span>
      </div>

      {/* Záložky */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
        {[
          { key: 'results',  label: '📊 Výsledky' },
          { key: 'users',    label: '👥 Uživatelé' },
          { key: 'testmode', label: '🔧 Test' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`
              flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.key
                ? 'bg-tjb-blue text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Obsah záložek */}
      {activeTab === 'results' && (
        <ResultsTab
          matches={matches}
          adminId={adminId}
          onUpdate={updated =>
            setMatches(prev =>
              prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m))
            )
          }
        />
      )}
      {activeTab === 'users' && (
        <UsersTab users={users} adminId={adminId} onUpdate={setUsers} />
      )}
      {activeTab === 'testmode' && (
        <TestModeTab adminId={adminId} />
      )}
    </div>
  )
}

// ─── ResultsTab ────────────────────────────────────────────────
function ResultsTab({
  matches, adminId, onUpdate,
}: {
  matches: any[]
  adminId: string
  onUpdate: (m: any) => void
}) {
  const [selected,   setSelected]   = useState<any>(null)
  const [homeScore,  setHomeScore]  = useState('')
  const [awayScore,  setAwayScore]  = useState('')
  const [saving,     setSaving]     = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [filter,     setFilter]     = useState('locked')

  const filtered = matches.filter(m =>
    filter === 'all' ? true : m.status === filter
  )

  const handleSubmit = async () => {
    if (!selected) return
    const h = parseInt(homeScore)
    const a = parseInt(awayScore)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError('Zadej platné skóre')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await setMatchResult(adminId, selected.id, h, a)
      onUpdate(updated)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setSelected(null)
        setHomeScore('')
        setAwayScore('')
      }, 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Chyba')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtr statusu */}
      <div className="flex gap-2 flex-wrap">
        {['locked', 'live', 'upcoming', 'finished', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${filter === f ? 'bg-tjb-blue text-white' : 'bg-white/10 text-white/60'}`}
          >
            {f === 'locked'   ? '🔒 Uzamčené' :
             f === 'live'     ? '🔴 Live' :
             f === 'upcoming' ? '📅 Nadcházející' :
             f === 'finished' ? '✓ Ukončené' : '📋 Vše'}
          </button>
        ))}
      </div>

      {/* Seznam zápasů */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {filtered.map((match: any) => (
          <div
            key={match.id}
            onClick={() => {
              setSelected(selected?.id === match.id ? null : match)
              setHomeScore(match.home_score?.toString() ?? '')
              setAwayScore(match.away_score?.toString() ?? '')
              setError(null)
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all
              ${selected?.id === match.id
                ? 'border-tjb-gold/60 bg-tjb-gold/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                #{match.match_number} {match.home_team ?? 'TBD'} vs {match.away_team ?? 'TBD'}
              </span>
              {match.status === 'finished' && match.home_score !== null ? (
                <span className="text-green-400 font-bold text-sm">
                  {match.home_score}:{match.away_score}
                </span>
              ) : (
                <span className="text-white/40 text-xs uppercase">{match.status}</span>
              )}
            </div>
            <div className="text-xs text-white/30 mt-0.5">
              {new Date(match.kickoff_time).toLocaleString('cs-CZ')}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-white/20 text-sm">
            Žádné zápasy
          </div>
        )}
      </div>

      {/* Formulář výsledku */}
      {selected && (
        <div
          className="p-4 rounded-2xl border"
          style={{ borderColor: 'rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.05)' }}
        >
          <h3 className="font-bold mb-3" style={{ color: '#C9A84C' }}>
            Zadat výsledek: {selected.home_team} vs {selected.away_team}
          </h3>
          <div className="flex items-center justify-center gap-4 mb-4">
            <input
              type="number" min="0"
              value={homeScore}
              onChange={e => setHomeScore(e.target.value)}
              className="input-field w-20 text-center text-2xl font-black"
              placeholder="0"
            />
            <span className="font-black text-3xl" style={{ color: '#C9A84C' }}>:</span>
            <input
              type="number" min="0"
              value={awayScore}
              onChange={e => setAwayScore(e.target.value)}
              className="input-field w-20 text-center text-2xl font-black"
              placeholder="0"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={saving || !homeScore || !awayScore}
            className={`w-full py-3 rounded-xl font-bold transition-all
              ${success
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'btn-gold'
              }`}
          >
            {saving ? '⏳ Ukládám...' : success ? '✓ Uloženo!' : '✅ Potvrdit výsledek'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── UsersTab ──────────────────────────────────────────────────
function UsersTab({
  users, adminId, onUpdate,
}: {
  users: any[]
  adminId: string
  onUpdate: (u: any[]) => void
}) {
  const supabase = createClient()
  const [newUsername, setNewUsername] = useState('')
  const [newEmail,    setNewEmail]    = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [creating,    setCreating]    = useState(false)
  const [createErr,   setCreateErr]   = useState<string | null>(null)
  const [createOk,    setCreateOk]    = useState(false)

  const handleCreate = async () => {
    if (!newEmail || !newPassword || !newUsername) {
      setCreateErr('Vyplň všechna pole')
      return
    }
    setCreating(true)
    setCreateErr(null)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          username: newUsername,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const { data: fresh } = await supabase
        .from('profiles').select('*').order('username')
      onUpdate(fresh ?? [])
      setNewUsername('')
      setNewEmail('')
      setNewPassword('')
      setCreateOk(true)
      setTimeout(() => setCreateOk(false), 3000)
    } catch (e: unknown) {
      setCreateErr(e instanceof Error ? e.message : 'Chyba')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Opravdu smazat tohoto uživatele i s jeho tipy?')) return
    try {
      await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      onUpdate(users.filter(u => u.id !== userId))
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-4">
      {/* Formulář nového uživatele */}
      <div className="card-glass p-4 border border-tjb-blue/20">
        <h3 className="font-bold text-tjb-blue mb-3">➕ Přidat tipujícího</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Přezdívka"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            className="input-field w-full"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="input-field w-full"
          />
          <input
            type="password"
            placeholder="Heslo (min. 8 znaků)"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="input-field w-full"
          />
          {createErr && <p className="text-red-400 text-sm">{createErr}</p>}
          {createOk  && <p className="text-green-400 text-sm">✓ Uživatel vytvořen!</p>}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="btn-primary w-full"
          >
            {creating ? 'Vytvářím...' : '✓ Vytvořit uživatele'}
          </button>
        </div>
      </div>

      {/* Seznam uživatelů */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {users.map(user => (
          <div key={user.id}
               className="flex items-center justify-between
                          bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center
                           font-bold text-sm"
                style={{ background: 'rgba(74,144,217,0.2)', color: '#4A90D9' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-white text-sm">{user.username}</div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>{user.total_points} b</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={
                      user.role === 'admin'
                        ? { background: 'rgba(201,168,76,0.2)', color: '#C9A84C' }
                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                    }
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            {user.id !== adminId && user.role !== 'admin' && (
              <button
                onClick={() => handleDelete(user.id)}
                className="p-2 rounded-lg text-red-400/40 hover:text-red-400
                           hover:bg-red-400/10 transition-all"
                title="Smazat uživatele"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TestModeTab ───────────────────────────────────────────────
function TestModeTab({ adminId }: { adminId: string }) {
  const supabase = createClient()
  const [offsetDays,    setOffsetDays]    = useState(0)
  const [offsetHours,   setOffsetHours]   = useState(0)
  const [offsetMinutes, setOffsetMinutes] = useState(0)
  const [description,   setDescription]   = useState('')
  const [saving,        setSaving]        = useState(false)
  const [isActive,      setIsActive]      = useState(false)
  const [realTime,      setRealTime]      = useState(new Date())

  useEffect(() => {
    // Načtení aktuálního nastavení
    supabase
      .from('time_offset_config')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setIsActive(data.is_active)
          const ms = data.offset_ms
          const totalMin = Math.floor(Math.abs(ms) / 60000)
          const sign = ms >= 0 ? 1 : -1
          setOffsetDays(sign * Math.floor(totalMin / 1440))
          setOffsetHours(sign * Math.floor((totalMin % 1440) / 60))
          setOffsetMinutes(sign * (totalMin % 60))
        }
      })

    const iv = setInterval(() => setRealTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const totalMs =
    offsetDays    * 86_400_000 +
    offsetHours   * 3_600_000 +
    offsetMinutes * 60_000

  const simulatedTime = new Date(Date.now() + totalMs)

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase
        .from('time_offset_config')
        .update({
          offset_ms:   totalMs,
          is_active:   totalMs !== 0,
          description: description || `Offset: ${totalMs}ms`,
          set_by:      adminId,
          set_at:      new Date().toISOString(),
        })
        .eq('id', 1)
      setIsActive(totalMs !== 0)
      alert('✅ Testovací čas nastaven!')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setSaving(true)
    try {
      await supabase
        .from('time_offset_config')
        .update({ offset_ms: 0, is_active: false, set_by: adminId })
        .eq('id', 1)
      setOffsetDays(0)
      setOffsetHours(0)
      setOffsetMinutes(0)
      setIsActive(false)
    } finally {
      setSaving(false)
    }
  }

  const presets = [
    { label: '−2h (volné tipování)',   ms: -7_200_000 },
    { label: '−61 min (těsně před)',   ms: -3_660_000 },
    { label: '−59 min (po uzamčení)',  ms: -3_540_000 },
    { label: '+1 den',                 ms: 86_400_000 },
    { label: '+3 dny',                 ms: 259_200_000 },
    { label: '+7 dní',                 ms: 604_800_000 },
  ]

  const applyPreset = (ms: number) => {
    const sign = ms >= 0 ? 1 : -1
    const abs  = Math.floor(Math.abs(ms) / 60000)
    setOffsetDays(sign * Math.floor(abs / 1440))
    setOffsetHours(sign * Math.floor((abs % 1440) / 60))
    setOffsetMinutes(sign * (abs % 60))
  }

  return (
    <div className="space-y-4">
      {/* Varování */}
      <div
        className="p-3 rounded-xl border text-sm"
        style={{
          background: 'rgba(245,158,11,0.1)',
          borderColor: 'rgba(245,158,11,0.3)',
          color: '#F59E0B',
        }}
      >
        <p className="font-bold">⚠️ Testovací režim</p>
        <p className="text-xs mt-1 opacity-80">
          Simulovaný čas ovlivní zamykání zápasů pro VŠECHNY uživatele.
          Před spuštěním soutěže nezapomeň kliknout Reset!
        </p>
      </div>

      {/* Hodiny */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-glass p-3 text-center">
          <div className="text-xs text-white/40 mb-1">Reálný čas</div>
          <div className="font-mono font-bold text-white">
            {realTime.toLocaleTimeString('cs-CZ')}
          </div>
          <div className="text-xs text-white/30">
            {realTime.toLocaleDateString('cs-CZ')}
          </div>
        </div>
        <div
          className="p-3 rounded-2xl border text-center"
          style={
            isActive
              ? { background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }
          }
        >
          <div
            className="text-xs mb-1"
            style={{ color: isActive ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}
          >
            {isActive ? '🔧 Simulovaný čas' : 'Simulovaný čas'}
          </div>
          <div
            className="font-mono font-bold"
            style={{ color: isActive ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}
          >
            {simulatedTime.toLocaleTimeString('cs-CZ')}
          </div>
          <div className="text-xs" style={{ color: 'rgba(245,158,11,0.4)' }}>
            {simulatedTime.toLocaleDateString('cs-CZ')}
          </div>
        </div>
      </div>

      {/* Nastavení offsetu */}
      <div className="card-glass p-4">
        <h4 className="font-bold text-white mb-3">⏱️ Nastavit posun</h4>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Dny',    val: offsetDays,    set: setOffsetDays,    min: -365, max: 365 },
            { label: 'Hodiny', val: offsetHours,   set: setOffsetHours,   min: -23,  max: 23 },
            { label: 'Minuty', val: offsetMinutes, set: setOffsetMinutes, min: -59,  max: 59 },
          ].map(f => (
            <div key={f.label} className="text-center">
              <label className="text-xs text-white/40 block mb-1">{f.label}</label>
              <input
                type="number"
                value={f.val}
                min={f.min} max={f.max}
                onChange={e => f.set(parseInt(e.target.value) || 0)}
                className="input-field w-full text-center font-mono text-sm"
              />
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Popis testu (volitelné)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="input-field w-full mb-3 text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? '⏳...' : '✅ Aktivovat'}
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(239,68,68,0.15)',
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Presety */}
      <div className="card-glass p-4">
        <h4 className="font-bold text-white mb-3">⚡ Rychlé presety</h4>
        <div className="grid grid-cols-2 gap-2">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.ms)}
              className="text-xs px-3 py-2 rounded-lg text-left transition-all
                         bg-white/5 hover:bg-tjb-blue/20 text-white/60
                         hover:text-white border border-white/10 hover:border-tjb-blue/30"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}