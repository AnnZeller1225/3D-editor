// импорты для three js 
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import {  composer, effectFXAA } from "../scripts/outline"
const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();

const floorY = 0; // позиция для пола по Y

function setSceneColor(scene) { // цвет всей сцены
    scene.background = new THREE.Color(0x657d83);
}
const getTypeLoader = (url) => {
    let type = url.match(/\.[0-9a-z]{1,5}$/);

    switch (type[0]) {
        case ".fbx":
            return fbxLoader;
        case ".glb":
            return gltfLoader;
        default: return gltfLoader;
    }
}

function getMouseCoord(e, canvas, mouse) { // текущие координаты мыши 
    var rect = canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
    mouse.x = (x / canvas.clientWidth) * 2 - 1;
    mouse.y = -(y / canvas.clientHeight) * 2 + 1;
}

function initPointLight(scene) { // свет на сцене 
    const color = 0xffffff;
    const intensity = 1.2;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
}

// простая фигура пола - прямоугольник / квадрат 
function initFloor(scene) {
    var floorGeometry = new THREE.PlaneGeometry(10, 18);
    var floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3f3f3f }); //color: 0x3f3f3f
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = -0.5 * Math.PI;
    floor.position.x = 0;
    floor.position.y = -0.1;
    floor.position.z = 0;
    scene.add(floor);
    floor.userData.name = "FLOOR";
    // scene.add(new THREE.GridHelper(20, 20, 0x888888, 0x444444)); // сетка пола
}

function findModel(arr, obj) {
    let elem;
    arr.forEach((el) => {
        if (el.type === "Group" && el.userData.id === obj.id) {
            elem = el;
        }
    });
    return elem;
}

function initRenderer(renderer) { // стандартные three js 
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
}
// удаляем из массива объектов на сцене заменившуюся модель
function replaceModelFromCollision(arr, id) {
    let arr2 = arr.filter(el => el.userData.id !== id);
    return arr2;
} // одно и то же
function replaceElemFromArr(arr, deletedId) {

    let newArr = [];
    arr.forEach((el) => {
        if (deletedId !== el.userData.id) {
            newArr.push(el);
        }
    });
    return newArr;
}

function createSquare(model, scene) { // подсветка точечным светом, не используется 
    let color = "white";
    let intensity = 9;
    let width = 1;
    let height = 1;

    const light4 = new THREE.RectAreaLight(color, intensity, width, height);
    light4.position.set(0, 2.8, 0);
    light4.rotation.y = THREE.MathUtils.degToRad(-180);
    light4.rotation.x = THREE.MathUtils.degToRad(90);

    const helper = new RectAreaLightHelper(light4);
    light4.add(helper);
    return light4;
}


function isCollision(el, mas) { // не сталкиваются ли модели друг с другом?
    for (var i = 0; i < mas.length; i++) {
        if (el.target.children[0].object !== mas[i]) {
            var firstObject = el.target.children[0].object;
            var secondObject = mas[i];
            // рисуем рамку
            var firstBB = new THREE.Box3().setFromObject(firstObject);
            var secondBB = new THREE.Box3().setFromObject(secondObject);
            // проверка на пересечение
            var collision = firstBB.intersectsBox(secondBB);
            if (collision) {
                // если сталкиваются, копирует предыдущее корректное положение 
                el.target.children[0].object.position.copy(
                    el.target.children[0].object.userData.currentPosition
                );
            }
        }
    }
}

function getCube(scene) { // не используется 
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: "red" });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position.y = 1;
    mesh.userData.name = "CUBE";
    mesh.material.side = THREE.DoubleSide;
}

function drawBox(
    objectwidth,
    objectheight,
    objectdepth,
    el,
) {
    var geometry, material, box;

    geometry = new THREE.BoxGeometry(objectwidth, objectheight, objectdepth);
    material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.1,
    });
    box = new THREE.Mesh(geometry, material);
    box.userData = { ...el }
    box.position.set(0, 0 + objectheight / 2, 0);
    // box.add(el)

    return box;
}


function combinePartsOfModel(el, scene) { // соединить части моделей, обвернув все кубом 
    var group, mesh, box;
    group = new THREE.Group();
    var gltfLoader = new GLTFLoader();
    gltfLoader.load(`${el.url}`, (gltf) => {
        mesh = gltf.scene;
        var gltfbox = new THREE.Box3().setFromObject(mesh);
        const width = new THREE.Vector3();

        let size = gltfbox.getSize(width);
        var objectwidth = Math.floor(size.x);
        var objectheight = Math.floor(size.y);
        var objectdepth = Math.floor(size.z);
        objectwidth = objectwidth + parseInt(1);
        objectheight = objectheight + parseInt(1);
        objectdepth = objectdepth + parseInt(1);
        mesh.position.set(0, -objectheight / 2, 0);
        box = drawBox(objectwidth, objectheight, objectdepth, el);
        group.add(box);
        group.name = "quadrant";
        return mesh
    });
    return box;
}

function setTexture(wall, side, url) {
    let texture = new THREE.TextureLoader().load(`${url}`);
    var mat = new THREE.MeshBasicMaterial({ map: texture });
    wall.material[side] = mat;
}

function findSideWall(obj) {
    var index = Math.floor(obj.faceIndex / 2);

    switch (index) {
        case 4:
            return setTexture(obj.object, 4);
        case 5:
            return setTexture(obj.object, 5);
        default:
            return "default";
    }
}

function hideAxesTransformConrol(control) { // скрываем оси стрелок
    control.showX = false;
    control.showY = false;
    control.showZ = false;
    control.detach();
}

// сложная форма пола - трапеция например
function polygonShape(floor) {
    const floorFigureCoord = [];
    floor.dots.forEach((el) => {
        floorFigureCoord.push(new THREE.Vector2(+el.x, +el.z));
    });
    const floorFigure = new THREE.Shape(floorFigureCoord);
    let texture = getSharpTexture(floor.texture);
    return addShape(floorFigure, texture, floor);
}

function addShape(shape, texture, floor) { // создаем сложную фигуру пола

    let geometry = new THREE.ShapeGeometry(shape);
    let material = new THREE.MeshPhongMaterial({ map: texture });
    material.side = THREE.DoubleSide;
    let mesh = new THREE.Mesh(
        geometry,
        material
    );
    mesh.position.set(-5, +floorY, 3);
    // изменить 
    if (floor.name === 'Пол') {
    mesh.rotation.x = -0.5 * Math.PI;
    } else if(floor.name === 'Потолок') {
        mesh.rotation.x = -0.5 * Math.PI;
    }
    return mesh;
}
// высчитываем пропорции, возвращая длину или ширину картинки - в зависимости от того, как расположена картинка- вертикально или горизонтально
function calculateParamTexture(widthImg, widthPixel, heightPixel, isRotate) {
    let lengthTexture = isRotate ?
        (widthImg * heightPixel) / widthPixel :
        (widthImg * widthPixel) / heightPixel;
    return lengthTexture;
}
// загрузка и вычисление текстуры только для сложной формы пола
function getSharpTexture(texture) {
    let loadTexture = new THREE.TextureLoader().load(`${texture.url}`, (tex) => {
        loadTexture.wrapS = loadTexture.wrapT = THREE.RepeatWrapping;
        if (+tex.image.height > +tex.image.width) {
            let height = calculateParamTexture(+texture.width, +tex.image.height, +tex.image.width,
                "rotating"
            );
            loadTexture.repeat.set(1 / Number(height), 1 / Number(texture.width));
        } else {
            let height = calculateParamTexture(+texture.width, +tex.image.height, +tex.image.width,
                null
            );
            loadTexture.repeat.set(1 / Number(texture.width), 1 / Number(height));
        }
    });
    return loadTexture;
}


function getChangeTextureFloor(obj, scene) { // замена текстуры пола 
    scene.children.forEach((el) => {
        if (el.type === "Mesh" && el.userData.id === obj.prev.id) {
            let texture = getSharpTexture(obj.next);
            var mat = new THREE.MeshBasicMaterial({ map: texture });
            el.material = mat;
        }
    });
}

const loadTextureForBox = (texture, length, wallHeight) => { // загрузка текстур  для стен 
    var loadTexture = new THREE.TextureLoader().load(`${texture.url}`, (tex) => {
        loadTexture.wrapS = loadTexture.wrapT = THREE.RepeatWrapping;
        if (+tex.image.height > +tex.image.width) {
           
            loadTexture.repeat.set(length / texture.width, wallHeight / texture.height);
        } else {
            let height = calculateParamTexture(+texture.width, +tex.image.height, +tex.image.width,
                null
            );
            loadTexture.repeat.set(length / texture.width, wallHeight / height);
        }
    });
    
    var frontMaterial = new THREE.MeshBasicMaterial({ map: loadTexture });
    return frontMaterial
}

function changeVisibility(arr, mod) { // меняем видимость модели
    let model = findModel(arr, mod);
    model.visible = !model.visible;
    return model;
}
function changeTextureWall(currentWall, currentTexture, scene) { // замена текстуры стен 
    scene.children.forEach((el) => {
        if (el.type === "Mesh" && el.userData.id === currentWall.id) {
            el.material[currentWall.sideInd] = loadTextureForBox(
                currentTexture,
                el.userData.size.width,
                el.userData.size.height
            );
        }
    });
}

function removeAllHightLight(arr) { // обнуление счетчика клика и снятие selected в userData 
    arr.forEach((model) => {
        if (model.type === "Group" || model.type === "Mesh") {
            model.userData.selected = false;
            model.userData.click = 0;
        }
    });
}

function onWindowResize(cameraPersp, renderer) { 
    const width = window.innerWidth;
    const height = window.innerHeight;
    cameraPersp.aspect = width / height;
    cameraPersp.updateProjectionMatrix();
    renderer.setSize(width, height);
    // для обводки
    composer.setSize(width, height);
    effectFXAA.uniforms["resolution"].value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
    );
}
function addFloor(arr, clickList, scene) { // рисуем пол 
    arr.forEach(el => {
        const id = el.id;
        el = polygonShape(el);
        el.userData = {
            type: "floor",
            ...el.userData,
            id: id,
            name: el.name,
            click: 0,
        };
        clickList.push(el);
        scene.add(el);
    });
}

export {
    setSceneColor,
    initPointLight,
    initFloor,
    initRenderer,
    drawBox,
    createSquare,
    findModel,
    isCollision,
    getMouseCoord,
    getCube,
    findSideWall,
    setTexture,
    hideAxesTransformConrol,
    polygonShape,
    getSharpTexture,
    combinePartsOfModel,
    loadTextureForBox,
    replaceElemFromArr,
    replaceModelFromCollision,
    changeVisibility, 
    changeTextureWall, getChangeTextureFloor,
    removeAllHightLight, 
    onWindowResize,
    addFloor,
    getTypeLoader

};