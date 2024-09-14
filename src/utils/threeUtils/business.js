import * as THREE from 'three'

// 模型居中显示
export function modelCenter(model, skeletonHelper) {
  // 创建一个 Box3 对象来作为包围盒
  const boundingBox = new THREE.Box3()

  // 更新包围盒，使其适应网格对象的边界
  boundingBox.setFromObject(model)

  // 获取包围盒的中心点
  const center = new THREE.Vector3()
  boundingBox.getCenter(center)

  // 获取包围盒的大小
  const size = boundingBox.getSize(new THREE.Vector3())

  // 调整模型的位置，使其位于场景的中心
  model.position.y -= center.y
}