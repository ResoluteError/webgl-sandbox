import { Object2D } from "./objects/Object2D";
import { GameLoop } from "./game/GameLoop";
import { ShaderProgram } from "./opengl/shaders/ShaderProgram";
import { TranslateAnimation } from "./objects/Animation";
import { Camera } from "./game/Camera";
import { vec3 } from "gl-matrix";
import { Object3D } from "./objects/Object3D";

async function getHeart(
  gl: WebGL2RenderingContext,
  shaderProgram: ShaderProgram,
  red: boolean
) {
  const heart = new Object3D(gl, shaderProgram);
  heart.setVertexPositions([
    [-1, 0.5, 0],
    [-0.5, 1, 0],
    [0, 0.5, 0],
    [0.5, 1, 0],
    [1, 0.5, 0],
    [0, -1, 0],
    [-0.5, 0.5, 0.2],
    [0, 0.15, 0.3],
    [0.5, 0.5, 0.2],
    [-0.5, 0.5, -0.2],
    [0, 0.15, -0.3],
    [0.5, 0.5, -0.2],
  ]);
  heart.setVertexColors([
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0.5, 0, 0, 1],
    [0.5, 0, 0, 1],
    [0.5, 0, 0, 1],
    [0.5, 0, 0, 1],
    [0.5, 0, 0, 1],
    [0.5, 0, 0, 1],
    [0.5, 0, 0, 1],
  ]);
  heart.setIndex([
    0, 1, 6, 1, 2, 6, 2, 7, 6, 6, 7, 5, 6, 5, 0, 2, 3, 8, 3, 4, 8, 8, 4, 5, 7,
    8, 5, 2, 8, 7, 0, 1, 9, 1, 2, 9, 2, 10, 9, 9, 10, 5, 9, 5, 0, 2, 3, 11, 3,
    4, 11, 11, 4, 5, 10, 11, 5, 2, 11, 10,
  ]);
  return heart;
}

document.addEventListener("DOMContentLoaded", async function () {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;
  try {
    var gameLoop = new GameLoop(60, canvasEle);

    const redHeart = await getHeart(
      gameLoop.getGL(),
      gameLoop.getShaderProgram(),
      true
    );

    const camera = new Camera(0.1, 1, true, 0, 0, -5.0);

    gameLoop.addCamera(camera);

    gameLoop.addObjectToScene(redHeart);

    // redHeart.scaleBy(2, 1000, 1000);
    // redHeart.translateBy(vec3.fromValues(5, 0, 0), 1000, 1000);
    // redHeart.translateBy(vec3.fromValues(-5, 0, 0), 1000, 2000);
    // setTimeout(() => {
    window.setInterval(() => {
      redHeart.rotateBy(Math.PI, vec3.fromValues(0, 1, 0), 1000, 0);
    }, 1000);
    // }, 1100);

    gameLoop.start();
  } catch (err) {
    console.error(err);
  }
});
