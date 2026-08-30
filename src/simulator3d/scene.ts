import { ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'
import type { ManoeuvreState } from '../simulation/state'
import type { P5HarbourScenario } from './rotterdam'

export type P5Scene = {
  engine: Engine
  scene: Scene
  ship: Mesh
  chaseCamera: ArcRotateCamera
  tacticalCamera: ArcRotateCamera
  bridgeCamera: FreeCamera
  setCamera(mode: 'chase' | 'tactical' | 'bridge'): void
  renderState(state: ManoeuvreState): void
  dispose(): void
}

export function createP5Scene(canvas: HTMLCanvasElement, scenario: P5HarbourScenario): P5Scene {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true })
  const scene = new Scene(engine)
  scene.clearColor = new Color4(.025, .07, .095, 1)
  new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = .78
  const sun = new DirectionalLight('sun', new Vector3(-.45, -1, .25), scene); sun.intensity = .65

  const water = MeshBuilder.CreateGround('water', { width: 130, height: 80 }, scene)
  const waterMat = new StandardMaterial('water-mat', scene); waterMat.diffuseColor = new Color3(.035, .18, .24); waterMat.specularColor = new Color3(.45, .7, .75); water.material = waterMat
  const quayMat = new StandardMaterial('quay-mat', scene); quayMat.diffuseColor = new Color3(.23, .24, .22)
  scenario.quays.forEach((q, i) => { const quay = MeshBuilder.CreateBox(`quay-${i}`, { width: q.length, depth: q.width, height: q.height }, scene); quay.position.set(q.x, q.height / 2, q.z); quay.material = quayMat })

  const berth = MeshBuilder.CreateBox('berth-marker', { width: scenario.berth.length, depth: scenario.berth.width, height: .08 }, scene)
  berth.position.set(scenario.berth.x, .05, scenario.berth.z); berth.rotation.y = scenario.berth.heading
  const berthMat = new StandardMaterial('berth-mat', scene); berthMat.diffuseColor = new Color3(.18, .72, .42); berthMat.emissiveColor = new Color3(.08, .28, .16); berthMat.alpha = .42; berth.material = berthMat

  const buoyMat = new StandardMaterial('buoy-mat', scene); buoyMat.diffuseColor = new Color3(.88, .52, .12); buoyMat.emissiveColor = new Color3(.18, .08, .01)
  ;[-18, -6, 6, 18].forEach((x, i) => { const buoy = MeshBuilder.CreateCylinder(`buoy-${i}`, { height: 1.2, diameter: .55, tessellation: 12 }, scene); buoy.position.set(x, .6, i % 2 ? 9 : -9); buoy.material = buoyMat })

  const ship = MeshBuilder.CreateBox('ship', { width: 7.5, height: 2.1, depth: 2.1 }, scene); ship.position.set(scenario.spawn.x, 1.05, scenario.spawn.z)
  const shipMat = new StandardMaterial('ship-mat', scene); shipMat.diffuseColor = new Color3(.78, .8, .72); shipMat.specularColor = new Color3(.18, .18, .18); ship.material = shipMat
  const bow = MeshBuilder.CreateCylinder('bow', { diameter: 2.05, height: 1.6, tessellation: 24 }, scene); bow.rotation.z = Math.PI / 2; bow.position.x = 4.05; bow.parent = ship; bow.material = shipMat
  const bridgeBlock = MeshBuilder.CreateBox('bridge-block', { width: 1.8, height: 1.2, depth: 1.5 }, scene); bridgeBlock.position.set(-1.9, 1.55, 0); bridgeBlock.parent = ship; bridgeBlock.material = shipMat

  const chaseCamera = new ArcRotateCamera('chase', Math.PI * 1.5, 1.05, 22, ship.position.clone(), scene); chaseCamera.lowerRadiusLimit = 12; chaseCamera.upperRadiusLimit = 34; chaseCamera.attachControl(canvas, true)
  const tacticalCamera = new ArcRotateCamera('tactical', -Math.PI / 2, .22, 58, new Vector3(5, 0, 0), scene); tacticalCamera.lowerRadiusLimit = 38; tacticalCamera.upperRadiusLimit = 80; tacticalCamera.attachControl(canvas, true)
  const bridgeCamera = new FreeCamera('bridge', ship.position.clone(), scene); bridgeCamera.minZ = .1
  scene.activeCamera = chaseCamera

  const setCamera = (mode: 'chase' | 'tactical' | 'bridge') => { scene.activeCamera = mode === 'bridge' ? bridgeCamera : mode === 'tactical' ? tacticalCamera : chaseCamera }
  const renderState = (state: ManoeuvreState) => {
    ship.position.x = scenario.spawn.x + state.x * scenario.renderScale; ship.position.z = scenario.spawn.z + state.y * scenario.renderScale; ship.rotation.y = -state.heading
    chaseCamera.target.copyFrom(ship.position)
    const forward = new Vector3(Math.cos(state.heading), 0, Math.sin(state.heading))
    bridgeCamera.position.copyFrom(ship.position.add(new Vector3(0, 2.35, 0)).add(forward.scale(1.2)))
    bridgeCamera.setTarget(bridgeCamera.position.add(forward.scale(20)))
  }
  const resize = () => engine.resize(); window.addEventListener('resize', resize)
  return { engine, scene, ship, chaseCamera, tacticalCamera, bridgeCamera, setCamera, renderState, dispose() { window.removeEventListener('resize', resize); scene.dispose(); engine.dispose() } }
}
