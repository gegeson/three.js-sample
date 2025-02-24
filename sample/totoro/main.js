import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // OrbitControls をインポート

// シーン、カメラ、レンダラーを作成
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('myCanvas'),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// カメラの位置を調整（OrbitControlsを使うので、少し変更）
camera.position.set(0, 0, 3);  // 原点を見て、少し近づけた位置

// 環境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 平行光源
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// GLTFローダー
const loader = new GLTFLoader();

// OrbitControls を作成
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 慣性スクロールを有効にする（オプション）
controls.dampingFactor = 0.1;  // 慣性の強さ（オプション）
// controls.autoRotate = true;   // 自動回転（オプション）
// controls.autoRotateSpeed = 2.0;// 自動回転の速度（オプション）

// ズームの範囲を制限（オプション）
controls.minDistance = 1;
controls.maxDistance = 10;

// パンの制限（オプション）
// controls.enablePan = false; // パンを無効にする場合
controls.minPan = new THREE.Vector3(-1, -1, -1); // XYZ方向の最小パン範囲
controls.maxPan = new THREE.Vector3(1, 1, 1);  // XYZ方向の最大パン範囲


loader.load(
    'totoro.glb',
    function (gltf) {
        scene.add(gltf.scene);

        // モデルのスケール、位置を調整（OrbitControlsを使うので、初期位置は原点でOK）
        gltf.scene.scale.set(0.1, 0.1, 0.1);
        gltf.scene.position.set(0, 0, 0);

        // アニメーションループ
        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // OrbitControls を更新
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

// ウィンドウリサイズ対応
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
