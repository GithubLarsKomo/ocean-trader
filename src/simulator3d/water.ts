import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, VertexBuffer } from '@babylonjs/core'

export type AnimatedWater = {
  mesh: Mesh
  update(timeSeconds: number): void
}

export function createAnimatedWater(scene: Scene): AnimatedWater {
  const mesh = MeshBuilder.CreateGround('animated-water', { width: 160, height: 102, subdivisionsX: 42, subdivisionsY: 28, updatable: true }, scene)
  const material = new StandardMaterial('water-material', scene)
  material.diffuseColor = new Color3(.025, .18, .25)
  material.specularColor = new Color3(.58, .72, .76)
  material.specularPower = 96
  material.alpha = .98
  mesh.material = material

  const base = mesh.getVerticesData(VertexBuffer.PositionKind)?.slice() ?? []
  const positions = base.slice()

  const update = (timeSeconds: number) => {
    for (let i = 0; i < base.length; i += 3) {
      const x = base[i]
      const z = base[i + 2]
      const swell = Math.sin(x * .17 + timeSeconds * .85) * .055
      const chop = Math.sin(z * .31 - timeSeconds * 1.35 + x * .07) * .026
      const ripple = Math.sin((x + z) * .48 + timeSeconds * 1.9) * .014
      positions[i + 1] = swell + chop + ripple
    }
    mesh.updateVerticesData(VertexBuffer.PositionKind, positions, true, false)
  }

  return { mesh, update }
}
