import './p5.css'
import { FIXED_DT, stepManoeuvre } from '../simulation/engine'
import { calmEnvironment, initialManoeuvreState, type ManoeuvreInput } from '../simulation/state'
import { loadState, VESSEL_PARAMETERS } from '../simulation/vessel-parameters'
import { createShipAudio } from './audio'
import { detectHarbourCollision, resolveHarbourCollision } from './collision'
import { ROTTERDAM_P5 } from './rotterdam'
import { createP5Scene } from './scene'

const canvas = document.querySelector<HTMLCanvasElement>('#p5-canvas')
if (!canvas) throw new Error('P5 canvas missing')

const sim = createP5Scene(canvas, ROTTERDAM_P5)
const audio = createShipAudio()
const vessel = VESSEL_PARAMETERS.handysize
const load = loadState(vessel, .6)
let state = initialManoeuvreState()
let input: ManoeuvreInput = { throttle: 0, rudder: 0 }
let uiRudder = 0
let accumulator = 0
let previous = performance.now()
let collisionMessageUntil = 0

const headingEl = document.querySelector<HTMLElement>('[data-hdg]')
const speedEl = document.querySelector<HTMLElement>('[data-sog]')
const rudderEl = document.querySelector<HTMLElement>('[data-rudder]')
const engineEl = document.querySelector<HTMLElement>('[data-engine]')
const hullEl = document.querySelector<HTMLElement>('[data-hull]')
const rudderVisual = document.querySelector<HTMLElement>('[data-rudder-visual]')
const alertEl = document.querySelector<HTMLElement>('[data-alert]')
const soundButton = document.querySelector<HTMLButtonElement>('[data-sound]')

const engineOrders: Array<[string, number]> = [
  ['HALF ASTERN', -.7],
  ['SLOW ASTERN', -.35],
  ['STOP', 0],
  ['SLOW AHEAD', .35],
  ['HALF AHEAD', .7],
]

async function ensureSound() {
  if (audio.enabled) return
  await audio.enable()
  soundButton?.classList.add('active')
  if (soundButton) soundButton.textContent = 'SOUND ON'
}

document.querySelectorAll<HTMLButtonElement>('[data-engine-order]').forEach(button => {
  button.addEventListener('click', () => {
    void ensureSound()
    const order = engineOrders.find(([name]) => name === button.dataset.engineOrder)
    if (!order) return
    input = { ...input, throttle: order[1] }
    document.querySelectorAll('[data-engine-order]').forEach(el => el.classList.remove('active'))
    button.classList.add('active')
  })
})

const rudder = document.querySelector<HTMLInputElement>('#rudder')
rudder?.addEventListener('input', () => {
  void ensureSound()
  uiRudder = Number(rudder.value)
  // UI convention: slider right/STBD must turn the bow to starboard.
  // P4's yaw convention is opposite to the screen-space steering convention used here.
  input = { ...input, rudder: -uiRudder }
})

soundButton?.addEventListener('click', async () => {
  if (!audio.enabled) await ensureSound()
  else {
    audio.enabled = false
    soundButton.classList.remove('active')
    soundButton.textContent = 'SOUND OFF'
  }
})

document.querySelectorAll<HTMLButtonElement>('[data-camera]').forEach(button => {
  button.addEventListener('click', () => {
    sim.setCamera(button.dataset.camera === 'tactical' ? 'tactical' : 'chase')
    document.querySelectorAll('[data-camera]').forEach(el => el.classList.remove('active'))
    button.classList.add('active')
  })
})

document.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', () => {
  state = initialManoeuvreState()
  input = { throttle: 0, rudder: 0 }
  uiRudder = 0
  if (rudder) rudder.value = '0'
  document.querySelectorAll('[data-engine-order]').forEach(el => el.classList.remove('active'))
  document.querySelector<HTMLButtonElement>('[data-engine-order="STOP"]')?.classList.add('active')
  if (alertEl) alertEl.classList.remove('show')
})

function renderHud() {
  const headingDeg = ((state.heading * 180 / Math.PI) % 360 + 360) % 360
  const speedKn = Math.hypot(state.surge, state.sway) * 1.94
  const rudderDeg = Math.round(Math.abs(uiRudder) * 35)
  const rudderSide = Math.abs(uiRudder) < .025 ? 'MID' : uiRudder < 0 ? 'PORT' : 'STBD'
  if (headingEl) headingEl.textContent = `${headingDeg.toFixed(0).padStart(3, '0')}°`
  if (speedEl) speedEl.textContent = `${speedKn.toFixed(1)} kn`
  if (rudderEl) rudderEl.textContent = rudderSide === 'MID' ? 'MIDSHIPS' : `${rudderSide} ${rudderDeg}°`
  if (hullEl) hullEl.textContent = `${state.condition.toFixed(0)} %`
  if (rudderVisual) rudderVisual.style.transform = `rotate(${uiRudder * 35}deg)`
  if (engineEl) engineEl.textContent = engineOrders.reduce((best, item) => Math.abs(item[1] - input.throttle) < Math.abs(best[1] - input.throttle) ? item : best)[0]
  audio.setMotion(input.throttle, speedKn)
  if (alertEl && performance.now() > collisionMessageUntil) alertEl.classList.remove('show')
}

sim.engine.runRenderLoop(() => {
  const now = performance.now()
  accumulator += Math.min(.1, (now - previous) / 1000)
  previous = now
  while (accumulator >= FIXED_DT) {
    const before = state
    const attempted = stepManoeuvre(state, input, vessel, load, calmEnvironment, FIXED_DT)
    const collision = detectHarbourCollision(attempted, ROTTERDAM_P5)
    if (collision) {
      state = resolveHarbourCollision(before, attempted, collision)
      audio.collision(collision.kind)
      collisionMessageUntil = performance.now() + 1400
      if (alertEl) {
        alertEl.textContent = collision.kind === 'quay' ? 'KOLLISION · KAIKANTE' : 'KOLLISION · FAHRWASSERTONNE'
        alertEl.classList.add('show')
      }
    } else state = attempted
    accumulator -= FIXED_DT
  }
  sim.renderState(state)
  renderHud()
  sim.scene.render()
})

window.addEventListener('pagehide', () => audio.dispose(), { once: true })
