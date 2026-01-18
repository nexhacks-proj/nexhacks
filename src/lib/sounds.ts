/**
 * Professional sound effects for swipe actions
 * Uses Web Audio API to generate clean, polished sound effects
 */

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.debug('Could not create audio context:', error)
      return null
    }
  }
  return audioContext
}

/**
 * Play a professional "reject" sound - smooth whoosh down
 */
export function playRejectSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const duration = 0.25 // 250ms
    const sampleRate = ctx.sampleRate
    const frameCount = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, frameCount, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate a smooth downward whoosh with noise
    for (let i = 0; i < frameCount; i++) {
      const t = i / frameCount
      const frequency = 600 * (1 - t * 0.7) // Descend from 600Hz to 180Hz
      const noise = (Math.random() * 2 - 1) * 0.1
      const envelope = Math.pow(1 - t, 1.5) // Exponential fade
      data[i] = (Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3 + noise) * envelope * 0.4
    }

    // Apply low-pass filter for smoothness
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800
    filter.Q.value = 1

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(filter)
    filter.connect(ctx.destination)
    source.start()
  } catch (error) {
    console.debug('Could not play reject sound:', error)
  }
}

/**
 * Play a professional "success" sound - pleasant ascending chime
 */
export function playSuccessSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const duration = 0.3 // 300ms
    const sampleRate = ctx.sampleRate
    const frameCount = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, frameCount, sampleRate)
    const data = buffer.getChannelData(0)

    // Create an ascending pleasant chime (major third interval)
    for (let i = 0; i < frameCount; i++) {
      const t = i / frameCount
      const freq1 = 523.25 + t * 130.81 // C5 to E5
      const freq2 = freq1 * 1.25 // Harmonic
      const envelope = Math.pow(1 - t, 0.8) // Smooth fade
      const wave1 = Math.sin(2 * Math.PI * freq1 * i / sampleRate)
      const wave2 = Math.sin(2 * Math.PI * freq2 * i / sampleRate)
      data[i] = (wave1 * 0.6 + wave2 * 0.4) * envelope * 0.25
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start()
  } catch (error) {
    console.debug('Could not play success sound:', error)
  }
}

/**
 * Play a subtle "star" sound - gentle twinkle
 */
export function playStarSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const duration = 0.2 // 200ms
    const sampleRate = ctx.sampleRate
    const frameCount = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, frameCount, sampleRate)
    const data = buffer.getChannelData(0)

    // Create a gentle twinkle with harmonics
    for (let i = 0; i < frameCount; i++) {
      const t = i / frameCount
      const frequency = 880 + Math.sin(t * Math.PI * 4) * 50 // Slight vibrato
      const envelope = Math.pow(1 - t, 2) // Quick fade
      const wave1 = Math.sin(2 * Math.PI * frequency * i / sampleRate)
      const wave2 = Math.sin(2 * Math.PI * frequency * 2 * i / sampleRate) * 0.3
      data[i] = (wave1 + wave2) * envelope * 0.2
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start()
  } catch (error) {
    console.debug('Could not play star sound:', error)
  }
}

/**
 * Play a subtle "undo" sound - quick reverse beep
 */
export function playUndoSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const duration = 0.15 // 150ms
    const sampleRate = ctx.sampleRate
    const frameCount = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, frameCount, sampleRate)
    const data = buffer.getChannelData(0)

    // Quick reverse chirp
    for (let i = 0; i < frameCount; i++) {
      const t = i / frameCount
      const frequency = 400 * (1.5 - t * 0.5) // Descend from 600Hz to 400Hz
      const envelope = Math.pow(1 - t, 1.2)
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * envelope * 0.15
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start()
  } catch (error) {
    console.debug('Could not play undo sound:', error)
  }
}
