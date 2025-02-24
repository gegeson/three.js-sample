import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// シーン、カメラ、レンダラー (省略: 前のコードと同じ)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('myCanvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.set(0, 0, 3);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.minDistance = 1;
controls.maxDistance = 10;

let model;
const loader = new GLTFLoader();
loader.load(
    'house.glb',
    function (gltf) {
        model = gltf.scene;
        scene.add(model);
        model.scale.set(0.1, 0.1, 0.1);
        model.position.set(0, 0, 0);

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log('An error happened');
        console.error(error);
    }
);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// マウスドラッグによる移動関連の変数
const raycaster = new THREE.Raycaster(); // Raycaster
const mouse = new THREE.Vector2();       // マウスの正規化座標 (-1 ~ 1)
let isDragging = false;                 // ドラッグ中かどうか
let previousMousePosition = {           // 前回のマウス位置
    x: 0,
    y: 0
};

// マウスダウンイベント
renderer.domElement.addEventListener('mousedown', (event) => {
    // マウス座標を正規化 (-1 ~ 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Raycaster を更新
    raycaster.setFromCamera(mouse, camera);

    // レイと交差するオブジェクトを取得
    const intersects = raycaster.intersectObject(model, true); // true: 子オブジェクトも対象

    if (intersects.length > 0) {
        // モデルと交差したらドラッグ開始
        isDragging = true;
        controls.enabled = false; // OrbitControls を一時的に無効化
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
});

// マウスムーブイベント
renderer.domElement.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    // マウスの移動量をワールド座標系での移動量に変換
    const deltaPosition = new THREE.Vector3(
        deltaMove.x * 0.01, // 適当な係数で調整
        -deltaMove.y * 0.01,
        0
    );

    // カメラの方向を考慮して移動
    deltaPosition.applyQuaternion(camera.quaternion);
    model.position.add(deltaPosition);


    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});

// マウスアップイベント
renderer.domElement.addEventListener('mouseup', () => {
    isDragging = false;
    controls.enabled = true; // OrbitControls を再び有効化
});

//マウスがキャンバスから外れた際の対応
renderer.domElement.addEventListener('mouseleave', () => {
    isDragging = false;
    controls.enabled = true;
});
