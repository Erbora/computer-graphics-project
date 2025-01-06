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

const doorTexture = textureLoader.load("./textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("./textures/door/alpha.jpg");
const doorNormalTexture = textureLoader.load("./textures/door/normal.jpg");

const bricksTexture = textureLoader.load("./textures/bricks/yellow.webp");
const bricksNormalTexture = textureLoader.load("./textures/bricks/yellow.webp");

const roofTexture = textureLoader.load("./textures/bricks/roof.jpg");
const roofNormalTexture = textureLoader.load("./textures/bricks/roof.jpg");

const floorTexture = textureLoader.load("./textures/floor/snow.jpg");
const floorNormalTexture = textureLoader.load("./textures/floor/snow.jpg");

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
directionalLight.position.set(-10, 20, 10); //Position the light to the left, above, and in front of the house
directionalLight.castShadow = true;
directionalLight.intensity = 0.5; //Increase and decrease the light intensity
scene.add(directionalLight);

directionalLight.target.position.set(0, 0, 0); //Target the center of the house
scene.add(directionalLight.target);

directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 100;

//Shadow map size for better quality
directionalLight.shadow.mapSize.width = 2048; //Higher values give better shadow quality
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
const roadTexture = textureLoader.load("./textures/floor/asphalt.jpg"); // Use the new road texture
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;

const roadGeometry = new THREE.PlaneGeometry(200, 20); // Wider road with length 200 and width 20
const roadMaterial = new THREE.MeshStandardMaterial({
  map: roadTexture,
  side: THREE.DoubleSide,
});
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2; // Lay flat on the ground
road.position.set(0, 0.1, 40); // Position road in front of the houses, nearer to the camera

scene.add(road);

const house = new THREE.Group();
scene.add(house);
house.position.y = 0;

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
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
    "models/window.glb", // Replace with the actual path to your .glb file
    (gltf) => {
      const windowModel = gltf.scene;

      // Scale the window model down to make it fit the house proportionally
      windowModel.scale.set(0.1, 0.1, 0.1); // Reduce size to one-tenth of the original

      // Set appropriate position for the left window
      windowModel.position.set(
        -wallWidth / 4,
        wallHeight / 2,
        wallWidth / 2 + 0.5
      ); // Move window closer to the camera by increasing z value
      windowModel.castShadow = true;

      // Add the left window to the house group
      houseGroup.add(windowModel.clone());

      // Create and add the right window
      const rightWindowModel = windowModel.clone();
      rightWindowModel.position.set(
        wallWidth / 4,
        wallHeight / 2,
        wallWidth / 2 + 0.5
      ); // Move window closer to the camera by increasing z value
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
const backRoadTexture = textureLoader.load("./textures/floor/highway.jpg");
backRoadTexture.wrapS = THREE.RepeatWrapping;
backRoadTexture.wrapT = THREE.RepeatWrapping;
backRoadTexture.repeat.set(2, 5); // Adjust the texture scaling if needed
backRoadTexture.rotation = Math.PI / 2; // Rotate the texture 90 degrees to make it vertical

const backRoadGeometry = new THREE.PlaneGeometry(200, 40); // Length and width of the road
const backRoadMaterial = new THREE.MeshStandardMaterial({
  map: backRoadTexture,
  side: THREE.DoubleSide,
});

const backRoad = new THREE.Mesh(backRoadGeometry, backRoadMaterial);
backRoad.rotation.x = -Math.PI / 2; // Lay flat on the ground
backRoad.position.set(0, 0.1, -50); // Position road behind the yellow houses
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

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//Size of the wall
const wallWidth = 19;
const wallHeight = 12;

const frontWallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);

//Interior and exterior textures for the front wall
const frontWallExteriorTexture = textureLoader.load(
  "./textures/bricks/yellow.webp"
);
const frontWallInteriorTexture = textureLoader.load(
  "./textures/floor/interior.jpg"
);

const frontWallExteriorMaterial = new THREE.MeshStandardMaterial({
  map: frontWallExteriorTexture,
  side: THREE.DoubleSide,
});

const frontWallInteriorMaterial = new THREE.MeshStandardMaterial({
  map: frontWallInteriorTexture,
  side: THREE.BackSide, //Interior side
});

//Front Wall Exterior Plane
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

textureLoad.load("./textures/bricks/yellow.webp", function (texture) {
  // Set the wrapping to clamp to edge to avoid repetition
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  // Set the minification filter to avoid mipmap generation
  texture.minFilter = THREE.LinearFilter;

  // Use a standard material with the texture
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

  //Function to add a window hole to the wall shape
  function addWindowHole(shape, x, y, width, height) {
    const holePath = new THREE.Path();
    holePath.moveTo(x - width / 2, y);
    holePath.lineTo(x - width / 2, y + height);
    holePath.lineTo(x + width / 2, y + height);
    holePath.lineTo(x + width / 2, y);
    holePath.lineTo(x - width / 2, y);
    shape.holes.push(holePath);
  }

  //Dimensions and positions for the windows
  const windowWidth = 3;
  const windowHeight = 2.8;
  const leftWindowX = -6; //Left window position
  const rightWindowX = 5; //Right window position
  const windowY = 7; //Vertical position

  //Window holes to the wall shape
  addWindowHole(wallShape, leftWindowX, windowY, windowWidth, windowHeight);
  addWindowHole(wallShape, rightWindowX, windowY, windowWidth, windowHeight);

  //Geometry from the shape
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
  backWall.position.set(0, baseh, wallDepth); // Adjust position as necessary
  house.add(backWall);
});

const sideWallLength = 15;
const leftWallGeometry = new THREE.PlaneGeometry(sideWallLength, wallHeight);

//Left Wall Exterior Plane
const leftWallExterior = new THREE.Mesh(
  leftWallGeometry,
  frontWallExteriorMaterial
);
leftWallExterior.position.x = -(wallWidth / 2 + 0.01);
leftWallExterior.position.y = wallHeight / 2;
leftWallExterior.rotation.y = -Math.PI / 2;
house.add(leftWallExterior);
leftWallExterior.castShadow = true;

//Right Wall Geometry
const rightWallGeometry = new THREE.PlaneGeometry(sideWallLength, wallHeight);

// Right Wall Exterior Plane
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
    // color: '#00ff00'
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
const platformTexture = textureLoader.load("./textures/bricks/tiles.jpg");

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

//Array to store positions of each raindrop
const positions = new Float32Array(raindropCount * 3);

for (let i = 0; i < raindropCount; i++) {
  //Positions
  positions[i * 3 + 0] = Math.random() * 400 - 200; // x
  positions[i * 3 + 1] = Math.random() * 500 - 250; // y
  positions[i * 3 + 2] = Math.random() * 400 - 200; // z
}

rainGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

// Snowflake particle count
const snowflakeCount = 5000; // Adjust for density
const snowGeometry = new THREE.BufferGeometry();
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff, // Snow is white
  size: 0.2, // Larger size for snowflakes
  transparent: true,
  opacity: 0.8, // Slightly transparent for a soft look
});

// Array to store positions of each snowflake
const snowPositions = new Float32Array(snowflakeCount * 3);

for (let i = 0; i < snowflakeCount; i++) {
  // Initial positions for snowflakes
  snowPositions[i * 3 + 0] = Math.random() * 400 - 200; // x
  snowPositions[i * 3 + 1] = Math.random() * 500 - 250; // y
  snowPositions[i * 3 + 2] = Math.random() * 400 - 200; // z
}

snowGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(snowPositions, 3)
);

// Create the particle system
const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

// Snow animation
const animateSnow = () => {
  const positions = snowGeometry.attributes.position.array;

  for (let i = 0; i < snowflakeCount; i++) {
    // Vertical movement
    positions[i * 3 + 1] -= 0.2; // Slow fall speed

    // Reset snowflake to the top when it falls out of view
    if (positions[i * 3 + 1] < -250) {
      positions[i * 3 + 1] = 250;
    }

    // Add slight horizontal drift
    positions[i * 3 + 0] += Math.random() * 0.2 - 0.1; // Drift in x
    positions[i * 3 + 2] += Math.random() * 0.2 - 0.1; // Drift in z
  }

  snowGeometry.attributes.position.needsUpdate = true; // Mark the geometry for an update
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
  "models/porsche.glb",
  function (gltf) {
    const carModel = gltf.scene;
    //Scale & position the model as before
    carModel.scale.set(3.5, 3.5, 3.5);
    carModel.position.set(-15, 2.5, 0);

    //Shadow casting for the car model and its children
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

// Load another car model for moving along the road
loader.load(
  "models/untitled.glb", // Assuming you have another car model or using the same one
  function (gltf) {
    const movingCar = gltf.scene;
    // Scale & position the model
    movingCar.scale.set(3.5, 3.5, 3.5);
    movingCar.position.set(-70, 0.2, 40); // Start on the road, near one end
    movingCar.rotation.y = Math.PI / 2; // Rotate 90 degrees to face along the road

    // Shadow casting for the car model and its children
    movingCar.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(movingCar);

    // Animation variables for the moving car
    let carSpeed = 0.5;
    let maxPosition = 70; // Set the maximum distance the car will travel on the road
    let minPosition = -70; // Set the minimum distance (back direction)

    // Update moving car movement in the animation loop
    function animateMovingCar() {
      movingCar.position.x += carSpeed;

      // Reverse direction when the car reaches the limits
      if (
        movingCar.position.x >= maxPosition ||
        movingCar.position.x <= minPosition
      ) {
        carSpeed *= -1; // Reverse the speed
        movingCar.rotation.y = Math.PI / 2; // Rotate 90 degrees to face along the road
      }
    }

    // Add moving car animation to the main animation loop
    const tick = () => {
      requestAnimationFrame(tick);

      // Update car animation
      animateMovingCar();

      // Update snow animation
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

// Function to load and position trees
function loadTree(position, scale) {
  loader.load(
    "models/tree.glb", // Tree model path
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
  "models/house1.glb",
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
  "models/house2.glb",
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
