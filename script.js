// --- Three.js Solar System Background ---
const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 40;

const light = new THREE.PointLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// Sun
const sunGeo = new THREE.SphereGeometry(5, 64, 64);
const sunMat = new THREE.MeshStandardMaterial({ emissive: 0xffaa00, emissiveIntensity: 1 });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Planets
function makePlanet(size, color, distance, speed) {
  const geo = new THREE.SphereGeometry(size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
  const planet = new THREE.Mesh(geo, mat);
  planet.userData = { angle: Math.random() * Math.PI * 2, distance, speed
