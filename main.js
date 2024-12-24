import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as dat from "dat.gui";

// Core Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// HDR environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load("hdri/puresky_4k.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.position.set(120, 40, 120);

// Loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

// GUI Debugging
const gui = new dat.GUI();
gui.width = 300;

// Grid Helper
const gridHelper = new THREE.GridHelper(100, 50);
scene.add(gridHelper);
gui.add(gridHelper, "visible").name("Toggle Grid");

// Lighting
const ambientLight = new THREE.AmbientLight(0xb9d5ff, 0.2);
scene.add(ambientLight);
gui.add(ambientLight, "intensity", 0, 1, 0.01).name("Ambient Intensity");

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;

// Ground
const groundTexture = textureLoader.load("./textures/floor/snow.jpg");
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({
    map: groundTexture,
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// House Creation
function createHouse(position) {
  const house = new THREE.Group();

  // Walls
  const wallWidth = 20;
  const wallHeight = 12;
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(wallWidth, wallHeight, wallWidth),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./textures/bricks/yellow.webp"),
    })
  );
  walls.position.y = wallHeight / 2;
  house.add(walls);

  // Roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(wallWidth * 0.8, wallHeight / 2, 4),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./textures/bricks/roof.jpg"),
    })
  );
  roof.position.y = wallHeight + wallHeight / 4;
  roof.rotation.y = Math.PI / 4;
  house.add(roof);

  // Door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 8),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load("./textures/door/color.jpg"),
    })
  );
  door.position.set(0, 4, wallWidth / 2 + 0.01);
  house.add(door);

  house.position.set(position.x, 0, position.z);
  scene.add(house);
}

// Create Multiple Houses
const houseSpacing = 50;
for (let i = -2; i <= 2; i++) {
  createHouse({ x: i * houseSpacing, z: 0 });
}

// Roads
function createRoad(position, width, length, texturePath) {
  const roadTexture = textureLoader.load(texturePath);
  roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(1, length / 10);

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(length, width),
    new THREE.MeshStandardMaterial({
      map: roadTexture,
      side: THREE.DoubleSide,
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(position.x, position.y, position.z);
  scene.add(road);
}

// Add Roads
createRoad({ x: 0, y: 0.1, z: 30 }, 20, 200, "./textures/floor/asphalt.jpg");
createRoad({ x: 0, y: 0.1, z: -30 }, 20, 200, "./textures/floor/highway.jpg");

// GLTF Models
function loadModel(path, position, scale, rotation) {
  gltfLoader.load(path, (gltf) => {
    const model = gltf.scene;
    model.scale.set(scale, scale, scale);
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(model);
  });
}

// Load Houses, Cars, and Trees
loadModel("models/house1.glb", { x: 70, y: 0, z: 55 }, 3, {
  x: 0,
  y: Math.PI,
  z: 0,
});
loadModel("models/tree.glb", { x: 22, y: 0, z: -22 }, 6, { x: 0, y: 0, z: 0 });
loadModel("models/porsche.glb", { x: -70, y: 0.2, z: 40 }, 3.5, {
  x: 0,
  y: Math.PI / 2,
  z: 0,
});

// Weather Effects (Rain/Snow)
const particleCount = 10000;
const particlesGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3 + 0] = Math.random() * 400 - 200;
  particlePositions[i * 3 + 1] = Math.random() * 200 - 100;
  particlePositions[i * 3 + 2] = Math.random() * 400 - 200;
}
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Animation
function animateParticles() {
  const positions = particlesGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= 0.1; // Fall speed
    if (positions[i * 3 + 1] < -100) positions[i * 3 + 1] = 100;
  }
  particlesGeometry.attributes.position.needsUpdate = true;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  animateParticles();
  renderer.render(scene, camera);
}
animate();
