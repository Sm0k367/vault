/**
 * DJ SMOKE STREAM // THE VAULT
 * PRODUCTION ENGINE v5.0 - ANAMORPHIC UI
 */

let scene, camera, renderer, crystal, analyser, dataArray;
let hue = 0;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 1. Initialize 3D Visualizer
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('lounge-canvas'), 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // The Neural Artifact
    const geometry = new THREE.IcosahedronGeometry(2, 20);
    const material = new THREE.MeshStandardMaterial({
        color: 0x00f2ff,
        wireframe: true,
        emissive: 0x00f2ff,
        emissiveIntensity: 0.5,
        roughness: 0,
        metalness: 1
    });
    
    crystal = new THREE.Mesh(geometry, material);
    scene.add(crystal);

    // High-End Lighting
    const light1 = new THREE.PointLight(0x00f2ff, 20, 100);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    
    const light2 = new THREE.RectAreaLight(0xff00d4, 5, 10, 10);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    camera.position.z = 6;
    animate();
}

// 2. Anamorphic UI Logic (The Mouse Tilt)
const hud = document.getElementById('interactive-hud');
window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20; // Tilt range
    const y = (e.clientY / window.innerHeight - 0.5) * -20;
    
    gsap.to(hud, {
        rotationY: x,
        rotationX: y,
        duration: 1.2,
        ease: "power2.out"
    });
    
    // Slight camera drift
    gsap.to(camera.position, {
        x: x * 0.05,
        y: y * 0.05,
        duration: 2
    });
});

// 3. Media Injection Master
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
    
    // Reset States
    audioPlayer.pause();
    videoPlayer.pause();
    
    if (isVideo) {
        gsap.to('#lounge-canvas', { opacity: 0, duration: 1 });
        videoStage.style.display = 'flex';
        videoPlayer.src = url;
        videoPlayer.play();
        connectAnalyser(videoPlayer);
    } else {
        gsap.to('#lounge-canvas', { opacity: 1, duration: 1 });
        videoStage.style.display = 'none';
        audioPlayer.src = url;
        audioPlayer.play();
        connectAnalyser(audioPlayer);
    }
});

function connectAnalyser(element) {
    if (analyser) analyser.disconnect();
    const source = audioContext.createMediaElementSource(element);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// 4. Animation & Chroma Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Constant Chroma Shift
    hue = (hue + 0.2) % 360;
    const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    const cssColor = `hsl(${hue}, 100%, 50%)`;
    
    if (crystal) {
        crystal.material.color.copy(color);
        crystal.material.emissive.copy(color);
        crystal.rotation.y += 0.002;
    }

    // Dynamic UI Color Sync
    document.querySelector('.glitch-orb').style.background = cssColor;
    document.querySelector('.glitch-orb').style.boxShadow = `0 0 20px ${cssColor}`;
    document.getElementById('clock').style.color = cssColor;
    injectBtn.style.color = cssColor;

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Reactive Scale
        const s = 1 + (avg / 100);
        crystal.scale.set(s, s, s);
        
        // Bass Shake Effect
        if (avg > 100) {
            gsap.to(camera, { x: (Math.random()-0.5)*0.1, duration: 0.1 });
        }
    }

    renderer.render(scene, camera);
}

// Global Utilities
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
