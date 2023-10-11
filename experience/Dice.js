import * as CANNON from "cannon-es";
import * as THREE from "three";

export default class Dice {
  constructor(
    scene,
    world,
    geometry,
    material,
    initialPosition,
    textGeometries,
    textMaterial
  ) {
    this.scene = scene;
    this.world = world;
    this.mesh = new THREE.Mesh(geometry, material);
    this.group = new THREE.Group();
    this.group.add(this.mesh);

    const offset = 0.01;

    geometry.computeBoundingBox();
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
    for (const textGeometry of textGeometries) {
      const text = new THREE.Mesh(textGeometry, textMaterial);
      const position = sixFacesPositions.get(textGeometry.name)(
        geometry.boundingBox
      );
      text.position.set(...position);
      text.rotation.set(...sixFacesRotations.get(textGeometry.name));
      this.group.add(text);
    }

    this.group.position.set(initialPosition.x, 3, initialPosition.z);
    this.group.castShadow = true;
    scene.add(this.group);

    this.body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(initialPosition.x, 3, initialPosition.z),
      shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
    });
    this.world.addBody(this.body);
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
