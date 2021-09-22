import { CustomBuffer } from "./Buffer.interface";

export class VertexBuffer implements CustomBuffer<[number, number]> {
  private gl: WebGL2RenderingContext;
  private buffer: WebGLBuffer;
  private positions: [number, number][];

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.positions = [];
  }

  public addItem(item: [number, number]) {
    this.positions.push(item);
  }

  public addItems(items: [number, number][]) {
    this.positions = this.positions.concat(items);
  }

  public bufferData() {
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.positions.flat()),
      this.gl.STATIC_DRAW
    );
  }

  public bind() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  }

  public getLayout() {
    return {
      numComponents: 2,
      type: this.gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0,
    };
  }

  public getSize() {
    return this.positions.length;
  }

  public getBuffer() {
    return this.buffer;
  }

  public getAttribName() {
    return "aVertexPosition";
  }
}
