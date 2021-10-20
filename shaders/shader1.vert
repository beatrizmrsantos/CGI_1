#define TWOPI 6.28318530718

attribute vec4 vPosition;
varying vec4 fColor;

const float ke = 8.988*pow(10.0, 9.0);

uniform float table_width;
uniform float table_height;

uniform int counter;

const int MAX_CHARGES = 30;
//posicoes cargas
uniform vec2 uPosition[MAX_CHARGES];
//valores cargas
uniform float ePosition[MAX_CHARGES];

// convert angle to hue; returns RGB
    // colors corresponding to (angle mod TWOPI):
    // 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
    vec3 angle_to_hue(float angle){
        angle /= TWOPI;
        return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
    }


    vec3 hsv2rgb(vec3 c){
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    vec4 colorize(vec2 f){
        float a = atan(f.y, f.x);
        return vec4(angle_to_hue(a-TWOPI), 1.);
    }


void main(){
    vec2 vetor = vec2(0.0,0.0);
    vec2 normal= vec2(0.0,0.0);
    vec2 total = vec2(0.0,0.0);
    float campo = 0.0;
    
    gl_PointSize = 4.0;

    for( int i=0; i<MAX_CHARGES; i++){
        if(i<counter){
            
            if(ePosition[i] < 0.0){
                vetor.x = (uPosition[i].x - vPosition.x);
                vetor.y = (uPosition[i].y - vPosition.y);
                campo = ke * (- ePosition[i] ) / (pow(vetor.x, 2.0) + pow(vetor.y, 2.0));
            } else {
                vetor.x = (vPosition.x - uPosition[i].x);
                vetor.y = (vPosition.y - uPosition[i].y);
                campo = ke * ePosition[i] / (pow(vetor.x, 2.0) + pow(vetor.y, 2.0));
            }

            normal = normalize(vetor);

            normal.x = normal.x * campo;
            normal.y = normal.y * campo;

            total.x += normal.x;
            total.y += normal.y;
        }
    }

    total.x= (total.x*0.25) / pow(10.0, 12.0);
    total.y= (total.y*0.25) / pow(10.0, 12.0);
    
    //total.x= total.x*pow(10.0, -12.0);
    //total.y= total.y*pow(10.0, -12.0);
    if( sqrt((pow(total.x, 2.0) + pow(total.y, 2.0))) > 0.25){
        normal = normalize(total);
        total = 0.25 * normal;
    } 

    

    float variable = vPosition.z;

    if(variable == 2.0){
        gl_Position = vec4(vPosition.x + total.x, vPosition.y + total.y, 1, 1) / vec4(table_width/2.0, table_height/2.0, 1, 1);
    } else {
        gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1, 1);
    }

    gl_Position.z = 0.0;

    fColor = colorize(total);

}

