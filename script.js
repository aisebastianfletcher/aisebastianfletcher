// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Three.js setup (hoisted for global access in resize)
    let renderer = null;
    let camera = null;
    const hologram = document.getElementById('hologram');
    if (hologram && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, hologram.clientWidth / hologram.clientHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(hologram.clientWidth, hologram.clientHeight);
        hologram.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00FFFF, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;

        function animate() {
            requestAnimationFrame(animate);
            if (cube) {
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
            }
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        }
        animate();
    }

    // Particles Canvas
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                color: '#00FFFF',
                speed: Math.random() * 0.5 + 0.1
            });
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                p.y -= p.speed;
                if (p.y < 0) p.y = canvas.height;
            });
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    // Animate Education Progress Bars
    const eduBadges = document.querySelectorAll('.edu-badge');
    eduBadges.forEach(badge => {
        const progress = badge.getAttribute('data-progress');
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        badge.appendChild(progressBar);

        // Trigger animation on scroll into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressBar.style.width = progress + '%';
                }
            });
        }, { threshold: 0.5 });
        observer.observe(badge);
    });

    // Contact Form (placeholder for EmailJS)
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message sent! (Placeholder)');
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Resize Handling
    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        if (hologram && renderer && camera) {
            renderer.setSize(hologram.clientWidth, hologram.clientHeight);
            camera.aspect = hologram.clientWidth / hologram.clientHeight;
            camera.updateProjectionMatrix();
        }
    });
});
