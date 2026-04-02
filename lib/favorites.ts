'use client'

import { useMemo, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'favorite_listing_ids'

const listeners = new Set<() => void>()
const SERVER_SNAPSHOT: string[] = []

let cachedRaw: string | null | undefined = undefined
let cachedIds: string[] = []

function notify() {
  for (const listener of listeners) listener()
}

function safeParseIds(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x) => typeof x === 'string')
  } catch {
    return []
  }
}

function readIds(): string[] {
  if (typeof window === 'undefined') return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === cachedRaw) return cachedIds

  cachedRaw = raw
  cachedIds = safeParseIds(raw)
  return cachedIds
}

function writeIds(ids: string[]) {
  if (typeof window === 'undefined') return

  const raw = JSON.stringify(ids)
  window.localStorage.setItem(STORAGE_KEY, raw)

  cachedRaw = raw
  cachedIds = ids
  notify()
}

export function getFavoriteListingIds(): string[] {
  return readIds()
}

export function isListingFavorite(listingId: string): boolean {
  return readIds().includes(listingId)
}

export function setListingFavorite(listingId: string, next: boolean): string[] {
  const prev = readIds()
  const has = prev.includes(listingId)

  if (next && !has) {
    const updated = [listingId, ...prev]
    writeIds(updated)
    return updated
  }

  if (!next && has) {
    const updated = prev.filter((id) => id !== listingId)
    writeIds(updated)
    return updated
  }

  return prev
}

export function toggleListingFavorite(listingId: string): string[] {
  const prev = readIds()
  const next = prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [listingId, ...prev]
  writeIds(next)
  return next
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onStoreChange()
  }

  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  return readIds()
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return useMemo(
    () => ({
      ids,
      isFavorite: (listingId: string) => ids.includes(listingId),
      toggle: (listingId: string) => toggleListingFavorite(listingId),
      set: (listingId: string, next: boolean) => setListingFavorite(listingId, next),
    }),
    [ids]
  )
}
