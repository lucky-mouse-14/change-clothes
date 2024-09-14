import * as THREE from 'three'

export function initRenderer(_el) {
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  // 设置像素比
  renderer.setPixelRatio(window.devicePixelRatio)
  // 设置渲染器尺寸
  renderer.setSize(_el.clientWidth, _el.clientHeight)
  // 设置背景颜色
  renderer.setClearColor(0xffffff, 0)
  // 将渲染器的 canvas 元素添加到容器中
  _el.appendChild(renderer.domElement)

  return renderer
}

export function destroyRenderer(_renderer) {
  _renderer?.dispose()
  _renderer?.forceContextLoss();
  // _renderer?.content = null
  let gl = _renderer.domElement.getContext("webgl");
  if (gl && gl.getExtension("WEBGL_lose_context")) {
    gl.getExtension("WEBGL_lose_context").loseContext();
  }
}