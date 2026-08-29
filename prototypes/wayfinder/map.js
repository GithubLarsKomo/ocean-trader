import { PORTS20, projected, makeFleet, advanceFleet, vesselPosition } from "./map-engine.mjs";

const canvas=document.getElementById("worldCanvas");
const ctx=canvas.getContext("2d");
const $=id=>document.getElementById(id);

let fleet=makeFleet();
let camera={zoom:1,offsetX:0,offsetY:0};
let selected={type:null,id:null};
let drag=null;

function screenPoint(norm){
  const baseX=norm.x*canvas.width,baseY=norm.y*canvas.height;
  return {
    x:(baseX-canvas.width/2)*camera.zoom+canvas.width/2+camera.offsetX,
    y:(baseY-canvas.height/2)*camera.zoom+canvas.height/2+camera.offsetY
  };
}

function normFromEvent(e){
  const r=canvas.getBoundingClientRect();
  return {x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)};
}

function drawBackground(){
  const g=ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,"#0c3142");g.addColorStop(1,"#061d29");
  ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.save();
  ctx.globalAlpha=.28;
  ctx.fillStyle="#557a79";
  const blobs=[
    [.20,.35,.11,.16],[.29,.44,.10,.18],[.42,.47,.17,.20],[.58,.42,.16,.18],
    [.72,.39,.16,.17],[.80,.65,.09,.11],[.47,.70,.08,.10]
  ];
  blobs.forEach(([x,y,rx,ry])=>{
    const p=screenPoint({x,y});
    ctx.beginPath();ctx.ellipse(p.x,p.y,rx*canvas.width*camera.zoom,ry*canvas.height*camera.zoom,0,0,Math.PI*2);ctx.fill();
  });
  ctx.restore();

  ctx.strokeStyle="rgba(180,220,235,.09)";ctx.lineWidth=1;
  for(let lon=-180;lon<=180;lon+=30){
    const a=screenPoint({x:(lon+180)/360,y:0}),b=screenPoint({x:(lon+180)/360,y:1});
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  for(let lat=-60;lat<=60;lat+=30){
    const y=(90-lat)/180,a=screenPoint({x:0,y}),b=screenPoint({x:1,y});
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
}

function drawRoutes(){
  fleet.forEach(v=>{
    const a=screenPoint(projected(PORTS20[v.from])),b=screenPoint(projected(PORTS20[v.to]));
    ctx.save();
    ctx.setLineDash([10,7]);
    ctx.strokeStyle=selected.type==="vessel"&&selected.id===v.id?"#e8b45c":"rgba(78,197,193,.50)";
    ctx.lineWidth=selected.type==="vessel"&&selected.id===v.id?3:2;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.restore();
  });
}

function drawPorts(){
  Object.entries(PORTS20).forEach(([code,p])=>{
    const s=screenPoint(projected(p));
    const active=selected.type==="port"&&selected.id===code;
    ctx.fillStyle=active?"#e8b45c":"#92abb7";
    ctx.strokeStyle="#07131d";ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(s.x,s.y,active?7:5,0,Math.PI*2);ctx.fill();ctx.stroke();

    if(camera.zoom>1.15||active){
      ctx.fillStyle="#c5d7de";ctx.font=`${Math.max(11,12*camera.zoom*.85)}px system-ui`;
      ctx.fillText(p.name,s.x+9,s.y-7);
    }
  });
}

function drawVessels(){
  fleet.forEach(v=>{
    const p=screenPoint(projected(vesselPosition(v)));
    const active=selected.type==="vessel"&&selected.id===v.id;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(
      projected(PORTS20[v.to]).y-projected(PORTS20[v.from]).y,
      projected(PORTS20[v.to]).x-projected(PORTS20[v.from]).x
    ));
    ctx.fillStyle=active?"#e8b45c":"#ffffff";ctx.strokeStyle="#10212b";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(4,-6);ctx.lineTo(-11,-5);ctx.lineTo(-12,5);ctx.lineTo(4,6);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();

    if(active){
      ctx.fillStyle="#ffffff";ctx.font="700 13px system-ui";ctx.fillText(v.name,p.x+13,p.y-10);
    }
  });
}

function draw(){
  drawBackground();drawRoutes();drawPorts();drawVessels();
}

function hitTest(pt){
  for(const v of fleet){
    const p=screenPoint(projected(vesselPosition(v)));
    if(Math.hypot(pt.x-p.x,pt.y-p.y)<15)return{type:"vessel",id:v.id};
  }
  for(const [code,p0] of Object.entries(PORTS20)){
    const p=screenPoint(projected(p0));
    if(Math.hypot(pt.x-p.x,pt.y-p.y)<13)return{type:"port",id:code};
  }
  return null;
}

canvas.addEventListener("pointerdown",e=>{
  canvas.setPointerCapture(e.pointerId);
  drag={start:normFromEvent(e),offsetX:camera.offsetX,offsetY:camera.offsetY,moved:false};
});
canvas.addEventListener("pointermove",e=>{
  if(!drag)return;
  const p=normFromEvent(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
  if(Math.hypot(dx,dy)>4)drag.moved=true;
  camera.offsetX=drag.offsetX+dx;camera.offsetY=drag.offsetY+dy;draw();
});
canvas.addEventListener("pointerup",e=>{
  const p=normFromEvent(e);
  if(drag&&!drag.moved){
    const hit=hitTest(p);
    if(hit){selected=hit;renderDetail();}
  }
  drag=null;draw();
});
canvas.addEventListener("wheel",e=>{
  e.preventDefault();
  const factor=e.deltaY<0?1.12:.89;
  camera.zoom=Math.max(.7,Math.min(3.2,camera.zoom*factor));
  draw();
},{passive:false});

$("zoomIn").onclick=()=>{camera.zoom=Math.min(3.2,camera.zoom*1.2);draw()};
$("zoomOut").onclick=()=>{camera.zoom=Math.max(.7,camera.zoom/1.2);draw()};
$("resetMap").onclick=()=>{camera={zoom:1,offsetX:0,offsetY:0};selected={type:null,id:null};renderDetail();draw()};
$("advanceBtn").onclick=()=>{fleet=advanceFleet(fleet,6);renderFleet();renderDetail();draw()};

function fmtEta(h){
  const d=Math.floor(h/24),hr=Math.round(h%24);
  return d>0?`${d} d ${hr} h`:`${hr} h`;
}

function renderFleet(){
  const box=$("fleetList");box.innerHTML="";
  fleet.forEach(v=>{
    const el=document.createElement("div");
    el.className="fleet-card"+(selected.type==="vessel"&&selected.id===v.id?" active":"");
    el.innerHTML=`<strong>${v.name}</strong><span>${PORTS20[v.from].name} → ${PORTS20[v.to].name}</span><span>${v.speed} kn · ETA ${fmtEta(v.etaHours)}</span><div class="progress"><i style="width:${Math.round(v.progress*100)}%"></i></div>`;
    el.onclick=()=>{selected={type:"vessel",id:v.id};renderFleet();renderDetail();draw()};
    box.appendChild(el);
  });
}

function renderDetail(){
  const box=$("detailBox");
  if(selected.type==="port"){
    const p=PORTS20[selected.id];
    const arriving=fleet.filter(v=>v.to===selected.id).length;
    const departing=fleet.filter(v=>v.from===selected.id).length;
    box.innerHTML=`<strong>${p.name}</strong>Code: ${selected.id}<br>Koordinaten: ${p.lat.toFixed(2)}, ${p.lon.toFixed(2)}<br>Aktuell abgehend: ${departing}<br>Aktuell ankommend: ${arriving}`;
  }else if(selected.type==="vessel"){
    const v=fleet.find(x=>x.id===selected.id);
    if(v)box.innerHTML=`<strong>${v.name}</strong>${PORTS20[v.from].name} → ${PORTS20[v.to].name}<br>${v.distanceNm.toLocaleString("de-DE")} sm<br>${v.speed} kn<br>Fortschritt: ${Math.round(v.progress*100)} %<br>ETA: ${fmtEta(v.etaHours)}`;
  }else{
    box.textContent="Wähle einen Hafen oder ein Schiff auf der Karte.";
  }
  renderFleet();
}

renderFleet();renderDetail();draw();
