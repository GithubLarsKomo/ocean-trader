export type ShipAudio = {
  enabled: boolean
  enable(): Promise<void>
  setMotion(throttle: number, speed: number): void
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
        master.gain.value = .42
        master.connect(ctx.destination)

        engineOsc = ctx.createOscillator()
        engineOsc.type = 'sawtooth'
        engineGain = ctx.createGain()
        engineGain.gain.value = 0
        const engineFilter = ctx.createBiquadFilter()
        engineFilter.type = 'lowpass'
        engineFilter.frequency.value = 180
        engineOsc.connect(engineFilter).connect(engineGain).connect(master)
        engineOsc.start()

        washOsc = ctx.createOscillator()
        washOsc.type = 'triangle'
        washGain = ctx.createGain()
        washGain.gain.value = 0
        const washFilter = ctx.createBiquadFilter()
        washFilter.type = 'bandpass'
        washFilter.frequency.value = 520
        washFilter.Q.value = .8
        washOsc.connect(washFilter).connect(washGain).connect(master)
        washOsc.start()
      }
      await ctx.resume()
      api.enabled = true
    },
    setMotion(throttle, speed) {
      if (!ctx || !engineOsc || !engineGain || !washOsc || !washGain || !api.enabled) return
      const now = ctx.currentTime
      const load = Math.min(1, Math.abs(throttle))
      engineOsc.frequency.setTargetAtTime(34 + load * 54, now, .15)
      engineGain.gain.setTargetAtTime(.02 + load * .14, now, .18)
      washOsc.frequency.setTargetAtTime(150 + Math.min(8, speed) * 32, now, .2)
      washGain.gain.setTargetAtTime(Math.min(.09, speed * .012), now, .2)
    },
    collision(kind) {
      if (!ctx || !master || !api.enabled) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = kind === 'quay' ? 'square' : 'triangle'
      osc.frequency.setValueAtTime(kind === 'quay' ? 82 : 210, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(kind === 'quay' ? 42 : 90, ctx.currentTime + .28)
      gain.gain.setValueAtTime(kind === 'quay' ? .35 : .14, ctx.currentTime)
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
