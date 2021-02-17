import * as THREE from 'three';
import * as dat from 'dat.gui';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import './styles.css';


/**
 * Base
 */

const canvas = document.querySelector('#canvas');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const parameters = {
    radius: 8,
    count: 50000,
    size: 0.02,
    branches: 3,
    spin: 1,
    randomness: 0.1,
    insideColor: 0xff6030,
    outsideColor: 0x1b3984,
    
    ambient: {
        color: 0xffffff,
        intensity: 1
    }
};

/**
 * Scene
 */

const scene = new THREE.Scene();


/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

camera.position.set(10, 10, 10);
camera.lookAt(scene.position);
scene.add(camera);


/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(
    parameters.ambient.color,
    parameters.ambient.intensity
);
scene.add(ambientLight);
// scene.add(new THREE.AxesHelper(25));


/**
 * Galaxy
 */


let geometry = null;
let material = null;
let points = null;
const generateGalaxy = () => {
    geometry && geometry.dispose();
    material && material.dispose();
    points && scene.remove(points);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    for (let i = 0; i < parameters.count; i++) {
        const idx = i * 3;
        const radius = Math.random() * parameters.radius;
        const angle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
        const spin = radius * parameters.spin;
        const randomX = (Math.random() - 0.5) * parameters.randomness * radius;
        const randomY = (Math.random() - 0.5) * parameters.randomness * radius;
        const randomZ = (Math.random() - 0.5) * parameters.randomness * radius;
        positions[idx] = Math.sin(angle + spin) * radius + randomX;
        positions[idx + 1] = randomY;
        positions[idx + 2] = Math.cos(angle + spin) * radius + randomZ;

        const color = insideColor.clone().lerp(outsideColor, radius / parameters.radius)
        colors[idx] = color.r;
        colors[idx + 1] = color.g;
        colors[idx + 2] = color.b;
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: parameters.size,
        vertexColors: true,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    points = new THREE.Points(geometry, material);
    scene.add(points);
};
generateGalaxy();


/**
 * Debug
 */

const gui = new dat.GUI({
    width: 400
});

gui.add(parameters, 'count')
    .min(1)
    .max(50000)
    .step(1)
    .name('count')
    .onFinishChange(generateGalaxy);

gui.add(parameters, 'size')
    .min(0)
    .max(1)
    .step(0.01)
    .name('size')
    .onFinishChange(generateGalaxy);

gui.add(parameters, 'radius')
    .min(0)
    .max(15)
    .step(1)
    .name('radius')
    .onFinishChange(generateGalaxy);

gui.add(parameters, 'branches')
    .min(1)
    .max(10)
    .step(1)
    .name('branches')
    .onFinishChange(generateGalaxy);

gui.add(parameters, 'spin')
    .min(1)
    .max(10)
    .step(1)
    .name('spin')
    .onFinishChange(generateGalaxy);

gui.add(parameters, 'randomness')
    .min(0)
    .max(1)
    .step(0.01)
    .name('randomness')
    .onFinishChange(generateGalaxy);

gui.addColor(parameters, 'insideColor')
    .name('insideColor')
    .onFinishChange(generateGalaxy);

gui.addColor(parameters, 'outsideColor')
    .name('outsideColor')
    .onFinishChange(generateGalaxy);

const stats = new Stats();
document.body.appendChild(stats.dom);

if (!window.location.hash.includes('debug')) {
    gui.hide();
}


/**
 * Animation
 */

const clock = new THREE.Clock();
const tick = () => {
    stats.begin();
    
    controls.update();

    renderer.render(scene, camera);
    
    stats.end();
    requestAnimationFrame(tick);
};
tick();




