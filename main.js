import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.9,
  200
);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
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

// Ambient light
const ambitionLight = new THREE.AmbientLight(0xb9d5ff, 0.2);
scene.add(ambitionLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-10, 20, 10);
scene.add(directionalLight);

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
