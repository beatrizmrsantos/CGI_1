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
//var thetaLoc, number;

var x = table_width/2;;
var y = 0;

var position = [MAX_CHARGES];
var values = [MAX_CHARGES];
var vertices = [];
var angles = [MAX_CHARGES];

var atomsnumber = 0;
var theta = 0.01;
let direction = true;


function animate()
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    updatePositions();
    updateAngles();
    
    gl.useProgram(program);
    gl.uniform1f(width, table_width);
    gl.uniform1f(height, table_height);
    gl.drawArrays(gl.POINTS, 0, vertices.length);

    gl.useProgram(atoms);
    gl.uniform1f(width2, table_width);
    gl.uniform1f(height2, table_height);

    //gl.uniform1i(number, 0);
    //gl.uniform1f(thetaLoc, theta);
    
    if(direction){
        gl.drawArrays(gl.POINTS, vertices.length, position.length);
    }
    
}

function updatePositions(){
    for(let i=0; i<position.length; i++){
        if(values[i] > 0.0){
            position[i] = vec2( (-Math.sin(angles[i])*y + Math.cos(angles[i])*x), (Math.sin(angles[i])*x + Math.cos(angles[i])*y) ); 
        } else {
            position[i] = vec2( (-Math.sin(-angles[i])*y + Math.cos(-angles[i])*x), (Math.sin(-angles[i])*x + Math.cos(-angles[i])*y) );
        }
    }
}

function updateAngles(){
    for(let i=0; i<angles.length; i++){
        angles[i] += theta;
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

    /*
    thetaLoc = gl.getUniformLocation(atoms, "uTheta");
    number = gl.getUniformLocation(atoms, "counter");
    */

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

    //console.log(buffer[0], vertices[0], buffer[3], vertices[3]);

    canvas.addEventListener("click", function(event) {
        var x = event.offsetX;
        var y = event.offsetY;

        var xvec = (table_width*x/canvas.width) - constx;
        var yvec = consty - (table_height*y/canvas.height);

        position.push(vec2(xvec, yvec));
        
        angles.push(Math.tanh(yvec/xvec));

        if(event.shiftKey){
            values.push(chargeneg);
            //vertices.push(MV.vec3(xvec, yvec, chargeneg));
        } else {
            values.push(chargepos);
            //vertices.push(MV.vec3(xvec, yvec, chargepos));
        }

        /*
        const uPosition = gl.getUniformLocation(atmos, "uPosition[" + atmosnumber + "]");
        gl.uniform2fv(uPosition, position[atmosnumber]);
        
        
        const ePosition = gl.getUniformLocation(atmos, "ePosition[" + atmosnumber + "]");
        gl.uniform1f(ePosition, valores[atmosnumber]);
        */

        atomsnumber++;


        for(let i=0; i<position.length; i++){
            const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
            gl.uniform2fv(uPosition, flatten(position[i]));
        }
        
        
        for(let i=0; i<values.length; i++){
            const ePosition = gl.getUniformLocation(program, "ePosition[" + i + "]");
            gl.uniform1f(ePosition, values[i]);
        }
        

        aBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 2048, gl.STATIC_DRAW);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(vertices));
        gl.bufferSubData(gl.ARRAY_BUFFER, vertices.length*16, MV.flatten(position));
        
        //gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(buffer), gl.STATIC_DRAW);

        vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

    });


    window.addEventListener("keydown", function(event) {
        if(event.code == "Space"){
            direction = !direction;
        }
    });

    

    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 2048, gl.STATIC_DRAW);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(vertices));
    gl.bufferSubData(gl.ARRAY_BUFFER, vertices.length*16, MV.flatten(position));

    //gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(buffer), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader2.vert", "shader1.frag", "shader2.frag"]).then(s => setup(s));