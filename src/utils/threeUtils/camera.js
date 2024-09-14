import * as THREE from 'three'


// 透视相机
export function initPerspectiveCamera(_el) {
  const camera = new THREE.PerspectiveCamera(
    45,
    _el.clientWidth / _el.clientHeight,
    0.1,
    1000,
  )
  // 设置相机位置
  camera.position.set(0.0, 0.0, 0.0)
  return camera
}

// 正交相机
export function initOrthographicCamera(_el) {
  // const camera = new THREE.OrthographicCamera(1, 1, 1, 1, 0.1, 200)
  // 设置相机位置
  const w = _el.clientWidth || 1
  const h = _el.clientHeight || 1
  const k = w / h
  const s = 1
  // const left = -w / 2
  // const right = w / 2
  // const top = h / 2
  // const bottom = -h / 2

  const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, -1000, 1000)
  // const camera = new THREE.OrthographicCamera(left, right, top, bottom, -1, 1000)

  return camera
}

// 创建默认相机 - 透视相机
export function initCamer() {
  return initPerspectiveCamera()
}