import { GameLoop } from "./game/GameLoop";
import { Camera } from "./game/Camera";
import { FileManager } from "./filemanager/FileManager";
import { Object3D } from "./objects/Object3D";

document.addEventListener("DOMContentLoaded", async function () {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;
  try {
    var gameLoop = new GameLoop(60, canvasEle);
    var fileManager = new FileManager("localhost:3000");
    const heart = new Object3D(gameLoop.getGL());

    fileManager
      .load("objs/heart.obj")
      .subscribe(
        ({ data: { vertexPositions, vertexNormals, positionIndex } }) => {
          console.log(
            "got data:",
            vertexPositions,
            vertexNormals,
            positionIndex
          );
          heart.create(vertexPositions, vertexNormals, positionIndex);
        }
      );

    const camera = new Camera(0.1, 1, true, 0, 0, -5.0);

    gameLoop.addCamera(camera);

    gameLoop.addObjectToScene(heart);

    window.setInterval(() => {
      heart.animRotateBy(Math.PI, [0, 1, 0], 2000, 0);
    }, 2000);

    gameLoop.start();
  } catch (err) {
    console.error(err);
  }
});
