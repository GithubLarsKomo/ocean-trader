import { accelerationBenchmark, crashStopBenchmark, hardTurnBenchmark, reversePropWalkBenchmark, windDriftBenchmark, type BenchmarkResult } from '../../../src/simulation/benchmarks'
import type { SimulationVesselClass } from '../../../src/simulation/vessel-parameters'

const classes: SimulationVesselClass[] = ['coaster','handysize','feeder','panamax']
const labels: Record<SimulationVesselClass,string> = { coaster:'Coaster', handysize:'Handysize', feeder:'Feeder', panamax:'Panamax' }
const hues: Record<SimulationVesselClass,string> = { coaster:'hsl(42 78% 62%)', handysize:'hsl(188 60% 60%)', feeder:'hsl(145 45% 58%)', panamax:'hsl(8 68% 63%)' }

const canvas = document.querySelector<HTMLCanvasElement>('#plot')!
const metricHost = document.querySelector<HTMLDivElement>('#metrics')!
const legendHost = document.querySelector<HTMLDivElement>('#legend')!
const titleHost = document.querySelector<HTMLHeadingElement>('#title')!
const benchmarkSelect = document.querySelector<HTMLSelectElement>('#benchmark')!
const loadSelect = document.querySelector<HTMLSelectElement>('#load')!
const reset = document.querySelector<HTMLButtonElement>('#reset')!

let hidden = new Set<SimulationVesselClass>()

function makeResult(kind:string, vesselClass:SimulationVesselClass, load:number):BenchmarkResult {
  if(kind==='acceleration') return accelerationBenchmark(vesselClass,load)
  if(kind==='crash-stop') return crashStopBenchmark(vesselClass,load)
  if(kind==='reverse-prop-walk') return reversePropWalkBenchmark(vesselClass,load)
  if(kind==='wind-drift') return windDriftBenchmark(vesselClass,load)
  return hardTurnBenchmark(vesselClass,load)
}

function fitCanvas(){const rect=canvas.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);const ctx=canvas.getContext('2d')!;ctx.setTransform(dpr,0,0,dpr,0,0)}
function fmt(n:number){const a=Math.abs(n);return a>=100?n.toFixed(0):a>=10?n.toFixed(1):n.toFixed(2)}
function title(kind:string){return kind.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ')}

function render(){fitCanvas();const kind=benchmarkSelect.value,load=Number(loadSelect.value);const results=classes.map(c=>makeResult(kind,c,load));titleHost.textContent=`${title(kind)} · ${Math.round(load*100)}% load`;
  metricHost.innerHTML='';const keys=Object.keys(results[0].metrics);for(const key of keys){for(const r of results){const d=document.createElement('div');d.className='metric';d.innerHTML=`<span>${labels[r.vesselClass]} · ${key}</span><strong>${fmt(r.metrics[key])}</strong>`;metricHost.append(d)}}
  legendHost.innerHTML='';for(const c of classes){const b=document.createElement('button');b.style.color=hues[c];b.innerHTML=`<span>${labels[c]}</span><i></i>`;b.style.opacity=hidden.has(c)?'.35':'1';b.onclick=()=>{hidden.has(c)?hidden.delete(c):hidden.add(c);render()};legendHost.append(b)}
  const ctx=canvas.getContext('2d')!;const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);ctx.fillStyle='#071923';ctx.fillRect(0,0,w,h);
  const visible=results.filter(r=>!hidden.has(r.vesselClass));const points=visible.flatMap(r=>r.track.length?r.track:[r.final]);if(!points.length)return;let minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));if(maxX-minX<1){minX-=.5;maxX+=.5}if(maxY-minY<1){minY-=.5;maxY+=.5}const pad=42,sx=(w-pad*2)/(maxX-minX),sy=(h-pad*2)/(maxY-minY),scale=Math.min(sx,sy);const tx=(x:number)=>pad+(x-minX)*scale,ty=(y:number)=>h-pad-(y-minY)*scale;
  ctx.strokeStyle='rgba(90,130,145,.16)';ctx.lineWidth=1;for(let i=0;i<=10;i++){const x=pad+(w-pad*2)*i/10;ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,h-pad);ctx.stroke();const y=pad+(h-pad*2)*i/10;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}
  for(const r of visible){const track=r.track.length?r.track:[r.final];ctx.strokeStyle=hues[r.vesselClass];ctx.lineWidth=3;ctx.beginPath();track.forEach((p,i)=>i?ctx.lineTo(tx(p.x),ty(p.y)):ctx.moveTo(tx(p.x),ty(p.y)));ctx.stroke();const last=track[track.length-1];ctx.fillStyle=hues[r.vesselClass];ctx.beginPath();ctx.arc(tx(last.x),ty(last.y),5,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle='#9db0b7';ctx.font='11px ui-monospace,monospace';ctx.fillText(`x ${fmt(minX)} … ${fmt(maxX)}`,pad,h-14);ctx.fillText(`y ${fmt(minY)} … ${fmt(maxY)}`,pad,20)
}

benchmarkSelect.onchange=render;loadSelect.onchange=render;reset.onclick=()=>{hidden.clear();render()};window.addEventListener('resize',render);render()
