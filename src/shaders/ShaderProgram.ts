import { Canvas } from "../canvas/Canvas";

export class ShaderProgram {
  private program: WebGLProgram;
  private gl: WebGLRenderingContext;
  private shaders: WebGLShader[];

  constructor(canvas: Canvas) {
    this.gl = canvas.getWebGL();
    this.program = this.gl.createProgram();
    this.shaders = [];
  }

  public addShader(shaderType: number, shaderSource: string): void {
    const shader = this.gl.createShader(shaderType);
    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      throw new Error(
        "An error occurred compiling the shaders: " +
          this.gl.getShaderInfoLog(shader)
      );
    }

    this.shaders.push(shader);
    this.gl.attachShader(this.program, shader);
    console.log(`Shadder of type ${shaderType} attached successfully`);
  }

  public link(): void {
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error(
        "Unable to initialize the shader program: " +
          this.gl.getProgramInfoLog(this.program)
      );
    }
    console.log("Shader program linked successfully");

    this.gl.useProgram(this.program);
  }

  public getProgram() {
    return this.program;
  }

  public getVertexPositions() {
      return this.gl.getAttribLocation(this.program, 'aVertexPosition');
  }
}