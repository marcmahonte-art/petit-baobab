"use client"

import { useCallback, useEffect, useSyncExternalStore, useRef } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useProfileStore, type ChildProfile } from "@/lib/profile-store"
import { getMascotImage, DEFAULT_MASCOT } from "@/lib/mascots"

export interface ProfileData {
  id: string | null
  name: string
  mascot: string
  age: number | null
  avatar: string
  email: string | null
  role: "parent" | "teacher" | "student" | "unknown"
  plan: string | null
  starsBalance: number
  isStudent: boolean
  isLoading: boolean
  activeProfileId: string | null
  profiles: ChildProfile[]
}

let externalAge: number | null = null
const listeners = new Set<() => void>()

function notifyAgeListeners() {
  for (const cb of listeners) cb()
}

function getAgeSnapshot() {
  return externalAge
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

async function fetchAgeFromApi(): Promise<number | null> {
  try {
    const res = await fetch("/api/student/profile")
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.age === "number" ? data.age : null
  } catch {
    return null
  }
}

export function useProfile(): ProfileData {
  const {
    user,
    account,
    profiles: authProfiles,
    activeProfileId: authActiveId,
    studentSession,
    isLoading: authLoading,
  } = useAuthStore()

  const { profiles: psProfiles, activeProfileId: psActiveId } = useProfileStore()

  const activeProfileId = authActiveId || psActiveId
  const isStudent = !!(studentSession && studentSession.type === "student")

  const profileName = isStudent
    ? studentSession!.name
    : authProfiles.find((p) => p.id === activeProfileId)?.name
      || psProfiles.find((p) => p.id === activeProfileId)?.name
      || "Awa"

  const profileMascot = isStudent
    ? studentSession!.mascot
    : authProfiles.find((p) => p.id === activeProfileId)?.mascot
      || psProfiles.find((p) => p.id === activeProfileId)?.mascot
      || DEFAULT_MASCOT

  const age = useSyncExternalStore(subscribe, getAgeSnapshot, getAgeSnapshot)

  const fetchedRef = useRef(false)

  const setAge = useCallback((a: number | null) => {
    externalAge = a
    notifyAgeListeners()
  }, [])

  const fetchProfile = useCallback(async () => {
    if (isStudent) return
    const a = await fetchAgeFromApi()
    if (a !== null) {
      setAge(a)
    } else {
      const stored = typeof window !== "undefined" ? localStorage.getItem("pb_child_age") : null
      setAge(stored ? Number(stored) : null)
    }
  }, [isStudent, setAge])

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchProfile()
    }
  }, [fetchProfile])

  useEffect(() => {
    const handler = () => {
      fetchProfile()
      useAuthStore.getState().checkSession()
    }
    window.addEventListener("pb-profile-updated", handler)
    return () => window.removeEventListener("pb-profile-updated", handler)
  }, [fetchProfile])

  return {
    id: activeProfileId,
    name: profileName,
    mascot: profileMascot,
    age,
    avatar: getMascotImage(profileMascot),
    email: user?.email || null,
    role: isStudent ? "student" : account ? "parent" : "unknown",
    plan: account?.plan || null,
    starsBalance: isStudent
      ? studentSession!.starsBalance
      : account?.stars_balance || 0,
    isStudent,
    isLoading: authLoading,
    activeProfileId,
    profiles: psProfiles,
  }
}

export async function refreshProfile(): Promise<void> {
  if (typeof window === "undefined") return

  await useAuthStore.getState().checkSession()

  const age = await fetchAgeFromApi()
  if (age !== null) {
    externalAge = age
    notifyAgeListeners()
  }

  window.dispatchEvent(new CustomEvent("pb-profile-updated"))
}
