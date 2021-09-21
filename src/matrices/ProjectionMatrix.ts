import { Canvas } from "../canvas/Canvas";
import { mat4 } from "gl-matrix";
import { ShaderProgram } from "../shaders/ShaderProgram";

export type ProjectionMatrixProps = Partial<{
    fieldOfView: number, // in radians
    aspect: number,
    zNear: number,
    zFar: number
}>

export class ProjectionMatrix {

    private fieldOfView: number;
    private aspect: number;
    private zNear: number;
    private zFar: number;
    private projectionMatrix: mat4;

    constructor(canvas : Canvas, {fieldOfView, aspect, zNear, zFar} : ProjectionMatrixProps) {
        this.fieldOfView = fieldOfView ?? (45 * Math.PI) / 180; 
        this.aspect = aspect ?? canvas.getWebGL().canvas.clientWidth / canvas.getWebGL().canvas.clientHeight; 
        this.zNear = zNear ?? 0.1;
        this.zFar = zFar ?? 100.0; 
        this.projectionMatrix = mat4.create();

        mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);
    }

    public getMatrix() : mat4{
        return this.projectionMatrix;
    }

    public getUniformLocation(gl : WebGLRenderingContext, program: WebGLProgram) {
        return gl.getUniformLocation(program, 'uProjectionMatrix');
    }

}