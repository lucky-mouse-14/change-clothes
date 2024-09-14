import * as THREE from 'three'

const initRotation = {}

const prefixName = 'mixamorig'
const mixamorig = {
  "Hips": {
    // "name": "J_Bip_C_Hips",
    "name": `${prefixName}Hips`,
    "order": "XYZ",
    "func": { "fx": "-x", "fy": "y", "fz": "-z" }
  },
  "Neck": {
    // "name": "J_Bip_C_Neck",
    "name": `${prefixName}Neck`,
    "order": "XYZ",
    "func": { "fx": "-x", "fy": "y", "fz": "-z" }
  },
  "Chest": {
    // "name": "J_Bip_C_Chest",
    "name": `${prefixName}Spine2`,
    "name": 'J_Bip_C_Chest',
    "order": "XYZ",
    "func": { "fx": "-x", "fy": "y", "fz": "-z" }
  },
  "Spine": {
    // "name": "J_Bip_C_Spine",
    "name": `${prefixName}Spine`,
    "order": "XYZ",
    "func": { "fx": "-x", "fy": "y", "fz": "-z" }
  },
  "RightUpperArm": {
    // "name": "J_Bip_R_UpperArm",
    "name": `${prefixName}RightArm`,
    "order": "ZXY",
    "func": { "fx": "-z", "fy": "x", "fz": "-y" }
  },
  "RightLowerArm": {
    // "name": "J_Bip_R_LowerArm",
    "name": `${prefixName}RightForeArm`,
    "order": "ZXY",
    "func": { "fx": "-z", "fy": "x", "fz": "-y" }
  },
  "LeftUpperArm": {
    // "name": "J_Bip_L_UpperArm",
    "name": `${prefixName}LeftArm`,
    "order": "ZXY",
    "func": { "fx": "z", "fy": "-x", "fz": "-y" }
  },
  "LeftLowerArm": {
    // "name": "J_Bip_L_LowerArm",
    "name": `${prefixName}LeftForeArm`,
    "order": "ZXY",
    "func": { "fx": "z", "fy": "-x", "fz": "-y" }
  },
  "LeftUpperLeg": {
    // "name": "J_Bip_L_UpperLeg",
    "name": `${prefixName}LeftUpLeg`,
    "order": "XYZ",
    "func": { "fx": "-x", "fy": "y", "fz": "-z" }
  },
  "LeftLowerLeg": {
    // "name": "J_Bip_L_LowerLeg",
    "name": `${prefixName}LeftLeg`,
    "order": "XYZ",
    "func": { "fx": "-x", "fy": "y", "fz": "-z" }
  },
  "RightUpperLeg": {
    // "name": "J_Bip_R_UpperLeg",
    "name": `${prefixName}RightUpLeg`,
    "order": "XYZ",
    "func": { "fx": "-x", "fy": "y", "fz": "-z" }
  },
  "RightLowerLeg": {
    // "name": "J_Bip_L_LowerLeg",
    "name": `${prefixName}RightLeg`,
    "order": "XYZ",
    "func": { "fx": "-x", "fy": "y", "fz": "-z" }
  }
}

function capitalizeFirstLetterToLowerCase(str) {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Animate Rotation Helper function
 */
export function rigRotation(
  fileType,
  skeletonHelper,
  vrmModel,
  name,
  rotation = { x: 0, y: 0, z: 0, },
  dampener = 1,
  lerpAmount = 0.3,
) {
  if (vrmModel) {
    const Part = vrmModel.humanoid.getNormalizedBoneNode(
      capitalizeFirstLetterToLowerCase(name)
    )
    if (!Part) return false

    let euler = new THREE.Euler(
      (vrmModel.meta.metaVersion === "1" ? -1 : 1) * rotation.x * dampener,
      rotation.y * dampener,
      (vrmModel.meta.metaVersion === "1" ? -1 : 1) *
      rotation.z *
      dampener,
      rotation.rotationOrder || "XYZ"
    );
    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
  }
  else if (skeletonHelper) {
    const skname = mixamorig[name].name
    const b = skeletonHelper.bones.find(bone => bone.name === skname)

    if (!b) return false

    if (!initRotation[name]) {
      initRotation[name] = {
        x: b.rotation.x,
        y: b.rotation.y,
        z: b.rotation.z,
      }
    }

    const bindingFunc = mixamorig[name].func
    const order = mixamorig[name].order?.toUpperCase();
    const x = rotation.x * dampener;
    const y = rotation.y * dampener;
    const z = rotation.z * dampener;

    let euler = new THREE.Euler(
      initRotation[name].x + eval(bindingFunc.fx),
      initRotation[name].y + eval(bindingFunc.fy),
      initRotation[name].z + eval(bindingFunc.fz),
      order || rotation.rotationOrder || "XYZ"
    );
    let quaternion = new THREE.Quaternion().setFromEuler(euler);
    b.quaternion.slerp(quaternion, lerpAmount); // interpolate
  }
  else { }
}

// Animate Position Helper Function
export function rigPosition(
  fileType,
  skeletonHelper,
  vrmModel,
  name,
  position = { x: 0, y: 0, z: 0, },
  dampener = 1,
  lerpAmount = 0.3,
) {
  if (vrmModel) {
    const Part = vrmModel.humanoid.getNormalizedBoneNode(
      capitalizeFirstLetterToLowerCase(name)
    )
    if (!Part) return false
    let vector = new THREE.Vector3(
      position.x * dampener,
      position.y * dampener,
      position.z * dampener
    );
    Part.position.lerp(vector, lerpAmount) // interpolate
  }
  else if (skeletonHelper) {
    name = mixamorig[name].name; // convert name with model json binding info
    // find bone in bones by name
    var b = skeletonHelper.bones.find((bone) => bone.name == name)

    if (!b) return false

    if (fileType == 'fbx') {
      dampener *= 100;
    }

    let vector = new THREE.Vector3(
      position.x * dampener,
      position.y * dampener,
      -position.z * dampener,
    );

    if (fileType == 'fbx') {
      vector.y -= 1.2 * dampener;
    }

    b.position.lerp(vector, lerpAmount); // interpolate
  }
  else { }
}