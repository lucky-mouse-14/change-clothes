import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
export function useGLTFLoader() {
  function loadGLTF(_scene) {
    const loader = new GLTFLoader();
    console.log('vvv', loader)
    loader.load('/3DModules/fancy_tailcoat_suit.glb', model => {
      console.log('gltf:', model)
      _scene.add(model.scene)
    })
  }

  return {
    loadGLTF
  }
}