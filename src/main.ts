import { VertexBuffer } from "./buffers/VertexBuffer";
import { ShaderProgram } from "./shaders/ShaderProgram";
import { fragmentShaderSource } from "../resources/shaders/fragmentShader.source";
import { IndexBuffer } from "./buffers/IndexBuffer";
import { vertexShaderSource } from "../resources/shaders/vertexShader.source";
import { ProjectionMatrix } from "./matrices/ProjectionMatrix";
import { ModelViewMatrix } from "./matrices/ModelViewMatrix";
import { VertexArrayObject } from "./vertexArrayObject/VertexArrayObject";
import { VertexBufferLayout } from "./buffers/VertexBufferLayout";
import { Renderer } from "./renderer/Renderer";
import { TextureMapper } from "./textures/TextureMapper";

function setupCanvas(): HTMLCanvasElement {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;
  canvasEle.setAttribute("height", `${window.innerHeight}`);
  canvasEle.setAttribute("width", `${window.innerWidth}`);
  return canvasEle;
}

document.addEventListener("DOMContentLoaded", async function () {
  const canvasEle = setupCanvas();
  const maxFps = 1;
  const maxMSpF = 1000 / maxFps;

  const projectionMatrix = new ProjectionMatrix(
    window.innerHeight,
    window.innerWidth,
    {}
  );
  const modelViewMatrix = new ModelViewMatrix();
  modelViewMatrix.translate(0.0, 0.0, -5.0);
  const basicHeart: [number, number, number, number][] = [
    [-1, 0.5, 0, 0.75],
    [-0.5, 1, 0.25, 1],
    [0, 0.5, 0.5, 0.75],
    [0.5, 1, 0.75, 1],
    [1, 0.5, 1, 0.75],
    [0, -1, 0.5, 0],
  ];

  try {
    const gl: WebGL2RenderingContext = canvasEle.getContext("webgl2");

    const renderer = new Renderer(gl);

    renderer.setup(0.0, 0.0, 0.0, 1.0);

    // Setup Shader Program
    const shaderProgram = new ShaderProgram(gl);

    shaderProgram.addShader(gl.VERTEX_SHADER, vertexShaderSource);
    shaderProgram.addShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    shaderProgram.link();

    // Setup Vertex Array Object and bind it
    var vao = new VertexArrayObject(gl);
    var vertexBufferLayout = new VertexBufferLayout(gl, shaderProgram);
    const textureMapper = new TextureMapper(gl);
    await textureMapper.createImageTexture(
      "/resources/textures/red.png",
      256,
      256
    );
    textureMapper.bind(0);

    // Create the Vertex and Index Buffers and bind them
    const vertexBuffer = new VertexBuffer<[number, number, number, number]>(gl);

    // Add data to the VertexBuffer
    vertexBuffer.addItems(basicHeart);

    // Actually buffer the data to the GPU
    vertexBuffer.bufferData();

    vertexBufferLayout.push(gl.FLOAT, basicHeart[0].length, 2, 0, "a_position");
    vertexBufferLayout.push(gl.FLOAT, basicHeart[0].length, 2, 2, "u_texpos");

    vao.addBuffer(vertexBuffer, vertexBufferLayout);

    const indexBuffer = new IndexBuffer(gl);
    indexBuffer.addItems([0, 1, 2, 2, 3, 4, 0, 4, 5]);
    indexBuffer.bufferData();

    shaderProgram.setUniformMatrix4fv(
      projectionMatrix.getUniformName(),
      projectionMatrix.getMatrix(),
      false
    );

    shaderProgram.setUniformMatrix4fv(
      modelViewMatrix.getUniformName(),
      modelViewMatrix.getMatrix(),
      false
    );

    shaderProgram.setUniform1i("u_Texture", 0);

    var previousTimeStamp = 0;

    const gameLoop = (timestamp: number) => {
      console.log("New frame");
      const startTime = Date.now();

      renderer.clear();
      renderer.draw(vao, shaderProgram, indexBuffer);

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
