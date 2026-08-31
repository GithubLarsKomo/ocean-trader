import { ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'
import type { ManoeuvreState } from '../simulation/state'
import type { P5HarbourScenario } from './rotterdam'
import { createHarbourEnvironment } from './environment'
import { createRotterdamTerminal } from './terminal'
import { createVesselVisual } from './vessel-model'
import { createAnimatedWater } from './water'

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
  engine.setHardwareScalingLevel(Math.max(1, Math.min(1.6, window.devicePixelRatio / 1.5)))
  const scene = new Scene(engine)
  scene.clearColor = new Color4(.44, .57, .62, 1)
  scene.fogMode = Scene.FOGMODE_EXP2
  scene.fogDensity = .0042
  scene.fogColor = new Color3(.44, .55, .59)

  const sky = new HemisphericLight('sky', new Vector3(0, 1, 0), scene)
  sky.intensity = .88
  sky.groundColor = new Color3(.14, .16, .16)
  const sun = new DirectionalLight('sun', new Vector3(-.42, -1, .24), scene)
  sun.intensity = .9

  const water = createAnimatedWater(scene)
  createRotterdamTerminal(scene)
  createHarbourEnvironment(scene)

  const quayMat = material(scene, 'quay-mat', new Color3(.29, .30, .29))
  const edgeMat = material(scene, 'quay-edge', new Color3(.78, .69, .42), new Color3(.07, .05, .01))
  const darkMetal = material(scene, 'dark-metal', new Color3(.055, .06, .06))
  scenario.quays.forEach((q, i) => {
    const quay = MeshBuilder.CreateBox(`quay-${i}`, { width: q.length, depth: q.width, height: q.height }, scene)
    quay.position.set(q.x, q.height / 2, q.z)
    quay.material = quayMat
    const waterSide = q.z < 0 ? q.z + q.width / 2 : q.z - q.width / 2
    const edge = MeshBuilder.CreateBox(`quay-edge-${i}`, { width: q.length, depth: .22, height: .18 }, scene)
    edge.position.set(q.x, q.height + .08, waterSide)
    edge.material = edgeMat
    if (q.length > q.width) {
      for (let x = q.x - q.length / 2 + 2; x < q.x + q.length / 2; x += 4.8) {
        const bollard = MeshBuilder.CreateCylinder(`bollard-${i}-${x}`, { diameter: .32, height: .42, tessellation: 10 }, scene)
        bollard.position.set(x, q.height + .28, waterSide + (q.z < 0 ? -.42 : .42))
        bollard.material = darkMetal
        const fender = MeshBuilder.CreateBox(`fender-${i}-${x}`, { width: .52, height: 1.42, depth: .30 }, scene)
        fender.position.set(x, 1.03, waterSide + (q.z < 0 ? .18 : -.18))
        fender.material = darkMetal
      }
    }
  })

  const berth = MeshBuilder.CreateBox('berth-marker', { width: scenario.berth.length, depth: scenario.berth.width, height: .04 }, scene)
  berth.position.set(scenario.berth.x, .045, scenario.berth.z)
  berth.rotation.y = scenario.berth.heading
  const berthMat = material(scene, 'berth-mat', new Color3(.12, .48, .28), new Color3(.03, .18, .09))
  berthMat.alpha = .15
  berth.material = berthMat

  const red = material(scene, 'buoy-red', new Color3(.72, .055, .045), new Color3(.10, .01, .01))
  const green = material(scene, 'buoy-green', new Color3(.035, .43, .16), new Color3(.01, .08, .03))
  for (const b of scenario.buoys) {
    const mat = b.side === 'port' ? red : green
    const buoy = MeshBuilder.CreateCylinder(`buoy-${b.id}`, { height: .72, diameterTop: .68, diameterBottom: 1.02, tessellation: 18 }, scene)
    buoy.position.set(b.x, .36, b.z)
    buoy.material = mat
    const cage = MeshBuilder.CreateTorus(`buoy-cage-${b.id}`, { diameter: .52, thickness: .055, tessellation: 16 }, scene)
    cage.parent = buoy
    cage.position.y = .62
    cage.rotation.x = Math.PI / 2
    cage.material = darkMetal
    const mast = MeshBuilder.CreateCylinder(`buoy-mast-${b.id}`, { diameter: .08, height: .72, tessellation: 8 }, scene)
    mast.parent = buoy
    mast.position.y = .78
    mast.material = darkMetal
    const lamp = MeshBuilder.CreateSphere(`buoy-lamp-${b.id}`, { diameter: .16, segments: 8 }, scene)
    lamp.parent = buoy
    lamp.position.y = 1.16
    const lampColor = b.side === 'port' ? new Color3(.9,.08,.06) : new Color3(.06,.8,.24)
    const lampMat = material(scene, `buoy-lamp-mat-${b.id}`, lampColor, lampColor.scale(.75))
    lamp.material = lampMat
  }

  const ship = MeshBuilder.CreateBox('ship-anchor', { width: 8.9, height: 1.8, depth: 2.6 }, scene)
  ship.visibility = 0
  ship.position.set(scenario.spawn.x, .95, scenario.spawn.z)
  const vessel = createVesselVisual(scene)
  vessel.root.parent = ship

  const wakeMat = material(scene, 'wake-mat', new Color3(.74, .86, .87), new Color3(.08, .11, .11))
  wakeMat.alpha = 0
  const wakePort = MeshBuilder.CreateDisc('wake-port', { radius: 1.0, tessellation: 24 }, scene)
  const wakeStarboard = MeshBuilder.CreateDisc('wake-starboard', { radius: 1.0, tessellation: 24 }, scene)
  for (const [wake, z] of [[wakePort, -.67], [wakeStarboard, .67]] as const) {
    wake.parent = vessel.root
    wake.rotation.x = Math.PI / 2
    wake.scaling.set(3.1, .45, 1)
    wake.position.set(-5.4, -.80, z)
    wake.material = wakeMat
  }

  const chaseCamera = new FreeCamera('chase', new Vector3(-15, 8.2, 0), scene)
  chaseCamera.minZ = .1
  chaseCamera.fov = .82
  const tacticalCamera = new ArcRotateCamera('tactical', -Math.PI / 2, .38, 70, new Vector3(7, 0, 0), scene)
  tacticalCamera.lowerRadiusLimit = 44
  tacticalCamera.upperRadiusLimit = 92
  tacticalCamera.attachControl(canvas, true)
  const bridgeCamera = new FreeCamera('bridge', ship.position.clone(), scene)
  bridgeCamera.minZ = .1
  bridgeCamera.fov = .88
  scene.activeCamera = chaseCamera

  const setCamera = (mode: 'chase' | 'tactical' | 'bridge') => {
    scene.activeCamera = mode === 'bridge' ? bridgeCamera : mode === 'tactical' ? tacticalCamera : chaseCamera
  }

  const renderState = (state: ManoeuvreState) => {
    const time = performance.now() / 1000
    water.update(time)
    ship.position.x = scenario.spawn.x + state.x * scenario.renderScale
    ship.position.z = scenario.spawn.z + state.y * scenario.renderScale
    ship.rotation.y = -state.heading
    vessel.rudder.rotation.y = state.rudder * 35 * Math.PI / 180

    const speed = Math.hypot(state.surge, state.sway)
    wakeMat.alpha = Math.min(.48, speed * .19)
    const wakeScale = .78 + Math.min(1.9, speed * .48)
    wakePort.scaling.x = 3.1 * wakeScale
    wakeStarboard.scaling.x = 3.1 * wakeScale

    const forward = new Vector3(Math.cos(state.heading), 0, Math.sin(state.heading))
    const side = new Vector3(-forward.z, 0, forward.x)
    chaseCamera.position.copyFrom(ship.position.subtract(forward.scale(18)).add(side.scale(1.2)).add(new Vector3(0, 8.2, 0)))
    chaseCamera.setTarget(ship.position.add(forward.scale(12)).add(new Vector3(0, .8, 0)))
    bridgeCamera.position.copyFrom(ship.position.add(new Vector3(0, 2.75, 0)).add(forward.scale(-1.7)))
    bridgeCamera.setTarget(bridgeCamera.position.add(forward.scale(32)).add(new Vector3(0, -.25, 0)))

    vessel.root.position.y = Math.sin(time * .85) * .025
    vessel.root.rotation.x = Math.sin(time * .55) * .0025
    vessel.root.rotation.z = Math.sin(time * .72 + .8) * .003
  }

  const resize = () => engine.resize()
  window.addEventListener('resize', resize)
  return {
    engine, scene, ship, chaseCamera, tacticalCamera, bridgeCamera, setCamera, renderState,
    dispose() { window.removeEventListener('resize', resize); scene.dispose(); engine.dispose() },
  }
}
