export const WORLD={
  width:1200,height:720,
  berth:{x:930,y:180,w:170,h:54,heading:0},
  shallow:[
    {x:0,y:0,w:1200,h:48},{x:0,y:0,w:70,h:720},
    {x:0,y:640,w:1200,h:80},{x:1050,y:0,w:150,h:130}
  ],
  quays:[
    {x:820,y:105,w:340,h:42},{x:820,y:247,w:340,h:42},{x:1120,y:105,w:40,h:184}
  ],
  breakwaters:[
    {x:330,y:450,w:260,h:34},{x:330,y:450,w:34,h:170}
  ]
};

export function initialHarborState(){
  return{x:160,y:520,heading:-0.08,speed:0,throttle:0,rudder:0,
    condition:100,collisions:0,groundings:0,docked:false,elapsed:0,
    message:"Verlasse das Hafenbecken und lege langsam im markierten Liegeplatz an."};
}

export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function normAngle(a){
  while(a>Math.PI)a-=Math.PI*2;
  while(a<-Math.PI)a+=Math.PI*2;
  return a;
}
const pointInRect=(x,y,r)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;

function shipSamplePoints(s){
  const halfL=31,halfW=10,c=Math.cos(s.heading),sn=Math.sin(s.heading);
  return [[halfL,0],[-halfL,0],[0,halfW],[0,-halfW],
    [halfL*.72,halfW*.7],[halfL*.72,-halfW*.7],
    [-halfL*.72,halfW*.7],[-halfL*.72,-halfW*.7]].map(([lx,ly])=>({
      x:s.x+lx*c-ly*sn,y:s.y+lx*sn+ly*c
    }));
}
const anyPointInRects=(points,rects)=>points.some(p=>rects.some(r=>pointInRect(p.x,p.y,r)));
const inWorldBounds=points=>points.every(p=>p.x>=0&&p.x<=WORLD.width&&p.y>=0&&p.y<=WORLD.height);

export function isDocked(s){
  const b=WORLD.berth;
  const centerOk=s.x>b.x&&s.x<b.x+b.w&&s.y>b.y&&s.y<b.y+b.h;
  const headingError=Math.abs(normAngle(s.heading-b.heading));
  return centerOk&&Math.abs(s.speed)<0.22&&headingError<0.18;
}

export function stepHarbor(state,input,dt=1/60){
  if(state.docked)return state;
  const throttle=clamp(input.throttle??state.throttle,-1,1);
  const rudder=clamp(input.rudder??state.rudder,-1,1);

  let speed=state.speed+throttle*0.44*dt;
  speed*=Math.max(0,1-0.055*dt*(0.35+Math.abs(speed)*0.22));
  speed=clamp(speed,-2.6,5.2);

  const steerAuthority=clamp(Math.abs(speed)/2.2,0,1);
  const turnRate=rudder*0.54*steerAuthority*Math.sign(speed||1);
  const heading=normAngle(state.heading+turnRate*dt);

  let next={...state,
    x:state.x+Math.cos(heading)*speed*18*dt,
    y:state.y+Math.sin(heading)*speed*18*dt,
    heading,speed,throttle,rudder,elapsed:state.elapsed+dt,
    message:"Manövriere mit geringer Geschwindigkeit zum Liegeplatz."
  };

  const points=shipSamplePoints(next);
  const hardHit=anyPointInRects(points,[...WORLD.quays,...WORLD.breakwaters])||!inWorldBounds(points);
  const shallowHit=anyPointInRects(points,WORLD.shallow);

  if(hardHit){
    next={...next,x:state.x,y:state.y,speed:-state.speed*0.18,
      condition:clamp(state.condition-Math.max(2,Math.abs(state.speed)*2.5),0,100),
      collisions:state.collisions+1,
      message:"Kollision! Geschwindigkeit reduzieren und neu ansetzen."};
  }else if(shallowHit){
    next={...next,speed:state.speed*0.35,
      condition:clamp(state.condition-1.2,0,100),
      groundings:state.groundings+1,
      message:"Grundberührung! Das Schiff verliert stark Fahrt."};
  }

  if(isDocked(next)){
    next={...next,speed:0,throttle:0,rudder:0,docked:true,
      message:"Festgemacht. Docking erfolgreich."};
  }
  return next;
}
