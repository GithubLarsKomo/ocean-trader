import { createInitialState, type GameState, type Vessel, type Voyage } from './domain';

export const SAVE_KEY='ocean-trader.save.v2';
export const LEGACY_KEY='ocean-trader.save.v1';

type LegacyState={schemaVersion:1;campaignDate:string;cash:number;reputation:number;vessel:Vessel;contracts:GameState['contracts'];activeVoyage:(Omit<Voyage,'vesselId'>)|null;completedContracts:string[];transactionLog:string[]};

export function serializeState(state:GameState){return JSON.stringify(state);}
export function parseState(raw:string):GameState|null{try{const value=JSON.parse(raw) as Partial<GameState>;if(value.schemaVersion!==2||typeof value.cash!=='number'||!Array.isArray(value.vessels)||!Array.isArray(value.voyages)||!Array.isArray(value.contracts))return null;return value as GameState;}catch{return null;}}
function migrateLegacy(raw:string):GameState|null{try{const old=JSON.parse(raw) as Partial<LegacyState>;if(old.schemaVersion!==1||!old.vessel||!Array.isArray(old.contracts)||typeof old.cash!=='number')return null;const defaults=createInitialState();const extraVessels=defaults.vessels.filter(v=>v.id!==old.vessel!.id);const knownContracts=new Set(old.contracts.map(c=>c.id));const extraContracts=defaults.contracts.filter(c=>!knownContracts.has(c.id));return {schemaVersion:2,campaignDate:old.campaignDate??'1970-01-05',cash:old.cash,reputation:old.reputation??50,vessels:[old.vessel,...extraVessels],contracts:[...old.contracts,...extraContracts],voyages:old.activeVoyage?[{...old.activeVoyage,vesselId:old.vessel.id}]:[],completedContracts:old.completedContracts??[],transactionLog:['Fleet-Update: Spielstand auf Schema v2 migriert',...(old.transactionLog??[])]};}catch{return null;}}
export function loadState(storage:Pick<Storage,'getItem'|'setItem'>):GameState|null{const current=storage.getItem(SAVE_KEY);if(current)return parseState(current);const legacy=storage.getItem(LEGACY_KEY);if(!legacy)return null;const migrated=migrateLegacy(legacy);if(migrated)storage.setItem(SAVE_KEY,serializeState(migrated));return migrated;}
export function saveState(storage:Pick<Storage,'setItem'>,state:GameState){storage.setItem(SAVE_KEY,serializeState(state));}
export function clearState(storage:Pick<Storage,'removeItem'>){storage.removeItem(SAVE_KEY);storage.removeItem(LEGACY_KEY);}
