import * as THREE from './modulos/three.module.js';
import {OrbitControls} from './modulos/OrbitControls.js';
import {GLTFLoader} from './modulos/GLTFLoader.js';
import {RGBELoader} from './modulos/RGBELoader.js';

let scene, camera, renderer, controls, object;
let pmremGenerator;
let loadingManager;
const canvas = document.getElementById('canvas');
const switch3D = document.getElementById('switch3d');
let id;
switch3D.addEventListener('click', init);

function init(){
    switch3D.remove();
    createScene();
    createRenderer();
    createCamera();
    loadManager();
    createControls();
    cargarModelo('3dmodel/horno/horno.glb');
    //lighting();
    render();
    animation();
    window.addEventListener('resize', render, false);
}

function createScene(){
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0x352847);
    loadHDRI();
}
function createCamera(){
    const fov = 75
    const aspect = renderer.domElement.clientWidth/renderer.domElement.clientHeight;
    const near = 0.1;
    const far = 8;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 7;
     camera.position.y = 0.25;
    // camera.position.x = 0.9;
}
function createRenderer(){
    renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
    renderer.setPixelRatio(0.8);
    pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();
}
function createControls(){
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.22;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.addEventListener('start', () => cancelAnimationFrame(id));
    controls.addEventListener('change', render);
}
function render(){
    onWindowResize();
    renderer.render(scene, camera);
}

function cargarModelo(patch){
    const loader = new GLTFLoader(loadingManager);
    loader.load(patch, gltf =>{
        object = gltf.scene.children[0];
        scene.add(gltf.scene);
        render();
    }, undefined, error =>{
        console.error(error);
    });
}

function lighting(){
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    scene.add(directionalLight);

    const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x352847);
    scene.add(ambient);
}

function loadHDRI(){
    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath('hdri/')
        .load('studio.hdr', texture =>{
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            //scene.background = envMap;
            scene.environment = envMap;
            texture.dispose();
            pmremGenerator.dispose();
            render();
        });
}


function onWindowResize() {
    if(resizeRendererToDisplaySize()){
        const width = renderer.domElement.clientWidth;
        const height = renderer.domElement.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

function loadManager(){
    loadingManager = new THREE.LoadingManager(()=>{
        const loadingScreen = document.getElementById('horno');
        loadingScreen.classList.add('fade');
        loadingScreen.addEventListener('transitionend', e =>{
            e.target.remove();
            console.log("hola");
        });
    });
}

function resizeRendererToDisplaySize() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}


function animation(){
    id = requestAnimationFrame(animation);
    if(camera.position.z <= 2.5){
        object.rotation.y += 0.005;
    }else{
        camera.position.z -= 0.1;
    }
    render();
}


// let button = document.getElementById('button');
// let bandera = true;
// button.addEventListener('click', fullscreen);

// function fullscreen(){
//     if(bandera){
//         canvas.classList.add('fullscreen');
//         bandera = false;
//     }
//     else{
//         canvas.classList.remove('fullscreen');
//         bandera = true;
//     }
//     render();
// }