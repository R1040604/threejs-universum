import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Licht
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Gras
const grassGeometry = new THREE.PlaneGeometry(50, 50);
const grassMaterial = new THREE.MeshStandardMaterial({
  color: 0x3fa34d,
});
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.rotation.x = -Math.PI / 2;
grass.position.y = -1;
scene.add(grass);

// Huis
const house = new THREE.Group();
scene.add(house);

const wallTexture = new THREE.TextureLoader().load("/textures/wall.jpg");
wallTexture.colorSpace = THREE.SRGBColorSpace;

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xf1c27d,
  map: wallTexture,
});

const houseBody = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), wallMaterial);
houseBody.position.y = 0.5;
house.add(houseBody);

// Dak
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.4, 2, 4),
  new THREE.MeshStandardMaterial({ color: 0x8b0000 }),
);
roof.position.y = 3;
roof.rotation.y = Math.PI / 4;
house.add(roof);

// Deur
const door = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1.6, 0.1),
  new THREE.MeshStandardMaterial({ color: 0x5a3a1a }),
);
door.position.set(0, -0.4, 2.05);
house.add(door);

// Witte kaart met je naam
const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 256;

const ctx = canvas.getContext("2d");
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "#000000";
ctx.font = "bold 64px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("Sarah", canvas.width / 2, canvas.height / 2);

const nameTexture = new THREE.CanvasTexture(canvas);
nameTexture.needsUpdate = true;

const nameCard = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 1),
  new THREE.MeshBasicMaterial({ map: nameTexture }),
);
nameCard.position.set(0, 1.4, 2.06);
house.add(nameCard);

house.position.set(0, 0, 0);

// Bomen via een lus
for (let i = 0; i < 8; i++) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.25, 2),
    new THREE.MeshStandardMaterial({ color: 0x6b4423 }),
  );
  trunk.position.y = 0;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x2e7d32 }),
  );
  leaves.position.y = 2;
  tree.add(leaves);

  const angle = (i / 8) * Math.PI * 2;
  tree.position.set(Math.cos(angle) * 9, 0, Math.sin(angle) * 9);
  scene.add(tree);
}


const clouds = [];

for (let i = 0; i < 6; i++) {
  const cloud = new THREE.Group();

  for (let j = 0; j < 4; j++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.8 + Math.random() * 0.4, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    );

    puff.position.set(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 2,
    );

    cloud.add(puff);
  }

  cloud.position.set(
    (Math.random() - 0.5) * 30,
    7 + Math.random() * 3,
    (Math.random() - 0.5) * 30,
  );

  scene.add(cloud);
  clouds.push(cloud);
}

const gltfLoader = new GLTFLoader();

gltfLoader.load(
  "/models/animal.glb",
  (gltf) => {
    const animal = gltf.scene;

    animal.scale.set(1, 1, 1);
    animal.position.set(3, -1, 3);

    scene.add(animal);
  },
  undefined,
  (error) => {
    console.error("Model kon niet geladen worden:", error);
  },
);

// Camera-animatie: van ver naar het huis
camera.position.set(0, 8, 25);
camera.lookAt(0, 1, 0);

gsap.to(camera.position, {
  x: 0,
  y: 3,
  z: 10,
  duration: 4,
  ease: "power2.out",
});

function animate(time) {
  const seconds = time * 0.001;

  // Wolken bewegen
  clouds.forEach((cloud, index) => {
    cloud.position.x += 0.01 + index * 0.001;

    if (cloud.position.x > 20) {
      cloud.position.x = -20;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
