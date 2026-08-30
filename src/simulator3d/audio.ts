export type ShipAudio = {
  enabled: boolean
  enable(): Promise<void>
  disable(): void
  setMotion(throttle: number, speedKnots: number): void
  collision(kind: 'buoy' | 'quay'): void
  dispose(): void
}

export function createShipAudio(): ShipAudio {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let engineOsc: OscillatorNode | null = null
  let engineGain: GainNode | null = null
  let washOsc: OscillatorNode | null = null
  let washGain: GainNode | null = null

  const api: ShipAudio = {
    enabled: false,
    async enable() {
      if (!ctx) {
        ctx = new AudioContext()
        master = ctx.createGain()
        master.gain.value = .38
        master.connect(ctx.destination)

        engineOsc = ctx.createOscillator()
        engineOsc.type = 'sawtooth'
        engineGain = ctx.createGain()
        engineGain.gain.value = 0
        const engineFilter = ctx.createBiquadFilter()
        engineFilter.type = 'lowpass'
        engineFilter.frequency.value = 170
        engineOsc.connect(engineFilter).connect(engineGain).connect(master)
        engineOsc.start()

        washOsc = ctx.createOscillator()
        washOsc.type = 'triangle'
        washGain = ctx.createGain()
        washGain.gain.value = 0
        const washFilter = ctx.createBiquadFilter()
        washFilter.type = 'bandpass'
        washFilter.frequency.value = 470
        washFilter.Q.value = .75
        washOsc.connect(washFilter).connect(washGain).connect(master)
        washOsc.start()
      }
      await ctx.resume()
      api.enabled = true
      master?.gain.setTargetAtTime(.38, ctx.currentTime, .06)
    },
    disable() {
      api.enabled = false
      if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, .05)
    },
    setMotion(throttle, speedKnots) {
      if (!ctx || !engineOsc || !engineGain || !washOsc || !washGain || !api.enabled) return
      const now = ctx.currentTime
      const load = Math.min(1, Math.abs(throttle) / .55)
      engineOsc.frequency.setTargetAtTime(33 + load * 52, now, .16)
      engineGain.gain.setTargetAtTime(.018 + load * .13, now, .18)
      washOsc.frequency.setTargetAtTime(150 + Math.min(10, speedKnots) * 28, now, .2)
      washGain.gain.setTargetAtTime(Math.min(.085, speedKnots * .009), now, .22)
    },
    collision(kind) {
      if (!ctx || !master || !api.enabled) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = kind === 'quay' ? 'square' : 'triangle'
      osc.frequency.setValueAtTime(kind === 'quay' ? 78 : 215, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(kind === 'quay' ? 40 : 95, ctx.currentTime + .28)
      gain.gain.setValueAtTime(kind === 'quay' ? .34 : .13, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .32)
      osc.connect(gain).connect(master)
      osc.start()
      osc.stop(ctx.currentTime + .34)
    },
    dispose() {
      api.enabled = false
      engineOsc?.stop()
      washOsc?.stop()
      void ctx?.close()
      ctx = null
    },
  }
  return api
}
