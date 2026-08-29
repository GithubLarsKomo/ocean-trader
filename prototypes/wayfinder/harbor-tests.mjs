import assert from "node:assert/strict";
import{initialHarborState,stepHarbor,isDocked,WORLD}from"./harbor-engine.mjs";

let s=initialHarborState();
for(let i=0;i<120;i++)s=stepHarbor(s,{throttle:1,rudder:0},1/60);
assert.ok(s.speed>0.5,"ship should accelerate in open water");
assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.y));

let turn=initialHarborState();
for(let i=0;i<150;i++)turn=stepHarbor(turn,{throttle:1,rudder:1},1/60);
assert.ok(Math.abs(turn.heading-initialHarborState().heading)>0.02,"rudder should change heading while under way");

const dock={...initialHarborState(),x:WORLD.berth.x+WORLD.berth.w/2,y:WORLD.berth.y+WORLD.berth.h/2,heading:.04,speed:.08};
assert.ok(isDocked(dock),"aligned low-speed ship should satisfy docking predicate");

let hit={...initialHarborState(),x:785,y:126,heading:0,speed:2.5};
const before=hit.condition;
for(let i=0;i<40;i++)hit=stepHarbor(hit,{throttle:1,rudder:0},1/60);
assert.ok(hit.collisions>0,"collision should be detected");
assert.ok(hit.condition<before,"collision should reduce condition");

console.log("harbor engine tests: PASS");
