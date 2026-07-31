let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioContext = new Ctor()
  }
  return audioContext
}

function playTone(ctx: AudioContext, frequency: number, start: number, duration: number, volume = 0.15) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + start)
  gain.gain.setValueAtTime(volume, ctx.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime + start)
  osc.stop(ctx.currentTime + start + duration)
}

export function playLevelUpSound(): void {
  const ctx = getContext()
  if (!ctx) return

  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => playTone(ctx, freq, i * 0.12, 0.35))
}

export function playUnlockSound(): void {
  const ctx = getContext()
  if (!ctx) return

  playTone(ctx, 880, 0, 0.15, 0.12)
  playTone(ctx, 1174.66, 0.12, 0.25, 0.12)
}
