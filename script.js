// script.js - Fixed Solar System (Procedural/Realistic, No External Loads) & Chatbot (Vercel-Ready)
console.log('Script loaded - Checking for canvas...');  // Debug log

// --- Ultra-Realistic Solar System (Procedural Fallback) ---
let renderer, scene, camera, controls, sun, planets = [], stars;
const canvas = document.getElementById("bg");

function initSolarSystem() {
  if (!canvas) {
    console.error('No canvas found');
    return;
  }

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));  // Optimize for mobile
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 50, 200);

  // Controls
  controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 20;
  controls.maxDistance = 1000;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);
  const sunLight = new THREE.PointLight(0xffffff, 2, 0);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Procedural Stars (10k points for galaxy effect)
  const starsGeometry = new THREE.BufferGeometry();
  const starsVertices = [];
  for (let i = 0; i < 10000; i++) {
    starsVertices.push(
      (Math.random() - 0.5) * 4000,
      (Math.random() - 0.5) * 4000,
      (Math.random() - 0.5) * 4000
    );
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 0.5, sizeAttenuation: false });
  stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // Sun (Glowing procedural)
  const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffaa00, 
    transparent: true, 
    opacity: 0.9 
  });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Planets Data (Realistic scales, colors, tilts)
  const planetsData = [
    { radius: 0.4, distance: 12, color: 0x8c7853, speed: 0.004, tilt: 0 },  // Mercury
    { radius: 0.9, distance: 18, color: 0xffc649, speed: 0.0015, tilt: 177 }, // Venus
    { radius: 1, distance: 25, color: 0x6b93d6, speed: 0.001, tilt: 23.4 }, // Earth
    { radius: 0.5, distance: 32, color: 0xc1440e, speed: 0.0005, tilt: 25 }, // Mars
    { radius: 8, distance: 100, color: 0xd8ca9d, speed: 0.0001, tilt: 3 }, // Jupiter
    { radius: 7, distance: 150, color: 0xfad5a5, speed: 0.00004, tilt: 26.7 }, // Saturn
    { radius: 3, distance: 220, color: 0x4fd0cd, speed: 0.00002, tilt: 97.8 }, // Uranus
    { radius: 3, distance: 300, color: 0x4b70dd, speed: 0.00001, tilt: 28.3 }  // Neptune
  ];

  planetsData.forEach((data, i) => {
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ 
      color: data.color,
      transparent: true,
      opacity: 0.9
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    planet.userData = { ...data, angle: Math.random() * Math.PI * 2 };
    planet.position.x = data.distance;
    scene.add(planet);
    planets.push(planet);

    // Clouds/Rings (procedural)
    if (i > 2) {  // Gas giants
      const cloudGeo = new THREE.SphereGeometry(data.radius * 1.02, 32, 32);
      const cloudMat = new THREE.MeshLambertMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.2 
      });
      const clouds = new THREE.Mesh(cloudGeo, cloudMat);
      planet.add(clouds);
    }
    if (i === 5) {  // Saturn rings
      const ringGeo = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2.2, 32);
      const ringMat = new THREE.MeshLambertMaterial({ 
        color: 0xaaaaaa, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.6 
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      planet.add(ring);
    }
  });

  console.log('Solar System initialized - Planets:', planets.length);
}

function animate() {
  if (!renderer || !scene) return;
  requestAnimationFrame(animate);
  controls.update();

  // Sun pulse
  sun.scale.setScalar(1 + 0.01 * Math.sin(Date.now() * 0.001));

  // Planets: Elliptical orbits, realistic rotation
  planets.forEach((planet, i) => {
    const data = planet.userData;
    data.angle += data.speed;

    // Elliptical path (realism)
    const ecc = 0.1;  // Eccentricity
    planet.position.x = Math.cos(data.angle) * data.distance * (1 + ecc * Math.sin(data.angle * 2));
    planet.position.z = Math.sin(data.angle) * data.distance * (1 - ecc * Math.cos(data.angle * 2));
    planet.position.y = Math.sin(data.angle * 0.5) * 2;  // Slight inclination

    // Rotation (day length variation)
    planet.rotation.y += 0.01 / data.radius;
    planet.rotation.x = data.tilt;

    // Clouds/ring rotation
    planet.children.forEach(child => {
      if (child.material && child.material.opacity < 1) child.rotation.y += 0.002;
    });
  });

  // Stars drift
  if (stars) stars.rotation.y += 0.0002;

  renderer.render(scene, camera);
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  initSolarSystem();
  animate();  // Start animation immediately
});

// Resize
window.addEventListener("resize", () => {
  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});

// --- Oracle Bot (Vercel API) ---
const chatLog = document.getElementById("chat-log");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const VERCEL_API_URL = 'https://your-vercel-app.vercel.app/api/chat';  // REPLACE with your Vercel project URL (e.g., aisebastianfletcher.vercel.app)

function typeText(element, text, delay = 30) {  // Slower for pro feel
  element.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text[i++];
      chatLog.scrollTop = chatLog.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, delay);
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // User msg
  const userDiv = document.createElement("div");
  userDiv.innerHTML = `<strong style="color: #00f0ff;">You:</strong> ${message}`;
  chatLog.appendChild(userDiv);

  // Bot placeholder
  const aiDiv = document.createElement("div");
  aiDiv.innerHTML = '<strong style="color: #f05fff;">Oracle Bot:</strong> Thinking...';
  chatLog.appendChild(aiDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  userInput.value = "";

  try {
    const response = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();
    if (!data.reply) throw new Error('No reply in response');

    aiDiv.innerHTML = '';  // Clear
    typeText(aiDiv, `<strong style="color: #f05fff;">Oracle Bot:</strong> ${data.reply}`, 30);
  } catch (error) {
    console.error('Bot error:', error);
    aiDiv.innerHTML = '';
    typeText(aiDiv, '<strong style="color: #f05fff;">Oracle Bot:</strong> Error: Check Vercel logs or try again. (Console: F12)', 30);
  }
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (userInput) userInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

// Welcome message
if (chatLog) {
  const welcome = document.createElement('div');
  welcome.innerHTML = '<strong style="color: #f05fff;">Oracle Bot:</strong> Hi! Ask about Sebastian\'s AI work, n8n bots, or anything.';
  chatLog.appendChild(welcome);
}
