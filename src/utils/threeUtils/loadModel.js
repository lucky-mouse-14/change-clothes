import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import { VRMLoaderPlugin, VRMUtils, } from '@pixiv/three-vrm'

export function loadGLTF(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      url,
      (gltf) => {
        console.log('dddddddddddddddd', gltf)
        return resolve(gltf.scene)
      },
      () => { },
      (error) => {
        return reject(error)
      }
    )
  })
}

export function loadVRM(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))
    loader.load(
      url,
      (gltf) => {
        console.log('dddddddddddddddd', gltf)
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        // `VRM` is loaded inside `gltf.userData.vrm`
        const vrm = gltf.userData.vrm

        // rotate the VRM around y axis if the vrm is VRM0.0
        VRMUtils.rotateVRM0(vrm)

        return resolve(vrm)
      },
      () => { },
      (error) => {
        return reject(error)
      }
    )
  })
}

export function loadFBX(url) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader()
    loader.load(
      url,
      (fbx) => {
        console.log('dddddddddddddddd', fbx)
        return resolve(fbx)
      },
      () => { },
      (error) => {
        return reject(error)
      }
    )
  })
}
