export type PortId = 'HAM' | 'RTM' | 'NYC' | 'SIN';

export interface Contract {
  id: string;
  origin: PortId;
  destination: PortId;
  cargo: string;
  tonnes: number;
  payout: number;
  days: number;
  deadlineDays: number;
}

export interface Vessel {
  id: string;
  name: string;
  className: string;
  capacityTonnes: number;
  speedKnots: number;
  condition: number;
  fuelTonnes: number;
  currentPort: PortId | null;
}

export interface VoyageEvent {
  day: number;
  title: string;
  effect: string;
}

export interface Voyage {
  id: string;
  contractId: string;
  day: number;
  totalDays: number;
  fuelCost: number;
  maintenanceCost: number;
  eventCost: number;
  seed: number;
  events: VoyageEvent[];
}

export interface GameState {
  schemaVersion: 1;
  campaignDate: string;
  cash: number;
  reputation: number;
  vessel: Vessel;
  contracts: Contract[];
  activeVoyage: Voyage | null;
  completedContracts: string[];
  transactionLog: string[];
}

export const ports: Record<PortId, string> = {
  HAM: 'Hamburg', RTM: 'Rotterdam', NYC: 'New York', SIN: 'Singapore'
};

export function createInitialState(): GameState {
  return {
    schemaVersion: 1,
    campaignDate: '1970-01-05',
    cash: 420_000,
    reputation: 50,
    vessel: {
      id: 'ot-vessel-001', name: 'MS Pioneer', className: 'Handysize',
      capacityTonnes: 18_000, speedKnots: 18, condition: 84, fuelTonnes: 820, currentPort: 'HAM'
    },
    contracts: [
      { id: 'C-HAM-RTM-001', origin: 'HAM', destination: 'RTM', cargo: 'Maschinenteile', tonnes: 5_500, payout: 78_000, days: 2, deadlineDays: 4 },
      { id: 'C-HAM-NYC-001', origin: 'HAM', destination: 'NYC', cargo: 'Stahlprodukte', tonnes: 12_000, payout: 244_000, days: 8, deadlineDays: 11 },
      { id: 'C-HAM-SIN-001', origin: 'HAM', destination: 'SIN', cargo: 'Chemikalien', tonnes: 8_600, payout: 421_000, days: 18, deadlineDays: 23 }
    ],
    activeVoyage: null,
    completedContracts: [],
    transactionLog: ['Kampagne gestartet · Startkapital €420.000']
  };
}

export function acceptContract(state: GameState, contractId: string): GameState {
  if (state.activeVoyage) throw new Error('A voyage is already active.');
  const contract = state.contracts.find(c => c.id === contractId);
  if (!contract) throw new Error('Contract not found.');
  if (state.vessel.currentPort !== contract.origin) throw new Error('Vessel is not at contract origin.');
  if (contract.tonnes > state.vessel.capacityTonnes) throw new Error('Cargo exceeds vessel capacity.');
  const seed = hashSeed(contract.id);
  return {
    ...state,
    vessel: { ...state.vessel, currentPort: null },
    activeVoyage: {
      id: `V-${contract.id}`, contractId, day: 0, totalDays: contract.days,
      fuelCost: 0, maintenanceCost: 0, eventCost: 0, seed, events: []
    },
    transactionLog: [`Vertrag angenommen · ${ports[contract.origin]} → ${ports[contract.destination]}`, ...state.transactionLog]
  };
}

export function advanceVoyageDay(state: GameState): GameState {
  const voyage = state.activeVoyage;
  if (!voyage) return state;
  const contract = state.contracts.find(c => c.id === voyage.contractId)!;
  const nextDay = voyage.day + 1;
  const dailyFuel = Math.round(7_500 + contract.tonnes * 0.65);
  const dailyMaintenance = Math.round(1_100 + (100 - state.vessel.condition) * 22);
  let eventCost = voyage.eventCost;
  let condition = Math.max(0, state.vessel.condition - 0.22);
  let fuel = Math.max(0, state.vessel.fuelTonnes - 24);
  let events = voyage.events;
  const roll = seededUnit(voyage.seed + nextDay * 97);
  if (roll > 0.77 && !events.some(e => e.day === nextDay)) {
    const cost = 8_000 + Math.floor(roll * 8_000);
    eventCost += cost;
    condition = Math.max(0, condition - 1.1);
    events = [...events, { day: nextDay, title: 'Schwere See', effect: `Zusatzkosten €${cost.toLocaleString('de-DE')} · Zustand -1,1 %` }];
  }
  const updatedVoyage: Voyage = {
    ...voyage, day: nextDay,
    fuelCost: voyage.fuelCost + dailyFuel,
    maintenanceCost: voyage.maintenanceCost + dailyMaintenance,
    eventCost, events
  };
  const progressed: GameState = {
    ...state,
    vessel: { ...state.vessel, condition, fuelTonnes: fuel },
    activeVoyage: updatedVoyage
  };
  if (nextDay < voyage.totalDays) return progressed;
  return settleVoyage(progressed, contract);
}

function settleVoyage(state: GameState, contract: Contract): GameState {
  const voyage = state.activeVoyage!;
  const costs = voyage.fuelCost + voyage.maintenanceCost + voyage.eventCost;
  const net = contract.payout - costs;
  return {
    ...state,
    cash: state.cash + net,
    reputation: Math.min(100, state.reputation + 2),
    vessel: { ...state.vessel, currentPort: contract.destination },
    activeVoyage: null,
    completedContracts: [...state.completedContracts, contract.id],
    contracts: state.contracts.filter(c => c.id !== contract.id),
    transactionLog: [`Reise abgeschlossen · Netto ${currency(net)}`, `Frachtumsatz ${currency(contract.payout)} · Kosten ${currency(costs)}`, ...state.transactionLog]
  };
}

export function companyValue(state: GameState): number {
  const vesselValue = Math.round(1_150_000 * (state.vessel.condition / 100));
  return state.cash + vesselValue;
}

export function currency(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (const ch of input) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function seededUnit(seed: number): number {
  let x = seed >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return (x >>> 0) / 4294967295;
}
