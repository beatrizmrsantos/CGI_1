attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

//uniform float uTheta;

varying vec4 fColor;


void main()
{
    gl_PointSize = 4.0;
    gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1, 1);

    float variable = vPosition.z;

    if(variable > 0.0){
        fColor = vec4(0.0, 1.0, 0.0, 1.0);
    } else {
        fColor = vec4(1.0, 0.0, 0.0, 1.0);
    }

    /*
    float x = vPosition.x / (table_width/2.0);
    float y = vPosition.y / (table_height/2.0);
    
    if(variable > 0.0){
        gl_Position.x = -sin(uTheta)*y + cos(uTheta)*x;
        gl_Position.y = sin(uTheta)*x + cos(uTheta)*y;
        gl_Position.z = 0.0;
        gl_Position.w = 1.0;
    } else {
        gl_Position.x = -sin(-uTheta)*y + cos(-uTheta)*x;
        gl_Position.y = sin(-uTheta)*x + cos(-uTheta)*y;
        gl_Position.z = 0.0;
        gl_Position.w = 1.0;
    }
*/
    
}

