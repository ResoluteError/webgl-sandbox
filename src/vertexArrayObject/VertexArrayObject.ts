import { CustomVertexBuffer } from "../buffers/Buffer.interface";
import { VertexBufferLayout } from "../buffers/VertexBufferLayout";
import { ShaderProgram } from "../shaders/ShaderProgram";

export class VertexArrayObject {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.vao = this.gl.createVertexArray();
    this.bind();
  }

  public bind() {
    this.gl.bindVertexArray(this.vao);
  }

  /**
   * This will define the layout of the provided Buffer, e.g. for vertex positions or normals.
   */
  public addBuffer(
    buffer: CustomVertexBuffer<any>,
    vertexBufferLayot: VertexBufferLayout
  ) {
    buffer.bind();

    vertexBufferLayot.getElements().forEach((elementLayout) => {
      this.gl.enableVertexAttribArray(elementLayout.index);
      this.gl.vertexAttribPointer(
        elementLayout.index,
        elementLayout.numComponents,
        elementLayout.type,
        elementLayout.normalize,
        elementLayout.stride,
        elementLayout.offset
      );
    });
  }
}
