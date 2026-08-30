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
  let engineLow: OscillatorNode | null = null
  let engineHigh: OscillatorNode | null = null
  let engineGain: GainNode | null = null
  let wash: AudioBufferSourceNode | null = null
  let washGain: GainNode | null = null

  const api: ShipAudio = {
    enabled: false,
    async enable() {
      if (!ctx) {
        ctx = new AudioContext()
        master = ctx.createGain()
        master.gain.value = .34
        master.connect(ctx.destination)

        engineGain = ctx.createGain(); engineGain.gain.value = 0
        const engineFilter = ctx.createBiquadFilter(); engineFilter.type = 'lowpass'; engineFilter.frequency.value = 155; engineFilter.Q.value = .65
        engineLow = ctx.createOscillator(); engineLow.type = 'sawtooth'; engineLow.frequency.value = 31
        engineHigh = ctx.createOscillator(); engineHigh.type = 'triangle'; engineHigh.frequency.value = 62
        const lowGain = ctx.createGain(); lowGain.gain.value = .85
        const highGain = ctx.createGain(); highGain.gain.value = .22
        engineLow.connect(lowGain).connect(engineFilter)
        engineHigh.connect(highGain).connect(engineFilter)
        engineFilter.connect(engineGain).connect(master)
        engineLow.start(); engineHigh.start()

        const frames = ctx.sampleRate * 2
        const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        let brown = 0
        for (let i = 0; i < frames; i += 1) {
          brown = (brown + (Math.random() * 2 - 1) * .035) * .985
          data[i] = Math.max(-1, Math.min(1, brown))
        }
        wash = ctx.createBufferSource(); wash.buffer = buffer; wash.loop = true
        washGain = ctx.createGain(); washGain.gain.value = 0
        const washFilter = ctx.createBiquadFilter(); washFilter.type = 'bandpass'; washFilter.frequency.value = 420; washFilter.Q.value = .55
        wash.connect(washFilter).connect(washGain).connect(master); wash.start()
      }
      await ctx.resume()
      api.enabled = true
      master?.gain.setTargetAtTime(.34, ctx.currentTime, .08)
    },
    disable() {
      api.enabled = false
      if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, .05)
    },
    setMotion(throttle, speedKnots) {
      if (!ctx || !engineLow || !engineHigh || !engineGain || !washGain || !api.enabled) return
      const now = ctx.currentTime
      const load = Math.min(1, Math.abs(throttle) / .55)
      const base = 29 + load * 28
      engineLow.frequency.setTargetAtTime(base, now, .2)
      engineHigh.frequency.setTargetAtTime(base * 2.03, now, .2)
      engineGain.gain.setTargetAtTime(.025 + load * .16, now, .22)
      washGain.gain.setTargetAtTime(Math.min(.15, .008 + speedKnots * .013), now, .28)
    },
    collision(kind) {
      if (!ctx || !master || !api.enabled) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter()
      osc.type = kind === 'quay' ? 'sawtooth' : 'triangle'
      osc.frequency.setValueAtTime(kind === 'quay' ? 74 : 190, now)
      osc.frequency.exponentialRampToValueAtTime(kind === 'quay' ? 34 : 72, now + .42)
      filter.type = 'lowpass'; filter.frequency.value = kind === 'quay' ? 320 : 620
      gain.gain.setValueAtTime(kind === 'quay' ? .45 : .20, now)
      gain.gain.exponentialRampToValueAtTime(.001, now + .45)
      osc.connect(filter).connect(gain).connect(master); osc.start(now); osc.stop(now + .46)
    },
    dispose() {
      api.enabled = false
      try { engineLow?.stop(); engineHigh?.stop(); wash?.stop() } catch {}
      void ctx?.close(); ctx = null
    },
  }
  return api
}
