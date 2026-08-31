import { Color3, MeshBuilder, Scene, StandardMaterial } from '@babylonjs/core'

function mat(scene: Scene, name: string, color: Color3, emissive?: Color3, alpha = 1) {
  const m = new StandardMaterial(name, scene)
  m.diffuseColor = color
  m.specularColor = new Color3(.03,.03,.03)
  if (emissive) m.emissiveColor = emissive
  m.alpha = alpha
  return m
}

export function createHarbourEnvironment(scene: Scene) {
  const distant = mat(scene,'distant-industry',new Color3(.17,.20,.20))
  const dark = mat(scene,'distant-dark',new Color3(.06,.07,.07))
  const lamp = mat(scene,'distant-lamp',new Color3(.83,.68,.35),new Color3(.55,.38,.12))

  // Low-detail skyline: enough parallax/depth to read as Europoort without tying
  // the game to a photogrammetric or copyrighted source model.
  const skyline = [
    [-48,-42,12,5],[-34,-44,18,3.8],[-15,-46,10,6.5],[1,-45,20,4.2],
    [25,-47,15,7.5],[44,-44,22,4.5],[60,-41,11,6],
  ] as const
  skyline.forEach(([x,z,w,h],i) => {
    const block = MeshBuilder.CreateBox(`distant-block-${i}`, { width:w, depth:4, height:h }, scene)
    block.position.set(x,h/2,z)
    block.material = distant
  })

  // Refinery stacks and storage silhouettes.
  for (const [i,x] of [-42,-29,-2,15,38,55].entries()) {
    const stack = MeshBuilder.CreateCylinder(`distant-stack-${i}`, { diameter:.55, height:9 + (i%3)*2, tessellation:10 }, scene)
    stack.position.set(x,5.5 + (i%3),-39 - (i%2)*3)
    stack.material = dark
    const cap = MeshBuilder.CreateSphere(`stack-light-${i}`, { diameter:.18, segments:6 }, scene)
    cap.position.set(x,10.1 + (i%3)*2,-39 - (i%2)*3)
    cap.material = lamp
  }

  // Distant wind turbines are strongly associated with the modern Rotterdam port
  // landscape and provide scale without needing high polygon counts.
  for (const [i,x] of [-54,-18,20,57].entries()) {
    const mast = MeshBuilder.CreateCylinder(`wind-mast-${i}`, { diameter:.18, height:12, tessellation:8 }, scene)
    mast.position.set(x,6,-52)
    mast.material = dark
    const hub = MeshBuilder.CreateSphere(`wind-hub-${i}`, { diameter:.5, segments:8 }, scene)
    hub.position.set(x,12,-52)
    hub.material = dark
    for (let b=0;b<3;b+=1) {
      const blade = MeshBuilder.CreateBox(`wind-blade-${i}-${b}`, { width:.16, height:4.5, depth:.08 }, scene)
      blade.position.set(x,12 + Math.cos(b*Math.PI*2/3)*2.1,-52)
      blade.rotation.z = b*Math.PI*2/3
      blade.material = dark
    }
  }

  // Soft cloud banks as translucent flattened spheres: cheap, no textures/downloads.
  const cloudMat = mat(scene,'cloud-bank',new Color3(.72,.76,.76),undefined,.15)
  for (const [i,x] of [-42,-12,21,48].entries()) {
    const cloud = MeshBuilder.CreateSphere(`cloud-${i}`, { diameter:13, segments:8 }, scene)
    cloud.scaling.set(2.2,.34,.65)
    cloud.position.set(x,23,-48 - (i%2)*5)
    cloud.material = cloudMat
  }
}
