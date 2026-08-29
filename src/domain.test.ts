import{describe,expect,it}from'vitest';
import{acceptContract,advanceAllVoyagesDay,advanceVoyageDay,createInitialState,voyageForVessel}from'./domain';

describe('VI-002 fleet management',()=>{
 it('runs two voyages independently and settles each once',()=>{let s=createInitialState();s=acceptContract(s,'ot-vessel-001','C-HAM-RTM-001');s=acceptContract(s,'ot-vessel-002','C-RTM-NYC-001');expect(s.voyages).toHaveLength(2);s=advanceVoyageDay(s,'ot-vessel-001');expect(voyageForVessel(s,'ot-vessel-001')?.day).toBe(1);expect(voyageForVessel(s,'ot-vessel-002')?.day).toBe(0);s=advanceVoyageDay(s,'ot-vessel-001');expect(voyageForVessel(s,'ot-vessel-001')).toBeNull();expect(voyageForVessel(s,'ot-vessel-002')).not.toBeNull();expect(s.completedContracts).toEqual(['C-HAM-RTM-001']);});
 it('advances all active vessels exactly one day',()=>{let s=createInitialState();s=acceptContract(s,'ot-vessel-001','C-HAM-NYC-001');s=acceptContract(s,'ot-vessel-002','C-RTM-NYC-001');s=advanceAllVoyagesDay(s);expect(s.voyages.map(v=>v.day)).toEqual([1,1]);});
 it('is deterministic for the same fleet commands',()=>{const run=()=>{let s=createInitialState();s=acceptContract(s,'ot-vessel-001','C-HAM-NYC-001');s=acceptContract(s,'ot-vessel-002','C-RTM-NYC-001');for(let i=0;i<8;i++)s=advanceAllVoyagesDay(s);return s;};expect(run()).toEqual(run());});
});
