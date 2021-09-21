import { IndexBuffer } from "../buffers/IndexBuffer";
import { ModelViewMatrix } from "../matrices/ModelViewMatrix";
import { ProjectionMatrix } from "../matrices/ProjectionMatrix";
import { ShaderProgram } from "../shaders/ShaderProgram";

export class Canvas {
  private canvasEle: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private projectionMatrix : ProjectionMatrix;
  private modelViewMatrix : ModelViewMatrix;

  constructor(canvasId: string) {
    this.canvasEle = document.getElementById(canvasId) as HTMLCanvasElement;
    this.canvasEle.setAttribute("height", `${window.innerHeight}`);
    this.canvasEle.setAttribute("width", `${window.innerWidth}`);
    this.gl = this.canvasEle.getContext("webgl");
    this.projectionMatrix = new ProjectionMatrix(this, {});
    this.modelViewMatrix = new ModelViewMatrix();

    if (!this.gl) {
      throw new Error(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
    }

    if(this.gl.getExtension("OES_element_index_uint") == null) {
      throw new Error("OES extension OES_element_index_uint is missing - UInt32 not supported!");
    }

    this.clear();
  }

  public translateView(x: number,y: number,z: number) {
    this.modelViewMatrix.translate(x,y,z);
  }

  private clear() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  public draw(shaderProgram: ShaderProgram, vertexCount : number, indexCount: number) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.enableVertexAttribArray(shaderProgram.getVertexPositions());

    var projectionMatrixLocation = this.projectionMatrix.getUniformLocation(this.gl, shaderProgram.getProgram());

    this.gl.uniformMatrix4fv(
      projectionMatrixLocation,
      false,
      this.projectionMatrix.getMatrix()
    );

    var modelViewMatrixLocation = this.modelViewMatrix.getUniformLocation(this.gl, shaderProgram.getProgram());

    this.gl.uniformMatrix4fv(
      modelViewMatrixLocation,
      false,
      this.modelViewMatrix.getMatrix()
    );

    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, indexCount, this.gl.UNSIGNED_INT, offset);
  }

  public getWebGL() {
    return this.gl;
  }
}
