import { VertexBuffer } from "./buffers/VertexBuffer";
import { ShaderProgram } from "./shaders/ShaderProgram";
import { fragmentShaderSource } from "../resources/shaders/fragmentShader.source";
import { IndexBuffer } from "./buffers/IndexBuffer";
import { vertexShaderSource } from "../resources/shaders/vertexShader.source";
import { ProjectionMatrix } from "./matrices/ProjectionMatrix";
import { ModelViewMatrix } from "./matrices/ModelViewMatrix";
import { VertexArrayObject } from "./vertexArrayObject/VertexArrayObject";
import {
  scale2DAroundCenterProvider,
  translate2DProvider,
} from "./matrices/utils/2dUtils";
import { VertexBufferLayout } from "./buffers/VertexBufferLayout";
import { Renderer } from "./renderer/Renderer";

function setupCanvas(): HTMLCanvasElement {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;
  canvasEle.setAttribute("height", `${window.innerHeight}`);
  canvasEle.setAttribute("width", `${window.innerWidth}`);
  return canvasEle;
}

document.addEventListener("DOMContentLoaded", function () {
  const canvasEle = setupCanvas();

  const projectionMatrix = new ProjectionMatrix(
    window.innerHeight,
    window.innerWidth,
    {}
  );
  const modelViewMatrix = new ModelViewMatrix();
  modelViewMatrix.translate(0.0, 0.0, -5.0);

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

    // Create the Vertex and Index Buffers and bind them
    const vertexBuffer = new VertexBuffer<[number, number]>(gl);

    // Add data to the VertexBuffer
    vertexBuffer.addItems([
      [-1, 0.5],
      [-0.5, 1],
      [0, 0.5],
      [0.5, 1],
      [1, 0.5],
      [0, -1],
    ]);

    // Actually buffer the data to the GPU
    vertexBuffer.bufferData();

    vertexBufferLayout.push(gl.FLOAT, 2, 0, "aVertexPosition");

    vao.addBuffer(vertexBuffer, vertexBufferLayout);

    const indexBuffer = new IndexBuffer(gl);
    indexBuffer.addItems([0, 1, 2, 2, 3, 4, 0, 4, 5]);
    indexBuffer.bufferData();

    // Starting here is the draw loop per frame
    renderer.clear();

    // Starting here is the draw loop per program
    shaderProgram.useProgram();

    vao.bind();

    shaderProgram.setUniform(
      projectionMatrix.getUniformName(),
      projectionMatrix.getMatrix(),
      false
    );

    shaderProgram.setUniform(
      modelViewMatrix.getUniformName(),
      modelViewMatrix.getMatrix(),
      false
    );

    [
      [0, 0],
      [2.5, 1],
      [-5, 0],
      [0, -2],
      [5, 0],
    ].forEach(([x, y], index) => {
      if (index === 1)
        vertexBuffer.updateItems(scale2DAroundCenterProvider(0.5));
      vertexBuffer.updateItems(translate2DProvider(x, y));
      vertexBuffer.bufferData();

      renderer.draw(vao, shaderProgram, indexBuffer);
    });
  } catch (err) {
    console.error(err);
  }
});
