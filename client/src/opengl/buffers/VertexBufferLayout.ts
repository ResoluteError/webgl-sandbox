import { VertexLayoutElement } from "./Buffer.interface";

export class VertexBufferLayout {
  private layoutElements: VertexLayoutElement[];
  private gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.layoutElements = [];
  }

  public push(
    type: number,
    totalElementCount: number,
    relevantElementCount: number,
    offset: number,
    attributeName: string
  ) {
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
      size: relevantElementCount,
      stride: baseSize * totalElementCount,
      type,
      offset: offset * baseSize,
      normalize: false,
      name: attributeName,
    });
  }

  public getElements(): VertexLayoutElement[] {
    return this.layoutElements;
  }

  // public debug() {
  //   this.layoutElements.forEach((item, index) => {
  //     console.log(
  //       `VertexLayoutElement ${index}: ${item.index} | ${item.size} | ${item.stride} | ${item.type}`
  //     );
  //   });
  // }
}
