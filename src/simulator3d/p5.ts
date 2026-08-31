import './p5.css'
import { FIXED_DT, stepManoeuvre } from '../simulation/engine'
import { calmEnvironment, initialManoeuvreState, type EngineOrder, type ManoeuvreInput, type ManoeuvreState } from '../simulation/state'
import { engineOrderFromLegacyThrottle } from '../simulation/forces/propulsion'
import { navigationMetrics, KNOTS_PER_MPS } from '../simulation/units'
import { loadState as simulationLoadState, VESSEL_PARAMETERS } from '../simulation/vessel-parameters'
import { createShipAudio } from './audio'
import { clearHarbourAttempt, loadHarbourAttempt, saveHarbourAttempt } from './attempt'
import { loadCampaignArrival, settleCampaignArrival, simulationLoadForArrival } from './campaign'
import { selectHarbourEnvironment } from './environment-profile'
import { evaluateHarbourOperation, initialHarbourOperationState } from './operations'
import { ROTTERDAM_P5, rotterdamScenario, type P5HarbourScenario } from './rotterdam'
import { rudderPresentation } from './rudder-presentation'
import { createP5Scene } from './scene'

const canvas = document.querySelector<HTMLCanvasElement>('#p5-canvas')
if (!canvas) throw new Error('P5 canvas missing')

const params = new URLSearchParams(window.location.search)
const vesselId = params.get('vessel')
const arrival = vesselId ? loadCampaignArrival(localStorage, vesselId) : null
const { mode: environmentMode, environment: HARBOUR_ENVIRONMENT } = selectHarbourEnvironment(params.get('environment'), Boolean(arrival))
// Campaign arrivals are intentionally locked to the authoritative Alongside scenario.
// Scenario selection exists only for standalone training mode.
const scenario = arrival ? ROTTERDAM_P5 : rotterdamScenario(params.get('scenario'))
const vessel = arrival ? VESSEL_PARAMETERS[arrival.vesselClass] : VESSEL_PARAMETERS.handysize
const load = arrival ? simulationLoadForArrival(arrival) : simulationLoadState(vessel, .6)
const sim = createP5Scene(canvas, scenario)
if (scenario.showBerth === false) sim.scene.getMeshByName('berth-marker')?.setEnabled(false)
const rudderMesh = sim.scene.getMeshByName('rudder')
const audio = createShipAudio()
const savedAttempt = arrival ? loadHarbourAttempt(sessionStorage, arrival.vesselId) : null

function freshState(condition = 100): ManoeuvreState {
  return { ...initialManoeuvreState(condition), heading: scenario.spawn.heading }
}

function freshOperation(selected: P5HarbourScenario) {
  return { ...initialHarbourOperationState(), message: selected.instructions }
}

let state = savedAttempt?.state ?? freshState(arrival?.initialCondition ?? 100)
let operation = savedAttempt?.operation ?? freshOperation(scenario)
let input: ManoeuvreInput = savedAttempt?.input ?? { engineOrder: 'STOP', rudder: 0, bowThruster: 0 }
// Momentary thruster commands never survive page load. Rudder has no actuator lag,
// so reconcile persisted state and command immediately at the presentation boundary.
input = { ...input, bowThruster: 0 }
let uiRudder = rudderPresentation(input.rudder).normalized
state = { ...state, rudder: uiRudder, bowThruster: 0 }
let manoeuvreArmed = false
let accumulator = 0
let previous = performance.now()
let campaignSettled = false
let persistenceTicks = 0
let audibleCollisionCount = operation.collisions
let activeThrusterPointer: number | null = null

const q = (selector: string) => document.querySelector<HTMLElement>(selector)
const headingEl = q('[data-hdg]')
const cogEl = q('[data-cog]')
const stwEl = q('[data-stw]')
const speedEl = q('[data-sog]')
const rotEl = q('[data-rot]')
const rudderEl = q('[data-rudder]')
const engineEl = q('[data-engine]')
const bowThrusterEl = q('[data-bow-thruster-state]')
const draftEl = q('[data-draft]')
const conditionEl = q('[data-condition]')
const statusEl = q('[data-status]')
const contextEl = q('[data-context]')
const scenarioTitleEl = q('[data-scenario-title]')
const scenarioPicker = q('[data-scenario-picker]')
const scenarioSelect = document.querySelector<HTMLSelectElement>('[data-scenario-select]')
const rudderVisual = q('[data-rudder-visual]')
const soundButton = document.querySelector<HTMLButtonElement>('[data-sound]')
const returnButton = document.querySelector<HTMLButtonElement>('[data-return-campaign]')
const thrusterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-bow-thruster]')]
const rudder = document.querySelector<HTMLInputElement>('#rudder')

const windKnots = (HARBOUR_ENVIRONMENT.windSpeedMps ?? 0) * KNOTS_PER_MPS
const currentKnots = (HARBOUR_ENVIRONMENT.currentSpeedMps ?? 0) * KNOTS_PER_MPS
const environmentLabel = environmentMode === 'baseline'
  ? 'ENV CALM'
  : `ENV CROSS · WND ${windKnots.toFixed(0)} kn/${HARBOUR_ENVIRONMENT.windFromDeg ?? 0}° · CUR ${currentKnots.toFixed(1)} kn/${HARBOUR_ENVIRONMENT.currentToDeg ?? 0}°`
if (scenarioTitleEl) scenarioTitleEl.textContent = scenario.name
if (contextEl) contextEl.textContent = arrival
  ? `${arrival.vesselName} · ${arrival.destination} · ${(arrival.loadRatio * 100).toFixed(0)}% load · ${environmentLabel}`
  : `${scenario.shortName} · 60% Handysize · ${environmentLabel}`

if (scenarioPicker) scenarioPicker.hidden = Boolean(arrival)
if (scenarioSelect) {
  scenarioSelect.value = scenario.id
  scenarioSelect.disabled = Boolean(arrival)
  scenarioSelect.addEventListener('change', () => {
    if (arrival) return
    const next = rotterdamScenario(scenarioSelect.value)
    const url = new URL(window.location.href)
    url.searchParams.delete('vessel')
    url.searchParams.set('scenario', next.id)
    window.location.assign(url.toString())
  })
}

if (returnButton) {
  returnButton.hidden = !arrival
  returnButton.disabled = true
  returnButton.addEventListener('click', () => { window.location.href = '/' })
}

const engineOrders: Record<string, EngineOrder> = {
  'FULL ASTERN': 'FULL_ASTERN',
  'HALF ASTERN': 'HALF_ASTERN',
  'SLOW ASTERN': 'SLOW_ASTERN',
  STOP: 'STOP',
  'SLOW AHEAD': 'SLOW_AHEAD',
  'HALF AHEAD': 'HALF_AHEAD',
  'FULL AHEAD': 'FULL_AHEAD',
}
const engineOrderLabel = (order: EngineOrder) => order.replaceAll('_', ' ')
const commandedOrder = () => input.engineOrder ?? engineOrderFromLegacyThrottle(input.throttle ?? 0)

function armManoeuvre() {
  if (!operation.docked) manoeuvreArmed = true
}

async function ensureSound() {
  if (audio.enabled) return
  await audio.enable()
  soundButton?.classList.add('active')
  if (soundButton) soundButton.textContent = 'SOUND ON'
}

function persistAttempt() {
  if (!arrival || campaignSettled) return
  saveHarbourAttempt(sessionStorage, { version: 3, vesselId: arrival.vesselId, state, operation, input })
}

function syncEngineButtons() {
  const order = commandedOrder()
  document.querySelectorAll<HTMLButtonElement>('[data-engine-order]').forEach(button => {
    button.classList.toggle('active', engineOrders[button.dataset.engineOrder ?? ''] === order)
  })
}

function syncThrusterButtons() {
  const command = input.bowThruster ?? 0
  thrusterButtons.forEach(button => {
    button.classList.toggle('active', Number(button.dataset.bowThruster) === command && command !== 0)
  })
}

function syncRudderPresentation() {
  const presentation = rudderPresentation(uiRudder)
  if (rudderEl) rudderEl.textContent = presentation.label
  if (rudderVisual) rudderVisual.style.transform = `rotate(${presentation.cssRotationDeg}deg)`
  // createP5Scene still owns vessel construction. Override only the visual angle
  // here so HUD, slider and vessel rudder share one explicit bridge convention.
  if (rudderMesh) rudderMesh.rotation.y = presentation.meshRotationRad
}

function setRudderCommand(command: number, persist = true) {
  const presentation = rudderPresentation(command)
  uiRudder = presentation.normalized
  input = { ...input, rudder: uiRudder }
  state = { ...state, rudder: uiRudder }
  if (rudder) rudder.value = String(uiRudder)
  syncRudderPresentation()
  if (persist) persistAttempt()
}

function setBowThruster(command: number) {
  const value = operation.docked ? 0 : Math.max(-1, Math.min(1, command))
  input = { ...input, bowThruster: value }
  syncThrusterButtons()
}

function releaseThruster(pointerId?: number) {
  if (pointerId !== undefined && activeThrusterPointer !== pointerId) return
  activeThrusterPointer = null
  setBowThruster(0)
}

syncEngineButtons()
syncThrusterButtons()
setRudderCommand(uiRudder, false)
document.querySelectorAll<HTMLButtonElement>('[data-engine-order]').forEach(button => button.addEventListener('click', () => {
  const order = engineOrders[button.dataset.engineOrder ?? '']
  if (!order || operation.docked) return
  armManoeuvre()
  void ensureSound()
  input = { ...input, engineOrder: order }
  persistAttempt()
  syncEngineButtons()
}))

thrusterButtons.forEach(button => {
  button.addEventListener('pointerdown', event => {
    event.preventDefault()
    if (operation.docked) return
    armManoeuvre()
    void ensureSound()
    activeThrusterPointer = event.pointerId
    button.setPointerCapture(event.pointerId)
    setBowThruster(Number(button.dataset.bowThruster ?? 0))
  })
  button.addEventListener('pointerup', event => releaseThruster(event.pointerId))
  button.addEventListener('pointercancel', event => releaseThruster(event.pointerId))
  button.addEventListener('lostpointercapture', event => releaseThruster(event.pointerId))
  button.addEventListener('keydown', event => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    if (operation.docked) return
    armManoeuvre()
    void ensureSound()
    setBowThruster(Number(button.dataset.bowThruster ?? 0))
  })
  button.addEventListener('keyup', event => {
    if (event.key === ' ' || event.key === 'Enter') releaseThruster()
  })
})
window.addEventListener('pointerup', event => releaseThruster(event.pointerId))
window.addEventListener('pointercancel', event => releaseThruster(event.pointerId))
window.addEventListener('blur', () => releaseThruster())
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseThruster() })

if (rudder) {
  rudder.value = String(uiRudder)
  rudder.addEventListener('input', () => {
    if (operation.docked) return
    armManoeuvre()
    void ensureSound()
    setRudderCommand(Number(rudder.value))
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

  if (arrival) {
    const retainedCondition = state.condition
    const retainedDamage = operation.damage
    const retainedCollisions = operation.collisions
    state = freshState(retainedCondition)
    operation = {
      ...freshOperation(scenario),
      damage: retainedDamage,
      collisions: retainedCollisions,
      message: retainedCollisions ? `Repositioned · ${retainedDamage.toFixed(1)}% damage retained` : scenario.instructions,
    }
    audibleCollisionCount = retainedCollisions
  } else {
    state = freshState(100)
    operation = freshOperation(scenario)
    audibleCollisionCount = 0
  }

  manoeuvreArmed = false
  input = { engineOrder: 'STOP', rudder: 0, bowThruster: 0 }
  activeThrusterPointer = null
  setRudderCommand(0, false)
  syncEngineButtons()
  syncThrusterButtons()
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
  const navigation = navigationMetrics(state, manoeuvreArmed ? HARBOUR_ENVIRONMENT : calmEnvironment)
  const bowLabel = Math.abs(state.bowThruster) < .01 ? 'OFF' : state.bowThruster < 0 ? 'PORT' : 'STBD'
  if (headingEl) headingEl.textContent = `${headingDeg.toFixed(0).padStart(3, '0')}°`
  if (cogEl) cogEl.textContent = `${navigation.cogDeg.toFixed(0).padStart(3, '0')}°`
  if (stwEl) stwEl.textContent = `${navigation.stwKnots.toFixed(1)} kn`
  if (speedEl) speedEl.textContent = `${navigation.sogKnots.toFixed(1)} kn`
  if (rotEl) rotEl.textContent = `${(state.yawRate * 180 / Math.PI * 60).toFixed(1)}°/min`
  syncRudderPresentation()
  if (engineEl) engineEl.textContent = engineOrderLabel(commandedOrder())
  if (bowThrusterEl) bowThrusterEl.textContent = bowLabel
  if (draftEl) draftEl.textContent = `${load.draftMeters.toFixed(1)} m`
  if (conditionEl) conditionEl.textContent = `${state.condition.toFixed(0)}%`
  if (statusEl) {
    statusEl.textContent = !operation.docked && !manoeuvreArmed
      ? `${savedAttempt ? 'PAUSED · manoeuvre restored' : 'READY · manoeuvre paused'} · touch a control to continue`
      : operation.message
  }
  audio.setMotion(operation.docked || !manoeuvreArmed ? 0 : state.shaftActual, navigation.stwKnots)
}

sim.engine.runRenderLoop(() => {
  const now = performance.now()
  accumulator += Math.min(.1, (now - previous) / 1000)
  previous = now
  while (accumulator >= FIXED_DT) {
    if (!operation.docked && manoeuvreArmed) {
      const before = state
      const stepped = stepManoeuvre(state, input, vessel, load, HARBOUR_ENVIRONMENT, FIXED_DT)
      const evaluated = evaluateHarbourOperation(stepped, before, vessel, load, scenario, operation)
      state = evaluated.state
      operation = evaluated.operation
      if (operation.collisions > audibleCollisionCount) {
        audio.collision(operation.message.includes('Quay') || operation.message.includes('berthing') ? 'quay' : 'buoy')
        audibleCollisionCount = operation.collisions
      }
      if (operation.docked) {
        input = { engineOrder: 'STOP', rudder: 0, bowThruster: 0 }
        state = { ...state, rudder: 0, bowThruster: 0 }
        uiRudder = 0
        activeThrusterPointer = null
        if (rudder) rudder.value = '0'
        syncEngineButtons()
        syncThrusterButtons()
        syncRudderPresentation()
      }
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
  // Scene coordinates and CSS coordinates differ; enforce the shared bridge
  // presentation after scene-state rendering so both visual rudders agree.
  syncRudderPresentation()
  renderHud()
  sim.scene.render()
})

window.addEventListener('pagehide', () => {
  releaseThruster()
  audio.dispose()
}, { once: true })