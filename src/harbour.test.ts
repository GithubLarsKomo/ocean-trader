import{describe,expect,it}from'vitest';
import{HARBOUR,initialHarbourState,isDocked,stepHarbour}from'./harbour';

describe('VI-004 harbour manoeuvre',()=>{
 it('accelerates ahead and turns only with way on',()=>{let s=initialHarbourState();for(let i=0;i<120;i++)s=stepHarbour(s,{throttle:1,rudder:0},1/60);expect(s.speed).toBeGreaterThan(0);const h=s.heading;for(let i=0;i<60;i++)s=stepHarbour(s,{throttle:.4,rudder:1},1/60);expect(s.heading).not.toBe(h);});
 it('requires low speed and aligned heading inside berth',()=>{const base={...initialHarbourState(),x:HARBOUR.berth.x+80,y:HARBOUR.berth.y+27,heading:0,speed:.1};expect(isDocked(base)).toBe(true);expect(isDocked({...base,speed:1})).toBe(false);expect(isDocked({...base,heading:.5})).toBe(false);});
 it('damages condition on a hard collision',()=>{const s={...initialHarbourState(),x:815,y:125,heading:0,speed:2,impactCooldown:0};const next=stepHarbour(s,{throttle:0,rudder:0},.1);expect(next.collisions).toBeGreaterThan(0);expect(next.condition).toBeLessThan(s.condition);});
 it('enters docked terminal state when criteria are met',()=>{const s={...initialHarbourState(),x:HARBOUR.berth.x+80,y:HARBOUR.berth.y+27,heading:0,speed:.1};const next=stepHarbour(s,{throttle:0,rudder:0},.01);expect(next.docked).toBe(true);expect(next.speed).toBe(0);});
});
