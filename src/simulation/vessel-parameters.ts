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

  surgeDragLinear: number
  surgeDragQuadratic: number
  swayDragLinear: number
  swayDragQuadratic: number
  yawDragLinear: number
  yawDragQuadratic: number
  swayYawCoupling: number
  yawSwayCoupling: number
  yawInertia: number

  rudderForceFactor: number
  rudderLeverArm: number
  rudderSwayFactor: number
  propWashFactor: number
  asternRudderWashFactor: number
  rudderFlowCap: number

  propWalk: number
  windage: number

  engineResponseAheadSeconds: number
  engineResponseAsternSeconds: number
  engineResponseStopSeconds: number
  engineReversalDelaySeconds: number
}

export const VESSEL_PARAMETERS: Record<SimulationVesselClass, VesselParameters> = {
  coaster: {
    classId: 'coaster', lengthMeters: 105, beamMeters: 16, lightshipTonnes: 3500, deadweightTonnes: 8000,
    designDraftMeters: 5.4, aheadThrust: 2.6, reverseThrustFactor: .72,
    surgeDragLinear: .012, surgeDragQuadratic: .042,
    swayDragLinear: .085, swayDragQuadratic: .080,
    yawDragLinear: .17, yawDragQuadratic: .13, swayYawCoupling: .045, yawSwayCoupling: .040, yawInertia: 1.0,
    rudderForceFactor: .34, rudderLeverArm: 1.00, rudderSwayFactor: .30, propWashFactor: .74, asternRudderWashFactor: .24, rudderFlowCap: 2.0,
    propWalk: .16, windage: .65,
    engineResponseAheadSeconds: 3.5, engineResponseAsternSeconds: 4.5, engineResponseStopSeconds: 2.8, engineReversalDelaySeconds: 1.5,
  },
  handysize: {
    classId: 'handysize', lengthMeters: 155, beamMeters: 24, lightshipTonnes: 7800, deadweightTonnes: 18000,
    designDraftMeters: 8.2, aheadThrust: 2.25, reverseThrustFactor: .66,
    surgeDragLinear: .010, surgeDragQuadratic: .036,
    swayDragLinear: .072, swayDragQuadratic: .068,
    yawDragLinear: .145, yawDragQuadratic: .105, swayYawCoupling: .040, yawSwayCoupling: .036, yawInertia: 1.65,
    rudderForceFactor: .30, rudderLeverArm: .94, rudderSwayFactor: .32, propWashFactor: .70, asternRudderWashFactor: .22, rudderFlowCap: 2.0,
    propWalk: .19, windage: .78,
    engineResponseAheadSeconds: 5.0, engineResponseAsternSeconds: 6.5, engineResponseStopSeconds: 3.8, engineReversalDelaySeconds: 2.3,
  },
  feeder: {
    classId: 'feeder', lengthMeters: 185, beamMeters: 29, lightshipTonnes: 11000, deadweightTonnes: 26000,
    designDraftMeters: 9.8, aheadThrust: 2.15, reverseThrustFactor: .62,
    surgeDragLinear: .009, surgeDragQuadratic: .032,
    swayDragLinear: .062, swayDragQuadratic: .058,
    yawDragLinear: .125, yawDragQuadratic: .092, swayYawCoupling: .036, yawSwayCoupling: .032, yawInertia: 2.15,
    rudderForceFactor: .27, rudderLeverArm: .90, rudderSwayFactor: .34, propWashFactor: .66, asternRudderWashFactor: .20, rudderFlowCap: 1.95,
    propWalk: .17, windage: 1.18,
    engineResponseAheadSeconds: 6.0, engineResponseAsternSeconds: 7.5, engineResponseStopSeconds: 4.5, engineReversalDelaySeconds: 2.7,
  },
  panamax: {
    classId: 'panamax', lengthMeters: 225, beamMeters: 32.2, lightshipTonnes: 18000, deadweightTonnes: 52000,
    designDraftMeters: 12.0, aheadThrust: 1.72, reverseThrustFactor: .48,
    surgeDragLinear: .008, surgeDragQuadratic: .027,
    swayDragLinear: .052, swayDragQuadratic: .050,
    yawDragLinear: .105, yawDragQuadratic: .080, swayYawCoupling: .032, yawSwayCoupling: .028, yawInertia: 3.15,
    rudderForceFactor: .24, rudderLeverArm: .86, rudderSwayFactor: .36, propWashFactor: .60, asternRudderWashFactor: .18, rudderFlowCap: 1.90,
    propWalk: .14, windage: 1.02,
    engineResponseAheadSeconds: 8.0, engineResponseAsternSeconds: 10.0, engineResponseStopSeconds: 5.5, engineReversalDelaySeconds: 3.5,
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
