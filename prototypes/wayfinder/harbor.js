import{WORLD,initialHarborState,stepHarbor}from"./harbor-engine.mjs";
const canvas=document.getElementById("harborCanvas"),ctx=canvas.getContext("2d"),$=id=>document.getElementById(id);
let state=initialHarborState(),last=performance.now();
const control={throttle:0,rudder:0};

function syncButtons(){
  document.querySelectorAll("[data-throttle]").forEach(b=>b.classList.toggle("active",Number(b.dataset.throttle)===control.throttle));
  document.querySelectorAll("[data-rudder]").forEach(b=>b.classList.toggle("active",Number(b.dataset.rudder)===control.rudder));
}
function reset(){state=initialHarborState();control.throttle=0;control.rudder=0;syncButtons()}
$("resetHarbor").onclick=reset;
document.querySelectorAll("[data-throttle]").forEach(b=>b.onclick=()=>{control.throttle=Number(b.dataset.throttle);syncButtons()});
document.querySelectorAll("[data-rudder]").forEach(b=>b.onclick=()=>{control.rudder=Number(b.dataset.rudder);syncButtons()});

window.addEventListener("keydown",e=>{
  const k=e.key.toLowerCase();
  if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
  if(k==="w"||k==="arrowup")control.throttle=Math.min(1,control.throttle+.25);
  if(k==="s"||k==="arrowdown")control.throttle=Math.max(-1,control.throttle-.25);
  if(k==="a"||k==="arrowleft")control.rudder=-1;
  if(k==="d"||k==="arrowright")control.rudder=1;
  if(k===" ")control.throttle=0;
  syncButtons();
});
window.addEventListener("keyup",e=>{
  const k=e.key.toLowerCase();
  if(["a","d","arrowleft","arrowright"].includes(k)){control.rudder=0;syncButtons()}
});

function rect(r,fill,stroke=null){ctx.fillStyle=fill;ctx.fillRect(r.x,r.y,r.w,r.h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.strokeRect(r.x,r.y,r.w,r.h)}}
function drawHarbor(){
  const g=ctx.createLinearGradient(0,0,0,WORLD.height);g.addColorStop(0,"#0f3446");g.addColorStop(1,"#082331");
  ctx.fillStyle=g;ctx.fillRect(0,0,WORLD.width,WORLD.height);
  ctx.strokeStyle="rgba(170,220,235,.10)";ctx.lineWidth=1;
  for(let x=0;x<WORLD.width;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,WORLD.height);ctx.stroke()}
  for(let y=0;y<WORLD.height;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WORLD.width,y);ctx.stroke()}
  WORLD.shallow.forEach(r=>rect(r,"#8c7b4d"));WORLD.breakwaters.forEach(r=>rect(r,"#6d7477","#90999c"));WORLD.quays.forEach(r=>rect(r,"#4c565c","#7e8b91"));
  const b=WORLD.berth;ctx.save();ctx.setLineDash([12,8]);ctx.strokeStyle="#6ee7a4";ctx.fillStyle="rgba(80,210,140,.12)";ctx.lineWidth=3;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeRect(b.x,b.y,b.w,b.h);ctx.setLineDash([]);ctx.fillStyle="#b9f7d2";ctx.font="700 18px system-ui";ctx.fillText("LIEGEPLATZ",b.x+16,b.y+34);ctx.restore();
  ctx.fillStyle="rgba(235,244,246,.7)";ctx.font="15px system-ui";ctx.fillText("HAFENEINFAHRT",118,610);ctx.fillText("KAIMAUER",930,93);
}
function drawShip(){
  ctx.save();ctx.translate(state.x,state.y);ctx.rotate(state.heading);ctx.fillStyle=state.docked?"#7fc891":"#e9eef0";ctx.strokeStyle="#10212b";ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(34,0);ctx.lineTo(22,-11);ctx.lineTo(-29,-11);ctx.lineTo(-34,-7);ctx.lineTo(-34,7);ctx.lineTo(-29,11);ctx.lineTo(22,11);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle="#cc5c4f";ctx.fillRect(-6,-9,18,18);ctx.fillStyle="#17303f";ctx.fillRect(-26,-7,14,14);
  ctx.strokeStyle="#e8b45c";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(48,0);ctx.stroke();ctx.restore();
}
function hud(){
  $("speedOut").textContent=`${Math.abs(state.speed).toFixed(1)} kn${state.speed<-.05?" rückwärts":""}`;
  $("throttleOut").textContent=control.throttle>.75?"VOLL VORAUS":control.throttle>.05?"HALB VORAUS":control.throttle<-.05?"ZURÜCK":"STOP";
  $("rudderOut").textContent=control.rudder<-.1?"BACKBORD":control.rudder>.1?"STEUERBORD":"MITTSCHIFFS";
  $("conditionOut").textContent=`${Math.round(state.condition)} %`;$("collisionOut").textContent=state.collisions;$("groundingOut").textContent=state.groundings;
  $("harborMessage").textContent=state.message;$("dockStatus").textContent=state.docked?"FESTGEMACHT":"MANÖVER";
}
function frame(now){const dt=Math.min(.04,(now-last)/1000||1/60);last=now;state=stepHarbor(state,control,dt);drawHarbor();drawShip();hud();requestAnimationFrame(frame)}
syncButtons();requestAnimationFrame(frame);
