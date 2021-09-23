import { CustomVertexBuffer } from "./Buffer.interface";

export class VertexBuffer<T extends number[]> implements CustomVertexBuffer<T> {
  private gl: WebGL2RenderingContext;
  private buffer: WebGLBuffer;
  private items: T[];

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.items = [];
  }

  public addItem(item: T) {
    this.items.push(item);
  }

  public addItems(items: T[]) {
    this.items = this.items.concat(items);
  }

  public updateItems(updateFn: (input: T[]) => T[]) {
    this.items = updateFn(this.items);
  }

  public replaceItems(newItems: T[]) {
    this.items = newItems;
  }

  public bufferData() {
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.items.flat() as number[]),
      this.gl.STATIC_DRAW
    );
  }

  public bind() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  }

  public unbind() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  public delete() {
    this.gl.deleteBuffer(this.buffer);
  }

  public getSize() {
    return this.items.length;
  }

  public getBuffer() {
    return this.buffer;
  }
}
