attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

const int MAX_CHARGES = 20;
//posicoes cargas
uniform vec2 uPosition[MAX_CHARGES];
//valores cargas
uniform vec2 ePosition[MAX_CHARGES];

void main()
{
    gl_PointSize = 4.0;
    gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1, 1);

}

