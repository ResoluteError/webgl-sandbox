import { CustomBuffer } from "./Buffer.interface";

export class IndexBuffer implements CustomBuffer<number> {
  private gl: WebGL2RenderingContext;
  private buffer: WebGLBuffer;
  private indexes: number[];

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.buffer = this.gl.createBuffer();
    this.bind();
    this.indexes = [];
  }

  public addItem(item: number) {
    this.indexes.push(item);
  }

  public addItems(items: number[]) {
    this.indexes = this.indexes.concat(items);
  }

  public bufferData() {
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array(this.indexes),
      this.gl.STATIC_DRAW
    );
  }

  public bind() {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }

  public unbind() {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  public delete() {
    this.gl.deleteBuffer(this.buffer);
  }

  public getSize() {
    return this.indexes.length;
  }

  public getBuffer() {
    return this.buffer;
  }
}
