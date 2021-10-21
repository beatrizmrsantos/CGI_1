precision highp float;

varying vec4 fColor;
varying vec4 fColorneg;

void main(){
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;

    float distance = length(fragmentPosition);
    float r = distance * distance;

    if (r > 1.0){
        discard;
    }


    if(fColor == vec4(1.0, 0.0, 0.0, 1.0)){
        if ( fragmentPosition.y < 0.2 &&  fragmentPosition.y > -0.2 && fragmentPosition.x < 0.7 &&  fragmentPosition.x > -0.7) {
            discard;
        }
    } else {
        if ( fragmentPosition.y < 0.2 &&  fragmentPosition.y > -0.2 && fragmentPosition.x < 0.7 &&  fragmentPosition.x > -0.7) {
            discard;
        }
        if(fragmentPosition.y > -0.7 &&  fragmentPosition.y < 0.7 && fragmentPosition.x > -0.2 &&  fragmentPosition.x < 0.2){
            discard;
        }
    }
    

    gl_FragColor = fColor;

    
}