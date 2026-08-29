import type { GameState, PortId, Vessel, Voyage } from './domain';
import { contractForVoyage, voyageForVessel } from './domain';

export interface MapPort { id:PortId; name:string; country:string; lat:number; lon:number; }
export interface Point { x:number; y:number; }

export const MAP_WIDTH=1000;
export const MAP_HEIGHT=520;

export const mapPorts:MapPort[]=[
  {id:'HAM',name:'Hamburg',country:'Deutschland',lat:53.55,lon:9.99},
  {id:'RTM',name:'Rotterdam',country:'Niederlande',lat:51.92,lon:4.48},
  {id:'LON',name:'London Gateway',country:'Vereinigtes Königreich',lat:51.50,lon:0.48},
  {id:'ALG',name:'Algeciras',country:'Spanien',lat:36.13,lon:-5.45},
  {id:'NYC',name:'New York',country:'USA',lat:40.71,lon:-74.01},
  {id:'SAV',name:'Savannah',country:'USA',lat:32.08,lon:-81.09},
  {id:'MIA',name:'Miami',country:'USA',lat:25.76,lon:-80.19},
  {id:'STS',name:'Santos',country:'Brasilien',lat:-23.96,lon:-46.33},
  {id:'BUE',name:'Buenos Aires',country:'Argentinien',lat:-34.60,lon:-58.38},
  {id:'CPT',name:'Cape Town',country:'Südafrika',lat:-33.92,lon:18.42},
  {id:'DUR',name:'Durban',country:'Südafrika',lat:-29.86,lon:31.02},
  {id:'DXB',name:'Jebel Ali',country:'VAE',lat:25.01,lon:55.06},
  {id:'BOM',name:'Mumbai',country:'Indien',lat:18.95,lon:72.84},
  {id:'SIN',name:'Singapore',country:'Singapur',lat:1.26,lon:103.84},
  {id:'JKT',name:'Jakarta',country:'Indonesien',lat:-6.10,lon:106.88},
  {id:'HKG',name:'Hong Kong',country:'China',lat:22.30,lon:114.17},
  {id:'SHA',name:'Shanghai',country:'China',lat:31.23,lon:121.47},
  {id:'BUS',name:'Busan',country:'Südkorea',lat:35.10,lon:129.04},
  {id:'TYO',name:'Tokyo',country:'Japan',lat:35.68,lon:139.76},
  {id:'SYD',name:'Sydney',country:'Australien',lat:-33.87,lon:151.21}
];

const byId=new Map(mapPorts.map(p=>[p.id,p]));
export function portById(id:PortId):MapPort{return byId.get(id)!;}
export function project(lat:number,lon:number):Point{return{x:((lon+180)/360)*MAP_WIDTH,y:((90-lat)/180)*MAP_HEIGHT};}
export function interpolateGeo(a:MapPort,b:MapPort,progress:number):{lat:number;lon:number}{const t=Math.max(0,Math.min(1,progress));let delta=b.lon-a.lon;if(delta>180)delta-=360;if(delta<-180)delta+=360;let lon=a.lon+delta*t;if(lon>180)lon-=360;if(lon<-180)lon+=360;return{lat:a.lat+(b.lat-a.lat)*t,lon};}
export function voyageProgress(voyage:Voyage):number{return voyage.totalDays<=0?1:Math.max(0,Math.min(1,voyage.day/voyage.totalDays));}
export function etaDays(voyage:Voyage):number{return Math.max(0,voyage.totalDays-voyage.day);}
export function vesselGeoPosition(state:GameState,vessel:Vessel):{lat:number;lon:number}{if(vessel.currentPort){const p=portById(vessel.currentPort);return{lat:p.lat,lon:p.lon};}const voyage=voyageForVessel(state,vessel.id);if(!voyage)return{lat:0,lon:0};const contract=contractForVoyage(state,voyage);if(!contract)return{lat:0,lon:0};return interpolateGeo(portById(contract.origin),portById(contract.destination),voyageProgress(voyage));}
export function vesselMapPosition(state:GameState,vessel:Vessel):Point{const geo=vesselGeoPosition(state,vessel);return project(geo.lat,geo.lon);}
export function vesselsAtPort(state:GameState,portId:PortId):Vessel[]{return state.vessels.filter(v=>v.currentPort===portId);}
