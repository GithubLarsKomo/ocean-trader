import './p5.css'
import { FIXED_DT, stepManoeuvre } from '../simulation/engine'
import { calmEnvironment, initialManoeuvreState, type ManoeuvreInput } from '../simulation/state'
import { loadState as simulationLoadState, VESSEL_PARAMETERS } from '../simulation/vessel-parameters'
import { createShipAudio } from './audio'
import { clearHarbourAttempt, loadHarbourAttempt, saveHarbourAttempt } from './attempt'
import { loadCampaignArrival, settleCampaignArrival, simulationLoadForArrival } from './campaign'
import { evaluateHarbourOperation, initialHarbourOperationState } from './operations'
import { ROTTERDAM_P5 } from './rotterdam'
import { createP5Scene } from './scene'

const canvas = document.querySelector<HTMLCanvasElement>('#p5-canvas')
if (!canvas) throw new Error('P5 canvas missing')

const vesselId = new URLSearchParams(window.location.search).get('vessel')
const arrival = vesselId ? loadCampaignArrival(localStorage, vesselId) : null
const vessel = arrival ? VESSEL_PARAMETERS[arrival.vesselClass] : VESSEL_PARAMETERS.handysize
const load = arrival ? simulationLoadForArrival(arrival) : simulationLoadState(vessel, .6)
const sim = createP5Scene(canvas, ROTTERDAM_P5)
const audio = createShipAudio()
const savedAttempt = arrival ? loadHarbourAttempt(sessionStorage, arrival.vesselId) : null
let state = savedAttempt?.state ?? initialManoeuvreState(arrival?.initialCondition ?? 100)
let operation = savedAttempt?.operation ?? initialHarbourOperationState()
let input: ManoeuvreInput = savedAttempt?.input ?? { throttle: 0, rudder: 0 }
let uiRudder = input.rudder
let accumulator = 0
let previous = performance.now()
let campaignSettled = false
let persistenceTicks = 0
let audibleCollisionCount = operation.collisions

const q = (selector: string) => document.querySelector<HTMLElement>(selector)
const headingEl = q('[data-hdg]')
const speedEl = q('[data-sog]')
const rotEl = q('[data-rot]')
const rudderEl = q('[data-rudder]')
const engineEl = q('[data-engine]')
const draftEl = q('[data-draft]')
const conditionEl = q('[data-condition]')
const statusEl = q('[data-status]')
const contextEl = q('[data-context]')
const rudderVisual = q('[data-rudder-visual]')
const soundButton = document.querySelector<HTMLButtonElement>('[data-sound]')
const returnButton = document.querySelector<HTMLButtonElement>('[data-return-campaign]')

if (contextEl) contextEl.textContent = arrival ? `${arrival.vesselName} · destination ${arrival.destination} · ${(arrival.loadRatio * 100).toFixed(0)}% load` : 'Training · 60% Handysize'
if (returnButton) {
  returnButton.hidden = !arrival
  returnButton.disabled = true
  returnButton.addEventListener('click', () => { window.location.href = '/' })
}

const engineOrders: Array<[string, number]> = [
  ['FULL ASTERN', -.55], ['HALF ASTERN', -.30], ['SLOW ASTERN', -.15], ['STOP', 0],
  ['SLOW AHEAD', .12], ['HALF AHEAD', .30], ['FULL AHEAD', .55],
]

async function ensureSound() {
  if (audio.enabled) return
  await audio.enable()
  soundButton?.classList.add('active')
  if (soundButton) soundButton.textContent = 'SOUND ON'
}

function persistAttempt() {
  if (!arrival || campaignSettled) return
  saveHarbourAttempt(sessionStorage, { version: 1, vesselId: arrival.vesselId, state, operation, input })
}

document.querySelectorAll<HTMLButtonElement>('[data-engine-order]').forEach(button => button.addEventListener('click', () => {
  const order = engineOrders.find(([name]) => name === button.dataset.engineOrder)
  if (!order || operation.docked) return
  void ensureSound()
  input = { ...input, throttle: order[1] }
  persistAttempt()
  document.querySelectorAll('[data-engine-order]').forEach(el => el.classList.remove('active'))
  button.classList.add('active')
}))

const rudder = document.querySelector<HTMLInputElement>('#rudder')
if (rudder) {
  rudder.value = String(uiRudder)
  rudder.addEventListener('input', () => {
    if (operation.docked) return
    void ensureSound()
    uiRudder = Number(rudder.value)
    // Helm convention: PORT is negative, STBD is positive. In the renderer
    // positive yaw is a visible clockwise/starboard turn, so no sign flip is needed.
    input = { ...input, rudder: uiRudder }
    persistAttempt()
  })
}

soundButton?.addEventListener('click', async () => {
  if (audio.enabled) {
    audio.disable()
    soundButton.classList.remove('active')
    soundButton.textContent = 'SOUND OFF'
  } else await ensureSound()
})

document.querySelectorAll<HTMLButtonElement>('[data-camera]').forEach(button => button.addEventListener('click', () => {
  const camera = button.dataset.camera
  sim.setCamera(camera === 'bridge' ? 'bridge' : camera === 'tactical' ? 'tactical' : 'chase')
  document.querySelectorAll('[data-camera]').forEach(el => el.classList.remove('active'))
  button.classList.add('active')
}))

function reset() {
  if (campaignSettled) return
  const retainedCondition = state.condition
  const retainedDamage = operation.damage
  const retainedCollisions = operation.collisions
  state = initialManoeuvreState(retainedCondition)
  operation = { ...initialHarbourOperationState(), damage: retainedDamage, collisions: retainedCollisions, message: retainedCollisions ? `Repositioned · ${retainedDamage.toFixed(1)}% damage retained` : 'Approach berth' }
  input = { throttle: 0, rudder: 0 }
  uiRudder = 0
  audibleCollisionCount = retainedCollisions
  if (rudder) rudder.value = '0'
  document.querySelectorAll('[data-engine-order]').forEach(el => el.classList.remove('active'))
  document.querySelector<HTMLButtonElement>('[data-engine-order="STOP"]')?.classList.add('active')
  persistAttempt()
}
document.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', reset)

function settleIfDocked() {
  if (!arrival || !operation.docked || campaignSettled) return
  settleCampaignArrival(localStorage, arrival.vesselId, state.condition)
  clearHarbourAttempt(sessionStorage, arrival.vesselId)
  campaignSettled = true
  operation = { ...operation, message: `${arrival.vesselName} secured · campaign settlement saved` }
  if (returnButton) returnButton.disabled = false
}

function renderHud() {
  const headingDeg = ((state.heading * 180 / Math.PI) % 360 + 360) % 360
  const speedKnots = Math.hypot(state.surge, state.sway) * 1.94
  const rudderDeg = Math.round(Math.abs(uiRudder) * 35)
  const rudderSide = Math.abs(uiRudder) < .025 ? 'MID' : uiRudder < 0 ? 'PORT' : 'STBD'
  if (headingEl) headingEl.textContent = `${headingDeg.toFixed(0).padStart(3, '0')}°`
  if (speedEl) speedEl.textContent = `${speedKnots.toFixed(1)} kn`
  if (rotEl) rotEl.textContent = `${(state.yawRate * 180 / Math.PI * 60).toFixed(1)}°/min`
  if (rudderEl) rudderEl.textContent = rudderSide === 'MID' ? 'MID' : `${rudderSide} ${rudderDeg}°`
  if (rudderVisual) rudderVisual.style.transform = `rotate(${uiRudder * 35}deg)`
  if (engineEl) engineEl.textContent = engineOrders.reduce((best, item) => Math.abs(item[1] - input.throttle) < Math.abs(best[1] - input.throttle) ? item : best)[0]
  if (draftEl) draftEl.textContent = `${load.draftMeters.toFixed(1)} m`
  if (conditionEl) conditionEl.textContent = `${state.condition.toFixed(0)}%`
  if (statusEl) statusEl.textContent = operation.message
  audio.setMotion(operation.docked ? 0 : input.throttle, speedKnots)
}

sim.engine.runRenderLoop(() => {
  const now = performance.now()
  accumulator += Math.min(.1, (now - previous) / 1000)
  previous = now
  while (accumulator >= FIXED_DT) {
    if (!operation.docked) {
      const before = state
      const stepped = stepManoeuvre(state, input, vessel, load, calmEnvironment, FIXED_DT)
      const evaluated = evaluateHarbourOperation(stepped, before, vessel, load, ROTTERDAM_P5, operation)
      state = evaluated.state
      operation = evaluated.operation
      if (operation.collisions > audibleCollisionCount) {
        audio.collision(operation.message.startsWith('Quay') ? 'quay' : 'buoy')
        audibleCollisionCount = operation.collisions
      }
      if (operation.docked) input = { throttle: 0, rudder: 0 }
      persistenceTicks += 1
      if (persistenceTicks >= 15) {
        persistAttempt()
        persistenceTicks = 0
      }
    }
    accumulator -= FIXED_DT
  }
  settleIfDocked()
  sim.renderState(state)
  renderHud()
  sim.scene.render()
})

window.addEventListener('pagehide', () => audio.dispose(), { once: true })
