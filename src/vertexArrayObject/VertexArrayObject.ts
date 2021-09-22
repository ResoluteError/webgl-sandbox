import { CustomBuffer } from "../buffers/Buffer.interface";
import { ShaderProgram } from "../shaders/ShaderProgram";

export class VertexArrayObject {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.vao = this.gl.createVertexArray();
    this.activate();
  }

  public activate() {
    this.gl.bindVertexArray(this.vao);
  }

  public enableVertexAttribArray(
    buffer: CustomBuffer<any>,
    shaderProgram: ShaderProgram
  ) {
    var bufferIndex = shaderProgram.getAttribLocation(
      buffer.getAttribName() as string
    );

    console.log(`BufferIndex at: `, bufferIndex);

    buffer.bind();
    this.gl.enableVertexAttribArray(bufferIndex);
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
