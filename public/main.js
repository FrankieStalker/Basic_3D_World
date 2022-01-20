/**/
//Import files
console.log("Import the files");
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MouseMeshInteraction } from 'three_mmi';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Water } from 'three/examples/jsm/objects/Water2';
console.log("Done");

//File variables
let scene, camera, renderer, mmi;

const stats = Stats();

const velocity = new THREE.Vector3(), direction = new THREE.Vector3();
let controls, moveForward, moveBackward, moveLeft, moveRight;

let lightAmbient;

const rainGeom = new THREE.BufferGeometry(), materials = [];
let vertices = [], parameters, particles, blizOn;

//Button colours
let gray_color = new THREE.Color(0x57554f), red_color = new THREE.Color(0xff0000), green_color = new THREE.Color(0x00ff00);

let world, box1, box2, boxBody, boxBody2, spring;

let plane, buttonSize = new THREE.BoxGeometry(0.5, 0.5, 0.5), on, cube;

let GLTFmixer, FBXmixer;

let solarSystem, mercurySystem, venusSystem, earthSystem, marsSystem, jupiterSystem, saturnSystem, uranusSystem, neptuneSystem;

let squiggleBall;
const damping = 0.2;

let cubeParams;

const clock = new THREE.Clock();
let prevTime = performance.now();

console.log("Define the initialize function");
console.log("<---------------------------------------->");
function init(){

    //Scene
    console.log("Create the scene");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x6699CC);
    console.log("Done");

    //Camera
    console.log("Create the camera");
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 1;
    camera.position.z = 15;
    camera.rotation.set(0, 0, 0);
    console.log("Done");

    //Renderer
    console.log("Create the renderer");
    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    console.log("Done");

    //Create mouse mesh interaction instance
    mmi = new MouseMeshInteraction(scene, camera);

    document.body.appendChild(stats.dom);

    //First Person Controls
    //On click removes pointlock and removes text from screen
    console.log("Define the first person function");
    function firstPerson(){
        controls = new PointerLockControls( camera, document.body );

        //Pointer
        const map = new THREE.TextureLoader().load( 'sprite.png' );
        const material = new THREE.SpriteMaterial( { map: map } );
        const sprite = new THREE.Sprite( material );

        const blocker = document.getElementById( 'blocker' );
        const instructions = document.getElementById( 'instructions' );

        //Adding and setting location of 'Crosshair'
        camera.add( sprite );
        sprite.scale.setScalar(0.001);
        sprite.position.z = -0.1;

        //Event listeners to lock and unlock on 'click'
        instructions.addEventListener( 'click', function () {

            controls.lock();

        } );

        controls.addEventListener( 'lock', function () {

            instructions.style.display = 'none';
            blocker.style.display = 'none';
            camera.add( sprite );
            sprite.scale.setScalar(0.001);
            sprite.position.z = -0.1;

        } );

        controls.addEventListener( 'unlock', function () {

            blocker.style.display = 'block';
            instructions.style.display = '';

        } );

        //Adding pointlock controls to the scene
        scene.add( controls.getObject() );

        moveForward = false;
        moveBackward = false;
        moveLeft = false;
        moveRight = false;

        //Key down = move
        const onKeyDown = function ( event ) {

            switch ( event.code ) {

                case 'ArrowUp':
                case 'KeyW':
                    moveForward = true;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft = true;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    moveBackward = true;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    moveRight = true;
                    break;

            }

        };

        //Key up = stop
        const onKeyUp = function ( event ) {

            switch ( event.code ) {

                case 'ArrowUp':
                case 'KeyW':
                    moveForward = false;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft = false;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    moveBackward = false;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    moveRight = false;
                    break;

            }

        };

        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );

    }
    firstPerson();
    console.log("Done");

    //Create the floor for the world
    console.log("Add the floor");
    plane = null;
    let planeGeo = new THREE.PlaneGeometry(20, 40);
    let planeMat = new THREE.MeshPhongMaterial ({color: 0x8b5a2b});
    plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = Math.PI / 2;
    plane.material.side = THREE.DoubleSide;
    scene.add(plane);
    console.log("Done");

    //Create notice board
    console.log("Add info board");
    let plane4 = null;
    let planeGeo4 = new THREE.PlaneGeometry(5, 5);
    plane4 = new THREE.Mesh(planeGeo4, planeMat);
    plane4.DoubleSide = true;
    plane4.position.set(0, 0, 10);
    scene.add(plane4);
    console.log("Done");

    //Spotlight
    console.log("Add a spotlight");
    let spotLight = new THREE.PointLight(0xffffff);
    spotLight.position.set(4, 30, 60);
    spotLight.intensity = 1;
    spotLight.castShadow = true;
    scene.add(spotLight);
    console.log("Done");

    //Ambient light
    console.log("Add ambient light");
    lightAmbient = new THREE.AmbientLight( 0x222222, 5.0 ); 
    scene.add(lightAmbient);
    console.log("Done");
}
init();
console.log("<---------------------------------------->");
console.log("Done");

function initCannon(){
    let mass = 10, radius = 0.1;

    //Box 1
    box1 = new THREE.Mesh(
        new THREE.BoxGeometry(radius, radius, radius),
        new THREE.MeshToonMaterial( {color: green_color})
        );
     scene.add(box1);
     
    //Box 2
    box2 = new THREE.Mesh(
        new THREE.BoxGeometry(radius, radius, radius),
        new THREE.MeshToonMaterial( {color: red_color})
        );
    scene.add(box2);
     
    // Cannon
    world = new CANNON.World();
    // set gravity in negative y direction
    world.gravity.set(0,-1,0);
    
    //Increase solver iterations (default is 10)
    world.solver.iterations = 20; 
    //Force solver to use all iterations
    world.solver.tolerance = 0.01;
    
    // a simple one is available in the library
    world.broadphase = new CANNON.NaiveBroadphase();
    
    let mat = new CANNON.Material();
    
    //Cannon box1
    let boxShape = new CANNON.Box(new CANNON.Vec3(radius,radius,radius));
    boxBody = new CANNON.Body({mass: mass, material: mat});
    boxBody.addShape(boxShape);
    boxBody.position.set(5,0.5,7);
    world.add(boxBody);                      
    
    //Cannon box 2
    boxBody2 = new CANNON.Body({mass: mass, material: mat});
    boxBody2.addShape(boxShape);
    boxBody2.position.set(5.2,0.5,7);
    world.add(boxBody2);                          
    
    //Create plane for floor so objects effected by physics cannot pass through
    let planeCannon1 = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0, material: mat });
    groundBody.addShape(planeCannon1);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.add(groundBody);
    
    // Create contact material behavior
    let mat_mat = new CANNON.ContactMaterial(mat, mat, { friction: 0.01, restitution: 0.1 });
    world.addContactMaterial(mat_mat);
    
    //Physics settings
    spring = new CANNON.Spring(boxBody,boxBody2,{
        localAnchorA: new CANNON.Vec3(0,0,0),
        localAnchorB: new CANNON.Vec3(0,0,0),
        restLength : 1,
        stiffness : 10,
        damping : 1,
    });
    
    // and update the force on the spring
    world.addEventListener("postStep",function(event){
        spring.applyForce();
    });
}
initCannon();

function blizzard(){
    //Loop to set the area of the blizzard
    for(let i = 0; i < 10000; i++){
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;

        vertices.push(x, y, z);
    }

    //Setting name and buffer attribute for rainGeom
    rainGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    //Array of sizes for snow
    parameters = [[20],[15],[10],[8],[5]];

    //Loop to give each particle a different size
    for(let i = 0; i < parameters.length; i++){
        const size = parameters[i][0];

        materials[i] = new THREE.PointsMaterial({size: size, blending: THREE.AdditiveBlending, depthTest: false, transparent: true});

        particles = new THREE.Points(rainGeom, materials[i]);
    }
    
    //Button for blizzard off
    let blizzardOffMat = new THREE.MeshPhongMaterial({color: red_color});
    let blizzardOff = new THREE.Mesh(buttonSize, blizzardOffMat);
    blizzardOff.name = 'blizzardOff';
    blizzardOff.position.y = 0.1;
    blizzardOff.position.x = -1;
    blizzardOff.position.z = 9;
    blizzardOff.receiveShadow = true;

    //Button for blizzard on
    let blizzardOnMat = new THREE.MeshPhongMaterial({color: gray_color});
    let blizzardOn = new THREE.Mesh(buttonSize, blizzardOnMat);
    blizzardOn.name = 'blizzardOn';
    blizzardOn.position.y = 0.3;
    blizzardOn.position.x = 1;
    blizzardOn.position.z = 9;
    blizzardOn.receiveShadow = true;

    scene.add(blizzardOff);
    scene.add(blizzardOn);

    //Button to turn blizzard on and off
    mmi.addHandler('blizzardOn', 'click', function(mesh){
        console.log("blizzard on");
        blizzardOff.material.color = gray_color;
        blizzardOn.material.color = green_color;
        blizzardOff.position.y = 0.3;
        blizzardOn.position.y = 0.1;
        blizOn = 1;
    });

    mmi.addHandler('blizzardOff', 'click', function(mesh){
        console.log("blizzard off");
        blizzardOff.material.color = red_color;
        blizzardOn.material.color = gray_color;
        blizzardOff.position.y = 0.1;
        blizzardOn.position.y = 0.3;
        blizOn = null;
    });
}
blizzard();

console.log("Define the light switch function");
function lightSwitch(){

    //Create bulb cube
    cube = null;
    let cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    let cubeMat = new THREE.MeshPhongMaterial({color: gray_color, emissive: 0xffffee, emissiveIntensity: 0.3});
    cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.y = 1;
    cube.receiveShadow = true;
    cube.name = 'bulb';

    //Create off button
    let cubeMat2 = new THREE.MeshPhongMaterial({color: red_color});
    let cube2 = new THREE.Mesh(buttonSize, cubeMat2);
    cube2.name = 'switchOff';
    cube2.position.y = 0.1;
    cube2.position.x = 1;
    cube2.position.z = 2;
    cube2.receiveShadow = true;

    //Create on button
    let cubeMat3 = new THREE.MeshPhongMaterial({color: gray_color});
    let cube3 = new THREE.Mesh(buttonSize, cubeMat3);
    cube3.name = 'switchOn';
    cube3.position.y = 0.3;
    cube3.position.x = -1;
    cube3.position.z = 2;
    cube3.receiveShadow = true;

    //Add bulb and buttons to scene
    scene.add(cube);
    scene.add(cube2);
    scene.add(cube3);

    //Create mouse mesh interaction instance
    let light = new THREE.DirectionalLight(0xffffff, 0.15);
    on = null;

    let yellow_color = new THREE.Color(0xe0c53a);

    //Event handlers to switch on and off the light bulb using 'click'
    mmi.addHandler('switchOn', 'click', function(mesh){
        console.log("switched on");
        cube.material.color = yellow_color;
        cube2.material.color = gray_color;
        cube3.material.color = green_color;
        cube2.position.y = 0.3;
        cube3.position.y = 0.1;
        light.position.set(0, 1, 0).normalize();
        on = 1;
        scene.add(light);
    });

    mmi.addHandler('switchOff', 'click', function(mesh){
        console.log("switched off");
        cube.material.color = gray_color;
        cube2.material.color = red_color;
        cube3.material.color = gray_color;
        cube2.position.y = 0.1;
        cube3.position.y = 0.3;
        on = null;
        scene.remove(light);
    });
}
lightSwitch();
console.log("Done");

console.log("Define the model loading function");
function loaders(){
    //GLTF loader initialized
    const GLTF_loader = new GLTFLoader();
    GLTF_loader.load( 'GLTF/knight.glb', function ( gltf ) {

        let GLTFobject = gltf.scene;
        //Animation mixer initialized
        GLTFmixer = new THREE.AnimationMixer( GLTFobject );
        let anim = GLTFmixer.clipAction(gltf.animations[8]);
        anim.loop = THREE.LoopOnce;

        //random jump animation between 1 - 10 seconds on every refresh of page
        let min = 1;
        let max = 10;
        let rand = Math.floor(Math.random() * (max - min + 1) + min);
        setInterval(function() {
            anim
                .reset()
                .play();
            }, rand * 1000);
        console.log('wait time = ' + rand);

        //When jump animation resets, play idle animation
        if(anim.reset()){
            let idle = GLTFmixer.clipAction(gltf.animations[7]);
            idle.play();
        }
    
        //Setting the position / rotation of model
        GLTFobject.position.set(5, 0, -3);
        GLTFobject.rotation.set(0, 5, 0);

        //Adding GLTF model to the scene
        scene.add( GLTFobject );
    });


    //FBX loader initialized
    const FBX_Loader = new FBXLoader();
    FBX_Loader.load('./FBX/paladin_j_nordstrom.fbx', function(fbx){
        
        //FBX loader initialized (for animation)
        const anim = new FBXLoader();
        anim.load('./FBX/Northern Soul Spin Combo.fbx', function(anim){
            FBXmixer = new THREE.AnimationMixer(fbx);
            const dance = FBXmixer.clipAction(anim.animations[0]);
            dance.play();
        });
        //Setting scale / position / rotation of model
        fbx.scale.setScalar(0.012);
        fbx.position.set(-5, 0, -3);
        fbx.rotation.set(0, -5, 0);
        scene.add(fbx);
    });
}
loaders();
console.log("Done");


console.log("Define the font loading function");
function fontLoaders(){

    //Text for lightbulb buttons
    const textLoader2 = new FontLoader();
    textLoader2.load('./fonts/basis33_Regular.json', function(font){
        const textGeo2 = new TextGeometry( 'Click left cube for on!\nClick right cube for off!', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh2 = new THREE.Mesh(textGeo2, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh2.position.y = 0.6;
        textMesh2.position.x = 1.5;
        textMesh2.position.z = 2.5;
        textMesh2.rotation.y = -1;

        scene.add(textMesh2);
    });

    //Text for GLTF
    const textLoaderGLTF = new FontLoader();
    textLoaderGLTF.load('./fonts/basis33_Regular.json', function(font){
        const textGeo3 = new TextGeometry( 'GLTF model\nw/ animation change\non random interval\non reload of page', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh3 = new THREE.Mesh(textGeo3, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh3.position.set(5, 1, -6);
        textMesh3.rotation.set(0, 5, 0);

        scene.add(textMesh3);
    });

    //Text for FBX
    const textLoaderFBX = new FontLoader();
    textLoaderFBX.load('./fonts/basis33_Regular.json', function(font){
        const textGeo4 = new TextGeometry( 'FBX model\nw/ animation', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh4 = new THREE.Mesh(textGeo4, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh4.position.set(-5, 0.4, -4);
        textMesh4.rotation.set(0, -5, 0);

        scene.add(textMesh4);
    });

    //Text for title
    const textLoaderCourse = new FontLoader();
    textLoaderCourse.load('./fonts/basis33_Regular.json', function(font){
        const textGeo5 = new TextGeometry( 'w18010435, Comp. Graphics and Animations Project:', {
            font: font,
            size: 0.1,
            height: 0.2
        });

        const textMesh5 = new THREE.Mesh(textGeo5, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh5.position.set(-1.5, 2, 10.5);

        scene.add(textMesh5);
    });

    const textLoaderTitle = new FontLoader();
    textLoaderTitle.load('./fonts/basis33_Regular.json', function(font){
        const textGeo5 = new TextGeometry( 'Showcase of Animations and Effects', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh5 = new THREE.Mesh(textGeo5, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh5.position.set(-2, 1.5, 10.5);

        scene.add(textMesh5);
    });

    //Text for controls
    const textLoaderControls = new FontLoader();
    textLoaderControls.load('./fonts/basis33_Regular.json', function(font){
        const textGeo6 = new TextGeometry( 'Move: WASD\nLook: MOUSE\nExit/Enter point lock: ESC', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh6 = new THREE.Mesh(textGeo6, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh6.position.set(-1.5, 1, 10.5);

        scene.add(textMesh6);
    });

    //Text for water effect
    const textLoaderRipple = new FontLoader();
    textLoaderRipple.load('./fonts/basis33_Regular.json', function(font){
        const textGeo7 = new TextGeometry( 'Ripple effect w/ realistic water texture', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh7 = new THREE.Mesh(textGeo7, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh7.position.set(-2.5, 0.3, -16);

        scene.add(textMesh7);
    });

    //Text for lightbulb interaction
    const textLoaderBulb = new FontLoader();
    textLoaderBulb.load('./fonts/basis33_Regular.json', function(font){
        const textGeo8 = new TextGeometry( 'Lightbulb effect\n using raycast\n\n\n\n\n stop and start\n   animation', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh8 = new THREE.Mesh(textGeo8, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh8.position.set(-0.9, 2.2, 0.8);

        scene.add(textMesh8);
    });

    //Text for solar system
    const textSolarSystem = new FontLoader();
    textSolarSystem.load('./fonts/basis33_Regular.json', function(font){
        const textGeo9 = new TextGeometry( 'Planetary orbit animation', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh9 = new THREE.Mesh(textGeo9, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh9.position.set(-5.3, 0.3, 5.5);
        textMesh9.rotation.set(0, -4.8, 0);

        scene.add(textMesh9);
    });

    //Text for blizzard buttons
    const textBlizzard = new FontLoader();
    textBlizzard.load('./fonts/basis33_Regular.json', function(font){
        const textGeo10 = new TextGeometry( 'On and off switch for\n   Blizzard effect', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh10 = new THREE.Mesh(textGeo10, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh10.position.set(1.3, 1.5, 9.5);
        textMesh10.rotation.set(0, -3.15, 0);

        scene.add(textMesh10);
    });

    //Text for physic cubes
    const physicsCube = new FontLoader();
    physicsCube.load('./fonts/basis33_Regular.json', function(font){
        const textGeo11 = new TextGeometry( 'Cubes that can be effected by\nphysics w/ lil-gui (top right)', {
            font: font,
            size: 0.2,
            height: 0.2
        });

        const textMesh11 = new THREE.Mesh(textGeo11, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}),
            new THREE.MeshPhongMaterial({color: 0x5c2301})
        ]);

        textMesh11.position.set(7, 0.5, 5);
        textMesh11.rotation.set(0, 4.72, 0);

        scene.add(textMesh11);
    });
}
fontLoaders();
console.log("Done");

//Solar system 
console.log("Define the orbit function");
function orbit(){
    //Sun
    let geometry = new THREE.SphereGeometry(0.2, 20, 20);
    let material = new THREE.MeshPhongMaterial({color: 0xF4E99B});
    let sun = new THREE.Mesh(geometry, material);
    solarSystem = new THREE.Group();
    solarSystem.add(sun);

    sun.position.set(-5, 1, 4);

    scene.add(sun);

    //Mercury
    let mercuryGeo = new THREE.SphereGeometry(0.01, 20, 20);
    let mercuryMat = new THREE.MeshPhongMaterial({color: 0xCECCD1});
    let mercury = new THREE.Mesh(mercuryGeo, mercuryMat);
    mercurySystem = new THREE.Object3D();
    mercurySystem.add(mercury);

    //Venus
    let venusGeo = new THREE.SphereGeometry(0.03, 20, 20);
    let venusMat = new THREE.MeshPhongMaterial({color: 0xa57c1b});
    let venus = new THREE.Mesh(venusGeo, venusMat);
    venusSystem = new THREE.Object3D();
    venusSystem.add(venus);

    //Earth
    let earthGeo = new THREE.SphereGeometry(0.035, 20, 20);
    let earthMat = new THREE.MeshPhongMaterial({color: 0x00655d});
    let earth = new THREE.Mesh(earthGeo, earthMat);
    let lunaGeo = new THREE.SphereGeometry(0.005, 20, 20);
    let lunaMat = new THREE.MeshPhongMaterial({color: 0xF4F1C9});
    let luna = new THREE.Mesh(lunaGeo, lunaMat);
    let lunaSystem = new THREE.Object3D();
    earthSystem = new THREE.Object3D();
    lunaSystem.add(luna);
    earthSystem.add(earth);

    //Mars
    let marsGeo = new THREE.SphereGeometry(0.02, 20, 20);
    let marsMat = new THREE.MeshPhongMaterial({color: 0xe77d11});
    let mars = new THREE.Mesh(marsGeo, marsMat);
    marsSystem = new THREE.Object3D();
    marsSystem.add(mars);

    //Jupiter
    let jupiterGeo = new THREE.SphereGeometry(0.09, 20, 20);
    let jupiterMat = new THREE.MeshPhongMaterial({color: 0xbcafb2});
    let jupiter = new THREE.Mesh(jupiterGeo, jupiterMat);
    jupiterSystem = new THREE.Object3D();
    jupiterSystem.add(jupiter);

    //Saturn
    let saturnGeo = new THREE.SphereGeometry(0.06, 20, 20);
    let saturnMat = new THREE.MeshPhongMaterial({color: 0xead6b8});
    let saturn = new THREE.Mesh(saturnGeo, saturnMat);
    let ringGeo = new THREE.TorusGeometry( 0.15, 0.01, 2, 100 );
    let ringMat = new THREE.MeshPhongMaterial( { color: 0xd8ae6d } );
    let ring1 = new THREE.Mesh( ringGeo, ringMat );
    let ringGeo2 = new THREE.TorusGeometry( 0.125, 0.01, 2, 100 );
    let ringMat2 = new THREE.MeshPhongMaterial( { color: 0x655f45 } );
    let ring3 = new THREE.Mesh( ringGeo2, ringMat2 );
    let ringGeo3 = new THREE.TorusGeometry( 0.1, 0.01, 2, 100 );
    let ringMat3 = new THREE.MeshPhongMaterial( { color: 0xdbb57c } );
    let ring2 = new THREE.Mesh( ringGeo3, ringMat3 );
    saturnSystem = new THREE.Object3D();
    saturnSystem.add(saturn);
    saturnSystem.add(ring1);
    saturnSystem.add(ring2);
    saturnSystem.add(ring3);

    //Uranus
    let uranusGeo = new THREE.SphereGeometry(0.05, 20, 20);
    let uranusMat = new THREE.MeshPhongMaterial({color: 0x4FD0E7});
    let uranus = new THREE.Mesh(uranusGeo, uranusMat);
    uranusSystem = new THREE.Object3D();
    uranusSystem.add(uranus);

    //Neptune
    let neptuneGeo = new THREE.SphereGeometry(0.048, 20, 20);
    let neptuneMat = new THREE.MeshPhongMaterial({color: 0x274687});
    let neptune = new THREE.Mesh(neptuneGeo, neptuneMat);
    neptuneSystem = new THREE.Object3D();
    neptuneSystem.add(neptune);

    //Setting position for each planet
    mercury.position.set(0.3, 0, 0);
    venus.position.set(-0.5, 0, 0);
    earth.position.set(0.7, 0, 0);
    lunaSystem.position.set(0.8, 0, 0);
    mars.position.set(-1, 0, 0);
    jupiter.position.set(-1.3, 0, 0);
    ring1.position.set(1.6, 0, 0);
    ring1.rotation.set(2, 0, 0);
    ring2.position.set(1.6, 0, 0);
    ring2.rotation.set(2, 0, 0);
    ring3.position.set(1.6, 0, 0);
    ring3.rotation.set(2, 0, 0);
    saturn.position.set(1.6, 0, 0);
    uranus.position.set(-1.9, 0, 0);
    neptune.position.set(2.2, 0, 0);

    //Add all systems to solar system
    solarSystem.add(mercurySystem, venusSystem, earthSystem, marsSystem, jupiterSystem, saturnSystem, uranusSystem, neptuneSystem);
    solarSystem.position.copy(sun.position);
    solarSystem.rotation.set(0.2, 2, 0);
    earthSystem.add(lunaSystem);

    //Add solar system to scene
    scene.add(solarSystem);

}
orbit();
console.log("Done");

console.log("Define the water effect function");
function waterEffect(){
    //Loading realistic water texture
    const textureLoader = new THREE.TextureLoader();
    squiggleBall = new THREE.SphereBufferGeometry(2, 10, 10);
    const flowMap = textureLoader.load( './textures/Water_1_M_Normal.jpg' );

    //Mapping texture onto sphere
    let sphere = new Water(squiggleBall,{
        scale: 2,
        color: 0x7fcdff,
        textureWidth: 1024,
        textureHight: 1024,
        flowMap: flowMap
    });
    sphere.receiveShadow = true;
    sphere.position.set(0, 2.5, -17);
    scene.add(sphere);
}
waterEffect();
console.log("Done");

//Modified function from the workshop
console.log("Define the wave function");
function wave(geometry) {
    //Get all vertices
    let positionAttribute = geometry.getAttribute( 'position' );
    let vertex = new THREE.Vector3();

    const time = Date.now() / 300;
  
    //Loop through vertices
    for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {
        vertex.fromBufferAttribute( positionAttribute, vertexIndex );

        //The x and y for wave effects
        const x = geometry.attributes.uv.getX(vertexIndex) * Math.PI * 16;
        const y = geometry.attributes.uv.getY(vertexIndex) * Math.PI * 16;
        
        //X and Y sine waves (intensity of wave)
        const xSin = Math.sin(x + time) * damping;
        const ySin = Math.sin(y + time) * damping;
        geometry.attributes.position.setZ(vertexIndex, xSin + ySin);
    }
    
    //Updates geometry position
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}
console.log("Done");

//Function to resize window on change
console.log("Define the window resize function");
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
window.addEventListener( 'resize', onWindowResize );
console.log("Done");

console.log("Define the GUI function");
function createGUI(){
    //Parameters of physics cubes
    cubeParams = {
        x1: 5, x2: 5.2, y: 0.5, z:7,
        gravX: 0, gravY: -1, gravZ: 0,
        reset: function(){resetCube()}
    };

    //Creat lil-gui panel
    const panel = new GUI();

    //Light folder
    const folder1 = panel.addFolder('Light');
    folder1.add(lightAmbient, "intensity", 1, 5).name("Ambient light intensity");
    folder1.close();

    //Gravity folder
    const folder2 = panel.addFolder('Physics Manipulation');
    let gravX = folder2.add(world.gravity,"x", -1 , 1).name("Gravity x").listen();
    let gravY = folder2.add(world.gravity,"y", -1 , 1).name("Gravity y").listen();
    let gravZ = folder2.add(world.gravity,"z", -1 , 1).name("Gravity z").listen();
    folder2.add(cubeParams, "reset" ).name("Reset Cube");
    folder2.close();

    //Change the sliders to match the reset
    gravX.onChange(function(value)
    { world.gravity.x = value;  });
    gravY.onChange(function(value)
    { world.gravity.y = value;  });
    gravZ.onChange(function(value)
    { world.gravity.z = value;  });
}
createGUI();
console.log("Done");

//Function to update body box positions to reset the physics cubes positions in the scene
function updateCube(){
    boxBody.position.set(cubeParams.x1, cubeParams.y, cubeParams.z);
    boxBody2.position.set(cubeParams.x2, cubeParams.y, cubeParams.z);

    world.gravity.set(cubeParams.gravX, cubeParams.gravY, cubeParams.gravZ);
}

//Resetting physics cubes
function resetCube(){
    cubeParams.x1 = 5;
    cubeParams.x2 = 5.2;
    cubeParams.y = 0.5;
    cubeParams.z = 7;

    cubeParams.gravX = 0;
    cubeParams.gravY = -1;
    cubeParams.gravZ = 0;

    //Call update cube function
    updateCube();
}

console.log("Define the animation function");
function animate() {
    requestAnimationFrame(animate);

    //Update mouse mesh interaction
    mmi.update();

    //Planet orbit speeds
    mercurySystem.rotation.y += 0.03;
    venusSystem.rotation.y += 0.01;
    earthSystem.rotation.y += 0.008;
    marsSystem.rotation.y += 0.005;
    jupiterSystem.rotation.y += 0.003;
    saturnSystem.rotation.y += 0.001;
    uranusSystem.rotation.y += 0.0008;
    neptuneSystem.rotation.y += 0.0005;
    solarSystem.rotation.y += 0.0003;

    //Infinite loop to create wave effect
    if (plane!=null) {
        wave(squiggleBall);
    }

    //Check on variable on to determine if cube rotates
    if(on != null){
        cube.rotation.y += 0.01;
        cube.rotation.x += 0.01;
        scene.add(box1);
    }

    //Check to turn blizzard on and off
    let rainTime = Date.now() * 0.00005;
    if(blizOn != null){
        scene.add(particles);
        //To animate blizzard
        particles.rotation.y = rainTime *= 100;
        particles.rotation.x = rainTime *= 10;
        particles.rotation.z = rainTime *= 100;
    }else{
        scene.remove(particles);
    }

    //Using delta time to update models
    let delta = clock.getDelta();
    if ( GLTFmixer ) GLTFmixer.update( delta );
    if ( FBXmixer ) FBXmixer.update( delta );

    //Ensures cannon boxes positions are always equal to three.js box mesh
    world.step(delta);
    box1.position.set(boxBody.position.x, boxBody.position.y, boxBody.position.z);
    box1.quaternion.set(boxBody.quaternion.x, boxBody.quaternion.y, boxBody.quaternion.z, boxBody.quaternion.w);

    box2.position.set(boxBody2.position.x, boxBody2.position.y, boxBody2.position.z);
    box2.quaternion.set(boxBody2.quaternion.x, boxBody2.quaternion.y, boxBody2.quaternion.z, boxBody2.quaternion.w);

    //Checks for point lock controls to allow movement
    const time = performance.now();
    if ( controls.isLocked === true ) {

        const delta = ( time - prevTime ) / 1000;

        //Walking speeds
        velocity.x -= velocity.x * 100.0 * delta;
        velocity.z -= velocity.z * 100.0 * delta;

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        //Checks for speed when moving
        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
    }
    prevTime = time;

    //Update stats UI
    stats.update();

    renderer.render( scene, camera );
}
animate();
console.log("Done");
/**/