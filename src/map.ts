import type { GameState, PortId, Vessel, Voyage } from './domain';
import { contractForVoyage, voyageForVessel } from './domain';

export interface MapPort { id:PortId; name:string; country:string; lat:number; lon:number; mapX:number; mapY:number; }
export interface Point { x:number; y:number; }

export const MAP_WIDTH=1000;
export const MAP_HEIGHT=520;

// mapX/mapY are calibrated against the approved Ocean Trader world-chart bitmap.
// The artwork is intentionally stylised, so these display coordinates are more
// accurate for the UI than applying a mathematical projection to the bitmap.
export const mapPorts:MapPort[]=[
  {id:'HAM',name:'Hamburg',country:'Deutschland',lat:53.55,lon:9.99,mapX:514.4,mapY:147.5},
  {id:'RTM',name:'Rotterdam',country:'Niederlande',lat:51.92,lon:4.48,mapX:502.4,mapY:155.8},
  {id:'LON',name:'London Gateway',country:'Vereinigtes Königreich',lat:51.50,lon:0.48,mapX:485.6,mapY:142.0},
  {id:'ALG',name:'Algeciras',country:'Spanien',lat:36.13,lon:-5.45,mapX:485.6,mapY:190.1},
  {id:'NYC',name:'New York',country:'USA',lat:40.71,lon:-74.01,mapX:278.1,mapY:193.4},
  {id:'SAV',name:'Savannah',country:'USA',lat:32.08,lon:-81.09,mapX:272.1,mapY:212.8},
  {id:'MIA',name:'Miami',country:'USA',lat:25.76,lon:-80.19,mapX:275.1,mapY:229.3},
  {id:'STS',name:'Santos',country:'Brasilien',lat:-23.96,lon:-46.33,mapX:388.8,mapY:320.5},
  {id:'BUE',name:'Buenos Aires',country:'Argentinien',lat:-34.60,lon:-58.38,mapX:349.9,mapY:367.5},
  {id:'CPT',name:'Cape Town',country:'Südafrika',lat:-33.92,lon:18.42,mapX:556.2,mapY:376.9},
  {id:'DUR',name:'Durban',country:'Südafrika',lat:-29.86,lon:31.02,mapX:596.9,mapY:347.0},
  {id:'DXB',name:'Jebel Ali',country:'VAE',lat:25.01,lon:55.06,mapX:678.2,mapY:221.0},
  {id:'BOM',name:'Mumbai',country:'Indien',lat:18.95,lon:72.84,mapX:708.1,mapY:244.3},
  {id:'SIN',name:'Singapore',country:'Singapur',lat:1.26,lon:103.84,mapX:779.9,mapY:269.1},
  {id:'JKT',name:'Jakarta',country:'Indonesien',lat:-6.10,lon:106.88,mapX:783.5,mapY:287.4},
  {id:'HKG',name:'Hong Kong',country:'China',lat:22.30,lon:114.17,mapX:842.1,mapY:215.0},
  {id:'SHA',name:'Shanghai',country:'China',lat:31.23,lon:121.47,mapX:862.4,mapY:191.8},
  {id:'BUS',name:'Busan',country:'Südkorea',lat:35.10,lon:129.04,mapX:891.1,mapY:181.8},
  {id:'TYO',name:'Tokyo',country:'Japan',lat:35.68,lon:139.76,mapX:916.3,mapY:175.2},
  {id:'SYD',name:'Sydney',country:'Australien',lat:-33.87,lon:151.21,mapX:903.1,mapY:367.5}
];

const byId=new Map(mapPorts.map(p=>[p.id,p]));
export function portById(id:PortId):MapPort{return byId.get(id)!;}
export function visualPortPosition(id:PortId):Point{const p=portById(id);return{x:p.mapX,y:p.mapY};}
export function project(lat:number,lon:number):Point{const exact=mapPorts.find(p=>Math.abs(p.lat-lat)<1e-6&&Math.abs(p.lon-lon)<1e-6);if(exact)return{x:exact.mapX,y:exact.mapY};return{x:((lon+180)/360)*MAP_WIDTH,y:((90-lat)/180)*MAP_HEIGHT};}
export function interpolateGeo(a:MapPort,b:MapPort,progress:number):{lat:number;lon:number}{const t=Math.max(0,Math.min(1,progress));let delta=b.lon-a.lon;if(delta>180)delta-=360;if(delta<-180)delta+=360;let lon=a.lon+delta*t;if(lon>180)lon-=360;if(lon<-180)lon+=360;return{lat:a.lat+(b.lat-a.lat)*t,lon};}
export function voyageProgress(voyage:Voyage):number{return voyage.totalDays<=0?1:Math.max(0,Math.min(1,voyage.day/voyage.totalDays));}
export function etaDays(voyage:Voyage):number{return Math.max(0,voyage.totalDays-voyage.day);}
export function vesselGeoPosition(state:GameState,vessel:Vessel):{lat:number;lon:number}{if(vessel.currentPort){const p=portById(vessel.currentPort);return{lat:p.lat,lon:p.lon};}const voyage=voyageForVessel(state,vessel.id);if(!voyage)return{lat:0,lon:0};const contract=contractForVoyage(state,voyage);if(!contract)return{lat:0,lon:0};return interpolateGeo(portById(contract.origin),portById(contract.destination),voyageProgress(voyage));}
export function vesselMapPosition(state:GameState,vessel:Vessel):Point{if(vessel.currentPort)return visualPortPosition(vessel.currentPort);const voyage=voyageForVessel(state,vessel.id);if(!voyage)return project(0,0);const contract=contractForVoyage(state,voyage);if(!contract)return project(0,0);const a=visualPortPosition(contract.origin),b=visualPortPosition(contract.destination),t=voyageProgress(voyage);return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
export function vesselsAtPort(state:GameState,portId:PortId):Vessel[]{return state.vessels.filter(v=>v.currentPort===portId);}
