import { Canvas } from "../canvas/Canvas";
import { ShaderProgram } from "../shaders/ShaderProgram";

export class IndexBuffer {
  private gl: WebGLRenderingContext;
  private buffer: WebGLBuffer;
  private indexes: number[];

  constructor(canvas: Canvas) {
    this.gl = canvas.getWebGL();
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    this.indexes = [];
  }

  public addIndex(i : number) {
    this.indexes.push(i);
  }

  public addIndeces(iArr: number[]) {
    this.indexes = this.indexes.concat(iArr);
  }

  public commit() {

    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array(this.indexes),
      this.gl.STATIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);

  }

  public getSize() {
    return this.indexes.length;
  }

  public getBuffer() {
      return this.buffer;
  }
}
