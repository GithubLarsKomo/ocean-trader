import { Color3, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'

function material(scene: Scene, name: string, diffuse: Color3, emissive?: Color3) {
  const mat = new StandardMaterial(name, scene)
  mat.diffuseColor = diffuse
  mat.specularColor = new Color3(.08,.08,.08)
  if (emissive) mat.emissiveColor = emissive
  return mat
}

export function createRotterdamTerminal(scene: Scene) {
  const concrete = material(scene, 'terminal-concrete', new Color3(.31,.32,.31))
  const asphalt = material(scene, 'terminal-asphalt', new Color3(.10,.11,.11))
  const white = material(scene, 'terminal-white', new Color3(.72,.74,.72))
  const yellow = material(scene, 'terminal-yellow', new Color3(.78,.55,.10))
  const dark = material(scene, 'terminal-dark', new Color3(.05,.06,.06))
  const warehouseMat = material(scene, 'warehouse', new Color3(.33,.39,.40))
  const roofMat = material(scene, 'warehouse-roof', new Color3(.18,.22,.23))

  const apron = MeshBuilder.CreateGround('terminal-apron', { width: 56, height: 23 }, scene)
  apron.position.set(15, 2.01, -20.5)
  apron.material = concrete

  const road = MeshBuilder.CreateGround('terminal-road', { width: 52, height: 6 }, scene)
  road.position.set(14, 2.025, -29)
  road.material = asphalt
  for (let x = -8; x <= 37; x += 6) {
    const stripe = MeshBuilder.CreateBox(`road-stripe-${x}`, { width: 2.4, depth: .12, height: .025 }, scene)
    stripe.position.set(x, 2.05, -29)
    stripe.material = white
  }

  const containerMats = [
    material(scene,'container-rust',new Color3(.48,.16,.10)),
    material(scene,'container-blue',new Color3(.08,.26,.40)),
    material(scene,'container-ochre',new Color3(.55,.38,.10)),
    material(scene,'container-green',new Color3(.10,.34,.24)),
    material(scene,'container-grey',new Color3(.30,.31,.30)),
  ]
  let id = 0
  for (let lane = 0; lane < 4; lane += 1) {
    for (let col = 0; col < 8; col += 1) {
      const stacks = 1 + ((lane * 3 + col * 5) % 3)
      for (let level = 0; level < stacks; level += 1) {
        const box = MeshBuilder.CreateBox(`container-${id++}`, { width: 3.25, depth: 1.35, height: 1.25 }, scene)
        box.position.set(-5 + col * 3.55, 2.65 + level * 1.28, -15.5 - lane * 1.65)
        box.material = containerMats[(lane + col + level) % containerMats.length]
      }
    }
  }

  // Gantry cranes with portal legs rather than simple posts.
  for (const [i,x] of [4,18,32].entries()) {
    for (const z of [-18.8,-12.0]) {
      const leg = MeshBuilder.CreateBox(`gantry-leg-${i}-${z}`, { width:.55, depth:.55, height:10.5 }, scene)
      leg.position.set(x,7.25,z)
      leg.material = yellow
    }
    const top = MeshBuilder.CreateBox(`gantry-top-${i}`, { width:.6, depth:7.3, height:.5 }, scene)
    top.position.set(x,12.5,-15.4)
    top.material = yellow
    const boom = MeshBuilder.CreateBox(`gantry-boom-${i}`, { width:11, depth:.42, height:.42 }, scene)
    boom.position.set(x-5.1,12.5,-12.0)
    boom.material = yellow
    const cabin = MeshBuilder.CreateBox(`gantry-cabin-${i}`, { width:1.0, depth:1.0, height:.75 }, scene)
    cabin.position.set(x-4.8,11.8,-12.0)
    cabin.material = material(scene,`gantry-cabin-mat-${i}`,new Color3(.70,.72,.68))
  }

  // Warehouses and service buildings create a readable industrial skyline.
  for (const [i, x] of [-5, 12, 29].entries()) {
    const hall = MeshBuilder.CreateBox(`warehouse-${i}`, { width:12, depth:8, height:4.7 }, scene)
    hall.position.set(x,4.35,-37)
    hall.material = warehouseMat
    const roof = MeshBuilder.CreateBox(`warehouse-roof-${i}`, { width:12.5, depth:8.5, height:.25 }, scene)
    roof.position.set(x,6.83,-37)
    roof.material = roofMat
  }

  // Tank farm / silos make the scene recognisably maritime-industrial.
  const siloMat = material(scene,'silo-steel',new Color3(.55,.58,.57))
  for (let i=0;i<5;i+=1) {
    const silo = MeshBuilder.CreateCylinder(`silo-${i}`, { diameter:3.1, height:5.8, tessellation:24 }, scene)
    silo.position.set(39 + (i%2)*3.7,4.9,-34 - Math.floor(i/2)*3.7)
    silo.material = siloMat
  }

  // Light poles use emissive heads, inexpensive on mobile compared with many PointLights.
  const lampMat = material(scene,'terminal-lamp',new Color3(.88,.78,.48),new Color3(.8,.68,.32))
  for (const [x,z] of [[-9,-25],[4,-25],[17,-25],[30,-25],[43,-25],[-9,-12],[43,-12]] as const) {
    const pole = MeshBuilder.CreateCylinder(`lamp-pole-${x}-${z}`, { diameter:.12, height:6.3, tessellation:8 }, scene)
    pole.position.set(x,5.15,z)
    pole.material = dark
    const arm = MeshBuilder.CreateBox(`lamp-arm-${x}-${z}`, { width:1.0, depth:.12, height:.12 }, scene)
    arm.position.set(x+.42,8.25,z)
    arm.material = dark
    const head = MeshBuilder.CreateBox(`lamp-head-${x}-${z}`, { width:.45, depth:.28, height:.16 }, scene)
    head.position.set(x+.85,8.18,z)
    head.material = lampMat
  }

  // Distant navigation landmark / harbour control tower.
  const tower = MeshBuilder.CreateCylinder('harbour-control-tower', { diameter:2.5, height:12, tessellation:16 }, scene)
  tower.position.set(-25,8,-39)
  tower.material = material(scene,'tower-concrete',new Color3(.42,.44,.43))
  const control = MeshBuilder.CreateCylinder('harbour-control-room', { diameterTop:5.4, diameterBottom:4.6, height:2.2, tessellation:16 }, scene)
  control.position.set(-25,14,-39)
  control.material = material(scene,'control-glass',new Color3(.06,.17,.21),new Color3(.03,.08,.10))

  return { apron, road, controlTower: tower, landmark: new Vector3(-25, 14, -39) }
}
