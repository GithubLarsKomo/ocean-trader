import type { ShipClassId } from './domain';

export type EraId='classic'|'container'|'global'|'digital'|'transition'|'future';
export interface EraSpec{ id:EraId; fromYear:number; name:string; kicker:string; description:string; unlockedClasses:ShipClassId[]; fuelMultiplier:number; maintenanceMultiplier:number; portMultiplier:number; marketVolatility:number; }

export const ERAS:EraSpec[]=[
 {id:'classic',fromYear:1970,name:'Classic Shipping',kicker:'1970–1984',description:'Breakbulk, regional tramp trade and mechanically simple fleets dominate.',unlockedClasses:['coaster','handysize'],fuelMultiplier:1.08,maintenanceMultiplier:1.00,portMultiplier:.92,marketVolatility:.82},
 {id:'container',fromYear:1985,name:'Container Expansion',kicker:'1985–1999',description:'Container networks accelerate schedules and reward fast feeder connections.',unlockedClasses:['coaster','handysize','feeder'],fuelMultiplier:1.04,maintenanceMultiplier:.97,portMultiplier:1.00,marketVolatility:.92},
 {id:'global',fromYear:2000,name:'Global Scale',kicker:'2000–2014',description:'Global supply chains and larger vessels increase both opportunity and capital exposure.',unlockedClasses:['coaster','handysize','feeder','panamax'],fuelMultiplier:1.00,maintenanceMultiplier:.94,portMultiplier:1.08,marketVolatility:1.00},
 {id:'digital',fromYear:2015,name:'Digital Fleet',kicker:'2015–2029',description:'Routing, maintenance planning and port efficiency improve while schedule pressure rises.',unlockedClasses:['coaster','handysize','feeder','panamax'],fuelMultiplier:.93,maintenanceMultiplier:.86,portMultiplier:1.12,marketVolatility:1.08},
 {id:'transition',fromYear:2030,name:'Energy Transition',kicker:'2030–2044',description:'Fuel efficiency, emissions pressure and retrofit economics reshape fleet strategy.',unlockedClasses:['coaster','handysize','feeder','panamax'],fuelMultiplier:.82,maintenanceMultiplier:.90,portMultiplier:1.18,marketVolatility:1.14},
 {id:'future',fromYear:2045,name:'Autonomous Horizons',kicker:'2045+',description:'Highly assisted operations lower routine cost while technology investment becomes decisive.',unlockedClasses:['coaster','handysize','feeder','panamax'],fuelMultiplier:.70,maintenanceMultiplier:.78,portMultiplier:1.23,marketVolatility:1.20}
];

export function eraForDate(date:string){const year=Number(date.slice(0,4))||1970;return [...ERAS].reverse().find(e=>year>=e.fromYear)??ERAS[0];}
export function nextEra(date:string){const current=eraForDate(date);const i=ERAS.findIndex(e=>e.id===current.id);return ERAS[i+1]??null;}
export function classUnlocked(classId:ShipClassId,date:string){return eraForDate(date).unlockedClasses.includes(classId);}
export function addCalendarDays(date:string,days:number){const d=new Date(`${date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
