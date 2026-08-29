export const PORTS20 = {
  HAM:{name:"Hamburg",lat:53.55,lon:9.99},
  RTM:{name:"Rotterdam",lat:51.92,lon:4.48},
  LON:{name:"London Gateway",lat:51.50,lon:0.48},
  ALG:{name:"Algeciras",lat:36.13,lon:-5.45},
  NYC:{name:"New York",lat:40.71,lon:-74.01},
  SAV:{name:"Savannah",lat:32.08,lon:-81.09},
  MIA:{name:"Miami",lat:25.76,lon:-80.19},
  SSZ:{name:"Santos",lat:-23.96,lon:-46.33},
  BUE:{name:"Buenos Aires",lat:-34.60,lon:-58.38},
  CPT:{name:"Cape Town",lat:-33.92,lon:18.42},
  DUR:{name:"Durban",lat:-29.86,lon:31.03},
  DXB:{name:"Jebel Ali",lat:25.01,lon:55.06},
  BOM:{name:"Mumbai",lat:18.95,lon:72.84},
  SIN:{name:"Singapore",lat:1.29,lon:103.85},
  JKT:{name:"Jakarta",lat:-6.10,lon:106.88},
  HKG:{name:"Hong Kong",lat:22.32,lon:114.17},
  SHA:{name:"Shanghai",lat:31.23,lon:121.47},
  BUS:{name:"Busan",lat:35.10,lon:129.04},
  TYO:{name:"Tokyo",lat:35.68,lon:139.65},
  SYD:{name:"Sydney",lat:-33.87,lon:151.21}
};

const R = 6371;
const toRad = d => d*Math.PI/180;

export function distanceNm(a,b){
  const dLat=toRad(b.lat-a.lat),dLon=toRad(b.lon-a.lon),la1=toRad(a.lat),la2=toRad(b.lat);
  const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return (2*R*Math.asin(Math.sqrt(h)))/1.852;
}

export function projected(p){
  return {x:(p.lon+180)/360,y:(90-p.lat)/180};
}

export function interpolateRoute(a,b,t){
  return {lat:a.lat+(b.lat-a.lat)*t,lon:a.lon+(b.lon-a.lon)*t};
}

export function makeFleet(){
  const defs=[
    ["Pioneer","HAM","NYC",18,0.38],
    ["Baltic Star","RTM","SIN",17,0.61],
    ["Cape Runner","CPT","DXB",16,0.28],
    ["Pacific Crown","SHA","LON",19,0.47],
    ["Southern Cross","SYD","BUS",15,0.73]
  ];
  return defs.map(([name,from,to,speed,progress],i)=>{
    const dist=distanceNm(PORTS20[from],PORTS20[to]);
    const totalHours=dist/speed;
    return {
      id:`V${i+1}`,name,from,to,speed,progress,
      distanceNm:Math.round(dist),
      totalHours,
      etaHours:Math.max(0,totalHours*(1-progress))
    };
  });
}

export function advanceFleet(fleet,hours=6){
  return fleet.map(v=>{
    const delta=hours/v.totalHours;
    let progress=v.progress+delta;
    let from=v.from,to=v.to,totalHours=v.totalHours,distance=v.distanceNm;
    if(progress>=1){
      const codes=Object.keys(PORTS20);
      const idx=codes.indexOf(v.to);
      from=v.to;
      to=codes[(idx+3)%codes.length];
      distance=distanceNm(PORTS20[from],PORTS20[to]);
      totalHours=distance/v.speed;
      progress=0;
    }
    return {...v,from,to,progress,distanceNm:Math.round(distance),totalHours,etaHours:Math.max(0,totalHours*(1-progress))};
  });
}

export function vesselPosition(v){
  return interpolateRoute(PORTS20[v.from],PORTS20[v.to],v.progress);
}
