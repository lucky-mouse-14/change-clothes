import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { emitter } from '@/utils'
export default function useBoneObj() {
  let boneObj = {}

  onMounted(() => {
    emitter.on('update-pointList', (pointList) => {
      onUpdateList(pointList)
    })
  })

  onUnmounted(() => {
    emitter.off('update-pointList')

    for (let e in boneObj) {
      if (e.BufferGeometry)
        e.BufferGeometry.dispose()

      if (e.geometry)
        e.geometry.dispose()

      if (e.material)
        e.material.dispose()

      if (e.type === 'Mesh')
        _scene?.remove(e)
      e = null
    }
    boneObj = {}
  })
  function initBoneObj(model) {
    const bones = model.children[0].children[2]
    boneObj['left-shoulder'] = {
      bone: bones.getObjectByName('mixamorigLeftShoulder'),
      // initPos: new THREE.Vector3(0.16728906333446503, -0.4775106608867645, -0.2042236328125),
      initPos: bones.getObjectByName('mixamorigLeftShoulder').position,
    }
    boneObj['left-arm'] = {
      bone: bones.getObjectByName('mixamorigLeftArm'),
      // initPos: new THREE.Vector3(0.38952040672302246, -0.4693129360675812, -0.207763671875),
      initPos: bones.getObjectByName('mixamorigLeftArm').position,
    }
    boneObj['left-fore-arm'] = {
      bone: bones.getObjectByName('mixamorigLeftForeArm'),
      // initPos: new THREE.Vector3(0.5944491624832153, -0.4565984904766083, -0.315185546875),
      initPos: bones.getObjectByName('mixamorigLeftForeArm').position,
    }
    boneObj['right-shoulder'] = {
      bone: bones.getObjectByName('mixamorigRightShoulder'),
      // initPos: new THREE.Vector3(-0.17201489210128784, -0.4690127372741699, -0.2266845703125),
      initPos: bones.getObjectByName('mixamorigRightShoulder').position,
    }
    boneObj['right-arm'] = {
      bone: bones.getObjectByName('mixamorigRightArm'),
      // initPos: new THREE.Vector3(-0.40517494082450867, -0.43440765142440796, -0.2242431640625),
      initPos: bones.getObjectByName('mixamorigRightArm').position,
    }
    boneObj['right-fore-arm'] = {
      bone: bones.getObjectByName('mixamorigRightForeArm'),
      // initPos: new THREE.Vector3(-0.6103491187095642, -0.4126957058906555, -0.3125),
      initPos: bones.getObjectByName('mixamorigRightForeArm').position,
    }
    boneObj['neck'] = {
      bone: bones.getObjectByName('mixamorigNeck'),
      initPos: new THREE.Vector3(1, 0.0, 0.0),
    }
    boneObj['waist'] = {
      bone: bones.getObjectByName('mixamorigSpine2'),
      initPos: new THREE.Vector3(1, 0.0, 0.0),
    }

    boneObj['left-leg'] = {
      bone: bones.getObjectByName('mixamorigLeftLeg'),
      initPos: bones.getObjectByName('mixamorigLeftLeg').position,
    }
    boneObj['left-up-leg'] = {
      bone: bones.getObjectByName('mixamorigLeftUpLeg'),
      initPos: bones.getObjectByName('mixamorigLeftUpLeg').position,
    }
  }

  function onUpdateList(pointList) {
    const left_nodes = pointList.filter((item, index) => {
      return index === 5 || index === 7 || index === 9
    })

    const right_nodes = pointList.filter((item, index) => {
      return index === 6 || index === 8 || index === 10
    })

    const boneRotation1 = getBoneRotation('left-shoulder', [left_nodes[0].x, left_nodes[0].y, left_nodes[0].z], 'left-arm', [left_nodes[1].x, left_nodes[1].y, left_nodes[1].z])
    boneObj['left-arm']['bone'].setRotationFromQuaternion(boneRotation1)
    const boneRotation2 = getBoneRotation('left-arm', [left_nodes[1].x, left_nodes[1].y, left_nodes[1].z], 'left-fore-arm', [left_nodes[2].x, left_nodes[2].y, left_nodes[2].z])
    boneObj['left-fore-arm']['bone'].setRotationFromQuaternion(boneRotation2)


    const boneRotation3 = getBoneRotation('right-shoulder', [right_nodes[0].x, right_nodes[0].y, right_nodes[0].z], 'right-arm', [right_nodes[1].x, right_nodes[1].y, right_nodes[1].z])
    boneObj['right-arm']['bone'].setRotationFromQuaternion(boneRotation3)
    const boneRotation4 = getBoneRotation('right-arm', [right_nodes[1].x, right_nodes[1].y, right_nodes[1].z], 'right-fore-arm', [right_nodes[2].x, right_nodes[2].y, right_nodes[2].z])
    boneObj['right-fore-arm']['bone'].setRotationFromQuaternion(boneRotation4)


    const left_legs = pointList.filter((item, index) => {
      return index === 11 || index === 13 || index === 15
    })
    const boneRotation5 = getBoneRotation('left-up-leg', [left_legs[0].x, left_legs[0].y, left_legs[0].z], 'left-leg', [left_legs[1].x, left_legs[1].y, left_legs[1].z])
    boneObj['left-leg']['bone'].setRotationFromQuaternion(boneRotation5)
  }

  /**
   * 通过上下两个骨骼端点位置，计算出骨骼的旋转角度
   */
  function getBoneRotation(baseBoneName, baseBonePoints, currentBoneName, currentBonePoints) {
    const baseBone = boneObj[baseBoneName];
    const currentBone = boneObj[currentBoneName];

    const baseBonePos = new THREE.Vector3(baseBonePoints[0], baseBonePoints[1], baseBonePoints[2])
    const currentBonePos = new THREE.Vector3(currentBonePoints[0], currentBonePoints[1], currentBonePoints[2])

    const newVec = new THREE.Vector3().subVectors(currentBonePos, baseBonePos);
    const baseVec = new THREE.Vector3().subVectors(currentBone.initPos, baseBone.initPos);

    newVec.normalize();
    baseVec.normalize();
    const angle = newVec.angleTo(baseVec);
    const cross = new THREE.Vector3().crossVectors(newVec, baseVec);

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(cross, angle);
    return quaternion;
  }

  return {
    boneObj,
    initBoneObj,
  }
}