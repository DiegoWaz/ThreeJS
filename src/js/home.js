// styles
import '../scss/index.scss';

// three.js
import * as THREE from 'three';
import 'gsap'
import 'three/examples/js/controls/PointerLockControls';

var camera, scene, renderer, geometry, material, mesh;
var controls, intersects;
let myTween;
let myTweenBack;
let myTweenObj;

//images 
var sol = 'images/herbe.jpg';
var brick = 'images/brick.jpg';
var bois = 'images/bois.jpg';
var pink = 'images/pink.png';
var sizeBox = 5;

var keys = [];
document.onkeydown = function (e) {
    e = e || window.event;
    keys[e.keyCode] = true;
};

document.onkeyup = function (e) {
    e = e || window.event;
    keys[e.keyCode] = false;
};

var earth;
var pivotObject;

function init() {

    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    
    // cubes floor
    for (var x = 0; x < 30; x++) {
        for (var y = 0; y < 30; y++) {
            var geometry = new THREE.BoxGeometry(sizeBox,sizeBox, sizeBox);
            var texture = new THREE.TextureLoader().load( sol ); 
            var material = new THREE.MeshBasicMaterial( { map: texture } );
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.x -= x * sizeBox;
            mesh.position.z -= y * sizeBox;
            mesh.position.y = -sizeBox;

            scene.add(mesh);
        }
    }

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    // mouse view controls
    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    // pointer lock
    var element = document.body;

    var pointerlockchange = function (event) {
        if (document.pointerLockElement == element) {
            controls.enabled = true;
        } else {
            controls.enabled = false;
        }
    };

    var pointerlockerror = function (event) {};

    // hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('pointerlockerror', pointerlockerror, false);

    element.addEventListener('click', function () {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    }, false);


    var geometry = new THREE.SphereGeometry( 10, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sun = new THREE.Mesh( geometry, material );

    sun.position.x = -20;
    sun.position.y = 30;
    sun.position.z = -20;
    scene.add(sun);

    var light = new THREE.PointLight( 0xffffff, 1, 3000 );

    sun.add(light);
    scene.add(new THREE.AmbientLight(0x909090));

    var geometry2 = new THREE.SphereGeometry( 5, 32, 32 );
    var material2 = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
    earth = new THREE.Mesh( geometry2, material2 );
    earth.position.x = -21;
    scene.add( earth );

    pivotObject = new THREE.Object3D();
    sun.add(pivotObject);
    pivotObject.add( earth );
}

var clock = new THREE.Clock();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();
    var speed = 5;

    // up
    if (keys[38]) {
        controls.getObject().translateZ(-delta * speed);
    }
    // down
    if (keys[40]) {
        controls.getObject().translateZ(delta * speed);
    }
    // left
    if (keys[37]) {
        controls.getObject().translateX(-delta * speed);
    }
    // right
    if (keys[39]) {
        controls.getObject().translateX(delta * speed);
    }

    earth.rotation.y += 3.2 * delta;
    pivotObject.rotation.y += 0.8 * delta;
    raycaster.setFromCamera( mouse, camera );

    intersects = raycaster.intersectObjects( scene.children );

    renderer.render(scene, camera);
}

document.addEventListener('keypress', (event) => {
    const keyPress = event.key;

    var obj = {a: brick, z:bois, e: pink};

    for(var i in obj) {
        if (keyPress == i) {
            if (intersects.length != 0) {
                var appX = Math.round(intersects[0].point.x);
                var appY = Math.round(intersects[0].point.y);
                var appZ = Math.round(intersects[0].point.z);

                var geometry3 = new THREE.BoxGeometry(sizeBox, sizeBox, sizeBox);
                var texture = new THREE.TextureLoader().load(obj[i]);
                var material3 = new THREE.MeshBasicMaterial({ map: texture });

                var mesh4 = new THREE.Mesh(geometry3, material3);
                mesh4.position.x = appX
                mesh4.position.z = appZ
                mesh4.position.y = appY+1;

                scene.add(mesh4);

                myTweenObj = mesh4;

                myTween = TweenLite.to(myTweenObj.rotation, 1, {
                    y: Math.PI,
                    ease: Expo.easeOut,
                    onComplete: () => {
                        myTween = null;
                    }
                });
            }
        }
    }

    var color = {y: 0xffff00, u: 0xff0000, i: 0x000000};
    for(var z in color) {
        //pour changer de couleur
        if(keyPress == z){
            if (intersects.length != 0) {
                if (intersects[0].object.geometry.type != "SphereGeometry") {
                    intersects[0].object.material.color.set(color[z]);
                }
            }
        }
    }

    // Pour supprimer un bloc
    if(keyPress == "s"){
        if (intersects.length != 0) {
            if (intersects[0].point.y >= 0 && intersects[0].object.geometry.type != "SphereGeometry") {
                scene.remove(intersects[0].object);
            }
        }
    }
});

init();
animate();