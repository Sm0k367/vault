/**
 * DJ SMOKE STREAM // THE STREET VAULT
 * ENGINE v7.0 - RECURSIVE TUNNEL & GRAFFITI
 */

let scene, camera, renderer, tunnel, analyser, dataArray;
let tunnelGeo, tunnelMat;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 1. Initialize the Industrial Tunnel
function init() {
    scene = new THREE.Scene();
    // Use a wide FOV for that "high-speed" look
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('lounge-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create the "Torus Knot" Tunnel
    // P and Q determine the number of winds around the axis
    tunnelGeo = new THREE.TorusKnotGeometry(10, 3, 200, 32, 2, 3);
    tunnelMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        wireframe: true,
        side: THREE.DoubleSide,
        emissive: 0x000000,
    });

    tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    scene.add(tunnel);

    // Dynamic Tunnel Lighting
    const light1 = new THREE.PointLight(0x00f2ff, 50, 50);
    light1.position.set(0, 0, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xff00d4, 50, 50);
    light2.position.set(0, 5, 0);
    scene.add(light2);

    camera.position.z = 30;
    animate();
}

// 2. Graffiti Flash System (Outside the Box Logic)
function flashGraffiti() {
    const tags = ['tag-1', 'tag-2', 'tag-3'];
    const randomTag = document.getElementById(tags[Math.floor(Math.random() * tags.length)]);
    const colors = ['#f0f214', '#00f2ff', '#ff00d4', '#ffffff'];
    
    // Randomize position and rotation
    randomTag.style.left = Math.random() * 60 + 20 + '%';
    randomTag.style.top = Math.random() * 60 + 20 + '%';
    randomTag.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
    randomTag.style.color = colors[Math.floor(Math.random() * colors.length)];
    randomTag.style.opacity = '1';
    randomTag.style.filter = 'blur(0px)';
    
    // Quick fade out
    setTimeout(() => {
        randomTag.style.opacity = '0';
        randomTag.style.filter = 'blur(20px)';
    }, 150);
}

// 3. Media Handlers
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
    analyser.fftSize = 128; // Smaller for faster response
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// 4. Animation & Audio Sync
function animate() {
    requestAnimationFrame(animate);

    // Infinite Tunnel Spin
    tunnel.rotation.z += 0.005;
    tunnel.rotation.x += 0.002;

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        
        // Bass sensing for tunnel scale
        const bass = dataArray[1];
        const mid = dataArray[15];
        const s = 1 + (bass / 200);
        tunnel.scale.set(s, s, s);

        // Flash graffiti on sharp mid-range transients (snares/claps)
        if (mid > 180) {
            flashGraffiti();
            tunnelMat.color.setHex(0xffffff); // Flash white tunnel
        } else {
            tunnelMat.color.setHex(0x333333); // Dark tunnel
        }

        // Warp the tunnel based on intensity
        tunnel.rotation.z += (bass / 500);
    }

    renderer.render(scene, camera);
}

// Clock Utility
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

init();
