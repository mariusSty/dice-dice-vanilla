import * as CANNON from "cannon-es";
import * as THREE from "three";

const offset = 0.01;
const sixFacesPositions = new Map([
  [1, (boundingBox) => [0, 0, boundingBox.max.z + offset]],
  [2, (boundingBox) => [0, boundingBox.max.y + offset, 0]],
  [3, (boundingBox) => [boundingBox.min.x - offset, 0, 0]],
  [4, (boundingBox) => [boundingBox.max.x + offset, 0, 0]],
  [5, (boundingBox) => [0, boundingBox.min.y - offset, 0]],
  [6, (boundingBox) => [0, 0, boundingBox.min.z - offset]],
]);
const sixFacesRotations = new Map([
  [1, [0, 0, 0]],
  [2, [-Math.PI * 0.5, 0, 0]],
  [3, [0, -Math.PI * 0.5, 0]],
  [4, [0, Math.PI * 0.5, 0]],
  [5, [Math.PI * 0.5, 0, 0]],
  [6, [0, -Math.PI, 0]],
]);

export default class Dice {
  constructor(scene, world, geometry, material, textGeometries, textMaterial) {
    this.scene = scene;
    this.world = world;
    this.geometry = geometry;
    this.geometry.computeBoundingBox();
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.castShadow = true;
    this.textGeometries = [];

    this.group = new THREE.Group();
    this.group.add(this.mesh);

    this.addText(textGeometries, textMaterial);

    const randomX = Math.round((Math.random() - 0.5) * 9);
    const randomZ = Math.round((Math.random() - 0.5) * 9);

    const initialY = 3;

    const rotationX = Math.random() * Math.PI * 2;
    const rotationY = Math.random() * Math.PI * 2;

    this.group.position.set(randomX, initialY, randomZ);
    this.group.rotateX(rotationX);
    this.group.rotateY(rotationY);

    scene.add(this.group);

    this.body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
    });
    this.body.position.copy(this.group.position);
    this.body.quaternion.copy(this.group.quaternion);
    this.world.addBody(this.body);
  }

  addText(textGeometries, textMaterial) {
    for (const textGeometry of textGeometries) {
      const text = new THREE.Mesh(textGeometry, textMaterial);
      const position = sixFacesPositions.get(textGeometry.name)(
        this.geometry.boundingBox
      );
      text.position.set(...position);
      text.rotation.set(...sixFacesRotations.get(textGeometry.name));
      this.textGeometries.push(text);
      this.group.add(text);
    }
  }

  removeText() {
    for (const textGeometry of this.textGeometries) {
      this.group.remove(textGeometry);
    }
    this.textGeometries = [];
  }

  remove() {
    this.scene.remove(this.group);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.world.removeBody(this.body);
  }

  addImpulse() {
    this.body.applyImpulse(
      new CANNON.Vec3(
        (Math.random() - 0.5) * 10,
        Math.random() * 10 + 15,
        (Math.random() - 0.5) * 10
      )
    );
  }
}
