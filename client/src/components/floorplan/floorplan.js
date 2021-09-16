// импорты для React-redux 
import React, { useRef, useEffect, useState } from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import { bindActionCreators } from "redux";
import * as actions from "../../actions";
// импорт сокета
import io from 'socket.io-client';
// испорты для three.js 
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { InteractionManager } from "three.interactive";
// настройки камеры 
import {
  setCameraPosition,
  cameraControlsEnable, cameraControls, initControls, changeMovingCamera
} from "../scripts/camera.js";
import { initOutlineComposer, composer, outlinePass } from "../scripts/outline";
// импорты отдельных компонентов 
import Wall from "../wall";  // рисует стену по координатам 
// вспомогательные функции, упрощающие взаимодействие с three js - поиск объектов, нахождение пересечения при движении, установка света
import {
  setSceneColor, // объявляем сцену
  initPointLight, // свет 
  initRenderer,
  findModel,
  isCollision, // проверка на пересечение моделей
  getMouseCoord,// получаем координаты мыши
  hideAxesTransformConrol, // скрыть стрелки для движения/вращения
  replaceModelFromCollision, // возращает обновленный массив после удаления элемента
  replaceElemFromArr, // возможно повторяется, почистить
  changeVisibility, changeTextureWall, // замена текстуры и видимости 
  getChangeTextureFloor, // задает текстуру для пола 
  removeAllHightLight, //  очищает все выделенные элементы 
  onWindowResize, // при измененииразмера окна задает корректные размеры сцене 
  addFloor, // рисует сложную форму пола/потолка 
} from "../scripts/initBasicScene.js";

const socket = io('http://localhost:7000') // объявление сокета 

const floorY = 0; // позиция для пола по Y 
const scene = new THREE.Scene(); // инициализация сцены
const manager = new THREE.LoadingManager(); // менеджер загрузки, нужен для отображния % загрузки текстур и 3d моделей 

let
  cameraPersp, // инициализация камеры
  renderer, // обновление three js, встроенное 
  checkCollisionModels,// массив всех объектов для пересечения
  control, // инициализация стрелок поворота или движения
  gltfLoader, //встроенные загрузчики моделей
  fbxLoader,
  objLoader,

  // флаги для обновлений после изменения store через useEffect - костыль
  updateForAddFurnishingWall,
  updateUseEffectForDrag,
  updateUseEffectForRotate,
  updateUseEffectCameraPanorama,
  updateUseEffectCameraDefault,
  updateUseEffectTexture,
  updateUseEffectTexture__floor,
  updateUseEffectInstrum,
  updateUseEffectListClick,
  updateUseEffectLock,

  axesHelper, // линии показывающие направление осей
  clock, // используется для обновления обводки модели
  selectedObjects, // массив для обводки
  outlinedArr, // массив для обводки
  movingStatus, // статус стрелок 
  needOutline, // статус обводки 
  raycaster, // для отлавливания клика по поверхностям
  clickList,// массив эл-тов доступных для клика через raycaster

  transformControledModel, // текущая модель со стрелками 
  mouse, // инициализация мыши 
  cameraStatus; // камера в режиме руки или стрелки 

initGlobalLets(); // присваеваем глобальным переменным значения для three js 
initUseEffects(); // для перерендера после изменения state - костыль 

// глобальные переменные для диспатчеров
let dispatchGlobalSelectWall, // выбор активной стены 
  dispatchGobalSelectSurface, // выбор пола 
  dispatchGlobalResetSelectedModel,  // сброс активной модели
  dispatchGlobalChangePositionModel,  // отправка позиции и поворота модели после изменений
  dispatchGlobalSelectModel,  // выбор активной модели
  dispatchGlobalPercentLoad; // % загрузки 

const canvas = renderer.domElement;
let ref; // ссылка на канвас для управления 

// отлавливает клик по модели 
let clickManager = new InteractionManager(
  renderer,
  cameraPersp,
  renderer.domElement
);
let needArrow = true; // флаг для стрелок при перемещении 


/* TODO - улучшения " на потом " 
find model заменить переменной useState? чтобы при клике записывать текушую модель  
в selectwall не делать перебор, а отправлять данные на пряямую из  юзердата
добавлять новю генераци. id для новой моддели
resetSelectedModel переименовать в resetSelectedActive - сброс стен и пола тоже
*/


const FloorPlan = ({
  project_1, // текущая планировка  со стенами, мебелью и тд из стора 
  camera, // статус камеры - рука или стрелка 
  // диспатчи для изменения стора, описание выше в глобальных переменных
  dispatchChangePositionModel,
  dispatchSelectWall,
  dispatchSelectModel,
  dispatchSelectSurface,
  dispatchResetNewModel,
  dispatchResetSelectedModel,
  dispatchPercentLoad,
  activeObject, // объект, по которому кликнули - выделенный через сцену 
  dispatchResetLockModel, // сброс блокировки 
  activeInList, // объект, по которому кликнули через список слева
}) => {
  cameraStatus = camera.status;
  // массивы мебели, стен, пола из стора 
  const { furniture_floor, walls, floor } = project_1;
  ref = useRef();

  /* 
  как раньше работало обновление - делалась проверка на существование в store опред. свойств, если они были, запускался useEffect . функции, начинающиеся с checkUpdate - это проверка, нужно ли это обновление.

  сейчас на socket я проверяю только событие, так что скорее всего множественные useState удалятся из-за ненадобности
  */
  const [addFurnishingsWall, setAddFurnishingsWall] = useState(null);
  const [moveModel, setMoveModel] = useState(null);
  const [rotateModel, setRotateModel] = useState(null);
  const [cameraPanorama, setCameraPanorama] = useState(null);
  const [cameraDefault, setCameraDefault] = useState(null);
  const [changeTexture, setChangeTexture] = useState(null);
  const [changeTextureFloor, setChangeTextureFloor] = useState(null);
  const [resetInstr, setResetInstr] = useState(null);
  const [clickListModel, setClickListModel] = useState(null);

  updateDispatches(); // локальные диспатчеры в глобальные

  // проверка, нужно ли обновление при изменении store
  checkUpdateForAddFurnishingWall(); // для добавления картин, переделется 
  checkUpdateForCameraPanorama();// изменние статуса камеры на "руку"
  checkUpdateForCameraDef();// изменние статуса камеры в стрелку 
  // checkUpdateTexture__wall(); // меняем текстуру стен 
  // checkUpdateTexture__floor(); // текстуру пола 
  checkUpdateInstrum();// меняем  статус стрелок - поворот или движение? 
  checkUpdateForMovingModel(); //  двигаем ли модель 
  checkUpdateForRotateModel(); // поворачиваем ли модель 
  checkUpdateClickListModel(); // кликнули ли по списку слева 


  // отрисовывает сцену,  свет, стенs, пол, моделей
  useEffect(() => {
    main(); // рисуем сцену, свет и тд
    // рисуем стены, пол, мебель,  получаем  из пропсов их массив 
    addWalls(walls);
    addFloor(floor, clickList, scene); // рисуем пол 
    addFurnitureFloor(furniture_floor); // добавляем мебель 

    // над этим работаю, тестовое 
    // нельзя переносить загрузку моделей в другой файл
    // loadFurnishingsWall(furnishingsWall)
  }, []);// eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => { // ловит событие  из server.js, payload - объект, поставляемый функцией socket.emit из компонента modalwindow
    socket.on('addModel', payload => {
      loadModel(payload);
    });

  }, []);
  // ловит событие  из floorPlane.js , когда заканчивается перемещение/поворот  
  useEffect(() => {
    socket.on('getNewPosition', payload => {
      let m = findModel(scene.children, payload);
      const { x, z } = payload.dots;
      console.log(payload.dots, 'dots')
      m.position.set(+x, 0, +z)
      m.rotation.y = +payload.rotate;
      dispatchGlobalChangePositionModel(payload);  // отправляет изменение в стор 
    });

  }, []);


  const findWall = (arr, elem) => { // найти стену на сцене 
    let wall;
    arr.forEach(el => {
      if (el.userData.type === 'wall' && el.userData.id === elem.id) {
        wall = el
      }
    });
    return wall
  }

  //  перемещение
  useEffect(() => {
    // если изменился или добавился вид стрелок, рисуем стрелки
    if (activeObject.action === "drag" && updateUseEffectForDrag) {

      movingStatus = "drag";
      showAxesControl(activeObject.action, control, activeObject, 'uf drag');
    }
  }, [moveModel]);  // eslint-disable-line react-hooks/exhaustive-deps

  function checkUpdateForMovingModel() { // если в панели инструментов выбраны стрелки для перемещения и если активная модель не заблочена
    if (
      activeObject.action === "drag" &&
      updateUseEffectForDrag === false && !activeObject.selectedModel.locked

    ) {
      setMoveModel(moveModel + 1);
      updateUseEffectForDrag = true; // тут изменить, рендер компонента дважды
      updateUseEffectForRotate = false;

    }
  }
  // добавляем вращение
  useEffect(() => {
    if (activeObject.action === "rotate") {
      movingStatus = "rotate";
      showAxesControl(activeObject.action, control,
      );

    }
  }, [rotateModel]);  // eslint-disable-line react-hooks/exhaustive-deps

  function checkUpdateForRotateModel() {  // проверка, нужно ли добавить  вращение

    if (
      activeObject.action === "rotate" &&
      updateUseEffectForRotate === false
    ) {
      setRotateModel(rotateModel + 1);
      updateUseEffectForRotate = true;
      updateUseEffectForDrag = false;
    }
  }

  useEffect(() => { // ловит событие сокета из ModalConfirm
    socket.on('deleteModel', payload => {
      const { model } = payload;
      deleteModelFromScene(model); // удаляем модель со сцены
    });
  }, []);

  // ловит изменение видимости модели из списка слева 
  useEffect(() => {
    socket.on('changeVisible', payload => {

      let model = changeVisibility(scene.children, payload);
      let updateCheckCollision = [];

      if (!payload.visible) { // удаляем модель из массива пересечений 
        updateCheckCollision = replaceElemFromArr(checkCollisionModels, payload.id);
        checkCollisionModels = updateCheckCollision;
        // скрываем стрелки
        hideAxesTransformConrol(control)
      } else { // если модели возвращаем видимость 

        checkCollisionModels.push(model);
        // если модель была кликнута , добавим обработчик стрелок  (если нужно)
        if (payload === activeObject.selectedModel) {
          addTransformControl(model) // тут возможно изменить на control.visible, нужно посмотреть 
        }
      }

    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps


  // замена модели
  useEffect(() => {
    // ловим событие из modal window, payload - заменяемый и новый объект 
    socket.on('replaceModel', payload => {
      replaceModelToScene(payload)
    });
    // 
  }, []);

  // замена текстуры 
  useEffect(() => {
    socket.on('changeTexture', payload => {
      getChangeTextureFloor(payload, scene);
    });
  }, []);


  // будет переписываться на сокет, не смотрим 
  // если добавляем плоские предметы 
  useEffect(() => {
    if (activeObject.newFurnishings.id && activeObject.isSave && updateForAddFurnishingWall) {
      // loadModel(activeObject.newModel);
      loadNewFurniships(activeObject)
      updateForAddFurnishingWall = false;
      dispatchResetNewModel(); // после загрузки модели сбрасываем выбранну. модели в модалке
      console.log(' фурнитура');
    }

  }, [addFurnishingsWall]);  // eslint-disable-line react-hooks/exhaustive-deps
  // будет переписываться на сокет, не смотрим 
  function checkUpdateForAddFurnishingWall() {
    if (activeObject.newFurnishings.id && updateForAddFurnishingWall === false && activeObject.isSave && activeObject.typeOfChange === 'add_furnishings_wall') {
      setAddFurnishingsWall(addFurnishingsWall + 1);
      updateForAddFurnishingWall = true;
    }
  }

  // режим камеры - панорама
  useEffect(() => {
    if (camera.status === "panorama") {
      changeMovingCamera(camera.status);
      updateUseEffectCameraPanorama = false;
    }
  }, [cameraPanorama]);  // eslint-disable-line react-hooks/exhaustive-deps

  function checkUpdateForCameraPanorama() {
    if (camera.status === "panorama" && updateUseEffectCameraPanorama === false) {
      setCameraPanorama(cameraPanorama + 1);
      updateUseEffectCameraPanorama = true;
    }
  }

  // режим камеры - по умолчанию 
  useEffect(() => {
    // console.log(" камера по ум");
    if (camera.status === "default" && updateUseEffectCameraDefault) {
      updateUseEffectCameraDefault = false;
      changeMovingCamera(camera.status);
    }
  }, [cameraDefault]);  // eslint-disable-line react-hooks/exhaustive-deps

  function checkUpdateForCameraDef() {
    if (camera.status === "default" && updateUseEffectCameraDefault === false) {
      setCameraDefault(cameraDefault + 1);
      updateUseEffectCameraDefault = true;
    }
  }

  // обновление текстуры для стен, переделается на сокет 
  useEffect(() => {
    if (updateUseEffectTexture) {
      // console.log(" меняем текстуру в юз эф   ");
      updateUseEffectTexture = !updateUseEffectTexture;

      changeTextureWall(activeObject.wall, activeObject.newTexture, scene);
      dispatchResetSelectedModel();
    }
  }, [changeTexture]);// eslint-disable-line react-hooks/exhaustive-deps


  // сброс стрелок для моделей
  useEffect(() => {
    if (updateUseEffectInstrum) {
      hideAxesTransformConrol(control);
      updateUseEffectInstrum = !updateUseEffectInstrum;
      movingStatus = null;
    }
  }, [resetInstr]);  // eslint-disable-line react-hooks/exhaustive-deps

  function checkUpdateInstrum() { // когда сняли выделение с инструмента в панели инструментов и нужно убрать стрелки 
    if (
      activeObject.action === "reset" &&
      updateUseEffectInstrum === false
    ) {

      setResetInstr(resetInstr + 1);
      updateUseEffectInstrum = true;
    }
  }

  // если выбрали модель по списку слева 
  useEffect(() => {
    const { selectedModel, wall, surface } = activeInList; // данные из стора 
    if (
      (activeInList.selectedModel?.id || activeInList.wall?.id || activeInList.surface?.id) &&
      updateUseEffectListClick
    ) {
      // надо подумать как упростить этот блок 
      let active;
      let activeObj;
      // проверка на тип объекта, которому нужно дать подсветку 
      if (selectedModel?.id) {
        active = selectedModel
        activeObj = findModel(scene.children, active);
      } else if (wall?.id) {
        active = wall
      } else if (surface?.id) {
        active = surface
        activeObj = findSurface(scene.children, active);
      } else {
        console.log(' не нашли тип активного в списке');
      }
      onSelectModel(activeObj, 'modelList');
      updateUseEffectListClick = false;
    }
  }, [clickListModel]);  // eslint-disable-line react-hooks/exhaustive-deps

  function checkUpdateClickListModel() { // был ли клик по списку слева
    if (
      (activeInList.selectedModel?.id || activeInList.wall?.id || activeInList.surface?.id) &&
      updateUseEffectListClick === false
    ) {

      setClickListModel(clickListModel + 1);
      updateUseEffectListClick = true;
    }
  }

  // блокировка модели
  useEffect(() => {
    socket.on('getLock', payload => {
      const { model, active } = payload;
      getChangeLock(model, active);

    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // меняем блокировку стрелок 
  function getChangeLock(payload, isActive) {
    //isActive - является ли он активным в сцене или мы кликнули в список, не активируя его, лишь меняя lock
    let model = findModel(scene.children, payload);
    model.userData.locked = !model.userData.locked; // меняются значения - locked - не заблокирована, locked===false - заблокированна 

    // если блочим модель, которая выделенная у меня 
    if (isActive) {

      if (!payload.locked) { // если заблочена 
        hideAxesTransformConrol(control);
      } else {
        addTransformControl(model);
      }
    } else if (transformControledModel?.userData.id === payload.id) {  // если блочим модель, которая у кого то выделена, но не у меня 

      if (!payload.locked) { // если заблочена 
        hideAxesTransformConrol(control);
      } else {
        addTransformControl(transformControledModel);
      }
    }
  }


  function updateDispatches() { // для передачи локального dispach в addEventListener внешний
    dispatchGlobalSelectWall = dispatchSelectWall;
    dispatchGobalSelectSurface = dispatchSelectSurface;
    dispatchGlobalChangePositionModel = dispatchChangePositionModel;
    dispatchGlobalSelectModel = dispatchSelectModel;
    dispatchGlobalResetSelectedModel = dispatchResetSelectedModel;
    dispatchGlobalPercentLoad = dispatchPercentLoad
  }
  return (
    <>
      <div className="canvas" ref={ref} />
    </>
  );
};

const mapStateToProps = (state) => {

  const { project_1,
    changingModels,
    currentModel,
    addedModel,
    camera,
    modal,
    activeObject,
    modalForConfirm, activeInList,
  } = state.main

  return {
    project_1,
    changingModels,
    currentModel,
    addedModel,
    camera,
    modal,
    activeObject,
    modalForConfirm, activeInList,
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...actions,
  }, dispatch);
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  FloorPlan
);

// отправляет % загрузки модели в store 
function countPercent(loaded, all) {
  // let res = Math.round(loaded / all * 100);
  // dispatchGlobalPercentLoad(res)
}
// отлавливает % загрузки и ошибки 
manager.onProgress = function (itemsLoaded, itemsTotal) {
  countPercent(itemsLoaded, itemsTotal)
};
manager.onError = function (url) {
  console.log('There was an error loading ' + url);
};


//  перенести в др файл 
function addWalls(arr) {
  // тут решить вопрос с правильным поворотом груп - перепутала угол поворота
  arr.forEach((wall) => {
    let addedWall = Wall(wall);

    addedWall.userData = {
      ...addedWall.userData,
      id: wall.id,
      name: wall.name,
      type: "wall", // type нужен для отслеживания кликов при использовании raycaster, при отправке инфы в стор
      click: 0, // счетчик кликов для снятия выделения
    };
    addedWall.material.side = THREE.DoubleSide; // видимость текстур с 2х сторон 
    clickList.push(addedWall); 
    scene.add(addedWall);
  });
}

function addFurnitureFloor(arr) { // добавляет 3d модели на пол
  arr.forEach(el => {
    loadModel(el);
  });
}


function getLoader(url) { // определяет, какой тип загрузчика использовать в зав-ти от формата 
// попробовать перенести в др файл 
  let type = url.match(/\.[0-9a-z]{1,5}$/);
  switch (type[0]) {
    case ".fbx":
      return fbxLoader;
    case ".glb": return gltfLoader;
    case ".gltf": return gltfLoader;
    case ".obj": return objLoader;
    default: return gltfLoader;
  };

}

function loadModel(data) {
  const { url, dots, rotate } = data;

  getLoader(url).load(`${url}`, (gltf) => {
    let root = gltf.scene;

    if (dots) { // при замене модели сохраняем координты прошлой модели
      const { x, z } = dots;
      root.position.set(Number(x), Number(floorY), Number(z));
      root.rotation.y = rotate;
    } else { // координаты по умолчанию, если добавляем новую модель 
      root.position.set(0, floorY, 0);
    }
    root.userData = {
      ...root.userData, ...data,
      click: 0,
      subType: 'furniture_floor'
    };

    scene.add(root);
    // выбивало ошибку при удалении моделей, делаем проверку на то, состоит ли в сцене модель
    if (root.parent && root.visible) {
      // на mousedown, потому что одновременно с кликом по модели срабатывал клик по стрелкам при переносе и стрелки / выделение модели  исчезали. на mousedown для стрелок устанавливается active = true, что предотвращает лишнюю обработку клика по модели 
      root.addEventListener("mousedown", () => onSelectModel(root));
      clickManager.add(root);
      checkCollisionModels.push(root);
      clickList.push(root);
      outlinedArr.push(root);
    }
  }
  );
}
// пока в доработке 
const loadFurnishingsWall = (arr) => {
  arr.forEach(el => {
    // load(el)
  });

}

// реакция на клик модели => подсветка и добавление стрелок  transform control, отправление в стор информации о выделенной мрдели 
function onSelectModel(root) {
  // если модель видима, сущетвует в сцене и камера не рука - даем подсветку
  // !control.userData.active - флаг, который предотвращает клик по стрелкам, когда кликаешь по самой модели

  if (root?.visible && root.parent && cameraStatus !== 'panorama' && !control.userData.active) {
    root.userData.click += 1; // счетчик кликов для снятия / добавления обводки и стрелок 
    highlightModel(root);
    // если это 3d модель, не заблочена и если ей нужны стрелки 
    if (needArrow && !root.userData.locked && (root.userData.type !== "wall" && root.userData.type !== "floor")) {

      transformControledModel = root; // задаем текущий объект для для добавления стрелок 
      addTransformControl(root);
    } else {
      // console.log(' скрываем остальные  стрелки');
      hideAxesTransformConrol(control)
    }
  }

}
// в доработке 
function onSelectModel2(root, status) {
  if (root?.visible && root.parent && cameraStatus !== 'panorama' && !control.userData.active) {
    root.userData.click += 1;
    highlightModel(root, status);
    // если это модель,  не заблочена и если ей нужны стрелки 
    if (needArrow && !root.userData.locked && (root.userData.type !== "WALL" || root.userData.type !== "floor")) {
      transformControledModel = root;
      addTC2(root);
    } else {
      // console.log(' скрываем остальные  стрелки');
      hideAxesTransformConrol(control)
    }
  }

}

// удаляем модель со сцены
function deleteModelFromScene(modelLson) {
  let model = findModel(scene.children, modelLson);
  model.material = undefined;
  model.geometry = undefined;
  // надо чтобы three js не ловил ошибки 
  model.traverse(function (obj) {
    if (obj.type === 'Mesh') {
      obj.geometry.dispose();
      obj.material.dispose();
    }
  })
  //  снимаем обработчики
  model.removeEventListener("click", () => onSelectModel(model));
  scene.remove(model);
  // обновляем массив для пересечений
  checkCollisionModels = replaceModelFromCollision(checkCollisionModels, modelLson.id)
  control.detach(); // убираем стрелки
}

// для перерендера после изменения state - костыль 
function initUseEffects() {
  updateForAddFurnishingWall = false;
  updateUseEffectForDrag = false;
  updateUseEffectForRotate = false;
  updateUseEffectCameraPanorama = false;
  updateUseEffectCameraDefault = false;
  updateUseEffectTexture = false;
  updateUseEffectTexture__floor = false;
  updateUseEffectInstrum = false;
  updateUseEffectLock = false;
  updateUseEffectListClick = false;
}
function initGlobalLets() {

  cameraPersp = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  cameraPersp.position.set(0, 0, 8);
  raycaster = new THREE.Raycaster(); // считывает пересечения при клике 
  mouse = new THREE.Vector2(); // координаты мыши
  renderer = new THREE.WebGLRenderer({ antialias: true });
  checkCollisionModels = []; // массив всех объектов для пересечения
  control = new TransformControls(cameraPersp, renderer.domElement); //  стрелки моделей
  gltfLoader = new GLTFLoader(manager); // загрузчики моделей и текстур
  fbxLoader = new FBXLoader();
  objLoader = new OBJLoader();
  axesHelper = new THREE.AxesHelper(15); // показывает линии направлений x y z  красная линия - ось x
  scene.add(axesHelper)

  movingStatus = null; // для сброса стрелок при движении 
  clock = new THREE.Clock();
  clickList = []; // список стен доступных для клика
  selectedObjects = []; // для обводки
  outlinedArr = []; // обводка
}

// нельзя переносить
// показывает стрелки в зависимости от вида перемещения 
const showAxesControl = (typeOfChange, control) => {
  if (typeOfChange === "drag") {
    updateUseEffectForDrag = false;
    control.setMode("translate");
    control.showY = false;
    control.showX = true;
    control.showZ = true;
  } else if (typeOfChange === "rotate") {
    updateUseEffectForRotate = false;
    control.setMode("rotate");
    control.showX = false;
    control.showZ = false;
    control.showY = true;
  } else {
    hideAxesTransformConrol(control);
  }
};




function addSelectedObject(object) { // для обведения модели
  selectedObjects = [];
  selectedObjects.push(object);
}

// привязка стрелок к модели
function addTransformControl(model) {

  if (model.parent && !model.userData.locked) {
    // текущая позиция, нужна  для пересечений 
    model.userData.currentPosition = new THREE.Vector3();

    control.addEventListener("change", render);
    control.addEventListener("mouseDown", () => {
      control.userData.active = true; // флаг, предотвращает клик по модели в момент переноса 
    });
    // при перетягивании
    control.addEventListener(
      "objectChange",
      function (el) {
        isCollision(el, checkCollisionModels); // не сталкиваются ли модели друг с другом?
        el.target.children[0].object.userData.currentPosition.copy(
          el.target.children[0].object.position
        );
      },
      false
    );
    control.addEventListener(
      "dragging-changed",
      (event) => cameraControlsEnable(event, cameraControls), // блокируем камеру
      false
    );

    control.addEventListener( // по завершении движения меняем флаг, чтобы клики по модели срабатывали 
      "dragging-changed", () => {
        control.userData.active = false;
      }
    );

    control.userData.name = "transformControl";
    scene.add(control);
    showAxesControl(movingStatus, control); // вид стрелок и их направление 
    control.attach(model);
  }

}
// для картин, пока не трогаем, в доработке 
function addTC2(model) {
  console.log(' addTC2');
  model.userData.currentPosition = new THREE.Vector3();
  // реагирует на все изменения 
  control.addEventListener("change", render);
  control.addEventListener("mouseDown", () => {
    control.userData.active = true;
  });
  // при перетягивании
  control.addEventListener(
    "objectChange",
    function (el) {
      isCollision(el, checkCollisionModels);
      el.target.children[0].object.userData.currentPosition.copy(
        el.target.children[0].object.position
      );
    },
    false
  );
  control.addEventListener(
    "dragging-changed",
    (event) => cameraControlsEnable(event, cameraControls),
    false
  );

  control.addEventListener(
    "dragging-changed", () => {
      control.userData.active = false;

    }
  );

  control.userData.name = "transformControl";
  control.showX = true;
  control.showZ = false;
  control.showY = true;

  scene.add(control);
  control.attach(model);
}
const isChangePosition = (el) => { // поменялось ли положение элемента на сцене после перемещения 
  const { x, z } = el.userData.currentPosition;
  if (x !== 0 && z !== 0) {
    return true
  }
}

function sendPosition(event, model) { // вызывает событие сокета после изменения позиции   
  model.userData.click = 2; // после переноса чтобы подсветка могла пропасть
  let { x, z } = event.target._plane.object.userData.currentPosition;
  model.userData.dots = event.target._plane.object.userData.currentPosition;

  let modelInfo = {
    dots: { x, z },
    rotate: event.target._plane.object.rotation.y,
    id: event.target._plane.object.userData.id,
  };
  if (isChangePosition(model)) {
    socket.emit('getNewPosition', modelInfo)
  }
}
// скрыть стрелки, не удаляя
function hideTransformControl(model) {
  control.visible = false;
  model.userData.click = 0;
}
function findSurface(arr, active) { // вспомогательные функции поиска пола 
  let elem;
  arr.forEach((el) => {
    if (el.type === "Mesh" && el.userData.type === active.type && el.userData.id === active.id) {
      elem = el;
    }
  });
  return elem;
}

function isModel(model) {
  if (model.userData.subType === 'furniture_floor') {
    return true
  }
}
function isSurface(model) {
  if (model.userData.type === 'floor') {
    return true
  }
}
function isWall(model) {
  if (model.userData.type === 'wall') {
    return true
  }
}
function isSelected(model) {
  if (model.userData.selected) {
    return true
  } else {
    return false
  }
}
// подсвечивает модель, отправляет в стор выделенную
function highlightModel(model) {

  if (cameraStatus !== 'panorama') { // предотвращаем выделение, если камера в режиме руки 
    // если клик не четный и если модель уже не была выбранна
    if (model.userData.click % 2 > 0 && isSelected(model) === false) {
      // какой диспач для выделения в сторе отправляем? - выделяем мебель, стену или пол?
      if (isModel(model)) {
        dispatchGlobalSelectModel(model.userData);

      } else if (isSurface(model)) {
        dispatchGobalSelectSurface(model.userData.id)

      }
      else if (isWall(model)) {
        dispatchGlobalSelectWall(model.userData)
      }
      removeAllHightLight(scene.children, model); // удалим предыдущие выделения эл-тов 
      // console.log(" добавляем подсветку, удаляя предыдущие ");

      // добавим выделение для текущего 
      needArrow = true;
      needOutline = true;
      model.userData.selected = true;
      addSelectedObject(model);
      outlinePass.selectedObjects = selectedObjects;
    } else if (isSelected(model)) { // клик по уже выбранной модели для снятия выделения 
      // удаляем активный элемент из стора 
      if (isModel(model)) {
        dispatchGlobalSelectModel(model.userData);
      } else if (isSurface(model)) {
        dispatchGobalSelectSurface(model.userData.id)
      } else if (isWall(model)) {
        dispatchGlobalSelectWall(model.userData)
      }
      // убираем обводку 
      needArrow = false;
      needOutline = false;
      hideTransformControl(model); // скрыть стрелки 
      model.userData.selected = false;
      movingStatus = null; // если нужно оставлять стрелки после снятия выделения - убрать null 
    }
  }

}
// загружаем модель с характеристиками старой 
function loadReplaceableModel(prev, next) {
  const { url, name, id } = next;
  getLoader(url).load(`${url}`, (gltf) => {
    let root = gltf.scene;
    root.userData = {
      ...prev,
      name: name,
      id: id,
      click: 0,
    };
    let { x, z } = prev.dots;
    root.position.set(Number(x), floorY, Number(z));
    scene.add(root);

    root.addEventListener("click", () => onSelectModel(root))

    clickManager.add(root);
    checkCollisionModels.push(root);
    checkCollisionModels = replaceElemFromArr(checkCollisionModels, prev.id);
    clickList.push(root);
    outlinedArr.push(root);

  })
}
// замена модели
function replaceModelToScene(payload) {
  loadReplaceableModel(payload.prev, payload.next); // загружаем новую модель на место старой
  deleteModelFromScene(payload.prev); // удаляем старую 
}

// в доработке
function load(el, active) {
  const { url, dots } = el

  const { x, y, z } = dots;
  getLoader(url).load(`${url}`,
    (model) => {
      model.scale.set(.01, .01, .01);
      model.position.set(Number(x), Number(y), Number(z));
      model.userData = {
        ...model.userData, ...el,
        click: 0,
      };
      scene.add(model);

      // addTC2(model);
      if (model.parent && model.visible) {
        model.addEventListener("mousedown", () => onSelectModel2(model));
        clickManager.add(model);
        checkCollisionModels.push(model);
        clickList.push(model);
        outlinedArr.push(model);
      }
    },

  );
}
// в доработке - добавление картин
function loadNewFurniships(el) {
  const { url } = el.newFurnishings;
  const { x, z, x2, z2 } = el.wall.dots;
  // тут нужно выводить по повороту стены, отправлять это значение в redux при создании стен 
  const y3 = el.wall.height;
  const x3 = x2 - x;
  const z3 = z2 - z;
  getLoader(url).load(`${url}`,
    (model) => {

      model.scale.set(.01, .01, .01);
      model.position.set(Number(x3), Number(y3), Number(z3));
      model.rotation.y = el.wall.rotate;

      model.userData = {
        ...model.userData, ...el,
        click: 0,
      };
      scene.add(model);

      // addTC2(model);
      if (model.parent && model.visible) {
        model.addEventListener("mousedown", () => onSelectModel2(model));
        clickManager.add(model);
        checkCollisionModels.push(model);
        clickList.push(model);
        outlinedArr.push(model);
      }
    },

  );
}

let clickIsDown = false; // для сброса руки при зажатой клавише alt 

//  для клика по стенам и полу
function onSelectSurface(event) {
  if (cameraStatus !== 'panorama') {
    clickIsDown = false;
    getMouseCoord(event, canvas, mouse); // текущие координаты мыши 

    raycaster.setFromCamera(mouse, cameraPersp);
    var intersects = raycaster.intersectObjects(clickList, true);
// перебор всех слоев моделей, стен и тд в массиве clickList  на сцене, которые пересекаются с лучом клика
    if (intersects.length > 0) {
      let event = intersects[0]; // первый пересекаемый элемент 

      if (event.object.userData.type === "floor") { // если клик по полу, дадим или уберем подсветку, отправим все в стор, скроем стрелки
        const root = intersects[0].object;
        if (!control.userData.active) {
          root.userData.click += 1;
          highlightModel(root, null);
          hideAxesTransformConrol(control);
        }
      } else if (event.object.userData.type === "wall" && !control.userData.active) { 
        // для стены делаем то же самое, + ловим индекс стены, по которой кликнули 
        let side = Math.floor(event.faceIndex / 2);
        intersects[0].object.userData.side = side;
        const root = intersects[0].object;
        root.userData.click += 1;
        highlightModel(root, null);
        hideAxesTransformConrol(control)
      }
    }

  } else {
    clickIsDown = true; // для возможности переключения режимов камеры при зажатом alt + click 
  }

}
//  ОБРАБОТЧИКИ СОБЫТИЙ, mouseUp и mouseDown- чтобы не пересекалось с кликом по поверхностям( стоит флаг)

const handlerDownAltKey = (e) => {
  e.preventDefault();
  if (cameraStatus === 'panorama' && clickIsDown && (e.code === 'AltRight' || e.code === 'AltLeft')) {
    changeMovingCamera('default')
  }
}
const handlerUpAltKey = (e) => {
  e.preventDefault();
  if (clickIsDown && (e.code === 'AltRight' || e.code === 'AltLeft')) {
    changeMovingCamera('panorama')
  } 
}
control.addEventListener("mouseUp", (event) => sendPosition(event, transformControledModel)); // обновляем в стор позицию элемента 
window.addEventListener("resize", () => onWindowResize(cameraPersp, renderer));
canvas.addEventListener("mousedown", onSelectSurface); // клик по полу или стенам 

// для возможности переключения режимов камеры при зажатом alt + click 
document.addEventListener('keydown', (e) => handlerDownAltKey(e));
document.addEventListener('keyup', (e) => handlerUpAltKey(e));
;


function main() {  // функции только для three js 

  init(); // рисуем сцену, камеру и тд 
  animate(); // анимируем 
}
function render() { // не переносится 
  renderer.render(scene, cameraPersp);
}
function init() {
  initRenderer(renderer);
  setSceneColor(scene);
  setCameraPosition(cameraPersp);
  initPointLight(scene);
  initControls(cameraPersp, renderer.domElement);
  initOutlineComposer(scene, cameraPersp, renderer); // для обводки
  ref.current.appendChild(renderer.domElement);
}

function animate() {

  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  const hasControlsUpdated = cameraControls.update(delta);
  clickManager.update();
  // для обводки
  if (hasControlsUpdated) {
    renderer.render(scene, cameraPersp);
    composer.render();
  } else if (needOutline) {
    composer.render();
  } else {
    renderer.render(scene, cameraPersp);
  }
}

export { clickManager, scene };
