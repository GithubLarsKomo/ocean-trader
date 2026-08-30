export type SimulationVesselClass = 'coaster' | 'handysize' | 'feeder' | 'panamax'

export type VesselParameters = {
  classId: SimulationVesselClass
  lengthMeters: number
  beamMeters: number
  lightshipTonnes: number
  deadweightTonnes: number
  designDraftMeters: number
  aheadThrust: number
  reverseThrustFactor: number
  surgeDrag: number
  lateralDrag: number
  yawDrag: number
  yawInertia: number
  rudderAuthority: number
  propWalk: number
  windage: number
}

export const VESSEL_PARAMETERS: Record<SimulationVesselClass, VesselParameters> = {
  coaster: {
    classId: 'coaster', lengthMeters: 105, beamMeters: 16, lightshipTonnes: 3500, deadweightTonnes: 8000,
    designDraftMeters: 5.4, aheadThrust: 2.6, reverseThrustFactor: .72, surgeDrag: .042, lateralDrag: .18,
    yawDrag: .34, yawInertia: 1.0, rudderAuthority: 1.0, propWalk: .16, windage: .65,
  },
  handysize: {
    classId: 'handysize', lengthMeters: 155, beamMeters: 24, lightshipTonnes: 7800, deadweightTonnes: 18000,
    designDraftMeters: 8.2, aheadThrust: 2.25, reverseThrustFactor: .66, surgeDrag: .036, lateralDrag: .15,
    yawDrag: .30, yawInertia: 1.65, rudderAuthority: .78, propWalk: .19, windage: .78,
  },
  feeder: {
    classId: 'feeder', lengthMeters: 185, beamMeters: 29, lightshipTonnes: 11000, deadweightTonnes: 26000,
    designDraftMeters: 9.8, aheadThrust: 2.15, reverseThrustFactor: .62, surgeDrag: .032, lateralDrag: .13,
    yawDrag: .27, yawInertia: 2.15, rudderAuthority: .68, propWalk: .17, windage: 1.18,
  },
  panamax: {
    classId: 'panamax', lengthMeters: 225, beamMeters: 32.2, lightshipTonnes: 18000, deadweightTonnes: 52000,
    designDraftMeters: 12.0, aheadThrust: 1.92, reverseThrustFactor: .56, surgeDrag: .027, lateralDrag: .11,
    yawDrag: .23, yawInertia: 3.15, rudderAuthority: .54, propWalk: .14, windage: 1.02,
  },
}

export function loadState(parameters: VesselParameters, cargoLoadRatio: number) {
  const ratio = Math.max(0, Math.min(1, cargoLoadRatio))
  const displacementTonnes = parameters.lightshipTonnes + parameters.deadweightTonnes * ratio
  const lightDraft = parameters.designDraftMeters * .55
  return {
    cargoLoadRatio: ratio,
    displacementTonnes,
    draftMeters: lightDraft + (parameters.designDraftMeters - lightDraft) * ratio,
    trim: 0,
  }
}
