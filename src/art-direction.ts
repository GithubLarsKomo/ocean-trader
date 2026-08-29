type LonLat=[number,number];
const VW=1000,VH=520,DPR=2;
const land:LonLat[][]=[
[[-168,71],[-150,62],[-136,58],[-126,51],[-124,42],[-117,32],[-105,25],[-96,18],[-86,17],[-81,25],[-80,32],[-74,40],[-66,47],[-58,53],[-63,61],[-82,69],[-108,73],[-137,70]],
[[-81,12],[-72,10],[-61,6],[-52,-2],[-47,-15],[-51,-28],[-58,-39],[-68,-54],[-75,-49],[-73,-35],[-79,-18],[-81,-4]],
[[-53,83],[-28,78],[-20,69],[-30,61],[-45,59],[-59,67],[-65,76]],
[[-10,36],[-5,44],[4,48],[8,56],[20,60],[30,70],[48,70],[70,76],[100,76],[126,70],[152,63],[170,57],[160,47],[144,42],[134,35],[122,25],[109,18],[103,8],[96,5],[88,19],[78,22],[70,30],[58,27],[49,40],[39,45],[31,40],[23,37],[14,36],[5,36]],
[[-18,36],[-6,37],[10,35],[23,31],[34,27],[43,12],[50,2],[43,-12],[35,-25],[25,-34],[14,-35],[4,-30],[-4,-18],[-10,-2],[-16,15]],
[[112,-11],[130,-12],[145,-19],[153,-29],[147,-39],[132,-43],[116,-34],[111,-22]],
[[95,6],[106,7],[115,1],[120,-6],[113,-10],[104,-7],[98,-1]],
[[130,34],[136,36],[142,43],[145,48],[141,42],[137,36]],
[[-180,-67],[-140,-71],[-90,-73],[-40,-70],[10,-72],[70,-70],[125,-73],[180,-68],[180,-90],[-180,-90]]
];
const proj=([lon,lat]:LonLat):[number,number]=>[(lon+180)/360*VW,(90-lat)/180*VH];
function rng(seed:number){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function pathPolygon(ctx:CanvasRenderingContext2D,poly:LonLat[]){poly.forEach((p,i)=>{const[x,y]=proj(p);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.closePath()}
function drawWorld(canvas:HTMLCanvasElement){canvas.width=VW*DPR;canvas.height=VH*DPR;const c=canvas.getContext('2d');if(!c)return;c.scale(DPR,DPR);
 const ocean=c.createLinearGradient(0,0,0,VH);ocean.addColorStop(0,'#071923');ocean.addColorStop(.48,'#0a2937');ocean.addColorStop(1,'#061721');c.fillStyle=ocean;c.fillRect(0,0,VW,VH);
 const glow=c.createRadialGradient(500,250,30,500,250,520);glow.addColorStop(0,'rgba(42,100,118,.22)');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,VW,VH);
 c.strokeStyle='rgba(111,165,180,.09)';c.lineWidth=.7;for(let lon=-150;lon<=150;lon+=30){const[x]=proj([lon,0]);c.beginPath();c.moveTo(x,0);c.lineTo(x,VH);c.stroke()}for(let lat=-60;lat<=60;lat+=20){const[,y]=proj([0,lat]);c.beginPath();c.moveTo(0,y);c.lineTo(VW,y);c.stroke()}
 c.save();c.shadowColor='rgba(73,156,179,.28)';c.shadowBlur=12;c.beginPath();land.forEach(p=>pathPolygon(c,p));const lg=c.createLinearGradient(0,60,0,480);lg.addColorStop(0,'#254653');lg.addColorStop(.5,'#193943');lg.addColorStop(1,'#102d36');c.fillStyle=lg;c.fill();c.strokeStyle='#557986';c.lineWidth=1.2;c.stroke();c.restore();
 c.save();c.beginPath();land.forEach(p=>pathPolygon(c,p));c.clip();const r=rng(19700105);for(let i=0;i<1000;i++){const x=r()*VW,y=r()*VH,a=r();if(a>.78){c.fillStyle=`rgba(229,181,83,${.05+r()*.28})`;c.fillRect(x,y,.7+r()*1.4,.7+r()*1.4)}}c.restore();
 const r=rng(42);for(let i=0;i<1300;i++){const x=r()*VW,y=r()*VH;c.fillStyle=`rgba(128,191,207,${r()*.025})`;c.fillRect(x,y,1,1)}
 const v=c.createRadialGradient(VW/2,VH/2,160,VW/2,VH/2,650);v.addColorStop(.55,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=v;c.fillRect(0,0,VW,VH)
}
function drawHarbour(canvas:HTMLCanvasElement){const W=1200,H=720;canvas.width=W*DPR;canvas.height=H*DPR;const c=canvas.getContext('2d');if(!c)return;c.scale(DPR,DPR);const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0c3a4a');g.addColorStop(.6,'#082b39');g.addColorStop(1,'#061d28');c.fillStyle=g;c.fillRect(0,0,W,H);
 const r=rng(918);for(let i=0;i<2600;i++){c.fillStyle=`rgba(124,196,211,${.015+r()*.055})`;const y=r()*H;c.fillRect(r()*W,y,12+r()*42,.7)}
 const quay=(x:number,y:number,w:number,h:number)=>{c.fillStyle='#232c2e';c.fillRect(x,y,w,h);c.strokeStyle='#8c774a';c.lineWidth=2;c.strokeRect(x,y,w,h);for(let i=0;i<w;i+=54){c.fillStyle=i%108===0?'#a9542f':'#38586a';c.fillRect(x+i+7,y+10,38,16);c.fillStyle='#c38b42';c.fillRect(x+i+11,y+30,34,13)}};quay(0,35,410,145);quay(825,500,375,180);quay(930,0,270,160);
 c.strokeStyle='rgba(226,183,83,.7)';c.setLineDash([12,12]);c.lineWidth=2;c.strokeRect(655,305,285,92);c.setLineDash([]);
 for(let i=0;i<5;i++){const x=85+i*66;c.strokeStyle='#5e7480';c.lineWidth=4;c.beginPath();c.moveTo(x,34);c.lineTo(x+18,-5);c.lineTo(x+48,34);c.stroke()}
 for(let i=0;i<7;i++){const x=560+i*70;c.fillStyle='rgba(226,183,83,.8)';c.beginPath();c.arc(x,270+Math.sin(i)*18,4,0,Math.PI*2);c.fill()}
 const vg=c.createLinearGradient(0,0,0,H);vg.addColorStop(0,'rgba(0,0,0,.08)');vg.addColorStop(1,'rgba(0,0,0,.34)');c.fillStyle=vg;c.fillRect(0,0,W,H)
}
function drawShip(canvas:HTMLCanvasElement){const W=160,H=58;canvas.width=W*DPR;canvas.height=H*DPR;const c=canvas.getContext('2d');if(!c)return;c.scale(DPR,DPR);c.clearRect(0,0,W,H);c.fillStyle='#c65730';c.beginPath();c.moveTo(10,37);c.lineTo(142,37);c.lineTo(154,28);c.lineTo(145,45);c.lineTo(28,48);c.closePath();c.fill();c.fillStyle='#e9ece8';c.fillRect(112,18,25,18);c.fillRect(119,9,10,9);c.fillStyle='#182a31';c.fillRect(15,28,95,8);for(let i=0;i<5;i++){c.fillStyle=i%2?'#b87a32':'#476774';c.fillRect(25+i*17,17,15,10)}c.strokeStyle='#c9d6d6';c.lineWidth=2;c.beginPath();c.moveTo(108,28);c.lineTo(108,6);c.lineTo(99,18);c.moveTo(133,19);c.lineTo(133,4);c.stroke()}
function drawCargo(canvas:HTMLCanvasElement,kind:string){const S=56;canvas.width=S*DPR;canvas.height=S*DPR;const c=canvas.getContext('2d');if(!c)return;c.scale(DPR,DPR);c.fillStyle='#0a1b24';c.fillRect(0,0,S,S);c.strokeStyle='#a98448';c.lineWidth=1;c.strokeRect(1,1,S-2,S-2);c.strokeStyle='#e2b75f';c.fillStyle='#d9a74c';c.lineWidth=2;
 if(kind==='chemical'){c.beginPath();c.moveTo(22,10);c.lineTo(34,10);c.moveTo(25,10);c.lineTo(25,22);c.lineTo(13,43);c.quadraticCurveTo(28,51,43,43);c.lineTo(31,22);c.lineTo(31,10);c.stroke()}
 else if(kind==='reefer'){c.beginPath();for(let a=0;a<6;a++){const t=a*Math.PI/3;c.moveTo(28,28);c.lineTo(28+Math.cos(t)*18,28+Math.sin(t)*18)}c.stroke()}
 else if(kind==='bulk'){c.beginPath();c.moveTo(10,42);c.quadraticCurveTo(28,8,46,42);c.closePath();c.fill()}
 else {c.fillRect(11,15,34,27);c.strokeStyle='#102631';for(let x=16;x<45;x+=8){c.beginPath();c.moveTo(x,16);c.lineTo(x,41);c.stroke()}}
}
function cargoKind(text:string){const s=text.toLowerCase();if(s.includes('chem'))return'chemical';if(s.includes('reefer')||s.includes('kühl'))return'reefer';if(s.includes('bulk')||s.includes('erz')||s.includes('kohle')||s.includes('getreide'))return'bulk';return'general'}
function fitMapScale(scale:HTMLElement){const scroll=scale.parentElement;if(!scroll)return;const now=parseFloat(scale.style.width||'640');const last=parseFloat(scale.dataset.hybridDisplay||'0');if(last&&Math.abs(now-last)<1)return;const zoom=Math.max(.55,Math.min(2.4,now/640));const target=Math.round(scroll.clientWidth*zoom);scale.dataset.hybridZoom=String(zoom);scale.dataset.hybridDisplay=String(target);scale.style.width=`${target}px`}
function decorate(){document.querySelectorAll<HTMLElement>('.map-scale').forEach(scale=>{fitMapScale(scale);if(!scale.querySelector('.world-art-canvas')){const canvas=document.createElement('canvas');canvas.className='world-art-canvas';drawWorld(canvas);scale.prepend(canvas)}});
 document.querySelectorAll<HTMLElement>('.harbour-stage').forEach(stage=>{if(stage.querySelector('.harbour-art-canvas'))return;const canvas=document.createElement('canvas');canvas.className='harbour-art-canvas';drawHarbour(canvas);stage.prepend(canvas)});
 document.querySelectorAll<HTMLButtonElement>('.fleet-row,.ship-offer').forEach(row=>{if(row.querySelector('.fleet-vessel-art'))return;const canvas=document.createElement('canvas');canvas.className='fleet-vessel-art';drawShip(canvas);row.prepend(canvas)});
 document.querySelectorAll<HTMLElement>('.contract-card').forEach(card=>{if(card.querySelector('.cargo-art'))return;const canvas=document.createElement('canvas');canvas.className='cargo-art';drawCargo(canvas,cargoKind(card.querySelector('h3')?.textContent||''));card.append(canvas);card.classList.add('hybrid-contract')})}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})};new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});window.addEventListener('resize',schedule);document.addEventListener('DOMContentLoaded',schedule);schedule();
