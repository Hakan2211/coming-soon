import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

const canvas = document.getElementById("canvas");
const loadingBarElement = document.querySelector(".loading-bar");
const audioButton = document.querySelector(".play");
const playText = document.querySelector(".playtext");
const icon = document.querySelector(".icon");
const audio = document.getElementById("audio");

function playAudio() {
  audio.play();
  audioButton.classList.add("play");
  playText.innerHTML = "Pause";
  icon.innerHTML = "&#9208";
}

function pauseAudio() {
  audioButton.classList.remove("play");
  audio.pause();
  playText.innerHTML = "Play";
  icon.innerHTML = "&#9658";
}

audioButton.addEventListener("click", () => {
  const isPlaying = audioButton.classList.contains("play");
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
});

// Parameters
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const params = {
  exposure: 3.0,
};

// Loader
const loadingManager = new THREE.LoadingManager(
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
      loadingBarElement.classList.add("ended");
      loadingBarElement.style.transform = "";
    });
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  }
);
const environmentLoader = new RGBELoader(loadingManager);
const loader = new GLTFLoader(loadingManager);

loader.load("public/scene.gltf", (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  model.position.set(0, 0, 0);
  //console.log(model.children[0].children[0].children);
});

//Environment
environmentLoader.load("public/sunny_vondelpark_4k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;

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
camera.position.x = -600;
camera.rotation.y = Math.PI / 180 + 90;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

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

  scene.rotation.y = -elapsedTime * 0.05;

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(animate);
};

animate();
