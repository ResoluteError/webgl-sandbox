import { Object2D } from "./objects/Object2D";
import { GameLoop } from "./gameObjects/GameLoop";
import { ShaderProgram } from "./shaders/ShaderProgram";
import { TranslateAnimation, ZoomAnimation } from "./objects/Animation";
import { Camera } from "./gameObjects/Camera";

async function getHeart(
  gl: WebGL2RenderingContext,
  shaderProgram: ShaderProgram,
  red: boolean
) {
  const heart = new Object2D(gl, shaderProgram);
  heart.setVertexPositions([
    [-1.75, 0.5],
    [-1.25, 1],
    [-0.75, 0.5],
    [-0.25, 1],
    [0.25, 0.5],
    [-0.75, -1],
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

    const camera = new Camera(0.05, 1, 0, 0, -5.0);

    gameLoop.addCamera(camera);

    redHeart.translate(-3, 0);
    blueHeart.translate(3, 0);

    redHeart.addAnimation(new TranslateAnimation(1000, 1, 0, 1000));
    blueHeart.addAnimation(new TranslateAnimation(1000, -1, 0, 1000));
    redHeart.addAnimation(new ZoomAnimation(1000, 2, 2000));
    blueHeart.addAnimation(new ZoomAnimation(1000, 2, 2000));

    gameLoop.addObjectToScene(redHeart);
    gameLoop.addObjectToScene(blueHeart);

    gameLoop.start();
  } catch (err) {
    console.error(err);
  }
});
