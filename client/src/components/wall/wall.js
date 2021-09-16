import * as THREE from "three";
import { loadTextureForBox } from "../scripts/initBasicScene";

let rotateAngle;
let wallLength;
let wallCenter;
let hideSide, halfSide;
let directionAngle; // переменная для правильного позиционирования, показывает направление угла, сравнительно с настенными часами. направление из центра
let acuteAngle;

const setPosition = (build, wall, katet, katet2, direction) => {
    let wallYposition = 0.5;
    switch (direction) {
        case "12-15": //
            wallCenter = {
                x: katet / 2 + Number(wall.dots.z),
                y: wallYposition,
                z: katet2 / 2 + Number(wall.dots.x),
            };

            build.position.set(wallCenter.x, wallCenter.y, wallCenter.z);
            break;
        case "15-18": //
            build.position.set(
                katet / 2 + Number(wall.dots.z2),
                wallYposition,
                katet2 / 2 + Number(wall.dots.x)
            );
            break;
        case "18-21": //
            wallCenter = {
                x: katet / 2 + Number(wall.dots.z2),
                y: wallYposition,
                z: katet2 / 2 + Number(wall.dots.x2),
            };

            build.position.set(wallCenter.x, wallCenter.y, wallCenter.z);
            // console.log(" на 7 вечера установили", wall.dots);
            break;
        case "21-24":
            wallCenter = {
                x: katet / 2 + Number(wall.dots.z),
                y: wallYposition,
                z: katet2 / 2 + Number(wall.dots.x2),
            };
            build.position.set(wallCenter.x, wallCenter.y, wallCenter.z);
            // console.log(" на 11 утра установили", wall.dots);
            break;

        case "00": //
            wallCenter = {
                x: katet / 2 + Number(wall.dots.z),
                y: wallYposition,
                z: katet2 / 2 + Number(wall.dots.x),
            };
            build.position.set(wallCenter.x, wallCenter.y, wallCenter.z);
            // console.log(" поставили на 00 ");
            break;
        case "15 00":
            wallCenter = {
                x: katet / 2 + Number(wall.dots.z),
                y: wallYposition,
                z: katet2 / 2 + Number(wall.dots.x),
            };
            // console.log(" установили на 15 00", wall.id);
            build.position.set(wallCenter.x, wallCenter.y, wallCenter.z);
            break;
        case "18 00":
            // wallCenter = {
            //   x: katet / 2 + Number(wall.dots.z),
            //   y: wallYposition,
            //   z: katet2 / 2,
            // };
            build.position.set(
                katet / 2 + Number(wall.dots.z2),
                wallYposition,
                katet2 / 2 + Number(wall.dots.x)
            );
            // console.log(" угол на 18");
            break;
        case "21 00":
            build.position.set(
                katet / 2 + Number(wall.dots.z2),
                wallYposition,
                Number(wall.dots.x) - katet2 / 2
            );
            // console.log(' ставим на 21', wall.dots)
            break;
        default:
            build.position.set(0, 2, 0);
            break;
    }
};

// катеты сторон

const getСathetus = (wall, axic) => {
    if (axic === "x") {
        return Math.abs(wall.x2 - wall.x);
    }
    if (axic === "z") {
        return Math.abs(wall.z2 - wall.z);
    }
};

const findDirectionWall = (wall) => {
    directionAngle = 0;
    hideSide = getСathetus(wall.dots, "x");
    halfSide = getСathetus(wall.dots, "z");
    wallLength = getHypotenuse(hideSide, halfSide);
    // формула нахождения угла поворота
    let res = halfSide / hideSide;
    // угол равен нулю
    if (res === Infinity && wall.dots.z2 > wall.dots.z) {
        acuteAngle = 0;
        directionAngle = "00";
        // console.log(" угол наклона 0", wall.id, wall.dots);
    }
    // угол 90 градусов
    else if (wall.dots.x2 > wall.dots.x && wall.dots.z === wall.dots.z2) {
        acuteAngle = -1.5708;
        directionAngle = "15 00";
        //  console.log(wall.id, " угол 90 градусов");
    }
    // если угол на 14 часов
    else if (wall.dots.z < wall.dots.z2 && wall.dots.x < wall.dots.x2) {
        acuteAngle = Math.atan(res) + 3.14159 + 1.5708;
        directionAngle = "12-15";
        // console.log(wall.id, " угол на 14 часов");
    } else if (wall.dots.z > wall.dots.z2 && wall.dots.x2 > wall.dots.x) {
        // 180 граусов плюс 90 => развернутый угол
        acuteAngle = 4.71238898038 - Math.atan(res); // 4 014
        directionAngle = "15-18";
    } else if (wall.dots.x > wall.dots.x2 && wall.dots.z2 === wall.dots.z) {
        acuteAngle = 1.5708;
        directionAngle = "21 00";
        //  console.log("на 21 час", wall.id);
    }
    // если стена перевернута и рисуется сверху вних
    else if (wall.dots.x === wall.dots.x2 && wall.dots.z > wall.dots.z2) {
        acuteAngle = 3.14159265359;
        directionAngle = "18 00";
        //  console.log("res", res, "эперевернули ", wall.id);
    }
    // если угол на 11 утра
    else if (wall.dots.z < wall.dots.z2 && wall.dots.x > wall.dots.x2) {
        acuteAngle = -Math.atan(res) + 1.5708;
        //  console.log(wall.id, " угол на 11 утра ");
        directionAngle = "21-24";
    }

    // если угол на 19вечера
    else if (wall.dots.x > wall.dots.x2 && wall.dots.z > wall.dots.z2) {
        acuteAngle = Math.atan(res) + 1.5708;
        //  console.log(wall.id, " угол на 19 вечера ");
        directionAngle = "18-21";
    } else {
        console.log(" не попали в перебор с координатами ");
    }
};

const getHypotenuse = (katet, katet2) => {
    let sum = Math.pow(katet, 2) + Math.pow(katet2, 2);
    return Math.sqrt(sum);
};

const getTextures = (wall, length) => {
    let textureList = []

    wall.textures.forEach((el, ind) => {
        if (ind < 2) {
            textureList.push(loadTextureForBox(el, length, wall.height))
        }
        textureList.push(loadTextureForBox(el, length, wall.height))
    });
    return textureList
};
const Wall = (wall) => {
    var building;
    findDirectionWall(wall);
    rotateAngle = acuteAngle;
    let texturesList = getTextures(wall, wallLength);
    building = new THREE.Mesh(
        new THREE.BoxGeometry(wallLength, wall.height, wall.width),
        texturesList
    );

    building.userData.rotate = rotateAngle;
    
    building.userData.size = {
        width: +building.geometry.parameters.width,
        height: +building.geometry.parameters.height,
        depth: +building.geometry.parameters.depth,
    };
    building.rotation.y = rotateAngle;

    setPosition(building, wall, halfSide, hideSide, directionAngle);

    return building;
};
export default Wall;

// function cutHole(obj, x, y, x2, y2, x3, y3, x4, y4, x5, y5) {
//     var width = obj.userData.size.width * 0.5;
//     var height = obj.userData.size.height * 0.5;
//     var depth = obj.userData.size.depth * 0.5;

//     var shape = new THREE.Shape();
//     shape.moveTo(-width, height);
//     shape.lineTo(-width, -height);
//     shape.lineTo(width, -height);
//     shape.lineTo(width, height);
//     shape.lineTo(-width, height);

//     var hole = new THREE.Path();

//     hole.moveTo(x, y); // 2.5 0.5
//     hole.lineTo(x2, y2); // 2.5 -.5
//     hole.lineTo(x3, y3); // 3.5 -.5
//     hole.lineTo(x4, y4); // 3.5 .5
//     hole.lineTo(x5, y5); // 2.5 0.5

//     shape.holes.push(hole);

//     var extrudeSettings = {
//         amount: depth * 2,
//         bevelEnabled: false,
//     };

//     var extrudeGeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
//     extrudeGeometry.translate(0, 0, -depth);
//     obj.geometry.dispose();
//     obj.geometry = extrudeGeometry;
// }

// проверка на прямой угол - если х второй точки такой же как первый = это прямой угол
// вычисляем угол не 90 градусов - берем гипотенузу треугольнка, катет делим на гипотензу, потом это делим на противополодный катет и от него делаем арксинус - будут радианыы