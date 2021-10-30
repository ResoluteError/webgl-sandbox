import { Object3D } from "../../objects/Object3D";
import { CustomVertexBuffer } from "../buffers/Buffer.interface";
import { VertexBufferLayout } from "../buffers/VertexBufferLayout";
import { ShaderProgram } from "../shaders/ShaderProgram";

export class VertexArrayObject {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;
  private shader: ShaderProgram;
  private hasBoundBuffers: boolean;

  constructor(gl: WebGL2RenderingContext, shader: ShaderProgram) {
    this.gl = gl;
    this.vao = this.gl.createVertexArray();
    this.hasBoundBuffers = false;
    this.shader = shader;
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
      const attribLocation = this.shader.getAttribLocation(elementLayout.name);
      this.gl.enableVertexAttribArray(attribLocation);

      // console.log(
      //   `VertexLayoutElement ${elementLayout.name}: ${elementLayout.index} | ${elementLayout.size} | ${elementLayout.stride} | ${elementLayout.type}`
      // );
      this.gl.vertexAttribPointer(
        attribLocation,
        elementLayout.size,
        elementLayout.type,
        elementLayout.normalize,
        elementLayout.stride,
        elementLayout.offset
      );
    });
  }

  public bindObject(obj: Object3D) {
    this.bind();
    if (!this.hasBoundBuffers) {
      const {
        vertexPositionsBuffer,
        vertexNormalsBuffer,
        indexBuffer,
        vertexColorsBuffer,
        vertexTexturePositionsBuffer,
      } = obj.getBuffers();
      const {
        vertexPositionBufferLayout,
        vertexNormalsBufferLayout,
        vertexColorsBufferLayout,
        vertexTexturePositionsBufferLayout,
      } = obj.getBufferLayouts();
      this.addBuffer(vertexPositionsBuffer, vertexPositionBufferLayout);
      this.addBuffer(vertexNormalsBuffer, vertexNormalsBufferLayout);
      this.addBuffer(vertexColorsBuffer, vertexColorsBufferLayout);
      this.addBuffer(
        vertexTexturePositionsBuffer,
        vertexTexturePositionsBufferLayout
      );
      indexBuffer.bind();
      this.hasBoundBuffers = true;
    }
  }

  public getHasBoundBuffers() {
    return this.hasBoundBuffers;
  }

  // public debug() {
  //   console.log("Debugging VAO");
  //   for (var i = 0; i < 3; i++) {
  //     console.log(
  //       "CURRENT_VERTEX_ATTRIB",
  //       this.gl.getVertexAttrib(i, this.gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING)
  //     );
  //     console.log(
  //       "VERTEX_ATTRIB_ARRAY_STRIDE",
  //       this.gl.getVertexAttrib(i, this.gl.VERTEX_ATTRIB_ARRAY_STRIDE)
  //     );
  //     console.log(
  //       "VERTEX_ATTRIB_ARRAY_SIZE",
  //       this.gl.getVertexAttrib(i, this.gl.VERTEX_ATTRIB_ARRAY_SIZE)
  //     );
  //   }
  // }
}
