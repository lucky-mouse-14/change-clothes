import * as THREE from 'three'

export function useScene() {
  function initScene() {
    // 初始化场景
    const scene = new THREE.Scene()
    // 场景的背景颜色
    scene.background = new THREE.Color('#EEE')
    return scene
  }

  function destroyScene(_scene) {
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
    _scene = null
  }

  return {
    initScene,
    destroyScene,
  }
}