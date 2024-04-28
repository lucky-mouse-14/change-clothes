import * as THREE from 'three'
export function useCamera() {
  function initCamera(_el) {
    const camera = new THREE.PerspectiveCamera(
      45,
      _el.clientWidth / _el.clientHeight,
      0.1,
      1000,
    )
    // 设置相机位置
    camera.position.set(0, 0, 10)
    return camera
  }

  function destroyCamera(_camera) {
    _camera = null
  }

  return {
    initCamera,
    destroyCamera
  }
}