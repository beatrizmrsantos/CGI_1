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
var theta = 0.01;
let direction = true;


function animate()
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    updateAngles();
    updatePositions();

    //console.log(angles[0]);
    
    gl.useProgram(program);
    gl.uniform1f(width, table_width);
    gl.uniform1f(height, table_height);
    gl.drawArrays(gl.POINTS, 0, vertices.length);

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
        console.log(angles[angles.length - 1]);

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
            gl.uniform2fv(uPosition, flatten(position[i]));
        }
        
        
        for(let i=0; i<values.length; i++){
            const ePosition = gl.getUniformLocation(program, "ePosition[" + i + "]");
            gl.uniform1f(ePosition, values[i]);
        }
        

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

      //  console.log(charge.length);
        //console.log(buffer.length);

    });


    window.addEventListener("keydown", function(event) {
        if(event.code == "Space"){
            direction = !direction;
        }
    });

    
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

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

function updatePositions(){
    //console.log(charge[0]);
    //console.log(position[0]);
    //console.log(angles[0]);

    for(let i=0; i<position.length; i++){
        if(values[i] > 0.0){
            position[i][0] = -Math.sin(angles[i])*y + Math.cos(angles[i])*x;
            position[i][1] = Math.sin(angles[i])*x + Math.cos(angles[i])*y;
            charge[i][0] = position[i][0];
            charge[i][1] = position[i][1];

        } else {
            position[i][0] = -Math.sin(-angles[i])*y + Math.cos(-angles[i])*x;
            position[i][1] = Math.sin(-angles[i])*x + Math.cos(-angles[i])*y;
            charge[i][0] = position[i][0];
            charge[i][1] = position[i][1]; 
        }
    }
}

function updateAngles(){
    for(let i=0; i<angles.length; i++){
        angles[i] += theta;
    }
}

function calcAngle(x, y){
    var hip = Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
    
    var angle = Math.asin(y/hip);

    console.log(angle);

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


UTILS.loadShadersFromURLS(["shader1.vert", "shader2.vert", "shader1.frag", "shader2.frag"]).then(s => setup(s));