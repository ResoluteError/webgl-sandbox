import { GameLoop } from "./game/GameLoop";
import { Camera } from "./game/Camera";
import { AssetManager } from "./filemanager/AssetManager";

document.addEventListener("DOMContentLoaded", async function () {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;

  try {
    var gameLoop = new GameLoop(60, canvasEle);
    var assetManager = new AssetManager(gameLoop.getGL(), "localhost:3000");
    assetManager.load("heart", true).subscribe({
      next: ({ asset, type }) => {
        if (type === "CREATE") {
          gameLoop.addAssetToScene(asset);
          window.setInterval(() => {
            asset.animRotateBy(Math.PI / 2, [0, 1, 0], 2000, 0);
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
