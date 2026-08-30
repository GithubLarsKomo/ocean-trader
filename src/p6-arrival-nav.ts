import { loadState } from './storage'

function vesselIdForName(name: string) {
  const state = loadState(localStorage)
  return state?.vessels.find(v => v.name === name && state.voyages.some(x => x.vesselId === v.id && x.arrivalPending))?.id ?? null
}

function open3d(vesselId: string) {
  window.location.href = `/p5.html?vessel=${encodeURIComponent(vesselId)}`
}

function wireMobile(root: ParentNode = document) {
  root.querySelectorAll<HTMLButtonElement>('.harbour-cta').forEach(button => {
    if (button.dataset.p6Wired) return
    button.dataset.p6Wired = '1'
    button.addEventListener('click', event => {
      const dossier = button.closest('.vessel-dossier')
      const name = dossier?.querySelector('h3')?.textContent?.trim()
      const vesselId = name ? vesselIdForName(name) : null
      if (!vesselId) return
      event.preventDefault()
      event.stopImmediatePropagation()
      open3d(vesselId)
    }, true)
  })
}

function wireDesktop(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.event.critical').forEach(eventCard => {
    if (eventCard.dataset.p6Wired) return
    const text = eventCard.textContent ?? ''
    const state = loadState(localStorage)
    const vessel = state?.vessels.find(v => text.includes(v.name) && state.voyages.some(x => x.vesselId === v.id && x.arrivalPending))
    if (!vessel) return
    eventCard.dataset.p6Wired = '1'
    eventCard.tabIndex = 0
    eventCard.setAttribute('role', 'button')
    eventCard.setAttribute('aria-label', `${vessel.name}: 3D Hafenmanöver öffnen`)
    eventCard.title = '3D Hafenmanöver öffnen'
    const open = () => open3d(vessel.id)
    eventCard.addEventListener('click', open)
    eventCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } })
  })
}

function wire() { wireMobile(); wireDesktop() }
const observer = new MutationObserver(wire)
observer.observe(document.documentElement, { childList: true, subtree: true })
wire()
