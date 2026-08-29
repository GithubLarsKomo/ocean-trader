export type PortId = 'HAM' | 'RTM' | 'NYC' | 'SIN';

export interface Contract { id:string; origin:PortId; destination:PortId; cargo:string; tonnes:number; payout:number; days:number; deadlineDays:number; }
export interface Vessel { id:string; name:string; className:string; capacityTonnes:number; speedKnots:number; condition:number; fuelTonnes:number; currentPort:PortId|null; }
export interface VoyageEvent { day:number; title:string; effect:string; }
export interface Voyage { id:string; vesselId:string; contractId:string; day:number; totalDays:number; fuelCost:number; maintenanceCost:number; eventCost:number; seed:number; events:VoyageEvent[]; }
export interface GameState { schemaVersion:2; campaignDate:string; cash:number; reputation:number; vessels:Vessel[]; contracts:Contract[]; voyages:Voyage[]; completedContracts:string[]; transactionLog:string[]; }

export const ports:Record<PortId,string>={HAM:'Hamburg',RTM:'Rotterdam',NYC:'New York',SIN:'Singapore'};

export function createInitialState():GameState{
  return {schemaVersion:2,campaignDate:'1970-01-05',cash:420_000,reputation:50,
    vessels:[
      {id:'ot-vessel-001',name:'MS Pioneer',className:'Handysize',capacityTonnes:18_000,speedKnots:18,condition:84,fuelTonnes:820,currentPort:'HAM'},
      {id:'ot-vessel-002',name:'Baltic Star',className:'Coaster',capacityTonnes:9_000,speedKnots:15,condition:91,fuelTonnes:540,currentPort:'RTM'},
      {id:'ot-vessel-003',name:'Atlantic Spirit',className:'Handysize',capacityTonnes:16_000,speedKnots:17,condition:87,fuelTonnes:760,currentPort:'NYC'}
    ],
    contracts:[
      {id:'C-HAM-RTM-001',origin:'HAM',destination:'RTM',cargo:'Maschinenteile',tonnes:5_500,payout:78_000,days:2,deadlineDays:4},
      {id:'C-HAM-NYC-001',origin:'HAM',destination:'NYC',cargo:'Stahlprodukte',tonnes:12_000,payout:244_000,days:8,deadlineDays:11},
      {id:'C-HAM-SIN-001',origin:'HAM',destination:'SIN',cargo:'Chemikalien',tonnes:8_600,payout:421_000,days:18,deadlineDays:23},
      {id:'C-RTM-NYC-001',origin:'RTM',destination:'NYC',cargo:'Anlagenbau',tonnes:7_200,payout:176_000,days:7,deadlineDays:10},
      {id:'C-RTM-HAM-001',origin:'RTM',destination:'HAM',cargo:'Konsumgüter',tonnes:4_200,payout:59_000,days:2,deadlineDays:4},
      {id:'C-NYC-HAM-001',origin:'NYC',destination:'HAM',cargo:'Industriegüter',tonnes:11_000,payout:231_000,days:8,deadlineDays:12},
      {id:'C-NYC-RTM-001',origin:'NYC',destination:'RTM',cargo:'Papierprodukte',tonnes:8_000,payout:194_000,days:7,deadlineDays:10}
    ],voyages:[],completedContracts:[],transactionLog:['Kampagne gestartet · Startkapital €420.000']};
}

export function voyageForVessel(state:GameState,vesselId:string){return state.voyages.find(v=>v.vesselId===vesselId)??null;}
export function contractForVoyage(state:GameState,voyage:Voyage){return state.contracts.find(c=>c.id===voyage.contractId)??null;}
export function availableContractsForVessel(state:GameState,vesselId:string){const vessel=state.vessels.find(v=>v.id===vesselId);if(!vessel?.currentPort||voyageForVessel(state,vesselId))return [];return state.contracts.filter(c=>c.origin===vessel.currentPort&&c.tonnes<=vessel.capacityTonnes);}

export function acceptContract(state:GameState,vesselId:string,contractId:string):GameState{
  if(voyageForVessel(state,vesselId))throw new Error('Vessel already has an active voyage.');
  const vessel=state.vessels.find(v=>v.id===vesselId); const contract=state.contracts.find(c=>c.id===contractId);
  if(!vessel)throw new Error('Vessel not found.'); if(!contract)throw new Error('Contract not found.');
  if(vessel.currentPort!==contract.origin)throw new Error('Vessel is not at contract origin.'); if(contract.tonnes>vessel.capacityTonnes)throw new Error('Cargo exceeds vessel capacity.');
  return {...state,vessels:state.vessels.map(v=>v.id===vesselId?{...v,currentPort:null}:v),voyages:[...state.voyages,{id:`V-${contract.id}-${vesselId}`,vesselId,contractId,day:0,totalDays:contract.days,fuelCost:0,maintenanceCost:0,eventCost:0,seed:hashSeed(`${contract.id}:${vesselId}`),events:[]}],transactionLog:[`${vessel.name} · Vertrag ${ports[contract.origin]} → ${ports[contract.destination]}`,...state.transactionLog]};
}

export function advanceVoyageDay(state:GameState,vesselId:string):GameState{
  const voyage=voyageForVessel(state,vesselId); if(!voyage)return state;
  const vessel=state.vessels.find(v=>v.id===vesselId)!; const contract=state.contracts.find(c=>c.id===voyage.contractId)!; const nextDay=voyage.day+1;
  const dailyFuel=Math.round(7_500+contract.tonnes*.65); const dailyMaintenance=Math.round(1_100+(100-vessel.condition)*22);
  let eventCost=voyage.eventCost,condition=Math.max(0,vessel.condition-.22),fuel=Math.max(0,vessel.fuelTonnes-24),events=voyage.events;
  const roll=seededUnit(voyage.seed+nextDay*97); if(roll>.77&&!events.some(e=>e.day===nextDay)){const cost=8_000+Math.floor(roll*8_000);eventCost+=cost;condition=Math.max(0,condition-1.1);events=[...events,{day:nextDay,title:'Schwere See',effect:`Zusatzkosten €${cost.toLocaleString('de-DE')} · Zustand -1,1 %`}];}
  const updated={...voyage,day:nextDay,fuelCost:voyage.fuelCost+dailyFuel,maintenanceCost:voyage.maintenanceCost+dailyMaintenance,eventCost,events};
  let progressed={...state,vessels:state.vessels.map(v=>v.id===vesselId?{...v,condition,fuelTonnes:fuel}:v),voyages:state.voyages.map(v=>v.id===voyage.id?updated:v)};
  if(nextDay<voyage.totalDays)return progressed; return settleVoyage(progressed,vesselId,contract);
}

export function advanceAllVoyagesDay(state:GameState):GameState{const ids=state.voyages.map(v=>v.vesselId);return ids.reduce((s,id)=>advanceVoyageDay(s,id),state);}

function settleVoyage(state:GameState,vesselId:string,contract:Contract):GameState{
  const voyage=voyageForVessel(state,vesselId)!; const vessel=state.vessels.find(v=>v.id===vesselId)!; const costs=voyage.fuelCost+voyage.maintenanceCost+voyage.eventCost; const net=contract.payout-costs;
  return {...state,cash:state.cash+net,reputation:Math.min(100,state.reputation+2),vessels:state.vessels.map(v=>v.id===vesselId?{...v,currentPort:contract.destination}:v),voyages:state.voyages.filter(v=>v.id!==voyage.id),completedContracts:[...state.completedContracts,contract.id],contracts:state.contracts.filter(c=>c.id!==contract.id),transactionLog:[`${vessel.name} angekommen · Netto ${currency(net)}`,`Frachtumsatz ${currency(contract.payout)} · Kosten ${currency(costs)}`,...state.transactionLog]};
}

export function companyValue(state:GameState){return state.cash+state.vessels.reduce((sum,v)=>sum+Math.round(1_000_000*(v.capacityTonnes/18_000)*(v.condition/100)),0);}
export function attentionCount(state:GameState){return state.vessels.filter(v=>v.condition<80||v.fuelTonnes<300).length;}
export function currency(value:number){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);}
function hashSeed(input:string){let h=2166136261;for(const ch of input)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
function seededUnit(seed:number){let x=seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967295;}
