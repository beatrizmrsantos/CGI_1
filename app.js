import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'
import { vec2, flatten, vec4, vec3 } from "../../libs/MV.js";


/** @type {WebGLRenderingContext} */
let gl;
var program, atoms;

const MAX_CHARGES = 30;
const table_width = 3.0;
const grid_spacing = 0.05;
const chargepos = 1.0;
const chargeneg = -1.0;

let table_height;
var width, width2;
var height, height2;
var counterLoc;
var constx, consty;

//vetor das posicoes das cargas
var charge = [];
//vetor dos valores das cargas
var values = [];
//vetor das posicoes dos vertices
var vertices = [];
//vetor das posicoes das cargas para mandar para o uniforme no shader
var position = [];
//vetor onde se junta os vertices e as cargas para mandar para o buffer e imprimir no ecra
var buffer = [];

var atomsnumber = 0;
var theta = 0.01;
let direction = true;


function updatePositions(){
    for(let i=0; i<charge.length; i++){
        var x = charge[i][0];
        var y = charge[i][1];

        if(charge[i][2] > 0.0){
            charge[i][0] = -Math.sin(theta)*y + Math.cos(theta)*x;
            charge[i][1] = Math.sin(theta)*x + Math.cos(theta)*y;
            position[i][0] = x;
            position[i][1] = y;
        
        } else {
            charge[i][0] = -Math.sin(-theta)*y + Math.cos(-theta)*x;
            charge[i][1] = Math.sin(-theta)*x + Math.cos(-theta)*y;
            position[i][0] = x;
            position[i][1] = y;
        }
        
    }
}

function setBuffer(){
    buffer = [];
    for(let i=0; i<vertices.length; i++){
        buffer.push(vertices[i]);
    }

    for(let i=0; i<charge.length; i++){
        buffer.push(charge[i]);
    }

    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(buffer), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}


function animate()
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    updatePositions();
    setBuffer();

    gl.useProgram(program);
    gl.uniform1f(width, table_width);
    gl.uniform1f(height, table_height);
    gl.uniform1i(counterLoc, atomsnumber);

    for(let i=0; i<position.length; i++){
        const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
        gl.uniform2fv(uPosition, MV.flatten(position[i]));
    }
    
    for(let i=0; i<values.length; i++){
        const ePosition = gl.getUniformLocation(program, "ePosition[" + i + "]");
        gl.uniform1f(ePosition, values[i]);
    }

    gl.drawArrays(gl.LINES, 0, vertices.length);

    gl.useProgram(atoms);
    gl.uniform1f(width2, table_width);
    gl.uniform1f(height2, table_height);

    
    if(direction){
        gl.drawArrays(gl.POINTS, vertices.length, charge.length);
    }
    
}


function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    atoms = UTILS.buildProgramFromSources(gl, shaders["shader2.vert"], shaders["shader2.frag"]);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    table_height = table_width/canvas.width*canvas.height;


    window.addEventListener("resize", function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        table_height = (table_width/canvas.width)*canvas.height;

        setBuffer();

        gl.viewport(0, 0, canvas.width, canvas.height);
    });


    width = gl.getUniformLocation(program, "table_width");
    height = gl.getUniformLocation(program, "table_height");
    counterLoc = gl.getUniformLocation(program, "counter");

    width2 = gl.getUniformLocation(atoms, "table_width");
    height2 = gl.getUniformLocation(atoms, "table_height");

    constx = table_width/2;
    consty = table_height/2;


    for(let x = ( -constx + 0.05); x <= constx; x += grid_spacing) {
        for(let y = -consty; y <= consty; y += grid_spacing) {
            var xr = x + grid_spacing*Math.random();
            var yr = y + grid_spacing*Math.random();
            vertices.push(MV.vec3(xr, yr, 1.0));
            vertices.push(MV.vec3(xr, yr, 2.0));
        }
    }

    canvas.addEventListener("click", function(event) {
        var x = event.offsetX;
        var y = event.offsetY;

        constx = table_width/2;
        consty = table_height/2;

        var xvec = (table_width*x/canvas.width) - constx;
        var yvec = consty - (table_height*y/canvas.height);

        if( atomsnumber < MAX_CHARGES){
            position.push(vec2(xvec, yvec));

            if(event.shiftKey){
                values.push(chargeneg);
                charge.push(MV.vec3(xvec, yvec, chargeneg));
            } else {
                values.push(chargepos);
                charge.push(MV.vec3(xvec, yvec, chargepos));
            }
            
            atomsnumber++;
            
            setBuffer();
        }

    });


    window.addEventListener("keydown", function(event) {
        if(event.code == "Space"){
            direction = !direction;
        }
    });

    
    setBuffer();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}


UTILS.loadShadersFromURLS(["shader1.vert", "shader2.vert", "shader1.frag", "shader2.frag"]).then(s => setup(s));
