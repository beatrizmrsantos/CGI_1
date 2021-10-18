import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'
import { vec2, flatten, vec4 } from "../../libs/MV.js";


/** @type {WebGLRenderingContext} */
let gl;
var program, atmos;

const MAX_CHARGES = 20;
const table_width = 3.0;
const grid_spacing = 0.05;
const cargapositiva = 1.602176565*(10^(-19));
const carganegativa = - 1.602176565*(10^(-19));
const constCoulomb = 8.99*(10^9);

let table_height;
var width, width2;
var height, height2;
var thetaLoc;
var position = [];
var valores = [];
var vertices = [];
var atmosnumber = 0;
var counter = 0;
var theta = 0;


function animate()
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += 0.01;

    gl.useProgram(program);
    gl.uniform1f(width, table_width);
    gl.uniform1f(height, table_height);
    gl.drawArrays(gl.POINTS, 0, vertices.length - atmosnumber);

    gl.useProgram(atmos);
    gl.uniform1f(width2, table_width);
    gl.uniform1f(height2, table_height);
   // gl.uniform1f(thetaLoc, theta);
    gl.drawArrays(gl.POINTS, vertices.length - atmosnumber, atmosnumber);
}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    atmos = UTILS.buildProgramFromSources(gl, shaders["shader2.vert"], shaders["shader2.frag"]);

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

    width2 = gl.getUniformLocation(atmos, "table_width");
    height2 = gl.getUniformLocation(atmos, "table_height");

    thetaLoc = gl.getUniformLocation(atmos, "uTheta");

    var constx = table_width/2;
    var consty = table_height/2;

    for(let x =  -constx + 0.05; x <= constx; x += grid_spacing) {
        for(let y = -consty; y <= consty; y += grid_spacing) {
            vertices.push(MV.vec2(x, y));
            //vertices.push(MV.vec2(x, y));
        }
    }


    canvas.addEventListener("click", function(event) {
        var x = event.offsetX;
        var y = event.offsetY;

        var xvec = (table_width*x/canvas.width) - constx;
        var yvec = consty - (table_height*y/canvas.height);

        position.push(vec2(xvec, yvec));
        vertices.push(vec2(xvec, yvec));

        atmosnumber++;

        if(event.shiftKey){
            valores[counter] = carganegativa;

        } else {
            valores[counter] = cargapositiva;
        }

        counter++;

        /*
        for(let i=0; i<MAX_CHARGES; i++){
            const uPosition = gl.getUniformLocation(atmos, "uPosition[" + i + "]");
            gl.uniform2fv(uPosition, flatten(position[i]));
        }
    
        for(let i=0; i<MAX_CHARGES; i++){
            const ePosition = gl.getUniformLocation(atmos, "ePosition[" + i + "]");
            gl.uniform2fv(ePosition, flatten(valores[i]));
        }*/
        
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

UTILS.loadShadersFromURLS(["shader1.vert", "shader2.vert", "shader1.frag", "shader2.frag"]).then(s => setup(s));