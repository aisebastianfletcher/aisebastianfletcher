/* script.js
   - Three.js solar system background (cinematic, performant)
   - UI interactions (demos buttons, contact form)
   - OpenAI chat integration (client-side demo; recommended: route via server)
*/

const canvas = document.getElementById('bg-canvas');
const width = () => window.innerWidth;
const height = () => window.innerHeight;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(width(), height());
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x00030a, 0.0007);

const camera = new THREE.PerspectiveCamera(45, width() / height(), 0.1, 1000);
camera.position.set(0, 18, 60);

// LIGHTING
const hemi = new THREE.HemisphereLight(0x101422, 0x0a2740, 0.8);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xc8f9ff, 1.1);
key.position.set(20, 40, 10);
scene.add(key);

// STARS (particle field)
function buildStarField(count = 3000, radius=400){
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for(let i=0;i<count;i++){
    const phi = Math.acos(2*Math.random()-1);
    const theta = 2*Math.PI*Math.random();
    const r = radius * Math.cbrt(Math.random());
    const x = r * Math.sin(phi)*Math.cos(theta);
    const y = r * Math.sin(phi)*Math.sin(theta);
    const z = r * Math.cos(phi);
    positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({ size: 0.6, color: 0xcfefff, transparent:true, opacity:0.9 });
  const points = new THREE.Points(geom, mat);
  points.frustumCulled=false;
  scene.add(points);
}
buildStarField();

// SOLAR SYSTEM: central sun + orbiting neon planets (stylized)
const solar = new THREE.Group();
scene.add(solar);

// sun
const sunGeo = new THREE.SphereGeometry(6.4, 64, 64);
const sunMat = new THREE.MeshStandardMaterial({ emissive: 0xffb86b, emissiveIntensity: 0.9, metalness: 0.0, roughness: 0.4 });
const sun = new THREE.Mesh(sunGeo, sunMat);
solar.add(sun);

// subtle halo
const haloGeo = new THREE.RingGeometry(7, 12, 64);
const haloMat = new THREE.MeshBasicMaterial({ color:0x002233, transparent:true, opacity:0.06, side: THREE.DoubleSide });
const halo = new THREE.Mesh(haloGeo, haloMat);
halo.rotation.x = -Math.PI/2;
halo.position.y = -2;
solar.add(halo);

// planets (stylized, neon rim lighting)
function makePlanet(opts){
  const geo = new THREE.SphereGeometry(opts.size, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: opts.color,
    metalness: 0.2,
    roughness: 0.35,
    emissive: opts.emissive || 0x000000,
    emissiveIntensity: opts.emissiveIntensity || 0.03
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData = { radius: opts.orbit, speed: opts.speed, angle: Math.random()*Math.PI*2 };
  mesh.position.set(opts.orbit, 0, 0);
  return mesh;
}

const planets = [
  makePlanet({size:2.0, color:0x00f0ff, emissive:0x002d3a, orbit: 12, speed: 0.9}),
  makePlanet({size:1.4, color:0xff5fff, emissive:0x2a0010, orbit: 19, speed: 0.6}),
  makePlanet({size:1.0, color:0xfff05f, emissive:0x1a1400, orbit: 26, speed: 0.45}),
  makePlanet({size:0.9, color:0x8affc8, emissive:0x002218, orbit: 33, speed: 0.32})
];
planets.forEach(p => solar.add(p));

// subtle camera motion
let t = 0;
function animate(){
  t += 0.005;
  solar.rotation.y += 0.0009;
  planets.forEach(p => {
    p.userData.angle += p.userData.speed * 0.0008;
    p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
    p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
    p.rotation.y += 0.002 * (0.5 + p.userData.speed);
  });

  // orbiting camera bob (slow)
  camera.position.x = Math.sin(t * 0.12) * 8;
  camera.position.y = 18 + Math.sin(t*0.05) * 1.2;
  camera.lookAt(0, 8, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// handle resize
window.addEventListener('resize', () => {
  const w = width(), h = height();
  renderer.setSize(w, h);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
});

// ------------------ UI interactions ------------------

// Demo buttons
document.querySelectorAll('[data-demo]').forEach(btn => {
  btn.addEventListener('click', (e)=>{
    const which = e.currentTarget.dataset.demo;
    if(which === 'chat'){
      // scroll to chat and focus
      document.querySelector('#chat-input').scrollIntoView({behavior:'smooth', block:'center'});
      setTimeout(()=> document.getElementById('chat-input').focus(), 500);
    }
  });
});

// Contact form (simple front-end handler)
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (evt)=>{
  evt.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm).entries());
  // In production, POST to your server / serverless function which will send mail or store the lead.
  alert('Thanks, ' + (data.name || 'there') + '! This demo site does not send emails automatically. Configure a backend endpoint and update script.js contact submission code.');
});

// ------------------ OpenAI Chatbot (Client-side demo) ------------------
/*
  SECURITY: Do not commit API keys. For production, create a small server endpoint
  (e.g., /api/openai) that signs requests with your OpenAI key. The client sends
  user messages to your endpoint; endpoint calls OpenAI and returns responses.

  For quick local testing you may paste a key into the variable below, but never commit it.
*/

// Option A: Use a server endpoint (recommended)
// const CHAT_ENDPOINT = '/api/openai'; // your server proxy

// Option B: Direct client call for quick local testing (NOT recommended for public repos)
// If you want to test locally, paste your key into the apiKey variable below (only for local dev!)
const apiKey = ''; // <-- Paste your OpenAI key here for LOCAL TESTING ONLY (not safe for production)

// UI elements
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

function appendMessage(who, text){
  const el = document.createElement('div');
  el.className = 'chat-line';
  el.innerHTML = `<strong>${who}:</strong> <span>${text}</span>`;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function queryOpenAI(message){
  appendMessage('You', message);
  appendMessage('AI', '… thinking');

  // If you have a server proxy, call it instead:
  // const r = await fetch(CHAT_ENDPOINT, { method:'POST', body: JSON.stringify({message}), headers:{'Content-Type':'application/json'} });
  // const jr = await r.json(); return jr.text;

  if(!apiKey){
    // fallback quick simulation for demo when no key is configured
    const fallback = "Demo mode: Configure your OpenAI key (server-side proxy recommended). Meanwhile: Sebastian is an AI Engineer skilled in prompt engineering, LLM alignment, and production ML.";
    // replace last 'AI: … thinking' with fallback
    chatLog.lastElementChild.innerHTML = `<strong>AI:</strong> <span>${fallback}</span>`;
    chatLog.scrollTop = chatLog.scrollHeight;
    return;
  }

  // DIRECT CALL (unsafe for public repos)
  try{
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // change to available model if needed
        messages: [
          { role: "system", content: "You are Sebastian Fletcher's assistant. Answer concisely and refer to the CV content provided."},
          { role: "user", content: message }
        ],
        max_tokens: 400,
        temperature: 0.2
      })
    });
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || '[no response]';
    // replace 'thinking' line
    chatLog.lastElementChild.innerHTML = `<strong>AI:</strong> <span>${text}</span>`;
    chatLog.scrollTop = chatLog.scrollHeight;
  }catch(err){
    chatLog.lastElementChild.innerHTML = `<strong>AI:</strong> <span>[error connecting to API]</span>`;
    console.error(err);
  }
}

chatSend.addEventListener('click', ()=> {
  const v = chatInput.value.trim();
  if(!v) return;
  queryOpenAI(v);
  chatInput.value = '';
});
chatInput.addEventListener('keydown', (e)=> {
  if(e.key === 'Enter') {
    chatSend.click();
    e.preventDefault();
  }
});

