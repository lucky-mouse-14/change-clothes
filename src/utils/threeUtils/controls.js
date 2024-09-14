import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function initOrbitControls(_camera, _renderer, _render) {
  // 创建轨道控制器
  const controls = new OrbitControls(_camera, _renderer.domElement)
  // controls.target.set(0, 0, 0) // 设定中心点
  // controls.update() // 重新设置轨道，相当于刷新

  controls.addEventListener('change', function () {
    _render()
  })

  return controls
}

export function destroyControls(_controls) {
  _controls?.dispose()
}