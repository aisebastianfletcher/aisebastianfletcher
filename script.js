// --- Three.js Solar System ---
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
  planet.userData = { angle: Math.random() * Math.PI * 2, distance, speed };
  scene.add(planet);
  return planet;
}

const planets = [
  makePlanet(1.5, 0x00f0ff, 12, 0.01),
  makePlanet(1.2, 0xf05fff, 18, 0.008),
  makePlanet(1.0, 0xffff00, 25, 0.006)
];

// Animate
function animate() {
  requestAnimationFrame(animate);
  planets.forEach(p => {
    p.userData.angle += p.userData.speed;
    p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
    p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
    p.rotation.y += 0.01;
  });
  sun.rotation.y += 0.002;
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
    const res = await fetch("/api/chat", {
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
