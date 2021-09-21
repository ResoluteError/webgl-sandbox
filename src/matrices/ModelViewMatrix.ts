import { mat4 } from "gl-matrix";

export class ModelViewMatrix {

    private modelViewMatrix : mat4;

    constructor() {
        this.modelViewMatrix = mat4.create();
    }

    public translate(x : number, y: number, z: number) {
        mat4.translate(
            this.modelViewMatrix, // destination matrix
            this.modelViewMatrix, // matrix to translate
            [x, y, z]
          ); // amount to translate
    }

    public getMatrix() {
        return this.modelViewMatrix;
    }

    public getUniformLocation(gl : WebGLRenderingContext, program: WebGLProgram) {
        return gl.getUniformLocation(program, 'uModelViewMatrix');
    }

}