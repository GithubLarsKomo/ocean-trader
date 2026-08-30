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
    { id: 'port-1', x: -12, z: -4.5, radius: .7, side: 'port' },
    { id: 'starboard-1', x: -12, z: 11.5, radius: .7, side: 'starboard' },
    { id: 'port-2', x: 3, z: -4.5, radius: .7, side: 'port' },
    { id: 'starboard-2', x: 3, z: 11.5, radius: .7, side: 'starboard' },
    { id: 'port-3', x: 16, z: -4.5, radius: .7, side: 'port' },
    { id: 'starboard-3', x: 16, z: 11.5, radius: .7, side: 'starboard' },
  ],
}
