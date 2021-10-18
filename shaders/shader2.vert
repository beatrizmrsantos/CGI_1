attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

uniform float uTheta;

const int MAX_CHARGES = 20;
//posicoes cargas
uniform vec2 uPosition[MAX_CHARGES];
//valores cargas
uniform float ePosition[MAX_CHARGES];


void main()
{
    gl_PointSize = 4.0;
    gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1, 1);


    float x = vPosition.x / (table_width/2.0);
    float y = vPosition.y / (table_height/2.0);

    gl_Position.x = -sin(uTheta)*y + cos(uTheta)*x;
    gl_Position.y = sin(uTheta)*x + cos(uTheta)*y;
    gl_Position.y = 0.0;
    gl_Position.w = 1.0;

}

