import { GUI } from "dat.gui";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import Dice from "./experience/Dice";
import Environment from "./experience/Environment";
import Lights from "./experience/Lights";
import Render from "./experience/Render";

// Constants
const dices = [];
const settings = {
  totalDices: 2,
  click: () => {
    for (const dice of dices) {
      dice.addImpulse();
    }
  },
};
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
const material = new THREE.MeshStandardMaterial({
  color: 0x0000ff,
  metalness: 0,
  roughness: 0,
});
const textMaterial = new THREE.MeshBasicMaterial({ color: "white" });

// Geometries
const textGeometries = new Map();
fontLoader.load("/fonts/autour.json", (font) => {
  textGeometries.set("autour", createTextGeometries(font));
  if (dices.length === 0) createDices();
});

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

const gui = new GUI();
gui
  .add(settings, "totalDices")
  .min(1)
  .max(9)
  .step(1)
  .onFinishChange((total) => {
    for (const dice of dices) {
      dice.remove();
    }
    createDices(total);
  });
gui.add(settings, "click");

function tick() {
  requestAnimationFrame(tick);
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
      height: 0.02,
    }).center();
    textGeometry.name = label;
    textGeometries.push(textGeometry);
  }
  return textGeometries;
}

function createDices(total = settings.totalDices, font = "autour") {
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
