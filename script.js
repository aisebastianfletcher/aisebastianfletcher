// --- Solar System Background ---
const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(20, 20, 20);
scene.add(pointLight);

// Planets
function createPlanet(size, color, distance, speed) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.1,
    metalness: 0.6,
    roughness: 0.2
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { angle: Math.random() * Math.PI * 2, distance, speed };
  scene.add(mesh);
  return mesh;
}

const planets = [
  createPlanet(2, 0x00ffff, 10, 0.01),
  createPlanet(1.5, 0xff00ff, 15, 0.008),
  createPlanet(1, 0xffff00, 20, 0.006)
];

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  planets.forEach(p => {
    p.userData.angle += p.userData.speed;
    p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
    p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
  });
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// --- Chatbot (OpenAI Integration) ---
const chatLog = document.getElementById("chat-log");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  const userDiv = document.createElement("div");
  userDiv.textContent = "You: " + message;
  chatLog.appendChild(userDiv);

  // Call OpenAI API
  const responseDiv = document.createElement("div");
  responseDiv.textContent = "AI: ...";
  chatLog.appendChild(responseDiv);

  const apiKey = "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"; // Replace with ENV var in production

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await res.json();
    responseDiv.textContent = "AI: " + (data.choices?.[0]?.message?.content || "No response");
    chatLog.scrollTop = chatLog.scrollHeight;
  } catch (error) {
    responseDiv.textContent = "AI: [Error connecting to API]";
  }

  userInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
