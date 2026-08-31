import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode, VertexData } from '@babylonjs/core'

export type VesselVisual = {
  root: TransformNode
  rudder: Mesh
}

function mat(scene: Scene, name: string, color: Color3, specular = new Color3(.12, .12, .12)) {
  const material = new StandardMaterial(name, scene)
  material.diffuseColor = color
  material.specularColor = specular
  return material
}

function createHull(scene: Scene, parent: TransformNode) {
  const stations = [
    [-4.45, .28, .54, -.72],[-4.05, 1.00, .68, -.82],[-3.00, 1.22, .76, -.88],[-1.20, 1.28, .80, -.90],
    [1.15, 1.28, .80, -.90],[3.05, 1.16, .72, -.84],[4.05, .72, .58, -.70],[4.55, .05, .32, -.38],
  ] as const
  const positions: number[] = []
  const indices: number[] = []
  for (const [x, beam, deckY, keelY] of stations) {
    positions.push(x,deckY,-beam, x,deckY,beam, x,-.18,-beam*.9, x,-.18,beam*.9, x,keelY,-beam*.34, x,keelY,beam*.34)
  }
  const ring = 6
  for (let s=0;s<stations.length-1;s+=1) {
    const a=s*ring,b=(s+1)*ring
    for (const [i,j] of [[0,1],[1,3],[3,5],[5,4],[4,2],[2,0]]) indices.push(a+i,b+i,b+j,a+i,b+j,a+j)
  }
  for (const base of [0,(stations.length-1)*ring]) indices.push(base,base+2,base+4, base,base+4,base+5, base,base+5,base+1, base+1,base+5,base+3)
  const normals:number[]=[]
  VertexData.ComputeNormals(positions,indices,normals)
  const mesh=new Mesh('handysize-hull',scene)
  const data=new VertexData(); data.positions=positions; data.indices=indices; data.normals=normals; data.applyToMesh(mesh)
  mesh.parent=parent
  mesh.material=mat(scene,'hull-steel',new Color3(.055,.12,.16),new Color3(.22,.22,.2))
  return mesh
}

export function createVesselVisual(scene: Scene): VesselVisual {
  const root=new TransformNode('vessel-visual',scene)
  createHull(scene,root)

  const deck=MeshBuilder.CreateBox('main-deck',{width:7.35,depth:2.18,height:.12},scene)
  deck.parent=root; deck.position.set(-.1,.82,0); deck.material=mat(scene,'deck',new Color3(.48,.43,.32))

  const waterline=mat(scene,'waterline',new Color3(.74,.72,.63))
  for (const z of [-1.12,1.12]) {
    const stripe=MeshBuilder.CreateBox(`waterline-${z}`,{width:7.2,depth:.035,height:.10},scene)
    stripe.parent=root; stripe.position.set(-.1,-.16,z); stripe.material=waterline
  }

  const hatchMaterial=mat(scene,'hatches',new Color3(.34,.22,.13))
  for (let i=0;i<3;i+=1) {
    const hatch=MeshBuilder.CreateBox(`cargo-hatch-${i}`,{width:1.55,depth:1.72,height:.22},scene)
    hatch.parent=root; hatch.position.set(-.35+i*1.72,1.0,0); hatch.material=hatchMaterial
    for (const z of [-.63,0,.63]) {
      const rib=MeshBuilder.CreateBox(`hatch-rib-${i}-${z}`,{width:1.58,depth:.035,height:.08},scene)
      rib.parent=root; rib.position.set(hatch.position.x,1.14,z); rib.material=hatchMaterial
    }
  }

  const house=mat(scene,'superstructure',new Color3(.82,.84,.80))
  const bridgeGlass=mat(scene,'bridge-glass',new Color3(.025,.10,.14),new Color3(.45,.5,.52))
  const block=MeshBuilder.CreateBox('aft-house',{width:1.55,depth:2.00,height:1.38},scene)
  block.parent=root; block.position.set(-2.85,1.48,0); block.material=house
  const bridge=MeshBuilder.CreateBox('bridge',{width:1.85,depth:2.15,height:.56},scene)
  bridge.parent=root; bridge.position.set(-2.55,2.18,0); bridge.material=house
  for (const z of [-1.09,1.09]) {
    const windows=MeshBuilder.CreateBox(`bridge-side-windows-${z}`,{width:1.32,depth:.035,height:.22},scene)
    windows.parent=root; windows.position.set(-2.43,2.22,z); windows.material=bridgeGlass
  }
  const frontWindows=MeshBuilder.CreateBox('bridge-front-windows',{width:.035,depth:1.78,height:.22},scene)
  frontWindows.parent=root; frontWindows.position.set(-1.62,2.22,0); frontWindows.material=bridgeGlass

  const dark=mat(scene,'ship-dark-metal',new Color3(.055,.06,.06))
  const railMat=mat(scene,'railings',new Color3(.64,.67,.65))
  for (const z of [-1.18,1.18]) {
    for (let x=-3.8;x<=3.6;x+=.65) {
      const post=MeshBuilder.CreateCylinder(`rail-post-${x}-${z}`,{diameter:.028,height:.42,tessellation:6},scene)
      post.parent=root; post.position.set(x,1.08,z); post.material=railMat
    }
    const rail=MeshBuilder.CreateBox(`rail-top-${z}`,{width:7.4,depth:.025,height:.025},scene)
    rail.parent=root; rail.position.set(-.1,1.28,z); rail.material=railMat
  }

  const lifeboat=MeshBuilder.CreateSphere('lifeboat',{diameter:1,segments:12},scene)
  lifeboat.parent=root; lifeboat.scaling.set(1.05,.35,.48); lifeboat.position.set(-2.2,1.45,-1.16)
  lifeboat.material=mat(scene,'lifeboat-orange',new Color3(.78,.28,.06))
  const davit=MeshBuilder.CreateBox('lifeboat-davit',{width:.7,depth:.05,height:.05},scene)
  davit.parent=root; davit.position.set(-2.2,1.92,-1.1); davit.material=dark

  const funnel=MeshBuilder.CreateCylinder('funnel',{diameterTop:.40,diameterBottom:.54,height:1.12,tessellation:14},scene)
  funnel.parent=root; funnel.position.set(-3.15,2.62,0); funnel.material=mat(scene,'funnel-yellow',new Color3(.76,.48,.08))
  const funnelCap=MeshBuilder.CreateCylinder('funnel-cap',{diameter:.44,height:.18,tessellation:14},scene)
  funnelCap.parent=root; funnelCap.position.set(-3.15,3.22,0); funnelCap.material=dark

  const mast=MeshBuilder.CreateCylinder('mast',{diameter:.065,height:2.45,tessellation:8},scene)
  mast.parent=root; mast.position.set(-1.55,3.0,0); mast.material=dark
  const yard=MeshBuilder.CreateBox('mast-yard',{width:.08,depth:1.6,height:.08},scene)
  yard.parent=root; yard.position.set(-1.55,3.48,0); yard.material=dark
  for (const z of [-.72,.72]) {
    const nav=MeshBuilder.CreateSphere(`nav-light-${z}`,{diameter:.12,segments:8},scene)
    nav.parent=root; nav.position.set(-1.55,3.51,z)
    const navMat=mat(scene,`nav-light-mat-${z}`,z<0?new Color3(.75,.06,.04):new Color3(.04,.65,.16))
    navMat.emissiveColor=navMat.diffuseColor.scale(.7); nav.material=navMat
  }

  for (const z of [-.72,.72]) {
    const hawse=MeshBuilder.CreateTorus(`anchor-hawse-${z}`,{diameter:.25,thickness:.055,tessellation:12},scene)
    hawse.parent=root; hawse.rotation.x=Math.PI/2; hawse.position.set(3.72,.25,z); hawse.material=dark
  }

  const forecastle=MeshBuilder.CreateBox('forecastle',{width:1.1,depth:1.55,height:.18},scene)
  forecastle.parent=root; forecastle.position.set(3.45,.92,0); forecastle.material=mat(scene,'forecastle-deck',new Color3(.42,.39,.30))
  for (const z of [-.45,.45]) {
    const windlass=MeshBuilder.CreateCylinder(`windlass-${z}`,{diameter:.26,height:.48,tessellation:10},scene)
    windlass.parent=root; windlass.rotation.x=Math.PI/2; windlass.position.set(3.45,1.12,z); windlass.material=dark
  }

  const rudder=MeshBuilder.CreateBox('rudder',{width:.66,height:.88,depth:.12},scene)
  rudder.parent=root; rudder.position.set(-4.18,-.70,0); rudder.material=mat(scene,'antifouling',new Color3(.42,.055,.04))
  const propeller=MeshBuilder.CreateCylinder('propeller-hub',{diameter:.28,height:.32,tessellation:12},scene)
  propeller.parent=root; propeller.rotation.z=Math.PI/2; propeller.position.set(-4.1,-.55,0)
  propeller.material=mat(scene,'propeller-bronze',new Color3(.42,.31,.12),new Color3(.55,.48,.24))

  return {root,rudder}
}
