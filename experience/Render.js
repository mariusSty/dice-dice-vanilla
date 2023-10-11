import * as CANNON from "cannon-es";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const sizes = {
  height: window.innerHeight,
  width: window.innerWidth,
};

export default class Render {
  constructor(canvas) {
    this.renderer = this.createRenderer(canvas);
    this.camera = this.createCamera(this.renderer);
    this.world = this.createWorld();
  }

  createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf2f2f2);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    return renderer;
  }

  createCamera(renderer) {
    const camera = new THREE.PerspectiveCamera(
      55,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    camera.position.set(0, 10, 0);
    new OrbitControls(camera, renderer.domElement);
    return camera;
  }

  createWorld() {
    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -30, 0),
    });
    const defaultMaterial = new CANNON.Material("default");
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.3,
        restitution: 0.3,
      }
    );
    world.addContactMaterial(defaultContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;
    return world;
  }
}
