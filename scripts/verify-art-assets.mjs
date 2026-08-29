import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=process.cwd();
const staticAssets=['public/art/bitmap/world-chart.webp','public/art/bitmap/coaster.webp'];
const embeddedAssets=['src/bitmap/handysize-runtime.ts','src/bitmap/feeder.ts','src/bitmap/panamax.ts','src/bitmap/port.ts'];

function assertWebp(buffer,label){
  if(buffer.length<1024)throw new Error(`${label}: asset is unexpectedly small (${buffer.length} bytes)`);
  if(buffer.subarray(0,4).toString('ascii')!=='RIFF'||buffer.subarray(8,12).toString('ascii')!=='WEBP')throw new Error(`${label}: invalid WEBP signature`);
  const declared=buffer.readUInt32LE(4)+8;
  if(declared!==buffer.length)throw new Error(`${label}: truncated WEBP (declared ${declared} bytes, actual ${buffer.length})`);
}

for(const rel of staticAssets){
  const file=resolve(root,rel);
  if(!existsSync(file))throw new Error(`${rel}: missing runtime asset`);
  assertWebp(readFileSync(file),rel);
}

for(const rel of embeddedAssets){
  const text=readFileSync(resolve(root,rel),'utf8');
  const match=text.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  if(!match)throw new Error(`${rel}: missing WEBP data URI`);
  assertWebp(Buffer.from(match[1],'base64'),rel);
}

console.log(`Ocean Trader art assets: OK (${staticAssets.length+embeddedAssets.length} checked)`);
