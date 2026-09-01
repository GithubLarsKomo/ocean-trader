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

function material(scene: Scene, name: string, diffuse: Color3, emissive?: Color3, specular = new Color3(.08, .08, .08)) {
  const mat = new StandardMaterial(name, scene)
  mat.diffuseColor = diffuse
  mat.specularColor = specular
  if (emissive) mat.emissiveColor = emissive
  return mat
}

export function createP5Scene(canvas: HTMLCanvasElement, scenario: P5HarbourScenario): P5Scene {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true }, true)
  const scene = new Scene(engine)
  scene.clearColor = new Color4(.43, .57, .64, 1)
  scene.fogMode = Scene.FOGMODE_EXP2
  scene.fogDensity = .0048
  scene.fogColor = new Color3(.46, .58, .63)

  const sky = new HemisphericLight('sky', new Vector3(0, 1, 0), scene)
  sky.intensity = .92
  sky.groundColor = new Color3(.17, .19, .19)
  const sun = new DirectionalLight('sun', new Vector3(-.42, -1, .22), scene)
  sun.intensity = .82

  const water = MeshBuilder.CreateGround('water', { width: 150, height: 96 }, scene)
  const waterMat = material(scene, 'water-mat', new Color3(.028, .22, .29), undefined, new Color3(.5, .7, .75))
  waterMat.specularPower = 72
  water.material = waterMat

  const quayMat = material(scene, 'quay-mat', new Color3(.31, .31, .28))
  const edgeMat = material(scene, 'quay-edge', new Color3(.82, .72, .42), new Color3(.08, .06, .02))
  const darkMetal = material(scene, 'dark-metal', new Color3(.07, .08, .08))
  scenario.quays.forEach((q, i) => {
    const quay = MeshBuilder.CreateBox(`quay-${i}`, { width: q.length, depth: q.width, height: q.height }, scene)
    quay.position.set(q.x, q.height / 2, q.z)
    quay.material = quayMat
    const waterSide = q.z < 0 ? q.z + q.width / 2 : q.z - q.width / 2
    const edge = MeshBuilder.CreateBox(`quay-edge-${i}`, { width: q.length, depth: .22, height: .18 }, scene)
    edge.position.set(q.x, q.height + .08, waterSide)
    edge.material = edgeMat
    if (q.length > q.width) {
      for (let x = q.x - q.length / 2 + 2; x < q.x + q.length / 2; x += 5) {
        const bollard = MeshBuilder.CreateCylinder(`bollard-${i}-${x}`, { diameter: .32, height: .42, tessellation: 12 }, scene)
        bollard.position.set(x, q.height + .28, waterSide + (q.z < 0 ? -.42 : .42))
        bollard.material = darkMetal
        const fender = MeshBuilder.CreateBox(`fender-${i}-${x}`, { width: .55, height: 1.5, depth: .32 }, scene)
        fender.position.set(x, 1.05, waterSide + (q.z < 0 ? .18 : -.18))
        fender.material = darkMetal
      }
    }
  })

  const berth = MeshBuilder.CreateBox('berth-marker', { width: scenario.berth.length, depth: scenario.berth.width, height: .06 }, scene)
  berth.position.set(scenario.berth.x, .05, scenario.berth.z)
  berth.rotation.y = scenario.berth.heading
  const berthMat = material(scene, 'berth-mat', new Color3(.15, .62, .36), new Color3(.07, .3, .16))
  berthMat.alpha = .24
  berth.material = berthMat

  const laneMat = material(scene, 'lane-mat', new Color3(.7, .78, .64), new Color3(.09, .1, .06))
  ;[-24, -12, 0, 12, 24, 36].forEach((x, i) => {
    const marker = MeshBuilder.CreateBox(`lane-${i}`, { width: 5.5, depth: .12, height: .035 }, scene)
    marker.position.set(x, .035, 2.3)
    marker.material = laneMat
  })

  const red = material(scene, 'buoy-red', new Color3(.76, .08, .06), new Color3(.12, .01, .01))
  const green = material(scene, 'buoy-green', new Color3(.05, .5, .2), new Color3(.01, .1, .04))
  for (const b of scenario.buoys) {
    const mat = b.side === 'port' ? red : green
    const buoy = MeshBuilder.CreateCylinder(`buoy-${b.id}`, { height: .68, diameter: 1.0, tessellation: 18 }, scene)
    buoy.position.set(b.x, .34, b.z)
    buoy.material = mat
    const top = MeshBuilder.CreateCylinder(`buoy-top-${b.id}`, { diameterTop: .1, diameterBottom: .45, height: .78, tessellation: 12 }, scene)
    top.parent = buoy
    top.position.y = .68
    top.material = mat
    const lamp = MeshBuilder.CreateSphere(`buoy-lamp-${b.id}`, { diameter: .15, segments: 8 }, scene)
    lamp.parent = buoy
    lamp.position.y = 1.14
    const lampMat = material(scene, `buoy-lamp-mat-${b.id}`, b.side === 'port' ? new Color3(.8, .1, .08) : new Color3(.1, .75, .28), b.side === 'port' ? new Color3(.5, .03, .02) : new Color3(.02, .42, .12))
    lamp.material = lampMat
  }

  const containerMats = [
    material(scene, 'container-a', new Color3(.52, .18, .12)),
    material(scene, 'container-b', new Color3(.12, .32, .48)),
    material(scene, 'container-c', new Color3(.48, .4, .14)),
    material(scene, 'container-d', new Color3(.12, .38, .27)),
  ]
  for (let i = 0; i < 24; i += 1) {
    const box = MeshBuilder.CreateBox(`container-${i}`, { width: 3.4, depth: 1.4, height: 1.35 }, scene)
    box.position.set(10 + (i % 6) * 3.7, 3 + Math.floor(i / 12) * 1.4, -16.2 - Math.floor((i % 12) / 6) * 1.55)
    box.material = containerMats[i % containerMats.length]
  }

  const craneMat = material(scene, 'crane-mat', new Color3(.82, .62, .12))
  ;[12, 24, 36].forEach((x, i) => {
    const mast = MeshBuilder.CreateBox(`crane-mast-${i}`, { width: .7, depth: .7, height: 9 }, scene)
    mast.position.set(x, 6.8, -17.5)
    mast.material = craneMat
    const boom = MeshBuilder.CreateBox(`crane-boom-${i}`, { width: 9.5, depth: .45, height: .45 }, scene)
    boom.position.set(x - 3.7, 11, -17.5)
    boom.material = craneMat
    const cable = MeshBuilder.CreateCylinder(`crane-cable-${i}`, { diameter: .06, height: 5, tessellation: 8 }, scene)
    cable.position.set(x - 8.1, 8.3, -17.5)
    cable.material = darkMetal
  })

  const ship = MeshBuilder.CreateBox('ship', { width: 8.8, height: 1.8, depth: 2.5 }, scene)
  ship.visibility = 0
  ship.position.set(scenario.spawn.x, .95, scenario.spawn.z)
  const hullRoot = new TransformNode('vessel-visual', scene)
  hullRoot.parent = ship
  const hullMat = material(scene, 'hull-mat', new Color3(.075, .14, .18), undefined, new Color3(.16, .16, .16))
  const antiFoul = material(scene, 'antifouling', new Color3(.43, .07, .05))
  const rudderMat = material(scene, 'rudder-mat', new Color3(.68, .1, .06), new Color3(.06, .01, .005))
  const deckMat = material(scene, 'deck-mat', new Color3(.62, .57, .45))
  const houseMat = material(scene, 'house-mat', new Color3(.84, .85, .8))
  const hatchMat = material(scene, 'hatch-mat', new Color3(.31, .22, .14))
  const windowMat = material(scene, 'window-mat', new Color3(.025, .1, .14), new Color3(.01, .04, .05))

  const hull = MeshBuilder.CreateBox('hull', { width: 8.6, height: 1.35, depth: 2.35 }, scene)
  hull.parent = hullRoot; hull.position.y = .05; hull.material = hullMat
  const lowerHull = MeshBuilder.CreateBox('lower-hull', { width: 8.15, height: .6, depth: 1.9 }, scene)
  lowerHull.parent = hullRoot; lowerHull.position.y = -.72; lowerHull.material = antiFoul
  const bow = MeshBuilder.CreateCylinder('bow', { diameter: 2.25, height: 1.75, tessellation: 28, arc: .5 }, scene)
  bow.parent = hullRoot; bow.rotation.z = Math.PI / 2; bow.rotation.x = Math.PI / 2; bow.position.set(4.35, .05, 0); bow.material = hullMat
  const deck = MeshBuilder.CreateBox('deck', { width: 7.7, height: .18, depth: 2.15 }, scene)
  deck.parent = hullRoot; deck.position.y = .8; deck.material = deckMat
  const house = MeshBuilder.CreateBox('bridge-house', { width: 1.45, height: 1.35, depth: 1.9 }, scene)
  house.parent = hullRoot; house.position.set(-2.75, 1.48, 0); house.material = houseMat
  const bridgeTop = MeshBuilder.CreateBox('bridge-top', { width: 1.75, height: .48, depth: 2.05 }, scene)
  bridgeTop.parent = hullRoot; bridgeTop.position.set(-2.45, 2.1, 0); bridgeTop.material = houseMat
  const windows = MeshBuilder.CreateBox('bridge-windows', { width: 1.78, height: .18, depth: 2.08 }, scene)
  windows.parent = hullRoot; windows.position.set(-2.39, 2.12, 0); windows.material = windowMat
  for (let i = 0; i < 3; i += 1) {
    const hatch = MeshBuilder.CreateBox(`hatch-${i}`, { width: 1.35, height: .24, depth: 1.7 }, scene)
    hatch.parent = hullRoot; hatch.position.set(-.8 + i * 1.55, 1.02, 0); hatch.material = hatchMat
  }
  const funnel = MeshBuilder.CreateCylinder('funnel', { diameter: .5, height: 1.05, tessellation: 12 }, scene)
  funnel.parent = hullRoot; funnel.position.set(-3.0, 2.55, 0); funnel.material = material(scene, 'funnel-mat', new Color3(.75, .5, .1))
  const mast = MeshBuilder.CreateCylinder('mast', { diameter: .07, height: 2.1, tessellation: 8 }, scene)
  mast.parent = hullRoot; mast.position.set(-1.55, 2.75, 0); mast.material = darkMetal
  const rudder = MeshBuilder.CreateBox('rudder', { width: 1.1, height: 1.05, depth: .16 }, scene)
  rudder.parent = hullRoot
  rudder.position.set(-4.58, -.72, 0)
  rudder.setPivotPoint(new Vector3(.55, 0, 0))
  rudder.material = rudderMat

  const wakeMat = material(scene, 'wake-mat', new Color3(.72, .85, .86), new Color3(.08, .12, .12))
  wakeMat.alpha = 0
  const wakePort = MeshBuilder.CreateBox('wake-port', { width: 5.5, height: .025, depth: .38 }, scene)
  const wakeStarboard = MeshBuilder.CreateBox('wake-starboard', { width: 5.5, height: .025, depth: .38 }, scene)
  for (const [wake, z] of [[wakePort, -.72], [wakeStarboard, .72]] as const) {
    wake.parent = hullRoot
    wake.position.set(-5.7, -.78, z)
    wake.rotation.y = z < 0 ? -.08 : .08
    wake.material = wakeMat
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
    rudder.rotation.y = -state.rudder * 35 * Math.PI / 180
    const speed = Math.hypot(state.surge, state.sway)
    wakeMat.alpha = Math.min(.5, speed * .18)
    const wakeScale = .7 + Math.min(1.8, speed * .45)
    wakePort.scaling.x = wakeScale
    wakeStarboard.scaling.x = wakeScale
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
