import * as CANNON from "cannon-es";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const sizes = {
  height: window.innerHeight,
  width: window.innerWidth,
};

const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

const canvas = document.querySelector("canvas.webgl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xf2f2f2);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(
  55,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(2, 1, 5);
new OrbitControls(camera, renderer.domElement);

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});
const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0,
    restitution: 0.7,
  }
);
world.addContactMaterial(defaultContactMaterial);

const box = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
});
const mesh = new THREE.Mesh(box, material);
mesh.position.y = 3;
mesh.castShadow = true;
scene.add(mesh);
const boxBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 3, 0),
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
  material: defaultMaterial,
});
world.addBody(boxBody);

const plane = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f2f2 });
const planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.rotation.x = -Math.PI * 0.5;
scene.add(planeMesh);
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  shape: floorShape,
  mass: 0,
  material: defaultMaterial,
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

const light = new THREE.AmbientLight();
scene.add(light);

const directionalLight = new THREE.DirectionalLight();
directionalLight.position.x = 1;
directionalLight.position.y = 4;
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
scene.add(directionalLight);
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
scene.add(directionalLightCameraHelper);

const clock = new THREE.Clock();
let oldElapsedTime = 0;

function tick() {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;
  world.step(1 / 60, deltaTime, 3);
  mesh.position.copy(boxBody.position);
  requestAnimationFrame(tick);
  renderer.render(scene, camera);
}

tick();
