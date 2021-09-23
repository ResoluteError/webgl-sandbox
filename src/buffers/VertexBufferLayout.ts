import { ShaderProgram } from "../shaders/ShaderProgram";
import { VertexLayoutElement } from "./Buffer.interface";

export class VertexBufferLayout {
  private layoutElements: VertexLayoutElement[];
  private gl: WebGL2RenderingContext;
  private shaderProgram: ShaderProgram;

  constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.layoutElements = [];
  }

  public push(
    type: number,
    numComponents: number,
    offset: number,
    attributeName: string
  ) {
    const index = this.shaderProgram.getAttribLocation(attributeName);
    let stride: number;
    switch (type) {
      case this.gl.FLOAT:
        stride = numComponents * 4;
        break;
      case this.gl.UNSIGNED_INT:
        stride = numComponents * 4;
        break;
    }
    this.layoutElements.push({
      index,
      numComponents,
      stride,
      type,
      offset,
      normalize: false,
    });
  }

  public getElements(): VertexLayoutElement[] {
    return this.layoutElements;
  }
}
