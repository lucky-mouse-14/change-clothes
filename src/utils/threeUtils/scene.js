import * as THREE from 'three'

export function initScene() {
  // 创建场景
  const scene = new THREE.Scene()
  // 场景的背景颜色
  // scene.background = new THREE.Color('#EEE')
  scene.background = null
  return scene
}

export function destroyScene(_scene) {
  if (!_scene) return

  _scene.traverse((e) => {
    if (e.BufferGeometry)
      e.BufferGeometry.dispose()

    if (e.geometry)
      e.geometry.dispose()

    if (e.material)
      e.material.dispose()

    if (e.type === 'Mesh')
      _scene?.remove(e)
    e = null
  })
  _scene?.clear()
}