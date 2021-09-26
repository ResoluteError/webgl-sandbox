import { IndexBuffer } from "../buffers/IndexBuffer";
import { ProjectionMatrix } from "../matrices/ProjectionMatrix";
import { Object2D } from "../../objects/Object2D";
import { ShaderProgram } from "../shaders/ShaderProgram";
import { VertexArrayObject } from "../vertexArrayObject/VertexArrayObject";

export class Renderer {
  private gl: WebGL2RenderingContext;
  private prevWidth: number;
  private prevHeight: number;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    if (!gl) {
      throw new Error(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
    }
  }

  public setup(r: number, g: number, b: number, alpha: number) {
    this.gl.clearColor(r, g, b, alpha);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.blendEquation(this.gl.FUNC_ADD);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  public clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  public draw(
    vao: VertexArrayObject,
    shader: ShaderProgram,
    indexBuffer: IndexBuffer
  ) {
    shader.useProgram();
    vao.bind();
    indexBuffer.bind();
    this.gl.drawElements(
      this.gl.TRIANGLES,
      indexBuffer.getSize(),
      this.gl.UNSIGNED_INT,
      0
    );
  }

  public drawObject(obj: Object2D) {
    obj.bind();
    this.gl.drawElements(
      this.gl.TRIANGLES,
      obj.getIndexBufferSize(),
      this.gl.UNSIGNED_INT,
      0
    );
  }
}
