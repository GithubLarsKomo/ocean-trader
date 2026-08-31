export type SimulationVesselClass = 'coaster' | 'handysize' | 'feeder' | 'panamax'
export type PropellerHandedness = 'left' | 'right'

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

  propellerHandedness: PropellerHandedness
  propWalkStrength: number
  propWalkLeverArm: number
  propWalkAheadFactor: number
  propWalkSpeedDecay: number

  bowThrusterForce: number
  bowThrusterLeverArm: number
  bowThrusterCutoffKnots: number

  windage: number

  engineResponseAheadSeconds: number
  engineResponseAsternSeconds: number
  engineResponseStopSeconds: number
  engineReversalDelaySeconds: number
}

/**
 * P5.3-D calibration rule:
 * Handysize is the low-speed reference vessel. Coaster is deliberately more
 * agile, Feeder more inert and wind-sensitive, and Panamax materially slower
 * to accelerate, stop and yaw. Values remain gameplay-scale coefficients,
 * not hydrodynamic derivatives from a specific real ship.
 */
export const VESSEL_PARAMETERS: Record<SimulationVesselClass, VesselParameters> = {
  coaster: {
    classId: 'coaster', lengthMeters: 105, beamMeters: 16, lightshipTonnes: 3500, deadweightTonnes: 8000,
    designDraftMeters: 5.4, aheadThrust: 2.8, reverseThrustFactor: .72,
    surgeDragLinear: .012, surgeDragQuadratic: .042,
    swayDragLinear: .085, swayDragQuadratic: .080,
    yawDragLinear: .17, yawDragQuadratic: .13, swayYawCoupling: .045, yawSwayCoupling: .040, yawInertia: 1.0,
    rudderForceFactor: .0034, rudderLeverArm: 1.00, rudderSwayFactor: .30, propWashFactor: .74, asternRudderWashFactor: .24, rudderFlowCap: 2.0,
    propellerHandedness: 'right', propWalkStrength: .00066, propWalkLeverArm: 7.3, propWalkAheadFactor: .020, propWalkSpeedDecay: .34,
    bowThrusterForce: .014, bowThrusterLeverArm: 1.18, bowThrusterCutoffKnots: 5,
    windage: .65,
    engineResponseAheadSeconds: 3.5, engineResponseAsternSeconds: 4.5, engineResponseStopSeconds: 2.8, engineReversalDelaySeconds: 1.5,
  },
  handysize: {
    classId: 'handysize', lengthMeters: 155, beamMeters: 24, lightshipTonnes: 7800, deadweightTonnes: 18000,
    designDraftMeters: 8.2, aheadThrust: 2.25, reverseThrustFactor: .66,
    surgeDragLinear: .010, surgeDragQuadratic: .036,
    swayDragLinear: .072, swayDragQuadratic: .068,
    yawDragLinear: .145, yawDragQuadratic: .105, swayYawCoupling: .040, yawSwayCoupling: .036, yawInertia: 1.65,
    rudderForceFactor: .0030, rudderLeverArm: .94, rudderSwayFactor: .32, propWashFactor: .70, asternRudderWashFactor: .22, rudderFlowCap: 2.0,
    propellerHandedness: 'right', propWalkStrength: .00075, propWalkLeverArm: 7.8, propWalkAheadFactor: .015, propWalkSpeedDecay: .32,
    bowThrusterForce: .016, bowThrusterLeverArm: 1.28, bowThrusterCutoffKnots: 5,
    windage: .78,
    engineResponseAheadSeconds: 5.0, engineResponseAsternSeconds: 6.5, engineResponseStopSeconds: 3.8, engineReversalDelaySeconds: 2.3,
  },
  feeder: {
    classId: 'feeder', lengthMeters: 185, beamMeters: 29, lightshipTonnes: 11000, deadweightTonnes: 26000,
    designDraftMeters: 9.8, aheadThrust: 2.15, reverseThrustFactor: .62,
    surgeDragLinear: .009, surgeDragQuadratic: .032,
    swayDragLinear: .062, swayDragQuadratic: .058,
    yawDragLinear: .125, yawDragQuadratic: .092, swayYawCoupling: .036, yawSwayCoupling: .032, yawInertia: 2.15,
    rudderForceFactor: .0027, rudderLeverArm: .90, rudderSwayFactor: .34, propWashFactor: .66, asternRudderWashFactor: .20, rudderFlowCap: 1.95,
    propellerHandedness: 'right', propWalkStrength: .000645, propWalkLeverArm: 7.9, propWalkAheadFactor: .012, propWalkSpeedDecay: .30,
    bowThrusterForce: .018, bowThrusterLeverArm: 1.34, bowThrusterCutoffKnots: 5,
    windage: 1.35,
    engineResponseAheadSeconds: 6.0, engineResponseAsternSeconds: 7.5, engineResponseStopSeconds: 4.5, engineReversalDelaySeconds: 2.7,
  },
  panamax: {
    classId: 'panamax', lengthMeters: 225, beamMeters: 32.2, lightshipTonnes: 18000, deadweightTonnes: 52000,
    designDraftMeters: 12.0, aheadThrust: 1.72, reverseThrustFactor: .48,
    surgeDragLinear: .008, surgeDragQuadratic: .027,
    swayDragLinear: .052, swayDragQuadratic: .050,
    yawDragLinear: .105, yawDragQuadratic: .080, swayYawCoupling: .032, yawSwayCoupling: .028, yawInertia: 3.15,
    rudderForceFactor: .0024, rudderLeverArm: .86, rudderSwayFactor: .36, propWashFactor: .60, asternRudderWashFactor: .18, rudderFlowCap: 1.90,
    propellerHandedness: 'right', propWalkStrength: .000525, propWalkLeverArm: 8.0, propWalkAheadFactor: .010, propWalkSpeedDecay: .27,
    bowThrusterForce: .020, bowThrusterLeverArm: 1.40, bowThrusterCutoffKnots: 5,
    windage: 1.02,
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
