import { GUI } from "dat.gui";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import Dice from "./experience/Dice";
import Environment from "./experience/Environment";
import Lights from "./experience/Lights";
import Render from "./experience/Render";
import circleFragmentShader from "./shaders/circle/fragment.glsl";
import gradientFragmentShader from "./shaders/gradient/fragment.glsl";
import randomFragmentShader from "./shaders/random/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";

// Constants
const dices = [];
const settings = {
  font: 1,
  primaryColor: 0x0000ff,
  secondaryColor: 0x00ffff,
  textColor: 0xffffff,
  totalDices: 2,
  type: 1,
  throw: throwDices,
};
const fonts = new Map([
  [1, "autour"],
  [2, "kanit"],
  [3, "yuji"],
]);
const initialPositions = new Map([
  [0, { x: 0, z: 0 }],
  [1, { x: -2, z: 0 }],
  [2, { x: 2, z: 0 }],
  [3, { x: 0, z: -2 }],
  [4, { x: -2, z: -2 }],
  [5, { x: 2, z: -2 }],
  [6, { x: 0, z: 2 }],
  [7, { x: -2, z: 2 }],
  [8, { x: 2, z: 2 }],
]);

// Loaders
const fontLoader = new FontLoader();

// Materials
const textMaterial = new THREE.MeshBasicMaterial({ color: settings.textColor });
const fragmentShaders = new Map([
  [1, randomFragmentShader],
  [2, gradientFragmentShader],
  [3, circleFragmentShader],
]);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader: fragmentShaders.get(settings.type),
  uniforms: {
    uPrimary: { value: new THREE.Color(settings.primaryColor) },
    uSecondary: { value: new THREE.Color(settings.secondaryColor) },
  },
});

// Geometries
const textGeometries = new Map();
fontLoader.load("/fonts/autour.json", (font) =>
  textGeometries.set("autour", createTextGeometries(font))
);
fontLoader.load("/fonts/kanit.json", (font) =>
  textGeometries.set("kanit", createTextGeometries(font))
);
fontLoader.load("/fonts/yuji.json", (font) =>
  textGeometries.set("yuji", createTextGeometries(font))
);

// Init
const scene = new THREE.Scene();
const canvas = document.querySelector("canvas.webgl");
THREE.ColorManagement.enabled = false;
const render = new Render(canvas);
new Lights(scene);
new Environment(scene, render.world);

const geometry = new RoundedBoxGeometry(1, 1, 1);
const labelTextGeometries = [...Array(6).keys()].map((i) => i + 1);

const clock = new THREE.Clock();
let oldElapsedTime = 0;

// GUI
const gui = new GUI();
gui
  .add(settings, "totalDices")
  .min(1)
  .max(9)
  .step(1)
  .onFinishChange((total) => createDices(total, settings.font));
gui
  .add(settings, "font")
  .min(1)
  .max(3)
  .step(1)
  .onFinishChange((fontKey) => createDices(settings.totalDices, fontKey));
gui
  .add(settings, "type")
  .min(1)
  .max(3)
  .step(1)
  .onFinishChange((type) => {
    material.fragmentShader = fragmentShaders.get(type);
    material.needsUpdate = true;
  });
gui
  .addColor(settings, "primaryColor")
  .onChange(() => material.uniforms.uPrimary.value.set(settings.primaryColor));
gui
  .addColor(settings, "secondaryColor")
  .onChange(() =>
    material.uniforms.uSecondary.value.set(settings.secondaryColor)
  );
gui
  .addColor(settings, "textColor")
  .onChange(() => textMaterial.color.set(settings.textColor));
gui.add(settings, "throw");

function tick() {
  requestAnimationFrame(tick);
  if (dices.length === 0 && textGeometries.has("autour")) createDices();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;
  render.world.step(1 / 60, deltaTime, 3);
  for (const dice of dices) {
    dice.group.position.copy(dice.body.position);
    dice.group.quaternion.copy(dice.body.quaternion);
  }
  render.renderer.render(scene, render.camera);
}

tick();

function createTextGeometries(font) {
  const textGeometries = [];
  for (const label of labelTextGeometries) {
    const textGeometry = new TextGeometry(label.toString(), {
      font,
      size: 0.5,
      height: 0.01,
    }).center();
    textGeometry.name = label;
    textGeometries.push(textGeometry);
  }
  return textGeometries;
}

function createDices(total = settings.totalDices, key = settings.font) {
  const font = fonts.get(key);
  removeDices();
  for (let i = 0; i < total; i++) {
    dices.push(
      new Dice(
        scene,
        render.world,
        geometry,
        material,
        initialPositions.get(i),
        textGeometries.get(font),
        textMaterial
      )
    );
  }
}

function removeDices() {
  for (const dice of dices) {
    dice.remove();
  }
}

function throwDices() {
  for (const dice of dices) {
    dice.addImpulse();
  }
}
