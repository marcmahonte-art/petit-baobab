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

async function fetchFullProfileFromApi(): Promise<{ name: string; mascot: string; age: number | null } | null> {
  try {
    const res = await fetch("/api/student/profile")
    if (!res.ok) return null
    const data = await res.json()
    return {
      name: typeof data.name === "string" ? data.name.trim() : "",
      mascot: typeof data.mascot === "string" ? data.mascot : DEFAULT_MASCOT,
      age: typeof data.age === "number" ? data.age : null,
    }
  } catch {
    return null
  }
}

function getActiveProfileId(): string | null {
  return useAuthStore.getState().activeProfileId || useProfileStore.getState().activeProfileId
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

  const syncFromApi = useCallback(async () => {
    if (isStudent) return

    const profile = await fetchFullProfileFromApi()
    if (!profile) return

    if (profile.age !== null) {
      setAge(profile.age)
    } else {
      const stored = typeof window !== "undefined" ? localStorage.getItem("pb_child_age") : null
      setAge(stored ? Number(stored) : null)
    }

    const pid = getActiveProfileId()
    if (!pid) return

    useAuthStore.setState((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === pid ? { ...p, name: profile.name, mascot: profile.mascot as any } : p
      ),
    }))

    useProfileStore.setState((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === pid ? { ...p, name: profile.name, mascot: profile.mascot as any } : p
      ),
    }))
  }, [isStudent, setAge])

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      syncFromApi()
    }
  }, [syncFromApi])

  useEffect(() => {
    const handler = () => {
      syncFromApi()
    }
    window.addEventListener("pb-profile-updated", handler)
    return () => window.removeEventListener("pb-profile-updated", handler)
  }, [syncFromApi])

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

  const profile = await fetchFullProfileFromApi()
  if (profile) {
    if (profile.age !== null) {
      externalAge = profile.age
      notifyAgeListeners()
    }

    const pid = getActiveProfileId()
    if (pid) {
      useAuthStore.setState((state) => ({
        profiles: state.profiles.map((p) =>
          p.id === pid ? { ...p, name: profile.name, mascot: profile.mascot as any } : p
        ),
      }))

      useProfileStore.setState((state) => ({
        profiles: state.profiles.map((p) =>
          p.id === pid ? { ...p, name: profile.name, mascot: profile.mascot as any } : p
        ),
      }))
    }
  }

  window.dispatchEvent(new CustomEvent("pb-profile-updated"))
}
