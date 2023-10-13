import * as THREE from "three";

export default class Lights {
  constructor(scene) {
    const light = new THREE.AmbientLight("#ffffff", 0.5 * Math.PI);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(
      "#ffffff",
      0.5 * Math.PI
    );
    directionalLight.position.x = 1;
    directionalLight.position.y = 4;
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 6;
    scene.add(directionalLight);
  }
}
