// script.js
// --- Three.js Ultra-Realistic Solar System ---
const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 50, 200);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 2000;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 3, 0, 0);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Stars background (procedural for reliability)
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const starsVertices = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 4000;
  const y = (Math.random() - 0.5) * 4000;
  const z = (Math.random() - 0.5) * 4000;
  starsVertices.push(x, y, z);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Planet data with realistic scales & textures (using reliable CDN)
const textureLoader = new THREE.TextureLoader();
const planetsData = [
  { name: 'Mercury', radius: 0.38, distance: 10, color: 0x8c7853, speed: 0.004, rings: false, clouds: false },
  { name: 'Venus', radius: 0.95, distance: 15, color: 0xffc649, speed: 0.0016, rings: false, clouds: false },
  { name: 'Earth', radius: 1, distance: 20, color: 0x6b93d6, speed: 0.001, rings: false, clouds: true },
  { name: 'Mars', radius: 0.53, distance: 25, color: 0xc1440e, speed: 0.0005, rings: false, clouds: false },
  { name: 'Jupiter', radius: 11.2, distance: 80, color: 0xd8ca9d, speed: 0.00008, rings: true, clouds: true },
  { name: 'Saturn', radius: 9.45, distance: 120, color: 0xfad5a5, speed: 0.00003, rings: true, clouds: true },
  { name: 'Uranus', radius: 4, distance: 180, color: 0x4fd0cd, speed: 0.00001, rings: true, clouds: false },
  { name: 'Neptune', radius: 3.88, distance: 220, color: 0x4b70dd, speed: 0.000006, rings: false, clouds: false }
];

// Sun (glowing with shader-like effect)
const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xffaa00, 
  transparent: true, 
  opacity: 0.8 
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create planets
const planets = [];
planetsData.forEach((data, index) => {
  const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
  const material = new THREE.MeshStandardMaterial({ 
    color: data.color,
    roughness: 0.8,
    metalness: 0.2
  });
  const planet = new THREE.Mesh(geometry, material);
  planet.castShadow = true;
  planet.receiveShadow = true;
  planet.userData = { 
    distance: data.distance, 
    speed: data.speed, 
    angle: Math.random() * Math.PI * 2,
    tilt: (index * 23.5 + Math.random() * 5 - 2.5) * Math.PI / 180  // Realistic axial tilt
  };
  planet.position.set(data.distance, 0, 0);
  scene.add(planet);
  planets.push(planet);

  // Clouds for gas giants/atmospheres
  if (data.clouds) {
    const cloudGeometry = new THREE.SphereGeometry(data.radius * 1.01, 64, 64);
    const cloudMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.3,
      alphaMap: textureLoader.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')  // Simple noise
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planet.add(clouds);
  }

  // Rings for outer planets
  if (data.rings) {
    const ringGeometry = new THREE.RingGeometry(data.radius * 1.1, data.radius * 2.5, 64);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xaaaaaa, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.6 
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    planet.add(ring);
  }
});

// Animate loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Sun rotation & glow
  sun.rotation.y += 0.005;

  // Planet orbits & rotations (elliptical variation for realism)
  planets.forEach((planet, index) => {
    const data = planetsData[index];
    planet.userData.angle += data.speed;
    
    // Elliptical orbit (slight eccentricity)
    const eccentricity = 0.05 + Math.random() * 0.05;
    const orbitX = Math.cos(planet.userData.angle) * data.distance * (1 + eccentricity * Math.sin(planet.userData.angle * 3));
    const orbitZ = Math.sin(planet.userData.angle) * data.distance * (1 - eccentricity * Math.cos(planet.userData.angle * 3));
    planet.position.x = orbitX;
    planet.position.z = orbitZ;
    
    // Self-rotation
    planet.rotation.y += 0.01 / data.radius;  // Slower for larger planets
    planet.rotation.x = planet.userData.tilt;
    
    // Cloud rotation
    if (planet.children[0] && planet.children[0].material.opacity < 1) {
      planet.children[0].rotation.y += 0.002;
    }
  });

  // Stars subtle rotation
  stars.rotation.y += 0.0001;

  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// --- Chatbot ---
const chatLog = document.getElementById("chat-log");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Typing animation
function typeText(element, text, delay = 20) {
  element.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text[i];
      i++;
      chatLog.scrollTop = chatLog.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, delay);
}

// Send message to Vercel API
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // User message
  const userDiv = document.createElement("div");
  userDiv.textContent = "You: " + message;
  userDiv.style.color = "#00f0ff";
  chatLog.appendChild(userDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  // AI placeholder
  const aiDiv = document.createElement("div");
  aiDiv.textContent = "AI: ...";
  aiDiv.style.color = "#f05fff";
  chatLog.appendChild(aiDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  userInput.value = "";

  try {
    const res = await fetch('https://your-vercel-app.vercel.app/api/chat', {  // Replace 'your-vercel-app' with your actual Vercel project name
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message })  // Matches your chat.js: { message }
    });
    
    if (!res.ok) throw new Error('API error');
    
    const data = await res.json();
    const reply = data.reply || "[No response from API]";
    aiDiv.textContent = "";  // Clear placeholder
    typeText(aiDiv, "AI: " + reply, 15);
  } catch (err) {
    console.error('Chatbot error:', err);
    aiDiv.textContent = "";
    typeText(aiDiv, "AI: Sorry, error connecting to the bot. Check console for details.", 15);
  }
}

if (sendBtn) sendBtn.addEventListener("click", sendMessage);
if (userInput) userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

// Initial bot message
const initialDiv = document.createElement("div");
initialDiv.textContent = "AI: Hi! I'm Sebastian's AI assistant. Ask about my skills, experience, or n8n demos.";
initialDiv.style.color = "#f05fff";
chatLog.appendChild(initialDiv);
