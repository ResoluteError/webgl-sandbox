import { Canvas } from "../canvas/Canvas";
import { ShaderProgram } from "../shaders/ShaderProgram";

export class VertexBuffer {
  private gl: WebGLRenderingContext;
  private buffer: WebGLBuffer;
  private positions: [number, number][];

  constructor(canvas: Canvas) {
    this.gl = canvas.getWebGL();
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.positions = [];
  }

  public addVertex(x: number, y: number) {
    this.positions.push([x, y]);
  }

  public addVertices(vertices: [number, number][]) {
    this.positions = this.positions.concat(vertices);
  }

  public commit(shaderProgram : ShaderProgram) {

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.positions.flat()),
      this.gl.STATIC_DRAW
    );

    const numComponents = 2; // pull out 2 values per iteration
    const type = this.gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(
      shaderProgram.getVertexPositions(),
      numComponents,
      type,
      normalize,
      stride,
      offset
    );

  }

  public getSize() {
    return this.positions.length;
  }

  public getBuffer() {
      return this.buffer;
  }
}
