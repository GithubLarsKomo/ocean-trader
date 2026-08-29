export interface Rect { x:number; y:number; width:number; height:number; }
export interface HarbourState { x:number; y:number; heading:number; speed:number; throttle:number; rudder:number; condition:number; collisions:number; groundings:number; docked:boolean; elapsed:number; impactCooldown:number; message:string; }
export interface HarbourInput { throttle?:number; rudder?:number; }

export const HARBOUR={width:1200,height:720,berth:{x:930,y:180,width:170,height:54,heading:0},shallow:[{x:0,y:0,width:1200,height:48},{x:0,y:0,width:70,height:720},{x:0,y:640,width:1200,height:80},{x:1050,y:0,width:150,height:130}],quays:[{x:820,y:105,width:340,height:42},{x:820,y:247,width:340,height:42},{x:1120,y:105,width:40,height:184}],breakwaters:[{x:330,y:450,width:260,height:34},{x:330,y:450,width:34,height:170}]};

export function initialHarbourState(condition=100):HarbourState{return{x:160,y:520,heading:-0.08,speed:0,throttle:0,rudder:0,condition,collisions:0,groundings:0,docked:false,elapsed:0,impactCooldown:0,message:'Lege langsam im markierten Liegeplatz an.'};}
export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
function normAngle(a:number){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;}
function pointInRect(x:number,y:number,r:Rect){return x>=r.x&&x<=r.x+r.width&&y>=r.y&&y<=r.y+r.height;}
function shipSamplePoints(s:HarbourState){const halfL=31,halfW=10,c=Math.cos(s.heading),sn=Math.sin(s.heading);return [[halfL,0],[-halfL,0],[0,halfW],[0,-halfW],[halfL*.72,halfW*.7],[halfL*.72,-halfW*.7],[-halfL*.72,halfW*.7],[-halfL*.72,-halfW*.7]].map(([lx,ly])=>({x:s.x+lx*c-ly*sn,y:s.y+lx*sn+ly*c}));}
function anyPointInRects(points:{x:number;y:number}[],rects:Rect[]){return points.some(p=>rects.some(r=>pointInRect(p.x,p.y,r)));}
function inBounds(points:{x:number;y:number}[]){return points.every(p=>p.x>=0&&p.x<=HARBOUR.width&&p.y>=0&&p.y<=HARBOUR.height);}
export function isDocked(s:HarbourState){const b=HARBOUR.berth;const centerOk=s.x>b.x&&s.x<b.x+b.width&&s.y>b.y&&s.y<b.y+b.height;return centerOk&&Math.abs(s.speed)<.22&&Math.abs(normAngle(s.heading-b.heading))<.18;}
export function stepHarbour(state:HarbourState,input:HarbourInput,dt=1/60):HarbourState{
 if(state.docked)return state;const throttle=clamp(input.throttle??state.throttle,-1,1),rudder=clamp(input.rudder??state.rudder,-1,1);let speed=state.speed+throttle*.44*dt;speed*=Math.max(0,1-.055*dt*(.35+Math.abs(speed)*.22));speed=clamp(speed,-2.6,5.2);const steerAuthority=clamp(Math.abs(speed)/2.2,0,1),turnRate=rudder*.54*steerAuthority*Math.sign(speed||1),heading=normAngle(state.heading+turnRate*dt);let next:HarbourState={...state,x:state.x+Math.cos(heading)*speed*18*dt,y:state.y+Math.sin(heading)*speed*18*dt,heading,speed,throttle,rudder,elapsed:state.elapsed+dt,impactCooldown:Math.max(0,state.impactCooldown-dt),message:'Manövriere mit geringer Geschwindigkeit zum Liegeplatz.'};const points=shipSamplePoints(next),hard=anyPointInRects(points,[...HARBOUR.quays,...HARBOUR.breakwaters])||!inBounds(points),shallow=anyPointInRects(points,HARBOUR.shallow);
 if(next.impactCooldown<=0&&hard){next={...next,x:state.x,y:state.y,speed:-state.speed*.18,condition:clamp(state.condition-Math.max(2,Math.abs(state.speed)*2.5),0,100),collisions:state.collisions+1,impactCooldown:.8,message:'Kollision! Geschwindigkeit reduzieren und neu ansetzen.'};}
 else if(next.impactCooldown<=0&&shallow){next={...next,speed:state.speed*.35,condition:clamp(state.condition-1.2,0,100),groundings:state.groundings+1,impactCooldown:.8,message:'Grundberührung! Das Schiff verliert stark Fahrt.'};}
 if(isDocked(next))next={...next,speed:0,throttle:0,rudder:0,docked:true,message:'Festgemacht. Docking erfolgreich.'};return next;
}
