import * as THREE from 'three'

// 创建光源
export function initLights(_scene) {
  const lights = []
  initAmbientLight(lights, _scene)
  initDirectionalLight(lights, _scene)
}

// 环境光
export function initAmbientLight(_lights, _scene) {
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1)
  _scene.add(ambientLight)
  _lights.push(ambientLight)
}

// 平行光
export function initDirectionalLight(_lights, _scene) {
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1)
  directionalLight.position.set(80, 80, 80)
  _scene.add(directionalLight)
  _lights.push(directionalLight)
}

export function destroyLights(_lights) {
  if (_lights?.length) {
    _lights.forEach(item => {
      item?.dispose()
      item = null
    })
  }
}