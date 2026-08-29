import type { PortId, ShipClassId, ShipOffer, Vessel } from './domain';

export interface ShipClassSpec {
  id: ShipClassId;
  name: string;
  capacityTonnes: number;
  speedKnots: number;
  fuelCapacityTonnes: number;
  fuelPerDay: number;
  baseValue: number;
  summary: string;
}

export const SHIP_CLASSES: Record<ShipClassId, ShipClassSpec> = {
  coaster: { id:'coaster', name:'Coaster', capacityTonnes:8_000, speedKnots:15, fuelCapacityTonnes:620, fuelPerDay:18, baseValue:650_000, summary:'Günstig und sparsam für kurze regionale Verkehre.' },
  handysize: { id:'handysize', name:'Handysize', capacityTonnes:18_000, speedKnots:17, fuelCapacityTonnes:1_050, fuelPerDay:28, baseValue:1_250_000, summary:'Flexibler Allrounder mit guter Hafenabdeckung.' },
  feeder: { id:'feeder', name:'Feeder', capacityTonnes:14_000, speedKnots:19, fuelCapacityTonnes:920, fuelPerDay:34, baseValue:1_450_000, summary:'Schneller Linienfrachter mit höherem Verbrauch.' },
  panamax: { id:'panamax', name:'Panamax', capacityTonnes:55_000, speedKnots:16, fuelCapacityTonnes:2_400, fuelPerDay:58, baseValue:3_600_000, summary:'Hohe Kapazität und Kapitalbindung für große Ladungen.' }
};

export const SERVICE_PORTS = new Set<PortId>(['HAM','RTM','NYC','SIN','DXB','SHA']);
const BUNKER_PRICE: Partial<Record<PortId,number>> = { HAM:590, RTM:565, NYC:625, SIN:540, DXB:515, SHA:555, CPT:610, TYO:645 };

export function bunkerPrice(port: PortId): number { return BUNKER_PRICE[port] ?? 600; }
export function repairAvailable(port: PortId): boolean { return SERVICE_PORTS.has(port); }
export function vesselFuelCapacity(vessel: Vessel): number { return vessel.fuelCapacityTonnes || SHIP_CLASSES[vessel.classId].fuelCapacityTonnes; }
export function fuelPerDay(vessel: Vessel): number { return SHIP_CLASSES[vessel.classId].fuelPerDay; }

export function vesselMarketValue(vessel: Vessel, campaignDate: string): number {
  const spec = SHIP_CLASSES[vessel.classId];
  const year = Number(campaignDate.slice(0,4)) || 1970;
  const age = Math.max(0, year - vessel.builtYear);
  const ageFactor = Math.max(.38, 1 - age * .035);
  const conditionFactor = .45 + .55 * Math.max(0, Math.min(100, vessel.condition)) / 100;
  return Math.round(spec.baseValue * ageFactor * conditionFactor / 1000) * 1000;
}

export function repairCost(vessel: Vessel, targetCondition: number): number {
  const target = Math.max(vessel.condition, Math.min(100, targetCondition));
  const points = target - vessel.condition;
  const spec = SHIP_CLASSES[vessel.classId];
  return Math.round(points * (650 + spec.capacityTonnes * .035));
}

export function createShipMarket(): ShipOffer[] {
  return [
    { id:'O-HAM-NORDWIND', port:'HAM', askingPrice:485_000, vessel:{ id:'market-nordwind', name:'MV Nordwind', classId:'coaster', className:'Coaster', builtYear:1966, capacityTonnes:8_000, speedKnots:15, condition:86, fuelCapacityTonnes:620, fuelTonnes:410, currentPort:'HAM' } },
    { id:'O-RTM-MERIDIAN', port:'RTM', askingPrice:910_000, vessel:{ id:'market-meridian', name:'MV Meridian', classId:'handysize', className:'Handysize', builtYear:1964, capacityTonnes:18_000, speedKnots:17, condition:82, fuelCapacityTonnes:1_050, fuelTonnes:690, currentPort:'RTM' } },
    { id:'O-SIN-PACIFIC', port:'SIN', askingPrice:1_285_000, vessel:{ id:'market-pacific', name:'MV Pacific Link', classId:'feeder', className:'Feeder', builtYear:1968, capacityTonnes:14_000, speedKnots:19, condition:93, fuelCapacityTonnes:920, fuelTonnes:760, currentPort:'SIN' } },
    { id:'O-NYC-ATLAS', port:'NYC', askingPrice:3_050_000, vessel:{ id:'market-atlas', name:'MV Atlas Crown', classId:'panamax', className:'Panamax', builtYear:1969, capacityTonnes:55_000, speedKnots:16, condition:89, fuelCapacityTonnes:2_400, fuelTonnes:1_760, currentPort:'NYC' } }
  ];
}
