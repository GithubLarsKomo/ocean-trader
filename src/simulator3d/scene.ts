import { ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'
import type { ManoeuvreState } from '../simulation/state'
import type { P5HarbourScenario } from './rotterdam'

export type P5Scene = {
  engine: Engine
  scene: Scene
  ship: Mesh
  chaseCamera: ArcRotateCamera
  tacticalCamera: ArcRotateCamera
  setCamera(mode: 'chase' | 'tactical'): void
  renderState(state: ManoeuvreState): void
  dispose(): void
}

function material(scene: Scene, name: string, diffuse: Color3, specular = new Color3(.08, .08, .08)) {
  const mat = new StandardMaterial(name, scene)
  mat.diffuseColor = diffuse
  mat.specularColor = specular
  return mat
}

export function createP5Scene(canvas: HTMLCanvasElement, scenario: P5HarbourScenario): P5Scene {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, adaptToDeviceRatio: true })
  const scene = new Scene(engine)
  scene.clearColor = new Color4(.42, .58, .67, 1)
  scene.fogMode = Scene.FOGMODE_EXP2
  scene.fogDensity = .006
  scene.fogColor = new Color3(.45, .58, .64)

  const sky = new HemisphericLight('sky', new Vector3(0, 1, 0), scene)
  sky.intensity = .92
  sky.groundColor = new Color3(.18, .2, .2)
  const sun = new DirectionalLight('sun', new Vector3(-.35, -1, .2), scene)
  sun.intensity = .9

  const water = MeshBuilder.CreateGround('water', { width: 150, height: 92, subdivisions: 2 }, scene)
  const waterMat = material(scene, 'water-mat', new Color3(.035, .24, .31), new Color3(.5, .72, .78))
  waterMat.specularPower = 72
  water.material = waterMat

  const quayMat = material(scene, 'quay-mat', new Color3(.31, .31, .28))
  const edgeMat = material(scene, 'quay-edge', new Color3(.78, .73, .58))
  const bollardMat = material(scene, 'bollard', new Color3(.09, .1, .1))
  scenario.quays.forEach((q, i) => {
    const quay = MeshBuilder.CreateBox(`quay-${i}`, { width: q.length, depth: q.width, height: q.height }, scene)
    quay.position.set(q.x, q.height / 2, q.z)
    quay.material = quayMat

    if (q.length > q.width) {
      const waterSide = q.z < 0 ? q.z + q.width / 2 : q.z - q.width / 2
      const edge = MeshBuilder.CreateBox(`edge-${i}`, { width: q.length, depth: .28, height: .18 }, scene)
      edge.position.set(q.x, q.height + .05, waterSide)
      edge.material = edgeMat
      for (let x = q.x - q.length / 2 + 2; x < q.x + q.length / 2; x += 5) {
        const bollard = MeshBuilder.CreateCylinder(`bollard-${i}-${x}`, { diameter: .35, height: .45, tessellation: 12 }, scene)
        bollard.position.set(x, q.height + .28, waterSide + (q.z < 0 ? -.45 : .45))
        bollard.material = bollardMat
      }
    }
  })

  const containerColors = [new Color3(.56, .16, .1), new Color3(.08, .27, .45), new Color3(.72, .48, .08), new Color3(.13, .39, .28)]
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const box = MeshBuilder.CreateBox(`container-${row}-${col}`, { width: 2.6, height: 1.1, depth: 1.05 }, scene)
      box.position.set(12 + col * 3, 3.1 + (row % 2) * 1.15, -17.2 - row * 1.25)
      box.material = material(scene, `container-mat-${row}-${col}`, containerColors[(row + col) % containerColors.length])
    }
  }

  const craneMat = material(scene, 'crane-mat', new Color3(.73, .55, .16))
  for (const x of [12, 27, 39]) {
    const tower = MeshBuilder.CreateBox(`crane-tower-${x}`, { width: .7, height: 9, depth: .7 }, scene)
    tower.position.set(x, 6.8, -18)
    tower.material = craneMat
    const boom = MeshBuilder.CreateBox(`crane-boom-${x}`, { width: 8, height: .35, depth: .35 }, scene)
    boom.position.set(x - 2.8, 10.8, -18)
    boom.material = craneMat
    const cable = MeshBuilder.CreateCylinder(`crane-cable-${x}`, { diameter: .06, height: 5, tessellation: 8 }, scene)
    cable.position.set(x - 6.2, 8.2, -18)
    cable.material = bollardMat
  }

  const berth = MeshBuilder.CreateBox('berth-marker', { width: scenario.berth.length, depth: scenario.berth.width, height: .05 }, scene)
  berth.position.set(scenario.berth.x, .04, scenario.berth.z)
  berth.rotation.y = scenario.berth.heading
  const berthMat = material(scene, 'berth-mat', new Color3(.2, .68, .38))
  berthMat.emissiveColor = new Color3(.04, .17, .08)
  berthMat.alpha = .18
  berth.material = berthMat

  for (const buoySpec of scenario.buoys) {
    const root = MeshBuilder.CreateCylinder(`buoy-${buoySpec.id}`, { diameter: 1.05, height: .65, tessellation: 18 }, scene)
    root.position.set(buoySpec.x, .32, buoySpec.z)
    const buoyColor = buoySpec.side === 'port' ? new Color3(.75, .08, .06) : new Color3(.08, .48, .17)
    root.material = material(scene, `buoy-${buoySpec.id}-mat`, buoyColor, new Color3(.15, .15, .15))
    const top = MeshBuilder.CreateCylinder(`buoy-top-${buoySpec.id}`, { diameterTop: .12, diameterBottom: .5, height: .8, tessellation: 12 }, scene)
    top.parent = root
    top.position.y = .65
    top.material = root.material
    const light = MeshBuilder.CreateSphere(`buoy-light-${buoySpec.id}`, { diameter: .16, segments: 8 }, scene)
    light.parent = root
    light.position.y = 1.14
    const lightMat = material(scene, `buoy-light-mat-${buoySpec.id}`, buoyColor)
    lightMat.emissiveColor = buoyColor.scale(.7)
    light.material = lightMat
  }

  const ship = MeshBuilder.CreateBox('ship-root', { size: .08 }, scene)
  ship.visibility = 0
  ship.position.set(scenario.spawn.x, .9, scenario.spawn.z)

  const hullMat = material(scene, 'hull-mat', new Color3(.16, .18, .18), new Color3(.12, .12, .12))
  const hull = MeshBuilder.CreateBox('hull', { width: 7.3, height: 1.45, depth: 2.15 }, scene)
  hull.parent = ship
  hull.material = hullMat
  hull.position.y = -.05
  const lowerHull = MeshBuilder.CreateBox('lower-hull', { width: 6.8, height: .65, depth: 1.75 }, scene)
  lowerHull.parent = ship
  lowerHull.position.y = -.82
  const antiFoul = material(scene, 'antifouling', new Color3(.45, .08, .055))
  lowerHull.material = antiFoul
  const bow = MeshBuilder.CreateCylinder('bow', { diameter: 2.12, height: 1.55, tessellation: 24 }, scene)
  bow.rotation.z = Math.PI / 2
  bow.position.set(3.75, -.03, 0)
  bow.parent = ship
  bow.material = hullMat

  const deckMat = material(scene, 'deck-mat', new Color3(.54, .42, .24))
  const deck = MeshBuilder.CreateBox('deck', { width: 6.4, height: .15, depth: 1.95 }, scene)
  deck.parent = ship
  deck.position.y = .76
  deck.material = deckMat

  const superMat = material(scene, 'superstructure', new Color3(.86, .85, .77))
  const superstructure = MeshBuilder.CreateBox('superstructure', { width: 1.35, height: 1.45, depth: 1.72 }, scene)
  superstructure.parent = ship
  superstructure.position.set(-2.35, 1.48, 0)
  superstructure.material = superMat
  const bridge = MeshBuilder.CreateBox('bridge', { width: 1.65, height: .55, depth: 1.92 }, scene)
  bridge.parent = ship
  bridge.position.set(-1.98, 2.05, 0)
  bridge.material = superMat
  const windowMat = material(scene, 'bridge-windows', new Color3(.035, .13, .17))
  const windows = MeshBuilder.CreateBox('bridge-windows', { width: 1.7, height: .22, depth: 1.94 }, scene)
  windows.parent = ship
  windows.position.set(-1.92, 2.12, 0)
  windows.material = windowMat

  const funnel = MeshBuilder.CreateCylinder('funnel', { diameter: .55, height: 1.15, tessellation: 12 }, scene)
  funnel.parent = ship
  funnel.position.set(-2.75, 2.55, 0)
  funnel.material = material(scene, 'funnel-mat', new Color3(.76, .52, .12))
  const mast = MeshBuilder.CreateCylinder('mast', { diameter: .08, height: 2.3, tessellation: 8 }, scene)
  mast.parent = ship
  mast.position.set(-1.25, 2.8, 0)
  mast.material = bollardMat

  for (const x of [-.8, .9, 2.4]) {
    const hatch = MeshBuilder.CreateBox(`hatch-${x}`, { width: 1.25, height: .18, depth: 1.55 }, scene)
    hatch.parent = ship
    hatch.position.set(x, .92, 0)
    hatch.material = material(scene, `hatch-mat-${x}`, new Color3(.36, .35, .29))
  }

  const rudder = MeshBuilder.CreateBox('rudder', { width: .75, height: 1.0, depth: .12 }, scene)
  rudder.parent = ship
  rudder.position.set(-3.72, -.78, 0)
  rudder.material = antiFoul

  const chaseCamera = new ArcRotateCamera('chase', Math.PI * 1.5, 1.08, 24, ship.position.clone(), scene)
  chaseCamera.lowerRadiusLimit = 13
  chaseCamera.upperRadiusLimit = 38
  chaseCamera.lowerBetaLimit = .55
  chaseCamera.upperBetaLimit = 1.35
  chaseCamera.attachControl(canvas, true)

  const tacticalCamera = new ArcRotateCamera('tactical', -Math.PI / 2, .3, 62, new Vector3(6, 0, 1), scene)
  tacticalCamera.lowerRadiusLimit = 38
  tacticalCamera.upperRadiusLimit = 84
  tacticalCamera.attachControl(canvas, true)
  scene.activeCamera = chaseCamera

  const setCamera = (mode: 'chase' | 'tactical') => { scene.activeCamera = mode === 'chase' ? chaseCamera : tacticalCamera }
  const renderState = (state: ManoeuvreState) => {
    ship.position.x = scenario.spawn.x + state.x * scenario.renderScale
    ship.position.z = scenario.spawn.z + state.y * scenario.renderScale
    ship.rotation.y = -state.heading
    rudder.rotation.y = state.rudder * Math.PI / 4.5
    chaseCamera.target.copyFrom(ship.position)
  }

  const resize = () => engine.resize()
  window.addEventListener('resize', resize)
  return { engine, scene, ship, chaseCamera, tacticalCamera, setCamera, renderState, dispose() { window.removeEventListener('resize', resize); scene.dispose(); engine.dispose() } }
}
