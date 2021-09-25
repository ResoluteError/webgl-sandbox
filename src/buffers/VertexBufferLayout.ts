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
    totalElementCount: number,
    relevantElementCount: number,
    offset: number,
    attributeName: string
  ) {
    const index = this.shaderProgram.getAttribLocation(attributeName);
    let baseSize = 0;
    switch (type) {
      case this.gl.FLOAT:
        baseSize = 4;
        break;
      case this.gl.UNSIGNED_INT:
        baseSize = 4;
        break;
    }
    this.layoutElements.push({
      index,
      size: relevantElementCount,
      stride: baseSize * totalElementCount,
      type,
      offset: offset * baseSize,
      normalize: false,
    });
  }

  public getElements(): VertexLayoutElement[] {
    return this.layoutElements;
  }
}
