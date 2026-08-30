import './p5.css'
import { FIXED_DT, stepManoeuvre } from '../simulation/engine'
import { calmEnvironment, initialManoeuvreState, type ManoeuvreInput } from '../simulation/state'
import { loadState, VESSEL_PARAMETERS } from '../simulation/vessel-parameters'
import { evaluateHarbourOperation, initialHarbourOperationState } from './operations'
import { ROTTERDAM_P5 } from './rotterdam'
import { createP5Scene } from './scene'

const canvas = document.querySelector<HTMLCanvasElement>('#p5-canvas')
if (!canvas) throw new Error('P5 canvas missing')

const sim = createP5Scene(canvas, ROTTERDAM_P5)
const vessel = VESSEL_PARAMETERS.handysize
const load = loadState(vessel, .6)
let state = initialManoeuvreState()
let operation = initialHarbourOperationState()
let input: ManoeuvreInput = { throttle: 0, rudder: 0 }
let accumulator = 0
let previous = performance.now()

const q = (selector: string) => document.querySelector<HTMLElement>(selector)
const headingEl = q('[data-hdg]')
const speedEl = q('[data-sog]')
const rotEl = q('[data-rot]')
const rudderEl = q('[data-rudder]')
const engineEl = q('[data-engine]')
const draftEl = q('[data-draft]')
const conditionEl = q('[data-condition]')
const statusEl = q('[data-status]')

const engineOrders: Array<[string, number]> = [
  ['FULL ASTERN', -1], ['HALF ASTERN', -.7], ['SLOW ASTERN', -.35], ['STOP', 0],
  ['SLOW AHEAD', .35], ['HALF AHEAD', .7], ['FULL AHEAD', 1],
]

document.querySelectorAll<HTMLButtonElement>('[data-engine-order]').forEach(button => button.addEventListener('click', () => {
  const order = engineOrders.find(([name]) => name === button.dataset.engineOrder)
  if (!order || operation.docked) return
  input = { ...input, throttle: order[1] }
  document.querySelectorAll('[data-engine-order]').forEach(el => el.classList.remove('active'))
  button.classList.add('active')
}))

const rudder = document.querySelector<HTMLInputElement>('#rudder')
rudder?.addEventListener('input', () => { if (!operation.docked) input = { ...input, rudder: Number(rudder.value) } })

document.querySelectorAll<HTMLButtonElement>('[data-camera]').forEach(button => button.addEventListener('click', () => {
  const camera = button.dataset.camera
  sim.setCamera(camera === 'bridge' ? 'bridge' : camera === 'tactical' ? 'tactical' : 'chase')
  document.querySelectorAll('[data-camera]').forEach(el => el.classList.remove('active'))
  button.classList.add('active')
}))

function reset() {
  state = initialManoeuvreState()
  operation = initialHarbourOperationState()
  input = { throttle: 0, rudder: 0 }
  if (rudder) rudder.value = '0'
  document.querySelectorAll('[data-engine-order]').forEach(el => el.classList.remove('active'))
  document.querySelector<HTMLButtonElement>('[data-engine-order="STOP"]')?.classList.add('active')
}
document.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', reset)

function renderHud() {
  const headingDeg = ((state.heading * 180 / Math.PI) % 360 + 360) % 360
  if (headingEl) headingEl.textContent = `${headingDeg.toFixed(0).padStart(3, '0')}°`
  if (speedEl) speedEl.textContent = `${(Math.hypot(state.surge, state.sway) * 1.94).toFixed(1)} kn`
  if (rotEl) rotEl.textContent = `${(state.yawRate * 180 / Math.PI * 60).toFixed(1)}°/min`
  if (rudderEl) rudderEl.textContent = `${Math.round(input.rudder * 35)}°`
  if (engineEl) engineEl.textContent = engineOrders.reduce((best, item) => Math.abs(item[1] - input.throttle) < Math.abs(best[1] - input.throttle) ? item : best)[0]
  if (draftEl) draftEl.textContent = `${load.draftMeters.toFixed(1)} m`
  if (conditionEl) conditionEl.textContent = `${state.condition.toFixed(0)}%`
  if (statusEl) statusEl.textContent = operation.message
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
      if (operation.docked) input = { throttle: 0, rudder: 0 }
    }
    accumulator -= FIXED_DT
  }
  sim.renderState(state)
  renderHud()
  sim.scene.render()
})
