export type RudderSide = 'PORT' | 'MID' | 'STBD'

const clamp = (value: number) => Math.max(-1, Math.min(1, value))

/**
 * Bridge convention used everywhere in the P5.3 UI:
 * negative = PORT, positive = STBD, zero = MIDSHIPS.
 *
 * CSS rotates in screen coordinates while Babylon's vessel rudder rotates in
 * scene coordinates, so the two visual transforms intentionally have opposite
 * mathematical signs while representing the same physical rudder direction.
 */
export function rudderPresentation(command: number) {
  const normalized = clamp(command)
  const angleDeg = normalized * 35
  const side: RudderSide = Math.abs(normalized) < .025 ? 'MID' : normalized < 0 ? 'PORT' : 'STBD'
  const magnitudeDeg = Math.round(Math.abs(angleDeg))

  return {
    normalized,
    side,
    magnitudeDeg,
    label: side === 'MID' ? 'MID' : `${side} ${magnitudeDeg}°`,
    cssRotationDeg: -angleDeg,
    meshRotationRad: angleDeg * Math.PI / 180,
  }
}
