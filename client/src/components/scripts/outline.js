// про обводку 
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
let composer, outlinePass, effectFXAA;
// настройки обводки для выделенной модели
const outlineParam = {
    edgeStrength: 3.0,
    edgeGlow: 1,
    edgeThickness: 1.0,
    pulsePeriod: 0,
    usePatternTexture: false
};
function initOutlineComposer(scene, camera, renderer) {
    composer = new EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        scene,
        camera
    );
    composer.addPass(outlinePass);
    effectFXAA = new ShaderPass(FXAAShader);

    effectFXAA.uniforms["resolution"].value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
    );
    composer.addPass(effectFXAA);
    renderer.domElement.style.touchAction = "none";
    outlinePass.edgeStrength = outlineParam.edgeStrength;
    outlinePass.edgeGlow = outlineParam.edgeGlow;
    outlinePass.edgeThickness = outlineParam.edgeThickness;
    outlinePass.visibleEdgeColor.set(outlineParam.visibleEdgeColor);
    outlinePass.hiddenEdgeColor.set(outlineParam.hiddenEdgeColor);
}
export { initOutlineComposer, composer, outlinePass, effectFXAA}