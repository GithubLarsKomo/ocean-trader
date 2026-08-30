import { completeHarbourArrival, contractForVoyage, voyageForVessel, type GameState } from '../domain'
import { loadState, saveState } from '../storage'
import { loadState as simulationLoadState, VESSEL_PARAMETERS } from '../simulation/vessel-parameters'

export type CampaignArrival = {
  state: GameState
  vesselId: string
  vesselName: string
  vesselClass: keyof typeof VESSEL_PARAMETERS
  loadRatio: number
  destination: string
  initialCondition: number
}

export function loadCampaignArrival(storage: Pick<Storage, 'getItem' | 'setItem'>, vesselId: string): CampaignArrival | null {
  const state = loadState(storage)
  if (!state) return null
  const vessel = state.vessels.find(v => v.id === vesselId)
  const voyage = voyageForVessel(state, vesselId)
  if (!vessel || !voyage?.arrivalPending) return null
  const contract = contractForVoyage(state, voyage)
  if (!contract) return null
  return {
    state,
    vesselId,
    vesselName: vessel.name,
    vesselClass: vessel.classId,
    loadRatio: voyage.reposition ? 0 : Math.max(0, Math.min(1, contract.tonnes / vessel.capacityTonnes)),
    destination: contract.destination,
    initialCondition: vessel.condition,
  }
}

export function settleCampaignArrival(storage: Pick<Storage, 'getItem' | 'setItem'>, vesselId: string, simulatorCondition: number): GameState {
  const state = loadState(storage)
  if (!state) throw new Error('Campaign save not found.')
  const settled = completeHarbourArrival(state, vesselId, simulatorCondition)
  saveState(storage, settled)
  return settled
}

export function simulationLoadForArrival(arrival: CampaignArrival) {
  return simulationLoadState(VESSEL_PARAMETERS[arrival.vesselClass], arrival.loadRatio)
}
