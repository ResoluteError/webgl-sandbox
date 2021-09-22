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

  public static enableVertexAttribArray(
    gl: WebGL2RenderingContext,
    buffer: CustomBuffer<any>,
    shaderProgram: ShaderProgram
  ) {
    var bufferIndex = shaderProgram.getAttribLocation(
      buffer.getAttribName() as string
    );

    console.log(`BufferIndex of ${buffer.getAttribName()} at: `, bufferIndex);

    buffer.bind();
    gl.enableVertexAttribArray(bufferIndex);
    var { numComponents, type, normalize, stride, offset } = buffer.getLayout();
    gl.vertexAttribPointer(
      bufferIndex,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
  }
}
