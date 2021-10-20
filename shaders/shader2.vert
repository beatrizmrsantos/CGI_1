attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

varying vec4 fColor;


void main()
{
    gl_PointSize = 18.0;
    gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1, 1);

    gl_Position.z = 0.0;

    float variable = vPosition.z;

    if(variable > 0.0){
        fColor = vec4(0.0, 1.0, 0.0, 1.0);
    } else {
        fColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    
}

