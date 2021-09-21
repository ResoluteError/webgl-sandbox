import { VertexBuffer } from "./buffers/VertexBuffer";
import { Canvas } from "./canvas/Canvas";
import { ShaderProgram } from "./shaders/ShaderProgram";
import {fragmentShaderSource} from "../resources/shaders/fragmentShader.source";
// import {simpleVertexShaderSource} from "../resources/shaders/simpleVertexShader.source";
import { IndexBuffer } from "./buffers/IndexBuffer";
import {vertexShaderSource} from "../resources/shaders/vertexShader.source";

document.addEventListener("DOMContentLoaded", function(){
    try {
        const canvas = new Canvas("glcanvas");
        const shaderProgram = new ShaderProgram(canvas);
        const vertexBuffer = new VertexBuffer(canvas);
        const indexBuffer = new IndexBuffer(canvas);
    
        shaderProgram.addShader(canvas.getWebGL().VERTEX_SHADER, vertexShaderSource);
        shaderProgram.addShader(canvas.getWebGL().FRAGMENT_SHADER, fragmentShaderSource);

        canvas.translateView(0.0,0.0,-5.0);

        shaderProgram.link();

        // vertexBuffer.addVertex(-.5, 0);
        // vertexBuffer.addVertex(0, .5);
        // vertexBuffer.addVertex(.5, 0);
        // vertexBuffer.addVertex(0, -.5);
        vertexBuffer.addVertex(-1,0.5);
        vertexBuffer.addVertex(-0.5,1);
        vertexBuffer.addVertex(0,0.5);
        vertexBuffer.addVertex(0.5,1);
        vertexBuffer.addVertex(1,0.5);
        vertexBuffer.addVertex(0,-1);

        vertexBuffer.commit(shaderProgram);

        indexBuffer.addIndeces([
            0,1,2,2,3,4,0,4,5
        ]);

        indexBuffer.commit();

        var inc = true;
        var currentZ = -5.0;
        var increment = 0.05;

        var gameLoop = setInterval( () => {
            if(inc) {
                canvas.translateView(0.0,0.0,increment);
                currentZ += increment;
                if(currentZ > -3.0) {
                    inc = false;
                }
            } else {
                canvas.translateView(0.0,0.0,-1 * increment);
                currentZ -= increment;
                if(currentZ < -6.0) {
                    inc = true;
                }
            }
            canvas.draw(shaderProgram, vertexBuffer.getSize(), indexBuffer.getSize());
            console.log("New Frame");
        }, 16 );

        // setTimeout( () => {clearInterval(gameLoop)}, 1.6*1000);

    } catch (err) {
        console.error(err);
    }

});