import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'
import { vec2, flatten, vec4 } from "../../libs/MV.js";


/** @type {WebGLRenderingContext} */
let gl;
var program;

const MAX_CHARGES = 20;
const table_width = 3.0;
const grid_spacing = 0.05;
const cargapositiva = 1.602176565*(10^(-19));
const carganegativa = - 1.602176565*(10^(-19));
const constCoulomb = 8.99*(10^9);

let table_height;
var width;
var height;
var position = [];
var valores = [];
var vertices = [];
var counter = 0;

function animate()
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform1f(width, table_width);
    gl.uniform1f(height, table_height);
    gl.drawArrays(gl.POINTS, 0, vertices.length);

}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    //vetores = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader2.frag"]);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    table_height = (canvas.height*table_width)/canvas.width;

    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gl.viewport(0, 0, canvas.width, canvas.height);
    });

    width = gl.getUniformLocation(program, "table_width");
    height = gl.getUniformLocation(program, "table_height");


    var constx = table_width/2;
    var consty = table_height/2;

    for(let x =  -constx + 0.05; x <= constx; x += grid_spacing) {
        for(let y = -consty; y <= consty; y += grid_spacing) {
            vertices.push(MV.vec2(x, y));
            //vertices.push(MV.vec2(x, y));
        }
    }


    canvas.addEventListener("click", function(event) {
        const x = event.offsetX;
        const y = event.offsetY;

        const xvec = (table_width*x/canvas.width) - constx;
        const yvec = consty - (table_height*y/canvas.height);

        position.push(vec2(xvec, yvec));

        if(event.shiftKey){
            valores[counter] = carganegativa;

        } else {
            valores[counter] = cargapositiva;
        }

        counter++;

        console.log(position[0]);

        for(let i=0; i<MAX_CHARGES; i++){
            const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
            gl.uniform2fv(uPosition, flatten(position[i]));
        }
    
        for(let i=0; i<MAX_CHARGES; i++){
            const ePosition = gl.getUniformLocation(program, "ePosition[" + i + "]");
            gl.uniform2fv(ePosition, flatten(valores[i]));
        }
        
        const aBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.STATIC_DRAW);

        const vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

    });



    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag", "shader2.frag"]).then(s => setup(s));