/**
 * DJ SMOKE STREAM // THE ETERNAL MORPH
 * ENGINE v8.0 - SHAPE-SHIFT & DRIP
 */

let scene, camera, renderer, analyser, dataArray;
let mainMesh, material;
let geometries = [];
let currentGeoIndex = 0;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 1. Initialize the Morphing Environment
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('lounge-canvas'), antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Define the 5 Stages of Matter
    geometries = [
        new THREE.IcosahedronGeometry(2, 15),       // The Crystal
        new THREE.TorusKnotGeometry(1.5, 0.4, 200, 32), // The Knot
        new THREE.OctahedronGeometry(2, 5),         // The Spike
        new THREE.SphereGeometry(2, 32, 32),        // The Liquid
        new THREE.TorusGeometry(2, 0.2, 16, 100)    // The Ring
    ];

    material = new THREE.MeshPhongMaterial({
        color: 0x00f2ff,
        wireframe: true,
        emissive: 0x9d00ff,
        emissiveIntensity: 0.5,
        shininess: 100
    });

    mainMesh = new THREE.Mesh(geometries[0], material);
    scene.add(mainMesh);

    const light1 = new THREE.PointLight(0xff00d4, 20, 100);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    
    const light2 = new THREE.AmbientLight(0x202020);
    scene.add(light2);

    camera.position.z = 5;
    animate();
}

// 2. The Persistent Graffiti Splat Logic
function triggerSplat() {
    const buffer = document.getElementById('paint-buffer');
    const splat = document.createElement('div');
    const words = ["DJ SMOKE", "VAULT", "DROP", "MORPH", "AFTER DARK", "HYPER", "GRIME"];
    const colors = ["#00f2ff", "#ff00d4", "#f0f214", "#ffffff"];
    
    splat.className = 'splat';
    splat.innerText = words[Math.floor(Math.random() * words.length)];
    splat.style.left = Math.random() * 70 + 15 + '%';
    splat.style.top = Math.random() * 40 + 10 + '%';
    splat.style.color = colors[Math.floor(Math.random() * colors.length)];
    splat.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
    
    buffer.appendChild(splat);
    
    // Cleanup to prevent memory lag
    setTimeout(() => splat.remove(), 8000);
}

// 3. The Morph Logic
function evolveShape() {
    currentGeoIndex = (currentGeoIndex + 1) % geometries.length;
    
    // Smooth transition using GSAP
    gsap.to(mainMesh.scale, { 
        x: 0, y: 0, z: 0, 
        duration: 0.4, 
        onComplete: () => {
            mainMesh.geometry = geometries[currentGeoIndex];
            gsap.to(mainMesh.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "back.out(1.7)" });
        }
    });
}

// 4. Media Handlers
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
    
    if (isVideo) {
        videoStage.style.display = 'flex';
        videoPlayer.src = url;
        videoPlayer.play();
        setupAudio(videoPlayer);
    } else {
        videoStage.style.display = 'none';
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
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// 5. Main Animation Loop
let lastSplat = 0;
let lastMorph = 0;

function animate() {
    requestAnimationFrame(animate);

    mainMesh.rotation.y += 0.005;
    mainMesh.rotation.x += 0.003;

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const bass = dataArray[2];
        const mid = dataArray[10];

        // Reactive Scale
        const s = 1 + (bass / 150);
        mainMesh.scale.lerp(new THREE.Vector3(s, s, s), 0.1);

        // Splat trigger on Snare/Mid-range (with cooldown)
        if (mid > 190 && Date.now() - lastSplat > 600) {
            triggerSplat();
            lastSplat = Date.now();
        }

        // Morph trigger on Heavy Bass Drop
        if (bass > 230 && Date.now() - lastMorph > 4000) {
            evolveShape();
            lastMorph = Date.now();
        }
        
        // Color Shifting based on music
        material.emissiveIntensity = bass / 50;
    }

    renderer.render(scene, camera);
}

// Telemetry
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

init();
