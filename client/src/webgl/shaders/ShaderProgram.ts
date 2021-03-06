import { vec3 } from "gl-matrix";

export class ShaderProgram {
  private program: WebGLProgram;
  private gl: WebGLRenderingContext;
  private shaders: WebGLShader[];
  private uniformLocationMemo: { [key: string]: WebGLUniformLocation };

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.program = this.gl.createProgram();
    this.shaders = [];
    this.uniformLocationMemo = {};
  }

  public addShader(shaderType: number, shaderSource: string): void {
    const shader = this.gl.createShader(shaderType);
    this.gl.shaderSource(shader, shaderSource);
    // Turns the shader string into binary data
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      var err =
        "An error occurred compiling the shaders: " +
        this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(err);
    }

    this.shaders.push(shader);
    this.gl.attachShader(this.program, shader);
  }

  public link(): void {
    // identifies attribute and uniform names and defines an index for each where the
    // respective buffers containing the values for these attributes and uniforms will be
    // expected on the vertex array object
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error(
        "Unable to initialize the shader program: " +
          this.gl.getProgramInfoLog(this.program)
      );
    }

    this.shaders.map((shader) => this.gl.deleteShader(shader));
    this.shaders = [];
  }

  public getProgram() {
    return this.program;
  }

  public useProgram() {
    this.gl.useProgram(this.program);
  }

  public getAttribLocation(name: string) {
    return this.gl.getAttribLocation(this.program, name);
  }

  private getUniformLocation(name: string) {
    if (!this.uniformLocationMemo[name]) {
      this.uniformLocationMemo[name] = this.gl.getUniformLocation(
        this.program,
        name
      );
    }
    return this.uniformLocationMemo[name];
  }

  public setUniformMatrix4fv(
    name: string,
    data: Float32List,
    transpose?: boolean
  ) {
    var location = this.getUniformLocation(name);
    this.gl.useProgram(this.program);

    this.gl.uniformMatrix4fv(location, transpose ?? false, data);
  }

  public setUniformMatrix3fv(
    name: string,
    data: Float32List,
    transpose?: boolean
  ) {
    var location = this.getUniformLocation(name);
    this.gl.useProgram(this.program);

    this.gl.uniformMatrix3fv(location, transpose ?? false, data);
  }

  public setUniform1i(name: string, data: number) {
    var location = this.getUniformLocation(name);

    if (typeof data !== "number" || data % 1 !== 0) {
      throw new Error(`setUniform1i: data ${data} is not of type INT`);
    }

    this.gl.uniform1i(location, data);
  }

  public setUniform3f(name: string, data: vec3) {
    var location = this.getUniformLocation(name);

    this.gl.uniform3f(location, data[0], data[1], data[2]);
  }
}
