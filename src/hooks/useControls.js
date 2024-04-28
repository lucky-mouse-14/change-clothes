import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function useControls() {
  function initOrbitControls(_camera, _renderer) {
    // 添加轨道，可以鼠标随意拖拽
    const controls = new OrbitControls(_camera, _renderer.domElement)
    controls.target.set(0, 0, 0) // 设定中心点
    controls.update(0) // 重新设置轨道，相当于刷新

    return controls
  }

  function destroyControls(_controls) {
    _controls?.dispose()
    _controls = null
  }

  return {
    initOrbitControls,
    destroyControls,
  }
}