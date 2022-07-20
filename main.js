import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
import GUI from "lil-gui";

const canvas = document.getElementById("canvas");
const loadingBarElement = document.querySelector(".loading-bar");

const audioSrc = "static/audio/vivaldi.mp3";
const audioElement = new Audio();
audioElement.src = audioSrc;
audioElement.loop = true;
audioElement.volume = 0.5;
// audioElement.addEventListener(
//   "load",
//   () => {
//     audioElement.play();
//   },
//   true
// );

console.log(audioElement);
// Parameters
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const params = {
  exposure: 3.0,
};

// const gui = new GUI();

// gui.add(params, "exposure", 0, 6, 0.01);

// Loader
const loadingManager = new THREE.LoadingManager(
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
      loadingBarElement.classList.add("ended");
      loadingBarElement.style.transform = "";
      audioElement.autoplay = true;
    });
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  }
);
const environmentLoader = new RGBELoader(loadingManager);
const loader = new GLTFLoader(loadingManager);

loader.load("static/objects/scene.gltf", (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  model.position.set(0, 0, 0);
  console.log(model.children[0].children[0].children);
  //camera.lookAt(model);
});

//Environment
environmentLoader.load("static/textures/sunny_vondelpark_4k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
  //renderer.toneMapping = LinearToneMapping;
  renderer.toneMappingExposure = params.exposure;
});

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

scene.add(camera);
camera.position.z = 20;
//camera.position.y = 400;
camera.position.x = -600;
camera.rotation.y = Math.PI / 180 + 90;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
//controls.target.set(0, 0, 0);

// Meshes
//const sphere = new THREE.SphereGeometry(1, 128, 128);
// const box = new THREE.BoxGeometry(1, 1, 1);

// const material = new THREE.MeshBasicMaterial({
//   color: "blue",
//   wireframe: true,
// });

// const mesh = new THREE.Mesh(box, material);
// scene.add(mesh);

//Overlay
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1.0 },
  },
  vertexShader: `
  void main() {
    gl_Position =  vec4(position, 1.0);
  }
  `,
  fragmentShader: `

  uniform float uAlpha;
  void main() {
    gl_FragColor = vec4(0.0,0.0,0.0,uAlpha);
  }
  `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);
//Resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  // mesh.rotation.x = elapsedTime;
  // mesh.rotation.y = elapsedTime;
  scene.rotation.y = -elapsedTime * 0.05;

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(animate);
};

animate();
