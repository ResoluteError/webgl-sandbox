import { Object2D } from "./objects/Object2D";
import { GameLoop } from "./game/GameLoop";
import { ShaderProgram } from "./opengl/shaders/ShaderProgram";
import { TranslateAnimation } from "./objects/Animation";
import { Camera } from "./game/Camera";
import { vec3 } from "gl-matrix";

async function getHeart(
  gl: WebGL2RenderingContext,
  shaderProgram: ShaderProgram,
  red: boolean
) {
  const heart = new Object2D(gl, shaderProgram);
  heart.setVertexPositions([
    [-1, 0.5],
    [-0.5, 1],
    [0, 0.5],
    [0.5, 1],
    [1, 0.5],
    [0, -1],
  ]);
  await heart.setImageTexture(
    red ? "/resources/textures/red.jpeg" : "/resources/textures/blue.jpeg"
  );
  heart.setIndex([0, 1, 2, 2, 3, 4, 0, 4, 5]);
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
    const blueHeart = await getHeart(
      gameLoop.getGL(),
      gameLoop.getShaderProgram(),
      false
    );

    const camera = new Camera(0.1, 1, true, 0, 0, -5.0);

    gameLoop.addCamera(camera);

    gameLoop.addObjectToScene(blueHeart);
    gameLoop.addObjectToScene(redHeart);

    blueHeart.translateTo(vec3.fromValues(-5, -2, 0));
    blueHeart.translateBy(vec3.fromValues(5, 2, 2), 1000, 3000);
    redHeart.scaleBy(2, 1000, 1000);

    gameLoop.start();
  } catch (err) {
    console.error(err);
  }
});
