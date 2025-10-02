// --- Three.js Solar System ---
const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 100, 200);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 50;
controls.maxDistance = 5000;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2.5, 0, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Stars background
const starsTexture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/9/9a/Solarsystemscope_texture_2k_stars.jpg');
const starsMaterial = new THREE.MeshBasicMaterial({ map: starsTexture, side: THREE.BackSide });
const starsGeometry = new THREE.SphereGeometry(5000, 64, 64);
const stars = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(stars);

// Planet data (scaled for visualization)
const planetsData = [
  { name: 'Mercury', radius: 0.38, distance: 10, texture: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg', speed: 0.004 },
  { name: 'Venus', radius: 0.95, distance: 18, texture: 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg', cloudTexture: 'https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg', speed: 0.0016 },
  { name: 'Earth', radius: 1, distance: 25, texture: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg', cloudTexture: 'https://www.solarsystemscope.com/textures/download/2k_earth_clouds.jpg', normalMap: 'https://www.solarsystemscope.com/textures/download/2k_earth_normal_map.tif', speed: 0.001 },
  { name: 'Mars', radius: 0.53, distance: 38, texture: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg', speed: 0.0005 },
  { name: 'Jupiter', radius: 11.2, distance: 130, texture: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg', speed: 0.00008 },
  { name: 'Saturn', radius: 9.45, distance: 240, texture: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg', ringTexture: 'https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png', speed: 0.00003 },
  { name: 'Uranus', radius: 4, distance: 480, texture: 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg', speed: 0.00001 },
  { name: 'Neptune', radius: 3.88, distance: 750, texture: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg', speed: 0.000006 }
];

// Sun
const sunTexture = new THREE.TextureLoader().load('https://www.solarsystemscope.com/textures/download/2k_sun.jpg');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create planets
const planets = [];
planetsData.forEach(data => {
  const loader = new THREE.TextureLoader();
  const material = new THREE.MeshStandardMaterial({ map: loader.load(data.texture) });
  
  if (data.normalMap) {
    material.normalMap = loader.load(data.normalMap);
  }
  
  const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
  const planet = new THREE.Mesh(geometry, material);
  planet.userData = { distance: data.distance, speed: data.speed, angle: Math.random() * Math.PI * 2, tilt: Math.random() * 10 - 5 };
  scene.add(planet);
  planets.push(planet);
  
  // Clouds
  if (data.cloudTexture) {
    const cloudMaterial = new THREE.MeshStandardMaterial({ map: loader.load(data.cloudTexture), transparent: true, opacity: 0.8 });
    const cloudGeometry = new THREE.SphereGeometry(data.radius * 1.01, 64, 64);
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planet.add(clouds);
  }
  
  // Rings for Saturn
  if (data.ringTexture) {
    const ringMaterial = new THREE.MeshStandardMaterial({ map: loader.load(data.ringTexture), side: THREE.DoubleSide, transparent: true });
    const ringGeometry = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2, 64);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    planet.add(ring);
  }
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  sun.rotation.y += 0.001;
  
  planets.forEach((p, i) => {
    p.userData.angle += planetsData[i].speed;
    p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
    p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
    p.rotation.y += 0.005;
    p.rotation.x = p.userData.tilt * Math.PI / 180;
    
    if (p.children[0]) p.children[0].rotation.y += 0.001; // Clouds
  });
  
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// --- Chatbot ---
const chatLog = document.getElementById("chat-log");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Typing animation helper
function typeText(element, text, delay = 20) {
  element.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
    chatLog.scrollTop = chatLog.scrollHeight;
  }, delay);
}

// Send message
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // User message
  const userDiv = document.createElement("div");
  userDiv.textContent = "You: " + message;
  userDiv.style.color = "#00f0ff";
  chatLog.appendChild(userDiv);

  // AI placeholder
  const aiDiv = document.createElement("div");
  aiDiv.textContent = "AI: ...";
  aiDiv.style.color = "#f05fff";
  chatLog.appendChild(aiDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  userInput.value = "";

  try {
    const res = await fetch('https://your-vercel-app.vercel.app/api/chat', {  // Replace with your actual Vercel URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    const reply = data.reply || "[No response]";
    typeText(aiDiv, "AI: " + reply, 15);
  } catch (err) {
    typeText(aiDiv, "AI: [Error connecting to bot]", 15);
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
