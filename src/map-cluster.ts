type Marker={node:SVGGElement;x:number;y:number};

function readMarkers(selector:string):Marker[]{return Array.from(document.querySelectorAll<SVGGElement>(selector)).map(node=>{const circle=node.querySelector('circle');if(!circle)return null;const x=Number(circle.getAttribute('cx')),y=Number(circle.getAttribute('cy'));return Number.isFinite(x)&&Number.isFinite(y)?{node,x,y}:null}).filter((m):m is Marker=>Boolean(m));}

function spread(selector:string,threshold=24,radius=14){const markers=readMarkers(selector);markers.forEach(m=>m.node.removeAttribute('transform'));const remaining=new Set(markers);while(remaining.size){const seed=remaining.values().next().value as Marker;const group:Marker[]=[seed];remaining.delete(seed);let changed=true;while(changed){changed=false;for(const candidate of Array.from(remaining)){if(group.some(m=>Math.hypot(m.x-candidate.x,m.y-candidate.y)<=threshold)){group.push(candidate);remaining.delete(candidate);changed=true;}}}if(group.length<2)continue;group.sort((a,b)=>(a.node.getAttribute('data-vessel-id')??'').localeCompare(b.node.getAttribute('data-vessel-id')??''));const r=group.length===2?11:radius;group.forEach((m,i)=>{const angle=-Math.PI/2+(Math.PI*2*i/group.length);const dx=Math.cos(angle)*r,dy=Math.sin(angle)*r;m.node.setAttribute('transform',`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);});}}

function apply(){spread('.world-map .vessel-node');spread('.dc-chart .dc-vessel');}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('resize',schedule);document.addEventListener('DOMContentLoaded',schedule);schedule();
