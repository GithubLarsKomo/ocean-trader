export type P5HarbourScenario = {
  id: string
  name: string
  renderScale: number
  spawn: { x: number; z: number; heading: number }
  berth: { x: number; z: number; length: number; width: number; heading: number }
  quays: Array<{ x: number; z: number; length: number; width: number; height: number }>
  buoys: Array<{ id: string; x: number; z: number; radius: number; side: 'port' | 'starboard' }>
}

export const ROTTERDAM_P5: P5HarbourScenario = {
  id: 'rotterdam-p5',
  name: 'Rotterdam · Maasvlakte Training Basin',
  renderScale: 10,
  spawn: { x: -34, z: 4, heading: 0 },
  berth: { x: 24, z: -7, length: 22, width: 5, heading: 0 },
  quays: [
    { x: 25, z: -15, length: 44, width: 7, height: 2.5 },
    { x: 25, z: 16, length: 44, width: 7, height: 2.5 },
    { x: 47, z: .5, length: 7, width: 38, height: 2.5 },
  ],
  buoys: [
    { id: 'r1', x: -24, z: -10.5, radius: .55, side: 'port' },
    { id: 'g1', x: -24, z: 10.5, radius: .55, side: 'starboard' },
    { id: 'r2', x: -8, z: -10.5, radius: .55, side: 'port' },
    { id: 'g2', x: -8, z: 10.5, radius: .55, side: 'starboard' },
    { id: 'r3', x: 8, z: -10.5, radius: .55, side: 'port' },
    { id: 'g3', x: 8, z: 10.5, radius: .55, side: 'starboard' },
    { id: 'r4', x: 24, z: -10.5, radius: .55, side: 'port' },
    { id: 'g4', x: 24, z: 10.5, radius: .55, side: 'starboard' },
  ],
}
