import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
export function useGLTFLoader() {
  function loadGLTF() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        // '/3DModules/female_noble_knight_armor.glb',
        // '/3DModules/5_piece_heavy_armor_-_metahuman_rigged.glb',
        // '3DModules/anatomical_skeleton.glb',
        // '3DModules/emi_-_3d_anime_character_girl_for_blender.glb',
        // '3DModules/t-shirt__3_fourth.glb',
        '3DModules/skeleton_character_psx.glb',
        (model) => {
          console.log('gltf:', model)
          return resolve(model.scene)
        },
        () => { },
        (err) => {
          return reject(err)
        }
      )
    })
  }

  return {
    loadGLTF
  }
}