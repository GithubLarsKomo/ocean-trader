export type ScenarioZone = { x: number; z: number; length: number; width: number }

export type P5ScenarioGoal =
  | { type: 'berth'; stableSeconds: number }
  | { type: 'unberth'; exitZone: ScenarioZone; targetHeading: number; headingToleranceDeg: number; minSpeedMps: number; maxSpeedMps: number; stableSeconds: number }
  | { type: 'turning'; basin: ScenarioZone; targetHeading: number; headingToleranceDeg: number; maxSpeedMps: number; maxYawRateDegPerSec: number; stableSeconds: number }

export type P5HarbourScenario = {
  id: string
  name: string
  shortName: string
  instructions: string
  renderScale: number
  spawn: { x: number; z: number; heading: number }
  berth: { x: number; z: number; length: number; width: number; heading: number }
  showBerth?: boolean
  goal: P5ScenarioGoal
  quays: Array<{ x: number; z: number; length: number; width: number; height: number }>
  buoys: Array<{ id: string; x: number; z: number; radius: number; side: 'port' | 'starboard' }>
}

const QUAYS: P5HarbourScenario['quays'] = [
  { x: 25, z: -15, length: 44, width: 7, height: 2.5 },
  { x: 25, z: 16, length: 44, width: 7, height: 2.5 },
  { x: 47, z: .5, length: 7, width: 38, height: 2.5 },
]

const BUOYS: P5HarbourScenario['buoys'] = [
  { id: 'r1', x: -24, z: -10.5, radius: .55, side: 'port' },
  { id: 'g1', x: -24, z: 10.5, radius: .55, side: 'starboard' },
  { id: 'r2', x: -8, z: -10.5, radius: .55, side: 'port' },
  { id: 'g2', x: -8, z: 10.5, radius: .55, side: 'starboard' },
  { id: 'r3', x: 8, z: -10.5, radius: .55, side: 'port' },
  { id: 'g3', x: 8, z: 10.5, radius: .55, side: 'starboard' },
  { id: 'r4', x: 24, z: -10.5, radius: .55, side: 'port' },
  { id: 'g4', x: 24, z: 10.5, radius: .55, side: 'starboard' },
]

const BERTH = { x: 24, z: -7, length: 22, width: 5, heading: 0 }

export const ROTTERDAM_P5: P5HarbourScenario = {
  id: 'alongside',
  name: 'Rotterdam · Alongside Berthing',
  shortName: 'Alongside',
  instructions: 'Approach, parallelize and hold the berth envelope for 3 seconds.',
  renderScale: 10,
  spawn: { x: -34, z: 4, heading: 0 },
  berth: BERTH,
  showBerth: true,
  goal: { type: 'berth', stableSeconds: 3 },
  quays: QUAYS,
  buoys: BUOYS,
}

export const ROTTERDAM_UNBERTHING: P5HarbourScenario = {
  id: 'unberthing',
  name: 'Rotterdam · Unberthing',
  shortName: 'Unberth',
  instructions: 'Clear the quay, turn west and establish controlled outbound motion in the fairway.',
  renderScale: 10,
  // Start alongside but with a small fender clearance so the player must create separation.
  spawn: { x: 24, z: -10.25, heading: 0 },
  berth: BERTH,
  showBerth: true,
  goal: {
    type: 'unberth',
    exitZone: { x: 8, z: 0, length: 14, width: 12 },
    targetHeading: Math.PI,
    headingToleranceDeg: 25,
    minSpeedMps: .20,
    maxSpeedMps: 1.40,
    stableSeconds: 1.5,
  },
  quays: QUAYS,
  buoys: BUOYS,
}

export const ROTTERDAM_TURNING_BASIN: P5HarbourScenario = {
  id: 'turning',
  name: 'Rotterdam · Turning Basin',
  shortName: 'Turn 180°',
  instructions: 'Turn the Handysize through 180° inside the basin, arrest rotation and finish at low speed.',
  renderScale: 10,
  spawn: { x: -1, z: 0, heading: 0 },
  berth: BERTH,
  showBerth: false,
  goal: {
    type: 'turning',
    basin: { x: 7, z: 0, length: 30, width: 18 },
    targetHeading: Math.PI,
    headingToleranceDeg: 5,
    maxSpeedMps: .40,
    maxYawRateDegPerSec: .15,
    stableSeconds: 2,
  },
  quays: QUAYS,
  buoys: BUOYS,
}

export const ROTTERDAM_TRAINING_SCENARIOS = [ROTTERDAM_P5, ROTTERDAM_UNBERTHING, ROTTERDAM_TURNING_BASIN] as const

export function rotterdamScenario(id: string | null | undefined): P5HarbourScenario {
  return ROTTERDAM_TRAINING_SCENARIOS.find(scenario => scenario.id === id) ?? ROTTERDAM_P5
}
