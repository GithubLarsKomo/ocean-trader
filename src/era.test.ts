import{describe,expect,it}from'vitest';
import{advanceEra,buyShip,createInitialState,currentEra,eraTransition}from'./domain';
import{classUnlocked,eraForDate}from'./era';

describe('VI-008 era progression',()=>{
 it('derives the classic era from the 1970 campaign date',()=>{expect(eraForDate('1970-01-05').id).toBe('classic');expect(currentEra(createInitialState()).name).toBe('Classic Shipping');});
 it('unlocks feeder in 1985 and panamax in 2000',()=>{expect(classUnlocked('feeder','1970-01-01')).toBe(false);expect(classUnlocked('feeder','1985-01-01')).toBe(true);expect(classUnlocked('panamax','1999-12-31')).toBe(false);expect(classUnlocked('panamax','2000-01-01')).toBe(true);});
 it('prevents buying a ship class before its era',()=>{let s={...createInitialState(),cash:5_000_000};const feeder=s.shipMarket.find(o=>o.vessel.classId==='feeder')!;expect(()=>buyShip(s,feeder.id)).toThrow();});
 it('advances to the next era with visible cost and fleet ageing consequence',()=>{let s={...createInitialState(),cash:2_000_000};const preview=eraTransition(s)!;expect(preview.target.fromYear).toBe(1985);const before=s.vessels[0].condition;s=advanceEra(s);expect(s.campaignDate).toBe('1985-01-01');expect(s.cash).toBe(2_000_000-preview.cost);expect(s.vessels[0].condition).toBeLessThan(before);expect(classUnlocked('feeder',s.campaignDate)).toBe(true);});
 it('does not allow strategic time jump while voyages are active',()=>{const s={...createInitialState(),voyages:[{id:'x',vesselId:'ot-vessel-001',contractId:'C-HAM-RTM-001',day:0,totalDays:2,fuelCost:0,maintenanceCost:0,eventCost:0,seed:1,events:[]}]};expect(()=>advanceEra(s)).toThrow();});
});
