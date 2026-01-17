/**
 * DJ SMOKE STREAM @ AI LOUNGE AFTER DARK
 * CORE v4.0 - CHROMA & CINEMA ENGINE
 */

let scene, camera, renderer, analyser, dataArray;
let currentMesh, material, pointLight;
let hue = 0; // The color starting point

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const videoStage = document.getElementById('video-stage');
const loungeCanvas = document.getElementById('lounge-canvas');
const statusOrb = document.querySelector('.status-orb');

// 1. Initialize 3D Environment
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: loungeCanvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // The Evolving Crystal
    const geometry = new THREE.IcosahedronGeometry(1.5, 12);
    material = new THREE.MeshPhongMaterial({
        color: 0x00f2ff,
        wireframe: true,
        emissive: 0x00f2ff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });

    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);

    // Dynamic Point Light (Matches the Crystal Color)
    pointLight = new THREE.PointLight(0x00f2ff, 15, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0x101010));

    camera.position.z = 5;
    animate();
}

// 2. Media Logic & Stage Switching
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

    // Kill previous streams
    audioPlayer.pause();
    videoPlayer.pause();

    const isVideo = file.type.includes('video');
    
    if (isVideo) {
        // --- CINEMA MODE ON ---
        videoStage.style.display = 'flex';
        loungeCanvas.style.opacity = '0'; // Hide 3D
        document.getElementById('visual-mode').innerText = "MODE: HD_CINEMA";
        
        videoPlayer.src = url;
        videoPlayer.play();
        setupAudioAnalysis(videoPlayer);
    } else {
        // --- AUDIO MODE ON ---
        videoStage.style.display = 'none';
        loungeCanvas.style.opacity = '1'; // Show 3D
        document.getElementById('visual-mode').innerText = "MODE: NEURAL_CHROMA";
        
        audioPlayer.src = url;
        audioPlayer.play();
        setupAudioAnalysis(audioPlayer);
    }
});

function setupAudioAnalysis(element) {
    if (analyser) analyser.disconnect();
    const source = audioContext.createMediaElementSource(element);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// 3. The Loop (Chroma Shift & Reactive Motion)
function animate() {
    requestAnimationFrame(animate);

    // Constant Chroma Shift (Ever-changing Colors)
    hue = (hue + 0.5) % 360;
    const colorHex = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    const cssColor = `hsl(${hue}, 100%, 50%)`;

    // Update 3D Materials
    material.color.copy(colorHex);
    material.emissive.copy(colorHex);
    pointLight.color.copy(colorHex);

    // Update UI (The Orb and Button Border)
    statusOrb.style.background = cssColor;
    statusOrb.style.boxShadow = `0 0 20px ${cssColor}`;
    injectBtn.style.borderColor = cssColor;
    injectBtn.style.color = cssColor;

    // React to Audio
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Pulse the crystal (if visible)
        const scale = 1 + (avg / 100);
        currentMesh.scale.set(scale, scale, scale);
        currentMesh.rotation.y += 0.01 + (avg / 500);
        
        // Make the light pulse
        pointLight.intensity = 10 + (avg / 10);
    } else {
        currentMesh.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

// UI Telemetry
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);
document.getElementById('vault-id').innerText = '#' + Math.random().toString(16).substr(2, 6).toUpperCase();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
