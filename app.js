import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'
import { vec2, flatten, vec4, vec3 } from "../../libs/MV.js";


/** @type {WebGLRenderingContext} */
let gl;
var program, atoms;
var aBuffer;
var vPosition

const MAX_CHARGES = 20;
const table_width = 3.0;
const grid_spacing = 0.05;
const chargepos = 1.0;
const chargeneg = -1.0;
const constCoulomb = 8.99*Math.pow(10, 9);

let table_height;
var width, width2;
var height, height2;

var x = table_width/2;;
var y = 0;

var charge = [];
var values = [];
var vertices = [];
var position = [];
var buffer = [];
var angles = [];

var atomsnumber = 0;
var theta = 0.02;
let direction = true;


function calcAngle(x, y){
    var hip = Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
    
    var angle = Math.asin(y/hip);

    if(x < 0.0 && y > 0.0){
        angle = Math.PI - angle;
    }

    if(x < 0.0 && y < 0.0){
        angle = Math.PI - angle;
    }

    if(x > 0.0 && y < 0.0){
        angle = 2*Math.PI + angle;
    }

    return angle;
}


function updatePositions(){
    for(let i=0; i<charge.length; i++){
        var r = Math.sqrt( Math.pow(charge[i][0], 2) + Math.pow(charge[i][1], 2) );

        if(charge[i][2] > 0.0){
            angles[i] = angles[i] + theta;

            charge[i][0] = r * Math.cos(angles[i]);
            charge[i][1] = r * Math.sin(angles[i]);
            position[i][0] = charge[i][0];
            position[i][1] = charge[i][1];
        
        } else {
            angles[i] = angles[i] - theta;

            charge[i][0] = r * Math.cos(angles[i]);
            charge[i][1] = r * Math.sin(angles[i]);
            position[i][0] = charge[i][0];
            position[i][1] = charge[i][1]; 
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

    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(buffer), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}


function animate()
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    gl.useProgram(program);
    gl.uniform1f(width, table_width);
    gl.uniform1f(height, table_height);
    gl.drawArrays(gl.POINTS, 0, vertices.length);

    gl.useProgram(atoms);
    gl.uniform1f(width2, table_width);
    gl.uniform1f(height2, table_height);

    updatePositions();
    setBuffer();
    
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
    table_height = (canvas.height*table_width)/canvas.width;


    window.addEventListener("resize", function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gl.viewport(0, 0, canvas.width, canvas.height);
    });


    width = gl.getUniformLocation(program, "table_width");
    height = gl.getUniformLocation(program, "table_height");

    width2 = gl.getUniformLocation(atoms, "table_width");
    height2 = gl.getUniformLocation(atoms, "table_height");

    var constx = table_width/2;
    var consty = table_height/2;
    y = consty;


    for(let x = ( -constx + 0.05); x <= constx; x += grid_spacing) {
        for(let y = -consty; y <= consty; y += grid_spacing) {
            vertices.push(MV.vec3(x, y, 1.0));
            vertices.push(MV.vec3(x, y, 2.0));
        }
    }

    canvas.addEventListener("click", function(event) {
        var x = event.offsetX;
        var y = event.offsetY;

        var xvec = (table_width*x/canvas.width) - constx;
        var yvec = consty - (table_height*y/canvas.height);
        
        position.push(vec2(xvec, yvec));

        angles.push(calcAngle(xvec, yvec));

        if(event.shiftKey){
            values.push(chargeneg);
            charge.push(MV.vec3(xvec, yvec, chargeneg));
        } else {
            values.push(chargepos);
            charge.push(MV.vec3(xvec, yvec, chargepos));
        }
        
        atomsnumber++;


        for(let i=0; i<position.length; i++){
            const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
            gl.uniform2fv(uPosition, MV.flatten(position[i]));
        }
        
        
        for(let i=0; i<values.length; i++){
            const ePosition = gl.getUniformLocation(program, "ePosition[" + i + "]");
            gl.uniform1f(ePosition, values[i]);
        }
        
        setBuffer();

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