import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3, VertexData } from '@babylonjs/core'

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
  // Longitudinal stations: x, half-beam, deck y, keel y. The pointed bow and
  // tapered stern give the silhouette a vessel-like form without external IP/assets.
  const stations = [
    [-4.45, .28, .54, -.72],
    [-4.05, 1.00, .68, -.82],
    [-3.00, 1.22, .76, -.88],
    [-1.20, 1.28, .80, -.90],
    [1.15, 1.28, .80, -.90],
    [3.05, 1.16, .72, -.84],
    [4.05, .72, .58, -.70],
    [4.55, .05, .32, -.38],
  ] as const
  const positions: number[] = []
  const indices: number[] = []
  for (const [x, beam, deckY, keelY] of stations) {
    positions.push(
      x, deckY, -beam,
      x, deckY, beam,
      x, -.18, -beam * .9,
      x, -.18, beam * .9,
      x, keelY, -beam * .34,
      x, keelY, beam * .34,
    )
  }
  const ring = 6
  for (let s = 0; s < stations.length - 1; s += 1) {
    const a = s * ring
    const b = (s + 1) * ring
    const faces = [[0,1],[1,3],[3,5],[5,4],[4,2],[2,0]]
    for (const [i,j] of faces) indices.push(a+i,b+i,b+j,a+i,b+j,a+j)
  }
  // Close bow/stern caps.
  for (const base of [0, (stations.length - 1) * ring]) {
    indices.push(base,base+2,base+4, base,base+4,base+5, base,base+5,base+1, base+1,base+5,base+3)
  }
  const normals: number[] = []
  VertexData.ComputeNormals(positions, indices, normals)
  const mesh = new Mesh('handysize-hull', scene)
  const data = new VertexData()
  data.positions = positions
  data.indices = indices
  data.normals = normals
  data.applyToMesh(mesh)
  mesh.parent = parent
  mesh.material = mat(scene, 'hull-steel', new Color3(.055, .12, .16), new Color3(.22, .22, .2))
  return mesh
}

export function createVesselVisual(scene: Scene): VesselVisual {
  const root = new TransformNode('vessel-visual', scene)
  createHull(scene, root)

  const deck = MeshBuilder.CreateBox('main-deck', { width: 7.35, depth: 2.18, height: .12 }, scene)
  deck.parent = root
  deck.position.set(-.1, .82, 0)
  deck.material = mat(scene, 'deck', new Color3(.48, .43, .32))

  const hatchMaterial = mat(scene, 'hatches', new Color3(.34, .22, .13))
  for (let i = 0; i < 3; i += 1) {
    const hatch = MeshBuilder.CreateBox(`cargo-hatch-${i}`, { width: 1.55, depth: 1.72, height: .22 }, scene)
    hatch.parent = root
    hatch.position.set(-.35 + i * 1.72, 1.0, 0)
    hatch.material = hatchMaterial
    for (const z of [-.63, 0, .63]) {
      const rib = MeshBuilder.CreateBox(`hatch-rib-${i}-${z}`, { width: 1.58, depth: .035, height: .08 }, scene)
      rib.parent = root
      rib.position.set(hatch.position.x, 1.14, z)
      rib.material = hatchMaterial
    }
  }

  const house = mat(scene, 'superstructure', new Color3(.82, .84, .80))
  const bridgeGlass = mat(scene, 'bridge-glass', new Color3(.025, .10, .14), new Color3(.45, .5, .52))
  const block = MeshBuilder.CreateBox('aft-house', { width: 1.55, depth: 2.00, height: 1.38 }, scene)
  block.parent = root
  block.position.set(-2.85, 1.48, 0)
  block.material = house
  const bridge = MeshBuilder.CreateBox('bridge', { width: 1.85, depth: 2.15, height: .56 }, scene)
  bridge.parent = root
  bridge.position.set(-2.55, 2.18, 0)
  bridge.material = house
  for (const z of [-1.09, 1.09]) {
    const windows = MeshBuilder.CreateBox(`bridge-side-windows-${z}`, { width: 1.32, depth: .035, height: .22 }, scene)
    windows.parent = root
    windows.position.set(-2.43, 2.22, z)
    windows.material = bridgeGlass
  }
  const frontWindows = MeshBuilder.CreateBox('bridge-front-windows', { width: .035, depth: 1.78, height: .22 }, scene)
  frontWindows.parent = root
  frontWindows.position.set(-1.62, 2.22, 0)
  frontWindows.material = bridgeGlass

  const dark = mat(scene, 'ship-dark-metal', new Color3(.055, .06, .06))
  const funnel = MeshBuilder.CreateCylinder('funnel', { diameterTop: .40, diameterBottom: .54, height: 1.12, tessellation: 14 }, scene)
  funnel.parent = root
  funnel.position.set(-3.15, 2.62, 0)
  funnel.material = mat(scene, 'funnel-yellow', new Color3(.76, .48, .08))
  const funnelCap = MeshBuilder.CreateCylinder('funnel-cap', { diameter: .44, height: .18, tessellation: 14 }, scene)
  funnelCap.parent = root
  funnelCap.position.set(-3.15, 3.22, 0)
  funnelCap.material = dark

  const mast = MeshBuilder.CreateCylinder('mast', { diameter: .065, height: 2.45, tessellation: 8 }, scene)
  mast.parent = root
  mast.position.set(-1.55, 3.0, 0)
  mast.material = dark
  const yard = MeshBuilder.CreateBox('mast-yard', { width: .08, depth: 1.6, height: .08 }, scene)
  yard.parent = root
  yard.position.set(-1.55, 3.48, 0)
  yard.material = dark
  for (const z of [-.72, .72]) {
    const nav = MeshBuilder.CreateSphere(`nav-light-${z}`, { diameter: .12, segments: 8 }, scene)
    nav.parent = root
    nav.position.set(-1.55, 3.51, z)
    const navMat = mat(scene, `nav-light-mat-${z}`, z < 0 ? new Color3(.75,.06,.04) : new Color3(.04,.65,.16))
    navMat.emissiveColor = navMat.diffuseColor.scale(.7)
    nav.material = navMat
  }

  const rudder = MeshBuilder.CreateBox('rudder', { width: .66, height: .88, depth: .12 }, scene)
  rudder.parent = root
  rudder.position.set(-4.18, -.70, 0)
  rudder.material = mat(scene, 'antifouling', new Color3(.42, .055, .04))

  const propeller = MeshBuilder.CreateCylinder('propeller-hub', { diameter: .28, height: .32, tessellation: 12 }, scene)
  propeller.parent = root
  propeller.rotation.z = Math.PI / 2
  propeller.position.set(-4.1, -.55, 0)
  propeller.material = mat(scene, 'propeller-bronze', new Color3(.42, .31, .12), new Color3(.55, .48, .24))

  return { root, rudder }
}
