import { GameLoop } from "./game/GameLoop";
import { Camera } from "./game/Camera";
import { FileManager } from "./filemanager/FileManager";
import { mat3, vec3, vec4 } from "gl-matrix";

document.addEventListener("DOMContentLoaded", async function () {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;
  try {
    var gameLoop = new GameLoop(60, canvasEle);
    var fileManager = new FileManager(gameLoop.getGL(), "localhost:3000");
    const heartLoader = fileManager.loadObject3D("objs/heart.obj", null, true);

    heartLoader
      .then((heart) => {
        console.log("Loaded heart");
        gameLoop.addObjectToScene(heart);
        window.setInterval(() => {
          heart.animRotateBy(Math.PI, [0, 1, 0], 2000, 0);
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
      });

    const camera = new Camera(0.1, 1, true, 0, 0, -5.0);

    gameLoop.addCamera(camera);

    gameLoop.start();
  } catch (err) {
    console.error(err);
  }
  test();
});

function test() {
  // in vec4 v_color;
  // in vec3 v_normal;
  // in vec3 v_fragPos;

  // out vec4 outColor;

  // uniform sampler2D u_Texture;
  // uniform vec3 u_LightPos;
  // uniform mat3 u_NormalMatrix;
  // vec4 norm = vec4(normalize(u_NormalMatrix * v_normal), 1.0);
  // vec4 lightDir = vec4(normalize(u_LightPos - v_fragPos), 1.0);
  // float diff = max(dot(norm, lightDir), 0.0);
  // vec4 result = diff * v_color;
  // outColor = vec4(diff * vec3(1.0, 1.0, 1.0), 1.0);

  const v_color = vec4.fromValues(1.0, 0, 0, 1.0);
  const v_normal = vec3.fromValues(0.1961, 0.0, 0.9806);
  const v_fragPos = vec3.fromValues(1.0, 0.5, 0.0);
  const u_LightPos = vec3.fromValues(0, 0, 5);
  const u_NormalMatrix = mat3.fromValues(1, 0, 0, 0, 1, 0, 0, 0, 1);

  var tempv3 = vec3.create();
  console.log(
    "u_NormalMatrix * v_normal: ",
    vec3.transformMat3(tempv3, v_normal, u_NormalMatrix)
  );
  console.log(
    "normalize(u_NormalMatrix * v_normal): ",
    vec3.normalize(tempv3, tempv3)
  );
  // console.log("normalize(u_LightPos - v_fragPos): ", )
}
