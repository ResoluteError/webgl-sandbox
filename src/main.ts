import { ShaderProgram } from "./shaders/ShaderProgram";
import { fragmentShaderSource } from "../resources/shaders/fragmentShader.source";
import { vertexShaderSource } from "../resources/shaders/vertexShader.source";
import { ModelViewMatrix } from "./matrices/ModelViewMatrix";
import { Renderer } from "./renderer/Renderer";
import { Object2D } from "./objects/Object2D";

document.addEventListener("DOMContentLoaded", async function () {
  const maxFps = 1;
  const maxMSpF = 1000 / maxFps;

  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;

  const modelViewMatrix = new ModelViewMatrix();
  modelViewMatrix.translate(0.0, 0.0, -5.0);

  try {
    const gl: WebGL2RenderingContext = canvasEle.getContext("webgl2");
    const shaderProgram = new ShaderProgram(gl);
    const renderer = new Renderer(gl);

    renderer.setup(0.0, 0.0, 0.0, 1.0);

    // Setup Shader Program

    shaderProgram.addShader(gl.VERTEX_SHADER, vertexShaderSource);
    shaderProgram.addShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    shaderProgram.link();

    const heart = new Object2D(gl, shaderProgram);
    heart.setVertexPositions([
      [-1, 0.5],
      [-0.5, 1],
      [0, 0.5],
      [0.5, 1],
      [1, 0.5],
      [0, -1],
    ]);
    await heart.setImageTexture("/resources/textures/red.png");
    heart.setIndex([0, 1, 2, 2, 3, 4, 0, 4, 5]);

    shaderProgram.setUniformMatrix4fv(
      modelViewMatrix.getUniformName(),
      modelViewMatrix.getMatrix(),
      false
    );

    var previousTimeStamp = 0;

    const gameLoop = (timestamp: number) => {
      const startTime = Date.now();

      renderer.clear();
      renderer.updateWindowSize(
        window.innerWidth,
        window.innerHeight,
        canvasEle,
        shaderProgram
      );

      renderer.drawObject(heart);

      previousTimeStamp = timestamp;
      const waitTime = maxMSpF - (Date.now() - startTime);

      window.setTimeout(
        () => {
          window.requestAnimationFrame(gameLoop);
        },
        waitTime > 0 ? waitTime : 0
      );
    };

    window.requestAnimationFrame(gameLoop);
  } catch (err) {
    console.error(err);
  }
});
