/**
 * DJ SMOKE STREAM // THE QUANTUM VAULT
 * ENGINE v9.0 - PARTICLE TOPOLOGY
 */

let scene, camera, renderer, analyser, dataArray;
let particleSystem, particleCount = 10000;
let positions, targetPositions, colors;
let morphStates = [];
let currentMode = 0;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('lounge-canvas'), antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // 1. Create Particle Buffers
    const geometry = new THREE.BufferGeometry();
    positions = new Float32Array(particleCount * 3);
    targetPositions = new Float32Array(particleCount * 3);
    colors = new Float32Array(particleCount * 3);

    // Initial Random Cloud
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        
        colors[i * 3] = 1;     // R
        colors[i * 3 + 1] = 1; // G
        colors[i * 3 + 2] = 1; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.015,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 2. Pre-Calculate Morph States (Sphere, Cube, Torus)
    createMorphStates();
    animate();
}

function createMorphStates() {
    const sphereTarget = new Float32Array(particleCount * 3);
    const torusTarget = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        // Sphere State
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        sphereTarget[i * 3] = 2 * Math.cos(theta) * Math.sin(phi);
        sphereTarget[i * 3 + 1] = 2 * Math.sin(theta) * Math.sin(phi);
        sphereTarget[i * 3 + 2] = 2 * Math.cos(phi);

        // Torus State
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        const R = 2.5, r = 0.5;
        torusTarget[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
        torusTarget[i * 3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
        torusTarget[i * 3 + 2] = r * Math.sin(v);
    }
    morphStates = [sphereTarget, torusTarget];
}

// 3. Media Logic
const mediaInput = document.getElementById('media-input');
const injectBtn = document.getElementById('inject-btn');
const audioPlayer = document.getElementById('audio-player');
const videoPlayer = document.getElementById('video-player');
const videoStage = document.getElementById('video-stage');

injectBtn.addEventListener('click', () => mediaInput.click());

mediaInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    document.getElementById('track-name').innerText = file.name.toUpperCase();
    if (audioContext.state === 'suspended') audioContext.resume();

    const isVideo = file.type.includes('video');
    videoStage.style.display = isVideo ? 'flex' : 'none';
    const activePlayer = isVideo ? videoPlayer : audioPlayer;
    activePlayer.src = url;
    activePlayer.play();
    
    setupAudio(activePlayer);
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

// 4. The Quantum Loop
let lastMorph = 0;
function animate() {
    requestAnimationFrame(animate);

    const posAttr = particleSystem.geometry.attributes.position;
    const colAttr = particleSystem.geometry.attributes.color;

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const bass = dataArray[2];
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Auto-switch morph state on heavy bass
        if (bass > 220 && Date.now() - lastMorph > 3000) {
            currentMode = (currentMode + 1) % morphStates.length;
            lastMorph = Date.now();
        }

        const target = morphStates[currentMode];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // LERP physics (Linear Interpolation)
            // Each particle moves toward its target state + audio turbulence
            const turbulence = (avg / 50) * Math.sin(Date.now() * 0.001 + i);
            posAttr.array[i3] += (target[i3] - posAttr.array[i3]) * 0.05 + turbulence * 0.01;
            posAttr.array[i3+1] += (target[i3+1] - posAttr.array[i3+1]) * 0.05;
            posAttr.array[i3+2] += (target[i3+2] - posAttr.array[i3+2]) * 0.05;

            // Reactive Colors (Shift from White to Cyan/Pink on volume)
            colAttr.array[i3] = 0.5 + (bass / 512);     // Red channel
            colAttr.array[i3+1] = 0.8 - (avg / 256);   // Green channel
            colAttr.array[i3+2] = 1.0;                 // Blue channel (keep it blue-ish)
        }
        
        particleSystem.rotation.y += 0.002 + (avg / 1000);
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
    } else {
        particleSystem.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
}

setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

init();
