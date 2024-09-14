import * as THREE from 'three'

export function initVideoTexture(video) {
  const videoTexture = new THREE.VideoTexture(video);
  const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
  const videoGeometry = new THREE.PlaneGeometry(16, 9);
  videoGeometry.scale(0.5, 0.5, 0.5);
  const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);

  return videoMesh
}