/**
 * DJ SMOKE STREAM @ AI LOUNGE AFTER DARK
 * CORE ENGINE v2.0
 */

let scene, camera, renderer, crystal, analyser, dataArray;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 1. Initialize 3D World
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('lounge-canvas'), antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create the "Neural Crystal" (Center Visualizer)
    const geometry = new THREE.IcosahedronGeometry(1.5, 15);
    const material = new THREE.MeshPhongMaterial({
        color: 0x9d00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
        emissive: 0x6e00ff,
        emissiveIntensity: 0.5
    });
    crystal = new THREE.Mesh(geometry, material);
    scene.add(crystal);

    // Lighting
    const light = new THREE.PointLight(0xff00d4, 2, 100);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 5;
    animate();
}

// 2. Audio Analysis Setup
function setupAudio(sourceNode) {
    if (analyser) analyser.disconnect();
    analyser = audioContext.createAnalyser();
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// 3. Media Injection (The "Viral" Part)
const mediaInput = document.getElementById('media-input');
const uploadBtn = document.getElementById('upload-btn');
const audioPlayer = document.getElementById('audio-player');
const videoPlayer = document.getElementById('video-player');

uploadBtn.addEventListener('click', () => mediaInput.click());

mediaInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    document.getElementById('track-name').innerText = file.name.toUpperCase();
    
    if (audioContext.state === 'suspended') audioContext.resume();

    if (file.type.includes('video')) {
        videoPlayer.src = url;
        videoPlayer.classList.add('active-video');
        videoPlayer.play();
        const source = audioContext.createMediaElementSource(videoPlayer);
        setupAudio(source);
        document.getElementById('visual-mode').innerText = "MODE: VIDEO_REACTIVE";
    } else {
        audioPlayer.src = url;
        audioPlayer.play();
        const source = audioContext.createMediaElementSource(audioPlayer);
        setupAudio(source);
        document.getElementById('visual-mode').innerText = "MODE: NEURAL_AUDIO";
    }
    
    gsap.to(crystal.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1 });
});

// 4. Animation Loop (Reacting to Frequencies)
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    crystal.rotation.x += 0.005;
    crystal.rotation.y += 0.005;

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const lowerHalf = dataArray.slice(0, dataArray.length / 2);
        const avg = lowerHalf.reduce((a, b) => a + b) / lowerHalf.length;
        
        // Make the crystal pulse to the bass
        const scale = 1 + (avg / 150);
        crystal.scale.set(scale, scale, scale);
        crystal.material.emissiveIntensity = avg / 50;
    }

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Clock Logic
setInterval(() => {
    const d = new Date();
    document.getElementById('clock').innerText = d.toTimeString().split(' ')[0];
}, 1000);

initScene();
