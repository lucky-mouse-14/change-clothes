import * as THREE from 'three'

export function useLights() {
  const lights = []
  function initLights(_scene) {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1)
    _scene.add(ambientLight)
    lights.push(ambientLight)
  }

  function destroyLights() {
    if (lights && lights.length) {
      lights.forEach(item => {
        item?.dispose()
      })
    }
  }

  return {
    initLights,
    destroyLights,
  }
}