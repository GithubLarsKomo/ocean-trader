import { ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core'
import type { ManoeuvreState } from '../simulation/state'
import type { P5HarbourScenario } from './rotterdam'

export type P5Scene = {
  engine: Engine
  scene: Scene
  ship: Mesh
  chaseCamera: FreeCamera
  tacticalCamera: ArcRotateCamera
  bridgeCamera: FreeCamera
  setCamera(mode: 'chase' | 'tactical' | 'bridge'): void
  renderState(state: ManoeuvreState): void
  dispose(): void
}

function material(scene: Scene, name: string, diffuse: Color3, emissive?: Color3) {
  const mat = new StandardMaterial(name, scene)
  mat.diffuseColor = diffuse
  if (emissive) mat.emissiveColor = emissive
  return mat
}

export function createP5Scene(canvas: HTMLCanvasElement, scenario: P5HarbourScenario): P5Scene {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true })
  const scene = new Scene(engine)
  scene.clearColor = new Color4(.025, .07, .095, 1)
  new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = .9
  const sun = new DirectionalLight('sun', new Vector3(-.45, -1, .25), scene)
  sun.intensity = .72

  const water = MeshBuilder.CreateGround('water', { width: 150, height: 96 }, scene)
  water.material = material(scene, 'water-mat', new Color3(.025, .20, .27))

  const quayMat = material(scene, 'quay-mat', new Color3(.27, .29, .27))
  const edgeMat = material(scene, 'quay-edge', new Color3(.82, .72, .42), new Color3(.08, .06, .02))
  scenario.quays.forEach((q, i) => {
    const quay = MeshBuilder.CreateBox(`quay-${i}`, { width: q.length, depth: q.width, height: q.height }, scene)
    quay.position.set(q.x, q.height / 2, q.z)
    quay.material = quayMat
    const edge = MeshBuilder.CreateBox(`quay-edge-${i}`, { width: q.length, depth: .22, height: .18 }, scene)
    edge.position.set(q.x, q.height + .08, q.z + (q.z < 0 ? q.width / 2 : -q.width / 2))
    edge.material = edgeMat
  })

  const berth = MeshBuilder.CreateBox('berth-marker', { width: scenario.berth.length, depth: scenario.berth.width, height: .08 }, scene)
  berth.position.set(scenario.berth.x, .05, scenario.berth.z)
  berth.rotation.y = scenario.berth.heading
  const berthMat = material(scene, 'berth-mat', new Color3(.15, .62, .36), new Color3(.07, .3, .16))
  berthMat.alpha = .58
  berth.material = berthMat

  const laneMat = material(scene, 'lane-mat', new Color3(.7, .78, .64), new Color3(.09, .1, .06))
  ;[-24, -12, 0, 12, 24, 36].forEach((x, i) => {
    const marker = MeshBuilder.CreateBox(`lane-${i}`, { width: 5.5, depth: .18, height: .05 }, scene)
    marker.position.set(x, .04, 2.3)
    marker.material = laneMat
  })

  const red = material(scene, 'buoy-red', new Color3(.75, .12, .09), new Color3(.15, .02, .01))
  const green = material(scene, 'buoy-green', new Color3(.08, .58, .32), new Color3(.01, .12, .05))
  ;[-24, -8, 8, 24].forEach((x, i) => {
    for (const [z, mat, suffix] of [[-8.5, red, 'r'], [8.5, green, 'g']] as const) {
      const buoy = MeshBuilder.CreateCylinder(`buoy-${suffix}-${i}`, { height: 1.25, diameter: .55, tessellation: 12 }, scene)
      buoy.position.set(x, .62, z)
      buoy.material = mat
    }
  })

  const containerMats = [
    material(scene, 'container-a', new Color3(.52, .18, .12)),
    material(scene, 'container-b', new Color3(.12, .32, .48)),
    material(scene, 'container-c', new Color3(.48, .4, .14)),
  ]
  for (let i = 0; i < 12; i += 1) {
    const box = MeshBuilder.CreateBox(`container-${i}`, { width: 3.4, depth: 1.4, height: 1.35 }, scene)
    box.position.set(13 + (i % 4) * 3.7, 3 + Math.floor(i / 8) * 1.4, -16.2 - Math.floor((i % 8) / 4) * 1.55)
    box.material = containerMats[i % containerMats.length]
  }

  const craneMat = material(scene, 'crane-mat', new Color3(.82, .62, .12))
  ;[12, 24, 36].forEach((x, i) => {
    const mast = MeshBuilder.CreateBox(`crane-mast-${i}`, { width: .7, depth: .7, height: 9 }, scene)
    mast.position.set(x, 6.8, -17.5)
    mast.material = craneMat
    const boom = MeshBuilder.CreateBox(`crane-boom-${i}`, { width: 8, depth: .45, height: .45 }, scene)
    boom.position.set(x - 3, 11, -17.5)
    boom.material = craneMat
  })

  // Invisible authoritative root. Child meshes create a recognizable cargo-vessel silhouette.
  const ship = MeshBuilder.CreateBox('ship', { width: 8.8, height: 1.8, depth: 2.5 }, scene)
  ship.visibility = 0
  ship.position.set(scenario.spawn.x, .95, scenario.spawn.z)
  const hullRoot = new TransformNode('vessel-visual', scene)
  hullRoot.parent = ship
  const hullMat = material(scene, 'hull-mat', new Color3(.08, .16, .2))
  const deckMat = material(scene, 'deck-mat', new Color3(.67, .64, .52))
  const houseMat = material(scene, 'house-mat', new Color3(.82, .84, .79))
  const hatchMat = material(scene, 'hatch-mat', new Color3(.34, .22, .12))

  const hull = MeshBuilder.CreateBox('hull', { width: 8.6, height: 1.45, depth: 2.35 }, scene)
  hull.parent = hullRoot; hull.position.y = 0; hull.material = hullMat
  const bow = MeshBuilder.CreateCylinder('bow', { diameter: 2.25, height: 1.75, tessellation: 28, arc: .5 }, scene)
  bow.parent = hullRoot; bow.rotation.z = Math.PI / 2; bow.rotation.x = Math.PI / 2; bow.position.set(4.35, .05, 0); bow.material = hullMat
  const deck = MeshBuilder.CreateBox('deck', { width: 7.7, height: .18, depth: 2.15 }, scene)
  deck.parent = hullRoot; deck.position.y = .8; deck.material = deckMat
  const house = MeshBuilder.CreateBox('bridge-house', { width: 1.45, height: 1.35, depth: 1.9 }, scene)
  house.parent = hullRoot; house.position.set(-2.75, 1.48, 0); house.material = houseMat
  for (let i = 0; i < 3; i += 1) {
    const hatch = MeshBuilder.CreateBox(`hatch-${i}`, { width: 1.35, height: .24, depth: 1.7 }, scene)
    hatch.parent = hullRoot; hatch.position.set(-.8 + i * 1.55, 1.02, 0); hatch.material = hatchMat
  }

  const chaseCamera = new FreeCamera('chase', new Vector3(-14, 8.5, 0), scene)
  chaseCamera.minZ = .1
  chaseCamera.fov = .86
  const tacticalCamera = new ArcRotateCamera('tactical', -Math.PI / 2, .4, 68, new Vector3(7, 0, 0), scene)
  tacticalCamera.lowerRadiusLimit = 46
  tacticalCamera.upperRadiusLimit = 90
  tacticalCamera.attachControl(canvas, true)
  const bridgeCamera = new FreeCamera('bridge', ship.position.clone(), scene)
  bridgeCamera.minZ = .1
  bridgeCamera.fov = .9
  scene.activeCamera = chaseCamera

  const setCamera = (mode: 'chase' | 'tactical' | 'bridge') => {
    scene.activeCamera = mode === 'bridge' ? bridgeCamera : mode === 'tactical' ? tacticalCamera : chaseCamera
  }

  const renderState = (state: ManoeuvreState) => {
    ship.position.x = scenario.spawn.x + state.x * scenario.renderScale
    ship.position.z = scenario.spawn.z + state.y * scenario.renderScale
    ship.rotation.y = -state.heading
    const forward = new Vector3(Math.cos(state.heading), 0, Math.sin(state.heading))
    const side = new Vector3(-forward.z, 0, forward.x)
    chaseCamera.position.copyFrom(ship.position.subtract(forward.scale(17)).add(side.scale(1.2)).add(new Vector3(0, 9, 0)))
    chaseCamera.setTarget(ship.position.add(forward.scale(11)).add(new Vector3(0, .8, 0)))
    bridgeCamera.position.copyFrom(ship.position.add(new Vector3(0, 2.7, 0)).add(forward.scale(1.6)))
    bridgeCamera.setTarget(bridgeCamera.position.add(forward.scale(28)).add(new Vector3(0, -.35, 0)))
  }

  const resize = () => engine.resize()
  window.addEventListener('resize', resize)
  return { engine, scene, ship, chaseCamera, tacticalCamera, bridgeCamera, setCamera, renderState, dispose() { window.removeEventListener('resize', resize); scene.dispose(); engine.dispose() } }
}
