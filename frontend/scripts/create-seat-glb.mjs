import fs from 'node:fs'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer
      this.onloadend?.()
    })
  }
}

const scene = new THREE.Scene()
const material = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness })
const addBox = (name, size, position, mat, bevel = 0.08) => {
  const geometry = new THREE.BoxGeometry(...size)
  if (bevel) {
    geometry.computeVertexNormals()
  }
  const mesh = new THREE.Mesh(geometry, mat)
  mesh.name = name
  mesh.position.set(...position)
  scene.add(mesh)
}

addBox('berth-cushion', [1.72, 0.18, 0.78], [0, 0.45, 0], material('#123d78'))
addBox('berth-mattress', [1.58, 0.12, 0.68], [0, 0.58, 0], material('#6c8fb8', 0.95))
addBox('berth-back', [1.68, 0.72, 0.12], [0, 0.8, -0.33], material('#123d78'))
addBox('berth-front-rail', [1.72, 0.08, 0.08], [0, 0.24, 0.34], material('#a9b7c8', 0.35, 0.7))
for (const x of [-0.72, 0.72]) addBox('berth-support', [0.08, 0.42, 0.08], [x, 0.08, 0], material('#8394a8', 0.35, 0.8), 0)

const exporter = new GLTFExporter()
exporter.parse(scene, (result) => {
  fs.mkdirSync('public/models', { recursive: true })
  fs.writeFileSync('public/models/train-seat.glb', Buffer.from(result))
}, (error) => {
  console.error(error)
  process.exitCode = 1
}, { binary: true })
