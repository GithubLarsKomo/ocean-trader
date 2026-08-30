import{describe,expect,it}from'vitest';
import{acceptContract,advanceVoyageDay,createInitialState}from'./domain';
import{MAP_HEIGHT,MAP_WIDTH,etaDays,interpolateGeo,mapPorts,portById,project,vesselMapPosition,visualPortPosition,voyageProgress}from'./map';

describe('VI-003 world map',()=>{
  it('contains exactly twenty real port positions inside projection bounds',()=>{
    expect(mapPorts).toHaveLength(20);
    for(const port of mapPorts){const p=project(port.lat,port.lon);expect(p.x).toBeGreaterThanOrEqual(0);expect(p.x).toBeLessThanOrEqual(MAP_WIDTH);expect(p.y).toBeGreaterThanOrEqual(0);expect(p.y).toBeLessThanOrEqual(MAP_HEIGHT);}
  });
  it('keeps calibrated bitmap anchors stable for representative coasts',()=>{
    expect(visualPortPosition('NYC')).toEqual({x:297.3,y:196.1});
    expect(visualPortPosition('CPT')).toEqual({x:564.3,y:382.2});
    expect(visualPortPosition('BOM')).toEqual({x:718.4,y:247.7});
    expect(visualPortPosition('SIN')).toEqual({x:791.3,y:272.9});
    expect(visualPortPosition('TYO')).toEqual({x:929.6,y:177.6});
    expect(visualPortPosition('SYD')).toEqual({x:916.3,y:372.6});
  });
  it('moves an active vessel deterministically between origin and destination',()=>{
    let state=acceptContract(createInitialState(),'ot-vessel-001','C-HAM-NYC-001');
    const ship=state.vessels.find(v=>v.id==='ot-vessel-001')!;
    const start=vesselMapPosition(state,ship);
    state=advanceVoyageDay(state,ship.id);
    const moved=vesselMapPosition(state,state.vessels.find(v=>v.id===ship.id)!);
    expect(moved).not.toEqual(start);
    const voyage=state.voyages.find(v=>v.vesselId===ship.id)!;
    expect(voyageProgress(voyage)).toBeCloseTo(1/8);
    expect(etaDays(voyage)).toBe(7);
  });
  it('interpolates safely across the date line',()=>{
    const a={...portById('TYO'),lon:170};
    const b={...portById('SYD'),lon:-170};
    expect(Math.abs(interpolateGeo(a,b,.5).lon)).toBe(180);
  });
});
