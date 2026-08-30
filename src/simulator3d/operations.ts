import type { ManoeuvreState, VesselLoadState } from '../simulation/state'
import type { VesselParameters } from '../simulation/vessel-parameters'
import type { P5HarbourScenario } from './rotterdam'

export type HarbourOperationState = {
  collisions: number
  damage: number
  docked: boolean
  contactActive: boolean
  message: string
}

export const initialHarbourOperationState = (): HarbourOperationState => ({ collisions: 0, damage: 0, docked: false, contactActive: false, message: 'Approach berth' })

const pointInBox = (x:number,z:number,box:{x:number;z:number;length:number;width:number},margin=0)=>Math.abs(x-box.x)<=box.length/2+margin&&Math.abs(z-box.z)<=box.width/2+margin
const angleDelta=(a:number,b:number)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))
const d2=(ax:number,az:number,bx:number,bz:number)=>(ax-bx)**2+(az-bz)**2
const world=(s:ManoeuvreState,sc:P5HarbourScenario)=>({x:sc.spawn.x+s.x*sc.renderScale,z:sc.spawn.z+s.y*sc.renderScale})

function hullSamples(s:ManoeuvreState,sc:P5HarbourScenario,v:VesselParameters){
  const p=world(s,sc), halfL=Math.max(3.2,v.lengthMeters/36), halfB=Math.max(1.05,v.beamMeters/24)
  const c=Math.cos(s.heading),q=Math.sin(s.heading)
  const local:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[[-halfL,0],[halfL,0],[0,-halfB],[0,halfB],[-halfL*.72,-halfB],[-halfL*.72,halfB],[halfL*.72,0]]
  return local.map(([lx,lz])=>({x:p.x+lx*c-lz*q,z:p.z+lx*q+lz*c}))
}

function contact(state:ManoeuvreState,previous:ManoeuvreState,vessel:VesselParameters,scenario:P5HarbourScenario){
  const now=hullSamples(state,scenario,vessel), prev=hullSamples(previous,scenario,vessel)
  const swept=now.flatMap((p,i)=>[p,{x:(p.x+prev[i].x)/2,z:(p.z+prev[i].z)/2},prev[i]])
  const hitQuay=scenario.quays.some(q=>swept.some(p=>pointInBox(p.x,p.z,q,.12)))
  if(hitQuay)return 'quay' as const
  const hitBuoy=scenario.buoys.some(b=>swept.some(p=>d2(p.x,p.z,b.x,b.z)<=(b.radius+.62)**2))
  return hitBuoy?'buoy' as const:null
}

export function evaluateHarbourOperation(state:ManoeuvreState,previous:ManoeuvreState,vessel:VesselParameters,load:VesselLoadState,scenario:P5HarbourScenario,operation:HarbourOperationState):{state:ManoeuvreState;operation:HarbourOperationState}{
  const p=world(state,scenario), speed=Math.hypot(state.surge,state.sway), contactKind=contact(state,previous,vessel,scenario)
  if(contactKind){
    if(operation.contactActive)return{state:{...previous,surge:previous.surge*-.08,sway:previous.sway*-.15,yawRate:previous.yawRate*.35},operation}
    const massImpact=Math.max(1,speed*load.displacementTonnes/5500)
    const impact=contactKind==='quay'?Math.min(18,massImpact):Math.min(4,.35+massImpact*.22)
    const rebound=contactKind==='quay'?.10:.20
    return{state:{...previous,surge:-previous.surge*rebound,sway:-previous.sway*rebound,yawRate:previous.yawRate*.3,condition:Math.max(0,previous.condition-impact)},operation:{...operation,contactActive:true,collisions:operation.collisions+1,damage:operation.damage+impact,message:contactKind==='quay'?`Quay contact · damage ${impact.toFixed(1)}%`:`Navigation buoy struck · damage ${impact.toFixed(1)}%`}}
  }
  const released=operation.contactActive?{...operation,contactActive:false}:operation
  const inBerth=pointInBox(p.x,p.z,scenario.berth,0),aligned=angleDelta(state.heading,scenario.berth.heading)<.18,slow=speed<.22
  if(inBerth&&aligned&&slow)return{state:{...state,surge:0,sway:0,yawRate:0},operation:{...released,docked:true,message:'All fast · berth secured'}}
  return{state,operation:{...released,message:speed>.8?'Reduce speed for berth approach':'Approach berth'}}
}
