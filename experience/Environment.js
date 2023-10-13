import * as CANNON from "cannon-es";
import * as THREE from "three";

export default class Environment {
  constructor(scene, world, floorMaterial) {
    // Walls
    this.back = this.createWall(world, new CANNON.Vec3(0, 5, -5));
    this.front = this.createWall(world, new CANNON.Vec3(0, 5, 5), {
      vector: new CANNON.Vec3(1, 0, 0),
      angle: Math.PI,
    });
    this.right = this.createWall(world, new CANNON.Vec3(5, 5, 0), {
      vector: new CANNON.Vec3(0, -1, 0),
      angle: Math.PI * 0.5,
    });
    this.left = this.createWall(world, new CANNON.Vec3(-5, 5, 0), {
      vector: new CANNON.Vec3(0, -1, 0),
      angle: -Math.PI * 0.5,
    });

    // Floor
    this.floor = this.createFloor(scene, world, floorMaterial);
  }

  createWall(world, position, quaternion) {
    const wall = new CANNON.Body({
      shape: new CANNON.Plane(),
      type: CANNON.Body.STATIC,
    });
    if (position) {
      wall.position.set(position.x, position.y, position.z);
    }
    if (quaternion) {
      wall.quaternion.setFromAxisAngle(quaternion.vector, quaternion.angle);
    }
    world.addBody(wall);
    return wall;
  }

  createFloor(scene, world, material) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    mesh.receiveShadow = true;
    mesh.rotation.x = -Math.PI * 0.5;
    scene.add(mesh);
    const floor = new CANNON.Body({
      shape: new CANNON.Plane(),
      type: CANNON.Body.STATIC,
    });
    floor.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
    world.addBody(floor);
    return mesh;
  }

  updateFloorMaterial(material) {
    this.floor.material = material;
  }
}
