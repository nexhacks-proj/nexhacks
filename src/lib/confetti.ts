// Confetti effect for successful swipes (Material Design 3 inspired colors)

export function triggerConfetti() {
  // Dynamic import to avoid SSR issues
  if (typeof window === 'undefined') return

  // Use a try-catch wrapped dynamic import to handle missing package gracefully
  Promise.resolve().then(async () => {
    try {
      const confetti = await import('canvas-confetti')
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    // Material Design 3 primary colors
    const colors = [
      '#3f51b5', // Primary 500
      '#5c6bc0', // Primary 400
      '#7986cb', // Primary 300
      '#4caf50', // Success 500
      '#66bb6a', // Success 400
      '#ffc107', // Warning 500
    ]

    function fire(particleRatio: number, opts: any) {
      confetti.default({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors,
      })
    }

    // Create a celebration burst
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      angle: 60,
      origin: { x: 0.2, y: 0.7 },
    })

    fire(0.2, {
      spread: 60,
      startVelocity: 45,
      angle: 120,
      origin: { x: 0.8, y: 0.7 },
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.5, y: 0.8 },
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.7 },
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
    })
    } catch (error) {
      // Silently fail if package not installed yet
      // This allows the app to work without canvas-confetti
    }
  })
}
