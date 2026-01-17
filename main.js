/**
 * DJ SMOKE STREAM // THE INFINITE EVOLUTION
 * ENGINE v11.0 - VIDEO PORTAL & GENERATIVE CHROMA
 */

let scene, camera, renderer, analyser, dataArray;
let points, particleCount = 15000;
let time = 0, phase = 0, currentMorph = 0;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;

    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('lounge-canvas'), 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.012,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);

    animate();
}

function getTopology(i, t, type) {
    const i3 = i / particleCount;
    let x, y, z;
    switch(type) {
        case 0: // Nebula
            const r = 2 + Math.sin(t * 0.5 + i * 0.1);
            x = r * Math.cos(i * 0.2) * Math.sin(i * 0.5);
            y = r * Math.sin(i * 0.2) * Math.sin(i * 0.5);
            z = r * Math.cos(i * 0.5);
            break;
        case 1: // DNA
            x = Math.cos(i * 0.1 + t) * (i3 * 4);
            y = (i3 - 0.5) * 8;
            z = Math.sin(i * 0.1 + t) * (i3 * 4);
            break;
        case 2: // Fractal
            x = Math.tan(i * 0.01 + t) * 0.5;
            y = Math.cos(i * 0.5) * 2;
            z = Math.sin(i * 0.2 + t) * 2;
            break;
        case 3: // Torus
            const R = 2.5, innerR = 0.8 + Math.sin(t) * 0.4;
            x = (R + innerR * Math.cos(i * 0.1)) * Math.cos(i * 0.05);
            y = (R + innerR * Math.cos(i * 0.1)) * Math.sin(i * 0.05);
            z = innerR * Math.sin(i * 0.1);
            break;
    }
    return { x, y, z };
}

const mediaInput = document.getElementById('media-input');
const injectBtn = document.getElementById('inject-btn');
const audioPlayer = document.getElementById('audio-player');
const videoPlayer = document.getElementById('video-player');
const videoPortal = document.getElementById('video-portal');

injectBtn.addEventListener('click', () => mediaInput.click());

mediaInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    document.getElementById('track-name').innerText = file.name.toUpperCase();
    
    if (audioContext.state === 'suspended') audioContext.resume();

    const isVideo = file.type.includes('video');
    
    // Reset players
    audioPlayer.pause();
    videoPlayer.pause();
    
    if (isVideo) {
        videoPortal.style.display = 'flex';
        videoPlayer.src = url;
        videoPlayer.play();
        setupAudio(videoPlayer);
    } else {
        videoPortal.style.display = 'none';
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

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    phase += 0.002;

    const pos = points.geometry.attributes.position.array;
    const col = points.geometry.attributes.color.array;

    const hue = (phase * 100) % 360;
    document.documentElement.style.setProperty('--dynamic-color', `hsl(${hue}, 100%, 60%)`);

    if (Math.floor(time) % 10 === 0 && Math.random() > 0.99) {
        currentMorph = (currentMorph + 1) % 4;
        const states = ["MAPPING NEBULA", "SYNTHESIZING DNA", "QUANTUM FRACTAL", "TORUS EVOLUTION"];
        document.getElementById('system-state').innerText = states[currentMorph];
    }

    let audioBoost = 0;
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        audioBoost = dataArray[2] / 40;
    }

    for (let i = 0; i < particleCount; i++) {
        const target = getTopology(i, time, currentMorph);
        const i3 = i * 3;
        pos[i3] += (target.x - pos[i3]) * 0.05 + (Math.random() - 0.5) * audioBoost * 0.05;
        pos[i3+1] += (target.y - pos[i3+1]) * 0.05;
        pos[i3+2] += (target.z - pos[i3+2]) * 0.05;

        const pColor = new THREE.Color().setHSL((phase + i / particleCount) % 1, 0.8, 0.6);
        col[i3] = pColor.r; col[i3+1] = pColor.g; col[i3+2] = pColor.b;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
    points.rotation.y += 0.002;

    renderer.render(scene, camera);
}

setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

init();
