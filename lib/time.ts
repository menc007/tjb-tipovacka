import { createClient } from './supabase'

// Cache pro testovací offset
let cachedOffset: number = 0
let cacheExpiry:  number = 0

/**
 * Vrátí aktuální čas aplikace (s případným testovacím posunem)
 */
export async function getAppTime(): Promise<Date> {
  const now = Date.now()

  // Refresh cache každých 30 sekund
  if (now > cacheExpiry) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('time_offset_config')
        .select('offset_ms, is_active')
        .eq('id', 1)
        .single()

      cachedOffset = data?.is_active ? (data.offset_ms ?? 0) : 0
      cacheExpiry  = now + 30_000
    } catch {
      cachedOffset = 0
    }
  }

  return new Date(now + cachedOffset)
}

/**
 * Zkontroluje, zda je zápas uzamčen
 */
export function isMatchLocked(lockTime: string, appTime: Date): boolean {
  return appTime >= new Date(lockTime)
}

/**
 * Zkontroluje, zda jsou tipy ostatních viditelné
 */
export function arePredictionsVisible(
  lockTime: string,
  status:   string,
  appTime:  Date
): boolean {
  return (
    ['locked', 'live', 'finished'].includes(status) ||
    appTime >= new Date(lockTime)
  )
}

/**
 * Vrátí počet sekund do uzamčení zápasu
 */
export function secondsUntilLock(lockTime: string, appTime: Date): number {
  const diff = new Date(lockTime).getTime() - appTime.getTime()
  return Math.max(0, Math.floor(diff / 1000))
}

/**
 * Formátuje odpočet do čitelného formátu
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'UZAMČENO'

  const days    = Math.floor(seconds / 86400)
  const hours   = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs    = seconds % 60

  if (days > 0)    return `${days}d ${hours}h ${minutes}m`
  if (hours > 0)   return `${hours}h ${minutes}m ${secs}s`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}