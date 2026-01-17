/**
 * DJ SMOKE STREAM // THE SINGULARITY
 * ENGINE v6.0 - NEURAL GALAXY & MONOLITH
 */

let scene, camera, renderer, analyser, dataArray;
let stars, starGeo, starCount = 5000;
let hue = 0;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const monolith = document.getElementById('monolith-container');
const hud = document.getElementById('neural-interface');

// 1. Initialize the Neural Galaxy
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('lounge-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create Star Particles
    starGeo = new THREE.BufferGeometry();
    let positions = new Float32Array(starCount * 3);
    let velocities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = Math.random() * 600 - 300;
        positions[i * 3 + 1] = Math.random() * 600 - 300;
        positions[i * 3 + 2] = Math.random() * 600 - 300;
        velocities[i] = 0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    let starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);

    animate();
}

// 2. Anamorphic Mouse Tracking (The "Billion Dollar" Tilt)
window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * -30;
    
    gsap.to(hud, {
        rotationY: x,
        rotationX: y,
        duration: 2,
        ease: "power3.out"
    });
});

// 3. Media Logic
const mediaInput = document.getElementById('media-input');
const injectBtn = document.getElementById('inject-btn');
const audioPlayer = document.getElementById('audio-player');
const videoPlayer = document.getElementById('video-player');

injectBtn.addEventListener('click', () => mediaInput.click());

mediaInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    document.getElementById('track-name').innerText = file.name.toUpperCase();
    if (audioContext.state === 'suspended') audioContext.resume();

    const isVideo = file.type.includes('video');
    
    if (isVideo) {
        monolith.style.display = 'flex';
        videoPlayer.src = url;
        videoPlayer.play();
        setupAudio(videoPlayer);
    } else {
        monolith.style.display = 'none';
        audioPlayer.src = url;
        audioPlayer.play();
        setupAudio(audioPlayer);
    }
});

function setupAudio(element) {
    if (analyser) analyser.disconnect();
    const source = audioContext.createMediaElementSource(element);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// 4. The Infinite Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the entire Galaxy
    stars.rotation.y += 0.001;

    // Color Cycle
    hue = (hue + 0.1) % 360;
    const color = new THREE.Color(`hsl(${hue}, 100%, 70%)`);
    stars.material.color.copy(color);

    // UI Feedback
    document.querySelector('.core-node').style.boxShadow = `0 0 30px hsl(${hue}, 100%, 50%)`;
    injectBtn.style.color = `hsl(${hue}, 100%, 50%)`;

    // Audio-Reactive Particle Warp
    const positions = starGeo.attributes.position.array;
    let speed = 0.5;

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        speed = 0.5 + (avg / 20); // The stars warp faster on loud beats
        
        // Shake Camera on Bass
        if (dataArray[2] > 210) {
            camera.position.z = 1 + (Math.random() * 0.1);
        }
    }

    for (let i = 0; i < starCount; i++) {
        // Move stars toward the camera (Z axis)
        positions[i * 3 + 2] += speed;

        // Reset stars that pass the camera
        if (positions[i * 3 + 2] > 500) {
            positions[i * 3 + 2] = -500;
        }
    }
    starGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

// Clock Logic
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

init();
