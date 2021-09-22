import { VertexBuffer } from "./buffers/VertexBuffer";
import { ShaderProgram } from "./shaders/ShaderProgram";
import { fragmentShaderSource } from "../resources/shaders/fragmentShader.source";
import { IndexBuffer } from "./buffers/IndexBuffer";
import { vertexShaderSource } from "../resources/shaders/vertexShader.source";
import { ProjectionMatrix } from "./matrices/ProjectionMatrix";
import { ModelViewMatrix } from "./matrices/ModelViewMatrix";
import { VertexArrayObject } from "./vertexArrayObject/VertexArrayObject";

function setupCanvas(clientHeight: number, clientWidth: number) {
  const canvasEle = document.getElementById("glcanvas") as HTMLCanvasElement;
  canvasEle.setAttribute("height", `${clientHeight}`);
  canvasEle.setAttribute("width", `${clientWidth}`);
  return canvasEle;
}

function setupGl(gl: WebGL2RenderingContext) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
}

function clearCanvas(gl: WebGL2RenderingContext) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

document.addEventListener("DOMContentLoaded", function () {
  const clientHeight = window.innerHeight;
  const clientWidth = window.innerWidth;
  const canvasEle = setupCanvas(clientHeight, clientWidth);

  const projectionMatrix = new ProjectionMatrix(clientHeight, clientWidth, {});
  const modelViewMatrix = new ModelViewMatrix();
  modelViewMatrix.translate(0.0, 0.0, -5.0);

  try {
    const gl: WebGL2RenderingContext = canvasEle.getContext("webgl2");

    if (!gl) {
      throw new Error(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
    }

    setupGl(gl);

    // Setup Shader Program
    const shaderProgram = new ShaderProgram(gl);
    shaderProgram.addShader(gl.VERTEX_SHADER, vertexShaderSource);
    shaderProgram.addShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    shaderProgram.link();

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

    // Setup Vertex Array Object and bind it
    var vao = new VertexArrayObject(gl);

    // Create the Vertex and Index Buffers and bind them
    const vertexBuffer = new VertexBuffer(gl);
    // Add data to the VertexBuffer
    vertexBuffer.addItem([-1, 0.5]);
    vertexBuffer.addItem([-0.5, 1]);
    vertexBuffer.addItem([0, 0.5]);
    vertexBuffer.addItem([0.5, 1]);
    vertexBuffer.addItem([1, 0.5]);
    vertexBuffer.addItem([0, -1]);

    // Actually buffer the data to the GPU
    vertexBuffer.bufferData();
    vao.enableVertexAttribArray(vertexBuffer, shaderProgram);

    const indexBuffer = new IndexBuffer(gl);
    indexBuffer.addItems([0, 1, 2, 2, 3, 4, 0, 4, 5]);
    indexBuffer.bufferData();

    shaderProgram.useProgram();

    const offset = 0;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(
      gl.TRIANGLES,
      indexBuffer.getSize(),
      gl.UNSIGNED_INT,
      offset
    );
  } catch (err) {
    console.error(err);
  }
});
