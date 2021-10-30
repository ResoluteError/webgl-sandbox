import { GameLoop } from "./game/GameLoop";
import { Camera } from "./game/Camera";
import { AssetManager } from "./filemanager/AssetManager";
import { Debug } from "./debug/Debugger";

document.addEventListener("DOMContentLoaded", async function () {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;

  try {
    var gameLoop = new GameLoop(60, canvasEle);
    var assetManager = new AssetManager(gameLoop.getGL(), "localhost:3000");
    assetManager.load("house", true).subscribe({
      next: ({ asset, type }) => {
        console.log("Loaded house: ", asset);
        if (type === "CREATE") {
          gameLoop.addAssetToScene(asset);
          window.setInterval(() => {
            asset.animRotateBy(Math.PI, [0, 1, 0], 2000, 0);
          }, 2000);
        }
      },
      error: console.error,
    });

    assetManager.load("heart", false).subscribe({
      next: ({ asset, type }) => {
        console.log("Loaded heart: ", asset);
        if (type === "CREATE") {
          gameLoop.addAssetToScene(asset);
          asset.translateBy([-7, 0, 0]);
          window.setInterval(() => {
            asset.animRotateBy(-Math.PI, [0, 1, 0], 2000, 0);
          }, 2000);
        }
      },
      error: console.error,
    });

    const camera = new Camera(0.1, 1, true, 0, 0, -7.0);

    gameLoop.addCamera(camera);

    gameLoop.start();
  } catch (err) {
    console.error(err);
  }
});
