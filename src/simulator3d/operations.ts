import type { ManoeuvreState, VesselLoadState } from '../simulation/state'
import type { VesselParameters } from '../simulation/vessel-parameters'
import type { P5HarbourScenario } from './rotterdam'

export type BerthingMetrics = {
  longitudinalErrorUnits: number
  lateralErrorUnits: number
  headingErrorDeg: number
  longitudinalSpeedMps: number
  lateralSpeedMps: number
  yawRateDegPerSec: number
}

export type HarbourOperationState = {
  collisions: number
  damage: number
  docked: boolean
  contactActive: boolean
  berthStableSeconds: number
  message: string
  lastBerthingMetrics?: BerthingMetrics
}

export const initialHarbourOperationState = (): HarbourOperationState => ({
  collisions: 0,
  damage: 0,
  docked: false,
  contactActive: false,
  berthStableSeconds: 0,
  message: 'Approach berth',
})

const pointInBox = (x: number, z: number, box: { x: number; z: number; length: number; width: number }, margin = 0) =>
  Math.abs(x - box.x) <= box.length / 2 + margin && Math.abs(z - box.z) <= box.width / 2 + margin
const angleDelta = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
const d2 = (ax: number, az: number, bx: number, bz: number) => (ax - bx) ** 2 + (az - bz) ** 2
const world = (s: ManoeuvreState, sc: P5HarbourScenario) => ({ x: sc.spawn.x + s.x * sc.renderScale, z: sc.spawn.z + s.y * sc.renderScale })

function hullSamples(s: ManoeuvreState, sc: P5HarbourScenario, v: VesselParameters) {
  const p = world(s, sc)
  const halfL = Math.max(3.2, v.lengthMeters / 36)
  const halfB = Math.max(1.05, v.beamMeters / 24)
  const c = Math.cos(s.heading)
  const q = Math.sin(s.heading)
  const local: Array<[number, number]> = [
    [halfL, 0],
    [-halfL, 0],
    [halfL * .68, -halfB],
    [halfL * .68, halfB],
    [0, -halfB],
    [0, halfB],
    [-halfL * .68, -halfB],
    [-halfL * .68, halfB],
  ]
  return local.map(([lx, lz]) => ({ x: p.x + lx * c - lz * q, z: p.z + lx * q + lz * c }))
}

function groundVelocity(state: ManoeuvreState, previous: ManoeuvreState) {
  const dt = state.elapsed - previous.elapsed
  if (dt > 1e-6) return { x: (state.x - previous.x) / dt, z: (state.y - previous.y) / dt, dt }
  const c = Math.cos(state.heading)
  const q = Math.sin(state.heading)
  return {
    x: state.surge * c - state.sway * q,
    z: state.surge * q + state.sway * c,
    dt: 1 / 30,
  }
}

function berthingMetrics(state: ManoeuvreState, previous: ManoeuvreState, scenario: P5HarbourScenario): BerthingMetrics {
  const p = world(state, scenario)
  const dx = p.x - scenario.berth.x
  const dz = p.z - scenario.berth.z
  const c = Math.cos(scenario.berth.heading)
  const q = Math.sin(scenario.berth.heading)
  const velocity = groundVelocity(state, previous)
  return {
    longitudinalErrorUnits: Math.abs(dx * c + dz * q),
    lateralErrorUnits: Math.abs(-dx * q + dz * c),
    headingErrorDeg: angleDelta(state.heading, scenario.berth.heading) * 180 / Math.PI,
    longitudinalSpeedMps: velocity.x * c + velocity.z * q,
    lateralSpeedMps: -velocity.x * q + velocity.z * c,
    yawRateDegPerSec: Math.abs(state.yawRate * 180 / Math.PI),
  }
}

function contact(
  state: ManoeuvreState,
  previous: ManoeuvreState,
  vessel: VesselParameters,
  scenario: P5HarbourScenario,
) {
  const now = hullSamples(state, scenario, vessel)
  const prev = hullSamples(previous, scenario, vessel)
  const swept = now.flatMap((p, i) => [p, { x: (p.x + prev[i].x) / 2, z: (p.z + prev[i].z) / 2 }, prev[i]])
  const velocity = groundVelocity(state, previous)

  for (const quay of scenario.quays) {
    if (!swept.some(p => pointInBox(p.x, p.z, quay, .12))) continue
    const normalSpeed = quay.length >= quay.width ? Math.abs(velocity.z) : Math.abs(velocity.x)
    return { kind: 'quay' as const, normalSpeed }
  }

  for (const buoy of scenario.buoys) {
    if (!swept.some(p => d2(p.x, p.z, buoy.x, buoy.z) <= (buoy.radius + .62) ** 2)) continue
    return { kind: 'buoy' as const, normalSpeed: Math.hypot(velocity.x, velocity.z) }
  }
  return null
}

function quayDamage(normalSpeed: number, load: VesselLoadState) {
  if (normalSpeed <= .10) return 0
  const massScale = Math.max(.5, load.displacementTonnes / 18000)
  return Math.min(18, Math.max(.2, (normalSpeed / .10) ** 2 * .18 * massScale))
}

function approachMessage(metrics: BerthingMetrics, scenario: P5HarbourScenario) {
  if (metrics.longitudinalErrorUnits > scenario.berth.length * .38 || metrics.lateralErrorUnits > scenario.berth.width * .45) return 'Move into berth window'
  if (metrics.headingErrorDeg > 3) return `Parallelize vessel · ${metrics.headingErrorDeg.toFixed(1)}° error`
  if (Math.abs(metrics.lateralSpeedMps) > .10) return `Check lateral speed · ${Math.abs(metrics.lateralSpeedMps).toFixed(2)} m/s`
  if (Math.abs(metrics.longitudinalSpeedMps) > .20) return `Reduce longitudinal speed · ${Math.abs(metrics.longitudinalSpeedMps).toFixed(2)} m/s`
  if (metrics.yawRateDegPerSec > .15) return `Stop rotation · ${metrics.yawRateDegPerSec.toFixed(2)}°/s`
  return 'Hold berth position'
}

export function evaluateHarbourOperation(
  state: ManoeuvreState,
  previous: ManoeuvreState,
  vessel: VesselParameters,
  load: VesselLoadState,
  scenario: P5HarbourScenario,
  operation: HarbourOperationState,
): { state: ManoeuvreState; operation: HarbourOperationState } {
  if (operation.docked) return { state, operation }

  const contactResult = contact(state, previous, vessel, scenario)
  let workingOperation = operation

  if (contactResult?.kind === 'quay') {
    if (contactResult.normalSpeed <= .10) {
      workingOperation = {
        ...workingOperation,
        contactActive: true,
        message: `Controlled fender contact · ${contactResult.normalSpeed.toFixed(2)} m/s`,
      }
    } else if (operation.contactActive) {
      return {
        state: { ...previous, surge: previous.surge * -.05, sway: previous.sway * -.12, yawRate: previous.yawRate * .35 },
        operation,
      }
    } else {
      const impact = quayDamage(contactResult.normalSpeed, load)
      const hardBerthing = contactResult.normalSpeed <= .30
      const rebound = hardBerthing ? .05 : .12
      return {
        state: {
          ...previous,
          surge: -previous.surge * rebound,
          sway: -previous.sway * rebound,
          yawRate: previous.yawRate * .3,
          condition: Math.max(0, previous.condition - impact),
        },
        operation: {
          ...operation,
          contactActive: true,
          berthStableSeconds: 0,
          collisions: operation.collisions + 1,
          damage: operation.damage + impact,
          message: `${hardBerthing ? 'Hard berthing' : 'Quay collision'} · ${contactResult.normalSpeed.toFixed(2)} m/s · damage ${impact.toFixed(1)}%`,
        },
      }
    }
  } else if (contactResult?.kind === 'buoy') {
    if (operation.contactActive) return { state: previous, operation }
    const massImpact = Math.max(1, contactResult.normalSpeed * load.displacementTonnes / 5500)
    const impact = Math.min(4, .35 + massImpact * .22)
    return {
      state: {
        ...previous,
        surge: -previous.surge * .20,
        sway: -previous.sway * .20,
        yawRate: previous.yawRate * .3,
        condition: Math.max(0, previous.condition - impact),
      },
      operation: {
        ...operation,
        contactActive: true,
        berthStableSeconds: 0,
        collisions: operation.collisions + 1,
        damage: operation.damage + impact,
        message: `Navigation buoy struck · damage ${impact.toFixed(1)}%`,
      },
    }
  } else if (operation.contactActive) {
    workingOperation = { ...operation, contactActive: false }
  }

  const metrics = berthingMetrics(state, previous, scenario)
  const positionOk = metrics.longitudinalErrorUnits <= scenario.berth.length * .38 && metrics.lateralErrorUnits <= scenario.berth.width * .45
  const headingOk = metrics.headingErrorDeg <= 3
  const longitudinalOk = Math.abs(metrics.longitudinalSpeedMps) <= .20
  const lateralOk = Math.abs(metrics.lateralSpeedMps) <= .10
  const yawOk = metrics.yawRateDegPerSec <= .15
  const stable = positionOk && headingOk && longitudinalOk && lateralOk && yawOk
  const dt = Math.max(1 / 30, state.elapsed - previous.elapsed)
  const berthStableSeconds = stable ? (workingOperation.berthStableSeconds ?? 0) + dt : 0

  if (berthStableSeconds >= 3) {
    return {
      state: { ...state, surge: 0, sway: 0, yawRate: 0 },
      operation: {
        ...workingOperation,
        berthStableSeconds,
        docked: true,
        lastBerthingMetrics: metrics,
        message: 'Berth secured · stable for 3.0 s',
      },
    }
  }

  return {
    state,
    operation: {
      ...workingOperation,
      berthStableSeconds,
      lastBerthingMetrics: metrics,
      message: stable ? `Berth stable ${berthStableSeconds.toFixed(1)} / 3.0 s` : approachMessage(metrics, scenario),
    },
  }
}
