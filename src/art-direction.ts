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
type ShipKind='coaster'|'handysize'|'feeder'|'panamax';
const SHIP_ART:Record<ShipKind,string>={coaster:'/art/ship-coaster.svg',handysize:'/art/ship-handysize.svg',feeder:'/art/ship-feeder.svg',panamax:'/art/ship-panamax.svg'};
const proj=([lon,lat]:LonLat):[number,number]=>[(lon+180)/360*VW,(90-lat)/180*VH];
function rng(seed:number){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function pathPolygon(ctx:CanvasRenderingContext2D,poly:LonLat[]){poly.forEach((p,i)=>{const[x,y]=proj(p);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.closePath()}
function drawWorld(canvas:HTMLCanvasElement){canvas.width=VW*DPR;canvas.height=VH*DPR;const c=canvas.getContext('2d');if(!c)return;c.scale(DPR,DPR);
 const ocean=c.createLinearGradient(0,0,0,VH);ocean.addColorStop(0,'#071923');ocean.addColorStop(.48,'#0a2937');ocean.addColorStop(1,'#061721');c.fillStyle=ocean;c.fillRect(0,0,VW,VH);
 const glow=c.createRadialGradient(500,250,30,500,250,520);glow.addColorStop(0,'rgba(42,100,118,.22)');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,VW,VH);
 c.strokeStyle='rgba(111,165,180,.09)';c.lineWidth=.7;for(let lon=-150;lon<=150;lon+=30){const[x]=proj([lon,0]);c.beginPath();c.moveTo(x,0);c.lineTo(x,VH);c.stroke()}for(let lat=-60;lat<=60;lat+=20){const[,y]=proj([0,lat]);c.beginPath();c.moveTo(0,y);c.lineTo(VW,y);c.stroke()}
 c.save();c.shadowColor='rgba(73,156,179,.28)';c.shadowBlur=12;c.beginPath();land.forEach(p=>pathPolygon(c,p));const lg=c.createLinearGradient(0,60,0,480);lg.addColorStop(0,'#254653');lg.addColorStop(.5,'#193943');lg.addColorStop(1,'#102d36');c.fillStyle=lg;c.fill();c.strokeStyle='#557986';c.lineWidth=1.2;c.stroke();c.restore();
 c.save();c.beginPath();land.forEach(p=>pathPolygon(c,p));c.clip();const landRng=rng(19700105);for(let i=0;i<1000;i++){const x=landRng()*VW,y=landRng()*VH,a=landRng();if(a>.78){c.fillStyle=`rgba(229,181,83,${.05+landRng()*.28})`;c.fillRect(x,y,.7+landRng()*1.4,.7+landRng()*1.4)}}c.restore();
 const seaRng=rng(42);for(let i=0;i<1300;i++){const x=seaRng()*VW,y=seaRng()*VH;c.fillStyle=`rgba(128,191,207,${seaRng()*.025})`;c.fillRect(x,y,1,1)}
 const v=c.createRadialGradient(VW/2,VH/2,160,VW/2,VH/2,650);v.addColorStop(.55,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=v;c.fillRect(0,0,VW,VH)
}
function drawHarbour(canvas:HTMLCanvasElement){const W=1200,H=720;canvas.width=W*DPR;canvas.height=H*DPR;const c=canvas.getContext('2d');if(!c)return;c.scale(DPR,DPR);const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0b3c4c');g.addColorStop(.6,'#082b39');g.addColorStop(1,'#061d28');c.fillStyle=g;c.fillRect(0,0,W,H);
 const waterRng=rng(918);for(let i=0;i<2500;i++){c.fillStyle=`rgba(124,196,211,${.012+waterRng()*.05})`;const y=waterRng()*H;c.fillRect(waterRng()*W,y,12+waterRng()*42,.7)}
 const quay=(x:number,y:number,w:number,h:number)=>{c.fillStyle='#242d2f';c.fillRect(x,y,w,h);c.strokeStyle='#8c774a';c.lineWidth=2;c.strokeRect(x,y,w,h)};quay(820,105,340,42);quay(820,247,340,42);quay(1120,105,40,184);quay(330,450,260,34);quay(330,450,34,170);
 for(let x=835;x<1110;x+=48){c.fillStyle=x%96<48?'#a9542f':'#38586a';c.fillRect(x,76,36,20);c.fillStyle='#c38b42';c.fillRect(x+5,54,31,17)}
 for(let i=0;i<4;i++){const x=842+i*76;c.strokeStyle='#647d87';c.lineWidth=4;c.beginPath();c.moveTo(x,104);c.lineTo(x+20,55);c.lineTo(x+57,103);c.stroke();c.strokeStyle='#d3a64e';c.lineWidth=1.5;c.beginPath();c.moveTo(x+20,55);c.lineTo(x+55,55);c.stroke()}
 c.fillStyle='rgba(225,178,82,.16)';c.fillRect(930,180,170,54);c.strokeStyle='rgba(225,178,82,.42)';c.setLineDash([10,10]);c.strokeRect(930,180,170,54);c.setLineDash([]);
 const shade=c.createRadialGradient(780,320,80,780,320,720);shade.addColorStop(.55,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.38)');c.fillStyle=shade;c.fillRect(0,0,W,H)
}
function drawCargo(canvas:HTMLCanvasElement,kind:string){const S=56;canvas.width=S*DPR;canvas.height=S*DPR;const c=canvas.getContext('2d');if(!c)return;c.scale(DPR,DPR);c.fillStyle='#081b24';c.fillRect(0,0,S,S);c.strokeStyle='#9f824b';c.strokeRect(1,1,S-2,S-2);c.strokeStyle='#e2b75f';c.fillStyle='#d9a74c';c.lineWidth=2;
 if(kind==='chemical'){c.beginPath();c.moveTo(22,10);c.lineTo(34,10);c.moveTo(25,10);c.lineTo(25,22);c.lineTo(13,43);c.quadraticCurveTo(28,51,43,43);c.lineTo(31,22);c.lineTo(31,10);c.stroke()}else if(kind==='reefer'){c.beginPath();for(let a=0;a<6;a++){const t=a*Math.PI/3;c.moveTo(28,28);c.lineTo(28+Math.cos(t)*18,28+Math.sin(t)*18)}c.stroke()}else if(kind==='bulk'){c.beginPath();c.moveTo(10,42);c.quadraticCurveTo(28,8,46,42);c.closePath();c.fill()}else{c.fillRect(11,15,34,27);c.strokeStyle='#102631';for(let x=16;x<45;x+=8){c.beginPath();c.moveTo(x,16);c.lineTo(x,41);c.stroke()}}
}
function cargoKind(text:string){const s=text.toLowerCase();if(s.includes('chem'))return'chemical';if(s.includes('reefer')||s.includes('kühl'))return'reefer';if(s.includes('bulk')||s.includes('erz')||s.includes('kohle')||s.includes('getreide'))return'bulk';return'general'}
function shipKind(text:string):ShipKind{const s=text.toLowerCase();if(s.includes('panamax')||s.includes('atlas crown'))return'panamax';if(s.includes('feeder')||s.includes('pacific link'))return'feeder';if(s.includes('coaster')||s.includes('baltic star')||s.includes('nordwind'))return'coaster';return'handysize'}
function addImage(host:Element,cls:string,src:string,where:'prepend'|'append'='prepend'){let img=host.querySelector<HTMLImageElement>(`.${cls}`);if(!img){img=document.createElement('img');img.className=cls;img.alt='';img.setAttribute('aria-hidden','true');where==='prepend'?host.prepend(img):host.append(img)}if(img.getAttribute('src')!==src)img.setAttribute('src',src)}
function addHeroImage(card:HTMLElement,src:string){let img=card.querySelector<HTMLImageElement>('.vessel-hero-art');if(!img){img=document.createElement('img');img.className='vessel-hero-art';img.alt='';img.setAttribute('aria-hidden','true');const head=card.querySelector('.detail-head');head?head.insertAdjacentElement('afterend',img):card.prepend(img)}if(img.getAttribute('src')!==src)img.setAttribute('src',src)}
function fitMapScale(scale:HTMLElement){const scroll=scale.parentElement;if(!scroll)return;const raw=parseFloat(scale.style.width||'640');const zoom=Math.max(1,Math.min(2.4,raw/640));const target=Math.round(scroll.clientWidth*zoom);if(Number(scale.dataset.hybridDisplay||0)===target)return;scale.dataset.hybridDisplay=String(target);scale.style.width=`${target}px`}
function decorate(){
 document.querySelectorAll<HTMLElement>('.brand-mark').forEach(mark=>addImage(mark,'brand-art','/art/ocean-trader-mark.svg','append'));document.querySelectorAll<HTMLElement>('.dc-wheel').forEach(mark=>addImage(mark,'dc-brand-art','/art/ocean-trader-mark.svg','append'));
 document.querySelectorAll<HTMLElement>('.map-scale').forEach(scale=>{fitMapScale(scale);if(!scale.querySelector('.world-art-canvas')){const canvas=document.createElement('canvas');canvas.className='world-art-canvas';drawWorld(canvas);scale.prepend(canvas)}});
 document.querySelectorAll<HTMLElement>('.dc-chart').forEach(chart=>{if(!chart.querySelector('.dc-world-art-canvas')){const canvas=document.createElement('canvas');canvas.className='dc-world-art-canvas';drawWorld(canvas);chart.prepend(canvas)}});
 document.querySelectorAll<HTMLElement>('.harbour-stage').forEach(stage=>{if(!stage.querySelector('.harbour-art-canvas')){const canvas=document.createElement('canvas');canvas.className='harbour-art-canvas';drawHarbour(canvas);stage.prepend(canvas)}});
 document.querySelectorAll<HTMLElement>('.fleet-row,.ship-offer,.dc-fleet-list button').forEach(row=>{const kind=shipKind(row.textContent||'');addImage(row,'fleet-vessel-art',SHIP_ART[kind])});
 document.querySelectorAll<HTMLElement>('.vessel-dossier,.offer-detail').forEach(card=>{const kind=shipKind(card.querySelector('.label')?.textContent||card.textContent||'');addHeroImage(card,SHIP_ART[kind])});
 document.querySelectorAll<HTMLElement>('.service-panel').forEach(panel=>addImage(panel,'port-operations-art','/art/port-terminal.svg','prepend'));
 document.querySelectorAll<HTMLElement>('.contract-card').forEach(card=>{if(!card.querySelector('.cargo-art')){const canvas=document.createElement('canvas');canvas.className='cargo-art';drawCargo(canvas,cargoKind(card.querySelector('h3')?.textContent||''));card.append(canvas)}card.classList.add('hybrid-contract')})
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})};new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});window.addEventListener('resize',schedule);document.addEventListener('DOMContentLoaded',schedule);schedule();
