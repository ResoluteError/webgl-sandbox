import { GameLoop } from "./game/GameLoop";
import { Camera } from "./game/Camera";
import { AssetManager } from "./filemanager/AssetManager";

document.addEventListener("DOMContentLoaded", async function () {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;

  try {
    var gameLoop = new GameLoop(60, canvasEle);
    var assetManager = new AssetManager(gameLoop.getGL(), "localhost:3000");
    assetManager.load("house", true).subscribe({
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

    assetManager.load("heart", true).subscribe({
      next: ({ asset, type }) => {
        if (type === "CREATE") {
          var asset2 = asset.clone();
          var asset3 = asset.clone();
          var asset4 = asset.clone();
          asset.translateTo([-5, 0, 0]);
          asset2.translateTo([5, 0, 0]);
          asset3.translateTo([0, 5, 0]);
          asset4.translateTo([0, -5, 0]);
          gameLoop.addAssetToScene(asset);
          gameLoop.addAssetToScene(asset2);
          gameLoop.addAssetToScene(asset3);
          gameLoop.addAssetToScene(asset4);
          window.setInterval(() => {
            asset.animRotateBy(-Math.PI / 2, [0, 1, 0], 2000, 0);
            asset2.animRotateBy(Math.PI / 2, [0, 1, 0], 2000, 0);
            asset3.animRotateBy(Math.PI / 2, [1, 0, 0], 2000, 0);
            asset4.animRotateBy(Math.PI / 2, [-1, 0, 0], 2000, 0);
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
