import assert from "node:assert/strict";
import { PORTS20, makeFleet, advanceFleet, vesselPosition, projected } from "./map-engine.mjs";

assert.equal(Object.keys(PORTS20).length,20,"expected 20 ports");
const fleet=makeFleet();
assert.equal(fleet.length,5,"expected five vessels");
assert.ok(fleet.every(v=>v.distanceNm>0&&v.etaHours>=0));

for(const v of fleet){
  const p=vesselPosition(v);
  assert.ok(Number.isFinite(p.lat)&&Number.isFinite(p.lon));
  const s=projected(p);
  assert.ok(s.x>=0&&s.x<=1&&s.y>=0&&s.y<=1);
}

const advanced=advanceFleet(fleet,6);
assert.equal(advanced.length,5);
assert.ok(advanced.some((v,i)=>v.progress!==fleet[i].progress),"fleet should advance");

console.log("world map tests: PASS");
