import * as THREE from "three";
import CameraControls from "camera-controls";

function setCameraPosition(camera) {
    // var angle = 0;
    // var radius = 500;
    // width / - 2, width / 2, height / 2, height / - 2, 1, 1000
    // camera.position.set(8, 12, 1);
    // camera.position.set(-1, 4, 8);
    // camera.position.set(-1, 8, -10);

    camera.position.set(-1, 2, 4);

    //   camera.position.x = radius * Math.cos( angle );
    // camera.position.z = radius * Math.sin( angle );
    // camera.rotation.y = 90 * Math.PI / 180
    // camera.lookAt(0, 5, 5);
}
// для блокировки  камеры при перемещении элементов
function cameraControlsEnable(event, cameraControls) {
    cameraControls.enabled = !event.value;
}
let cameraControls;
function initControls(camera, el) {
    CameraControls.install({ THREE: THREE });
    cameraControls = new CameraControls(camera, el);
}
// настройка режимов камеры - рука или стрелка 
function changeMovingCamera(status) {
    cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
    status === "panorama"
        ? (cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK)
        : (cameraControls.mouseButtons.left = CameraControls.ACTION.ROTATE);
}
export {

    setCameraPosition, changeMovingCamera, initControls, cameraControlsEnable,
    cameraControls
}