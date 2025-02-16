import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.9,
  200
);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const textureLoader = new THREE.TextureLoader();
const gui = new dat.GUI();

camera.position.set(120, 40, 0);
controls.enableDamping = true;
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
gui.width = 300;

const doorTexture = textureLoader.load("/textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");

const bricksTexture = textureLoader.load("/textures/bricks/yellow.webp");
const bricksNormalTexture = textureLoader.load("/textures/bricks/yellow.webp");

const roofTexture = textureLoader.load("/textures/bricks/roof.jpg");
const roofNormalTexture = textureLoader.load("/textures/bricks/roof.jpg");

const floorTexture = textureLoader.load("/textures/floor/snow.jpg");
const floorNormalTexture = textureLoader.load("/textures/floor/snow.jpg");

floorTexture.repeat.set(4, 4);
floorNormalTexture.repeat.set(4, 4);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;

const gridHelper = new THREE.GridHelper(30, 50, 50);
scene.add(gridHelper);
gridHelper.visible = false;
gui.add(gridHelper, "visible").name("Grid Helper");

const ambitionLight = new THREE.AmbientLight(0xb9d5ff, 0.2);
scene.add(ambitionLight);
gui
  .add(ambitionLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Ambient Light");

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-10, 20, 10);
directionalLight.castShadow = true;
directionalLight.intensity = 0.5;
scene.add(directionalLight);

directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight.target);

directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 100;

//Shadow map size for better quality
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

//Update light and shadow properties
directionalLight.shadow.camera.updateProjectionMatrix();

//HDR environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load("hdri/puresky_4k.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// Road Geometry
const roadTexture = textureLoader.load("/textures/floor/asphalt.jpg");
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;

const roadGeometry = new THREE.PlaneGeometry(200, 20);
const roadMaterial = new THREE.MeshStandardMaterial({
  map: roadTexture,
  side: THREE.DoubleSide,
});
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0.1, 40);

scene.add(road);

const house = new THREE.Group();
scene.add(house);
house.position.y = 0;

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: floorTexture,
    normalMap: floorNormalTexture,
    side: THREE.DoubleSide,
  })
);
floor.rotation.x = Math.PI * -0.5;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

function createHouse(position) {
  const houseGroup = new THREE.Group();

  const wallWidth = 20;
  const wallHeight = 12;
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(wallWidth, wallHeight, wallWidth),
    new THREE.MeshStandardMaterial({
      map: bricksTexture,
      normalMap: bricksNormalTexture,
    })
  );
  walls.position.y = wallHeight / 2;
  walls.castShadow = true;
  houseGroup.add(walls);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(wallWidth * 1.2, wallHeight * 0.5, 4),
    new THREE.MeshStandardMaterial({
      map: roofTexture,
      normalMap: roofNormalTexture,
    })
  );
  roof.position.y = wallHeight + wallHeight * 0.25;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  houseGroup.add(roof);

  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 8),
    new THREE.MeshStandardMaterial({
      map: doorTexture,
      normalMap: doorNormalTexture,
      alphaMap: doorAlphaTexture,
      transparent: true,
    })
  );
  door.position.set(0, 4, wallWidth / 2 + 0.01);
  door.castShadow = true;
  houseGroup.add(door);

  // Load the window model using GLTFLoader
  const loader = new GLTFLoader();

  loader.load(
    "//models/window.glb",
    (gltf) => {
      const windowModel = gltf.scene;

      windowModel.scale.set(0.1, 0.1, 0.1);

      windowModel.position.set(
        -wallWidth / 4,
        wallHeight / 2,
        wallWidth / 2 + 0.5
      );
      windowModel.castShadow = true;

      houseGroup.add(windowModel.clone());

      const rightWindowModel = windowModel.clone();
      rightWindowModel.position.set(
        wallWidth / 4,
        wallHeight / 2,
        wallWidth / 2 + 0.5
      );
      houseGroup.add(rightWindowModel);
    },
    undefined,
    (error) => {
      console.error("An error occurred while loading the window model:", error);
    }
  );

  houseGroup.position.set(position.x, position.y, position.z);
  scene.add(houseGroup);
}

const houseCount = 5;
const houseSpacing = 50;

for (let i = -houseCount; i <= houseCount; i++) {
  createHouse({ x: i * houseSpacing, y: 0, z: 0 });
}
// Back Road Geometry
const backRoadTexture = textureLoader.load("/textures/floor/highway.jpg");
backRoadTexture.wrapS = THREE.RepeatWrapping;
backRoadTexture.wrapT = THREE.RepeatWrapping;
backRoadTexture.repeat.set(2, 5);
backRoadTexture.rotation = Math.PI / 2;
const backRoadGeometry = new THREE.PlaneGeometry(200, 40);
const backRoadMaterial = new THREE.MeshStandardMaterial({
  map: backRoadTexture,
  side: THREE.DoubleSide,
});

const backRoad = new THREE.Mesh(backRoadGeometry, backRoadMaterial);
backRoad.rotation.x = -Math.PI / 2;
backRoad.position.set(0, 0.1, -50);
scene.add(backRoad);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const wallWidth = 19;
const wallHeight = 12;

const frontWallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);

const frontWallExteriorTexture = textureLoader.load(
  "/textures/bricks/yellow.webp"
);
const frontWallInteriorTexture = textureLoader.load(
  "/textures/floor/interior.jpg"
);

const frontWallExteriorMaterial = new THREE.MeshStandardMaterial({
  map: frontWallExteriorTexture,
  side: THREE.DoubleSide,
});

const frontWallInteriorMaterial = new THREE.MeshStandardMaterial({
  map: frontWallInteriorTexture,
  side: THREE.BackSide, //Interior side
});

const frontWallExterior = new THREE.Mesh(
  frontWallGeometry,
  frontWallExteriorMaterial
);
frontWallExterior.position.z = -7.5 - 0.01;
frontWallExterior.position.y = wallHeight / 2;
house.add(frontWallExterior);
frontWallExterior.castShadow = true;

//Wall material
const wallMaterial = new THREE.MeshStandardMaterial({
  roughness: 0.33,
  map: bricksTexture,
  normalMap: bricksNormalTexture,
  side: THREE.DoubleSide,
});

const textureLoad = new THREE.TextureLoader();

textureLoad.load("/textures/bricks/yellow.webp", function (texture) {
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.minFilter = THREE.LinearFilter;

  const backWallTextureMaterial = new THREE.MeshStandardMaterial({
    map: texture,
  });

  const wallDepth = 7.5;

  const wallShape = new THREE.Shape();
  wallShape.moveTo(-wallWidth / 2, 0);
  wallShape.lineTo(-wallWidth / 2, wallHeight);
  wallShape.lineTo(wallWidth / 2, wallHeight);
  wallShape.lineTo(wallWidth / 2, 0);
  wallShape.lineTo(-wallWidth / 2, 0);

  function addWindowHole(shape, x, y, width, height) {
    const holePath = new THREE.Path();
    holePath.moveTo(x - width / 2, y);
    holePath.lineTo(x - width / 2, y + height);
    holePath.lineTo(x + width / 2, y + height);
    holePath.lineTo(x + width / 2, y);
    holePath.lineTo(x - width / 2, y);
    shape.holes.push(holePath);
  }

  const windowWidth = 3;
  const windowHeight = 2.8;
  const leftWindowX = -6;
  const rightWindowX = 5;
  const windowY = 7;

  addWindowHole(wallShape, leftWindowX, windowY, windowWidth, windowHeight);
  addWindowHole(wallShape, rightWindowX, windowY, windowWidth, windowHeight);

  const backWallGeometry = new THREE.ShapeGeometry(wallShape);
  backWallGeometry.computeBoundingBox();
  const max = backWallGeometry.boundingBox.max;
  const min = backWallGeometry.boundingBox.min;
  const uvAttribute = backWallGeometry.attributes.uv;

  for (let i = 0; i < uvAttribute.count; i++) {
    const u = (uvAttribute.getX(i) - min.x) / (max.x - min.x);
    const v = (uvAttribute.getY(i) - min.y) / (max.y - min.y);
    uvAttribute.setXY(i, u, v);
  }
  const baseh = 0;
  const backWall = new THREE.Mesh(backWallGeometry, backWallTextureMaterial);
  backWall.position.set(0, baseh, wallDepth);
  house.add(backWall);
});

const sideWallLength = 15;
const leftWallGeometry = new THREE.PlaneGeometry(sideWallLength, wallHeight);

const leftWallExterior = new THREE.Mesh(
  leftWallGeometry,
  frontWallExteriorMaterial
);
leftWallExterior.position.x = -(wallWidth / 2 + 0.01);
leftWallExterior.position.y = wallHeight / 2;
leftWallExterior.rotation.y = -Math.PI / 2;
house.add(leftWallExterior);
leftWallExterior.castShadow = true;

const rightWallGeometry = new THREE.PlaneGeometry(sideWallLength, wallHeight);

const rightWallExterior = new THREE.Mesh(
  rightWallGeometry,
  frontWallExteriorMaterial
);
rightWallExterior.position.x = wallWidth / 2 + 0.01;
rightWallExterior.position.y = wallHeight / 2;
rightWallExterior.rotation.y = Math.PI / 2;
house.add(rightWallExterior);
rightWallExterior.castShadow = true;

const roof = new THREE.Mesh(
  new THREE.ConeGeometry(wallWidth * 0.85, wallHeight * 0.4, 4),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    map: roofTexture,
    normalMap: roofNormalTexture,
  })
);
roof.position.y = wallHeight + (wallHeight * 0.4) / 2;
roof.rotation.y = Math.PI * 0.25;
house.add(roof);
roof.castShadow = true;

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 6, 10, 10),
  new THREE.MeshStandardMaterial({
    roughness: 0.1,
    map: doorTexture,
    alphaMap: doorAlphaTexture,
    transparent: true,
    normalMap: doorNormalTexture,
  })
);
door.position.z = wallWidth / 2 - 1.8;
door.position.y = door.geometry.parameters.height * 0.5 - 0.1;

house.add(door);

const textureLoader1 = new THREE.TextureLoader();
const platformTexture = textureLoader.load("/textures/bricks/tiles.jpg");

platformTexture.wrapS = THREE.RepeatWrapping;
platformTexture.wrapT = THREE.RepeatWrapping;
platformTexture.repeat.set(4, 4);

const platformGeometry = new THREE.BoxGeometry(47, 1, 37);

const platformMaterial = new THREE.MeshStandardMaterial({
  map: platformTexture,
  roughness: 1,
});

const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.position.x = -0.5;
platform.position.y = -0.25;
platform.receiveShadow = true;

scene.add(platform);

const raindropCount = 10000;
const rainGeometry = new THREE.BufferGeometry();
const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
  transparent: true,
});

const positions = new Float32Array(raindropCount * 3);

for (let i = 0; i < raindropCount; i++) {
  positions[i * 3 + 0] = Math.random() * 400 - 200; // x
  positions[i * 3 + 1] = Math.random() * 500 - 250; // y
  positions[i * 3 + 2] = Math.random() * 400 - 200; // z
}

rainGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const snowflakeCount = 5000;
const snowGeometry = new THREE.BufferGeometry();
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.2,
  transparent: true,
  opacity: 0.8,
});

const snowPositions = new Float32Array(snowflakeCount * 3);

for (let i = 0; i < snowflakeCount; i++) {
  snowPositions[i * 3 + 0] = Math.random() * 400 - 200; // x
  snowPositions[i * 3 + 1] = Math.random() * 500 - 250; // y
  snowPositions[i * 3 + 2] = Math.random() * 400 - 200; // z
}

snowGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(snowPositions, 3)
);

const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

const animateSnow = () => {
  const positions = snowGeometry.attributes.position.array;

  for (let i = 0; i < snowflakeCount; i++) {
    positions[i * 3 + 1] -= 0.2;

    if (positions[i * 3 + 1] < -250) {
      positions[i * 3 + 1] = 250;
    }

    positions[i * 3 + 0] += Math.random() * 0.2 - 0.1;
    positions[i * 3 + 2] += Math.random() * 0.2 - 0.1;
  }

  snowGeometry.attributes.position.needsUpdate = true;
};

const tick = () => {
  requestAnimationFrame(tick);

  // Update snow animation
  animateSnow();

  controls.update();
  renderer.render(scene, camera);
};
tick();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const loader = new GLTFLoader();
loader.load(
  "//models/porsche.glb",
  function (gltf) {
    const carModel = gltf.scene;
    carModel.scale.set(3.5, 3.5, 3.5);
    carModel.position.set(-15, 2.5, 0);

    carModel.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(carModel);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

loader.load(
  "/models/untitled.glb",
  function (gltf) {
    const movingCar = gltf.scene;
    movingCar.scale.set(3.5, 3.5, 3.5);
    movingCar.position.set(-70, 0.2, 40);
    movingCar.rotation.y = Math.PI / 2;

    movingCar.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(movingCar);

    let carSpeed = 0.5;
    let maxPosition = 70;
    let minPosition = -70;

    function animateMovingCar() {
      movingCar.position.x += carSpeed;

      if (movingCar.position.x >= maxPosition) {
        movingCar.position.x = minPosition;
      }
    }

    const tick = () => {
      requestAnimationFrame(tick);

      animateMovingCar();

      animateSnow();

      controls.update();
      renderer.render(scene, camera);
    };
    tick();
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

function loadTree(position, scale) {
  loader.load(
    "/models/tree.glb",
    (gltf) => {
      const treeModel = gltf.scene;

      // Set position and scale
      treeModel.position.set(position.x, position.y, position.z);
      treeModel.scale.set(scale, scale, scale);

      // Enable shadow casting for all mesh components
      treeModel.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });

      // Add tree to the scene
      scene.add(treeModel);
    },
    (xhr) => {
      console.log(`Tree model ${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      console.error("Error loading tree model:", error);
    }
  );
}

// Tree positions and scales
const treeData = [
  { position: { x: 22, y: 0, z: -22 }, scale: 6 },
  { position: { x: -22, y: 0, z: -22 }, scale: 6 },
  { position: { x: 22, y: 0, z: -22 }, scale: 6 },
  { position: { x: 22, y: 0, z: -22 }, scale: 6 },
  { position: { x: 30, y: 0, z: 0 }, scale: 5 }, // New tree position
  { position: { x: -30, y: 0, z: 10 }, scale: 5 }, // Another new tree
];

// Loop through tree data and add trees
treeData.forEach((tree) => {
  loadTree(tree.position, tree.scale);
});

// Load another house model to be placed in front of the existing houses
loader.load(
  "/models/house1.glb",
  function (gltf) {
    const house1Model = gltf.scene;

    // Scale and position the model
    house1Model.scale.set(3, 3, 3); // Adjust the scale to match other houses if necessary
    house1Model.position.set(70, 10.5, 55); // Place in front of the existing houses along the z-axis
    house1Model.rotation.set(0, -Math.PI / 2, 0); // Rotate 360 degrees along y-axis

    // Shadow casting for the house model and its children
    house1Model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    // Add the house model to the scene
    scene.add(house1Model);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

// Load another house model to be placed in front of the existing houses
loader.load(
  "/models/house2.glb",
  function (gltf) {
    const house2Model = gltf.scene;

    // Scale and position the model
    house2Model.scale.set(40, 40, 40); // Adjust the scale to match other houses if necessary
    house2Model.position.set(-80, 0, 60); // Place in front of the existing houses along the z-axis
    house2Model.rotation.set(0, Math.PI, 0); // Rotate 180 degrees along y-axis (more to the right)

    // Shadow casting for the house model and its children
    house2Model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    // Add the house model to the scene
    scene.add(house2Model);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

loader.load(
  "/models/house3.glb",
  function (gltf) {
    const house3Model = gltf.scene;

    // Scale and position the model
    house3Model.scale.set(3, 3, 3); // Adjust the scale to match other houses if necessary
    house3Model.position.set(10, 2, 80); // Place in front of the existing houses along the z-axis
    house3Model.rotation.set(0, 2 * Math.PI, 0); // Rotate 360 degrees along y-axis

    // Shadow casting for the house model and its children
    house3Model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    // Add the house model to the scene
    scene.add(house3Model);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

loader.load(
  "/models/house5.glb",
  function (gltf) {
    const house3Model = gltf.scene;

    house3Model.scale.set(4, 4, 4); // Adjust the scale as necessary

    house3Model.position.set(-30, 0.1, 80);

    house3Model.rotation.set(0, -7.9, 0); // Adjust rotation as needed to face the road

    house3Model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    scene.add(house3Model);
  },
  function (xhr) {
    console.log(`House model ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  function (error) {
    console.error("An error occurred while loading the house model:", error);
  }
);

loader.load(
  "/models/lunapark.glb",
  function (gltf) {
    const lunapark = gltf.scene;

    // Compute bounding box for proper placement
    const boundingBox = new THREE.Box3().setFromObject(lunapark);

    // Adjust scale and position
    lunapark.scale.set(0.7, 0.7, 0.7);
    lunapark.position.set(80, 0, -100); // Ensure it rests on the plane

    lunapark.rotation.set(0, 2 * Math.PI, 0);

    // Enable shadow casting
    lunapark.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(lunapark);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

loader.load(
  "/models/football_field.glb",
  function (gltf) {
    const football_field = gltf.scene;

    // Compute bounding box for proper placement
    const boundingBox = new THREE.Box3().setFromObject(football_field);

    // Adjust scale and position
    football_field.scale.set(1.5, 1.5, 1.5);
    football_field.position.set(-30, 0, -150); // Ensure it rests on the plane

    football_field.rotation.set(0, 2 * Math.PI, 0);

    // Enable shadow casting
    football_field.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(football_field);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);
loader.load(
  "/models/player1.glb",
  function (gltf) {
    const player1 = gltf.scene;

    // Compute bounding box for proper placement
    const boundingBox = new THREE.Box3().setFromObject(player1);

    // Adjust scale and position
    player1.scale.set(0.1, 0.1, 0.1);
    player1.position.set(-30, 3, -120); // Ensure it rests on the plane

    player1.rotation.set(0, 2 * Math.PI, 0);

    player1.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(player1);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

loader.load(
  "/models/player2.glb",
  function (gltf) {
    const player2 = gltf.scene;

    const boundingBox = new THREE.Box3().setFromObject(player2);

    player2.scale.set(0.1, 0.1, 0.1);
    player2.position.set(10, 3, -120);

    player2.rotation.set(0, 2 * Math.PI, 0);

    player2.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(player2);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

loader.load(
  "/models/person.glb",
  function (gltf) {
    const person = gltf.scene;

    person.scale.set(0.1, 0.1, 0.1);
    person.position.set(50, 0, 50);

    person.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(person);
  },
  function (xhr) {
    console.log(`Person model ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  function (error) {
    console.error("Error loading person model:", error);
  }
);
