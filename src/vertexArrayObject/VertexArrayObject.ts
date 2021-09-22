import { CustomBuffer } from "../buffers/Buffer.interface";
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
   * This will enable the VertexArayObject at the index that is expected by the ShaderProgram for a
   * given attribute. When working with multiple programs, this needs to be re-enabled between program switches.
   */
  public enableVertexAttribArray(
    buffer: CustomBuffer<any>,
    shaderProgram: ShaderProgram
  ) {
    var bufferIndex = shaderProgram.getAttribLocation(
      buffer.getAttribName() as string
    );

    buffer.bind();
    this.gl.enableVertexAttribArray(bufferIndex);
  }

  /**
   * This will define the layout of the provided Buffer, e.g. for vertex positions or normals.
   */
  public setVertexAttribPoints(
    buffer: CustomBuffer<any>,
    shaderProgram: ShaderProgram
  ) {
    var bufferIndex = shaderProgram.getAttribLocation(
      buffer.getAttribName() as string
    );

    var { numComponents, type, normalize, stride, offset } = buffer.getLayout();
    this.gl.vertexAttribPointer(
      bufferIndex,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
  }
}
