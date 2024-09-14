import * as THREE from 'three'

const boneObj = {}

let modelDis = 0

const videoWidth = 320
const videoHeight = 640

const vecX = new THREE.Vector3(1, 0, 0)
const vecY = new THREE.Vector3(0, 1, 0)
const vecZ = new THREE.Vector3(0, 0, 1)
const halfPi = Math.PI / 2;

const deg2rad = (deg) => deg * Math.PI / 180.0
const rad2deg = (rad) => rad * 180.0 / Math.PI

// 从src的root以leaf的角度从node和node旋转dst
function updateJoint(src, root, node, leaf, dst, min = -360, max = 360) {
  const from = src[leaf].clone().sub(src[node]).normalize();
  const to = src[node].clone().sub(src[root]).normalize();
  let quat = new THREE.Quaternion();
  const axis = from.clone().cross(to).normalize();
  let angle = Math.acos(from.dot(to));
  angle = Math.max(deg2rad(min), Math.min(deg2rad(max), angle));
  quat.setFromAxisAngle(axis, angle);
  dst.rotation.setFromQuaternion(quat);
}

// 调整旋转角度
function adjJoint(x, y, z, dst) {
  let quatX = new THREE.Quaternion();
  quatX.setFromAxisAngle(vecX, deg2rad(x));
  let quatY = new THREE.Quaternion();
  quatY.setFromAxisAngle(vecY, deg2rad(y));
  let quatZ = new THREE.Quaternion();
  quatZ.setFromAxisAngle(vecZ, -deg2rad(z));

  let quat = dst.quaternion.multiply(quatZ).multiply(quatY).multiply(quatX);
  dst.rotation.setFromQuaternion(quat);
}



export function initModel(_model) {
  boneObj['hips'] = _model.getObjectByName('J_Bip_C_Hips')
  boneObj['spine'] = _model.getObjectByName('J_Bip_C_Spine')
  boneObj['chest'] = _model.getObjectByName('J_Bip_C_Chest')
  boneObj['upperChest'] = _model.getObjectByName('J_Bip_C_UpperChest')
  boneObj['neck'] = _model.getObjectByName('J_Bip_C_Neck')
  boneObj['head'] = _model.getObjectByName('J_Bip_C_Head')
  boneObj['upperArmL'] = _model.getObjectByName('J_Bip_L_UpperArm')
  boneObj['upperArmR'] = _model.getObjectByName('J_Bip_R_UpperArm')
  boneObj['lowerArmL'] = _model.getObjectByName('J_Bip_L_LowerArm')
  boneObj['lowerArmR'] = _model.getObjectByName('J_Bip_R_LowerArm')
  boneObj['handL'] = _model.getObjectByName('J_Bip_L_Hand')
  boneObj['handR'] = _model.getObjectByName('J_Bip_R_Hand')
  boneObj['upperLegL'] = _model.getObjectByName('J_Bip_L_UpperLeg')
  boneObj['upperLegR'] = _model.getObjectByName('J_Bip_R_UpperLeg')
  boneObj['lowerLegL'] = _model.getObjectByName('J_Bip_L_LowerLeg')
  boneObj['lowerLegR'] = _model.getObjectByName('J_Bip_R_LowerLeg')
  boneObj['footL'] = _model.getObjectByName('J_Bip_L_Foot')
  boneObj['footR'] = _model.getObjectByName('J_Bip_R_Foot')

  boneObj['eyeL'] = _model.getObjectByName('J_Adj_L_FaceEyeSet')
  boneObj['eyeR'] = _model.getObjectByName('J_Adj_R_FaceEyeSet')

  boneObj["shoulderR"] = _model.getObjectByName("J_Bip_R_Shoulder");
  boneObj["shoulderL"] = _model.getObjectByName("J_Bip_L_Shoulder");

  _model.scale.set(4, 4, 1)


  _model.rotation.y = Math.PI
  _model.position.set(0, 0, 0)
}

export function updateModelPose(pointList) {
  const src = {}

  src['nose'] = pointList[0]
  src['eyeL'] = pointList[1]
  src['eyeR'] = pointList[2]
  src['earL'] = pointList[3]
  src['earR'] = pointList[4]
  src['upperArmL'] = pointList[5]
  src['upperArmR'] = pointList[6]
  src['lowerArmL'] = pointList[7]
  src['lowerArmR'] = pointList[8]
  src['handL'] = pointList[9]
  src['handR'] = pointList[10]
  src['upperLegL'] = pointList[11]
  src['upperLegR'] = pointList[12]
  src['lowerLegL'] = pointList[13]
  src['lowerLegR'] = pointList[14]
  src['footL'] = pointList[15]
  src['footR'] = pointList[16]

  const joint = {}
  Object.keys(src).forEach(key => {
    joint[key] = new THREE.Vector3(src[key].x, videoHeight - src[key].y, 0)
  })


  // 左手
  if (joint['upperArmL']) {
    if (joint['lowerArmL']) {
      if (joint['upperArmR']) {
        updateJoint(joint, 'upperArmR', 'upperArmL', 'lowerArmL', boneObj['upperArmL'])
      }
      if (joint['handL']) {
        updateJoint(joint, 'upperArmL', 'lowerArmL', 'handL', boneObj['lowerArmL'])

        // 总是朝向手掌修正
        const armLow2Hand = joint['handL'].clone().sub(joint['lowerArmL']).normalize()
        const angleX = rad2deg(armLow2Hand.y) + 90
        const angleY = Math.min(0, rad2deg(armLow2Hand.x))
        adjJoint(angleX, angleY, 0, boneObj['lowerArmL'])

        boneObj['handL'].rotation.setFromQuaternion(new THREE.Quaternion())
      }
    }
  }

  // 右手
  if (joint['upperArmR']) {
    if (joint['lowerArmR']) {
      if (joint['upperArmL']) {
        updateJoint(joint, 'upperArmL', 'upperArmR', 'lowerArmR', boneObj['upperArmR'])
      }
      if (joint['handR']) {
        updateJoint(joint, "upperArmR", "lowerArmR", "handR", boneObj["lowerArmR"]);

        const armLow2Hand = joint["handR"].clone().sub(joint["lowerArmR"]).normalize();
        const angleX = rad2deg(armLow2Hand.y) + 90;
        const angleY = Math.max(0, rad2deg(armLow2Hand.x));
        adjJoint(angleX, angleY, 0, boneObj["lowerArmR"]);

        boneObj["handR"].rotation.setFromQuaternion(new THREE.Quaternion());
      }
    }
  }

  //胸
  if (joint["upperArmL"] && joint["upperArmR"]) {
    joint["upperArmLL"] = joint["upperArmL"].clone().add(vecX);
    updateJoint(joint, "upperArmLL", "upperArmL", "upperArmR", boneObj["upperChest"], -20, 20);
  }

  //腰
  if (joint["upperLegL"] && joint["upperLegR"]) {
    joint["upperLegLL"] = joint["upperLegL"].clone().add(vecX);
    updateJoint(joint, "upperLegLL", "upperLegL", "upperLegR", boneObj["spine"], -10, 10);

    // const adjX = 2.0;
    // const pos = joint["upperLegL"].clone().add(joint["upperLegR"]).divideScalar(2);
    // const x = -(pos.x - (videoWidth / 2)) / videoWidth;
    // boneObj["hips"].x = x * adjX;

    // const adjX = 3
    // const pos = joint['upperLegL'].clone().add(joint['upperLegR']).divideScalar(2)
    // const x = -(pos.x - (videoWidth / 2)) / videoWidth
    // boneObj['hips'].position.x = x * adjX

    const adjX = -0.0
    const adjY = -0.5
    let pos = joint['upperLegL'].clone().add(joint['upperLegR']).divideScalar(2)
    let x = -(-pos.x - videoWidth / 2) / videoWidth
    let y = -(pos.y - videoHeight / 2) / videoHeight
    boneObj["hips"].position.x = x * adjX;
    boneObj["hips"].position.y = y * adjY;
  }

  //左脚
  if (joint["upperLegL"]) {
    if (joint["lowerLegL"]) {
      if (joint["upperLegR"]) {
        // 由于没有参考点，因此在左腹股沟上方创建一个临时关节。
        joint["upperLegLUp"] = joint["upperLegR"].clone().sub(joint["upperLegL"]).normalize();
        joint["upperLegLUp"].applyAxisAngle(vecZ, -halfPi).add(joint["upperLegL"]);
        updateJoint(joint, "upperLegLUp", "upperLegL", "lowerLegL", boneObj["upperLegL"], -20, 20);
      }
      if (joint["footL"]) {
        updateJoint(joint, "upperLegL", "lowerLegL", "footL", boneObj["lowerLegL"], -20, 20);

        // 由于没有参考点，因此在左脚踝下方垂直创建一个临时关节。
        joint["footLDown"] = joint["footL"].clone().sub(vecY);
        updateJoint(joint, "lowerLegL", "footL", "footLDown", boneObj["footL"]);
      } else {
        // 由于没有参考点，因此在左膝垂直下方创建一个临时关节。
        joint["lowerLegLDown"] = joint["lowerLegL"].clone().sub(vecY);
        updateJoint(joint, "upperLegL", "lowerLegL", "lowerLegLDown", boneObj["lowerLegL"]);
        updateJoint(joint, "lowerLegL", "lowerLegLDown", "lowerLegLDown", boneObj["footL"]);
      }
    }
  }

  //右脚
  if (joint["upperLegR"]) {
    if (joint["lowerLegR"]) {
      if (joint["upperLegL"]) {
        // 由于没有参考点，因此在右腹股沟上方创建一个临时关节。
        joint["upperLegRUp"] = joint["upperLegL"].clone().sub(joint["upperLegR"]).normalize();
        joint["upperLegRUp"].applyAxisAngle(vecZ, halfPi).add(joint["upperLegR"]);
        updateJoint(joint, "upperLegRUp", "upperLegR", "lowerLegR", boneObj["upperLegR"], -20, 20);
      }
      if (joint["footR"]) {
        updateJoint(joint, "upperLegR", "lowerLegR", "footR", boneObj["lowerLegR"], -20, 20);

        // 由于没有参考点，因此在右脚踝垂直下方创建一个临时关节
        joint["footRDown"] = joint["footR"].clone().sub(vecY);
        updateJoint(joint, "lowerLegR", "footR", "footRDown", boneObj["footR"]);
      } else {
        // 由于没有参考点，因此在右膝下方垂直创建一个临时关节。
        joint["lowerLegRDown"] = joint["lowerLegR"].clone().sub(vecY);
        updateJoint(joint, "upperLegR", "lowerLegR", "lowerLegRDown", boneObj["lowerLegR"]);
        updateJoint(joint, "lowerLegR", "lowerLegRDown", "lowerLegRDown", boneObj["footR"]);
      }
    }
  }
}