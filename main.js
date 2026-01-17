/**
 * DJ SMOKE STREAM @ AI LOUNGE AFTER DARK
 * SYNAPSE ENGINE v3.0 - Generative Evolution
 */

let scene, camera, renderer, analyser, dataArray;
let currentMesh, material;
let geometries = [];
let geoIndex = 0;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 1. Scene Setup
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('lounge-canvas'), antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Prepare Geometry Archive for Evolution
    geometries = [
        new THREE.IcosahedronGeometry(1.5, 15),
        new THREE.TorusKnotGeometry(1, 0.3, 100, 16),
        new THREE.OctahedronGeometry(1.8, 2),
        new THREE.BoxGeometry(2, 2, 2, 10, 10, 10)
    ];

    material = new THREE.MeshPhongMaterial({
        color: 0x00f2ff,
        wireframe: true,
        emissive: 0x9d00ff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
    });

    currentMesh = new THREE.Mesh(geometries[0], material);
    scene.add(currentMesh);

    // Cinematic Lighting
    const pLight = new THREE.PointLight(0xff00d4, 10, 100);
    pLight.position.set(5, 5, 5);
    scene.add(pLight);
    scene.add(new THREE.AmbientLight(0x202020));

    camera.position.z = 5;
    animate();
}

// 2. The Evolution Logic (Switching Shapes)
function evolveVisualizer() {
    geoIndex = (geoIndex + 1) % geometries.length;
    
    // Smooth transition using GSAP
    gsap.to(currentMesh.rotation, { z: currentMesh.rotation.z + Math.PI, duration: 1 });
    gsap.to(currentMesh.scale, { x: 0, y: 0, z: 0, duration: 0.5, onComplete: () => {
        currentMesh.geometry = geometries[geoIndex];
        gsap.to(currentMesh.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
    }});
    
    document.getElementById('visual-mode').innerText = `EVOLUTION: ${geoIndex + 1}_MORPH`;
}

// 3. Audio Handling
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

    // Reset players
    audioPlayer.pause();
    videoPlayer.pause();
    videoPlayer.style.display = 'none';

    const isVideo = file.type.includes('video');
    const player = isVideo ? videoPlayer : audioPlayer;
    
    player.src = url;
    if (isVideo) {
        videoPlayer.style.display = 'block';
        videoPlayer.muted = false;
    }
    player.play();

    // Connect analyzer
    const source = audioContext.createMediaElementSource(player);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
});

// 4. Main Loop
let lastEvolution = 0;

function animate() {
    requestAnimationFrame(animate);
    
    currentMesh.rotation.x += 0.003;
    currentMesh.rotation.y += 0.003;

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        
        // Bass sensing (0-20Hz range roughly)
        const bass = dataArray[2]; 
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // Reactive Pulsing
        const targetScale = 1 + (avg / 100);
        currentMesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        
        // Color Shift based on intensity
        material.emissiveIntensity = avg / 40;
        if (avg > 100) material.color.setHex(0xff00d4); // Flash Pink on loud parts
        else material.color.setHex(0x00f2ff);

        // Auto-Evolve on heavy bass drops (cooldown of 3 seconds)
        if (bass > 220 && Date.now() - lastEvolution > 3000) {
            evolveVisualizer();
            lastEvolution = Date.now();
        }
    }

    renderer.render(scene, camera);
}

// Clock & ID Generator
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toTimeString().split(' ')[0];
}, 1000);
document.getElementById('vault-id').innerText = '#' + Math.random().toString(16).substr(2, 4).toUpperCase();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
