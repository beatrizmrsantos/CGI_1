attribute vec4 vPosition;

const float ke = 8.99*pow(10.0, 9.0);

uniform float table_width;
uniform float table_height;

uniform int counter;

const int MAX_CHARGES = 20;
//posicoes cargas
uniform vec2 uPosition[MAX_CHARGES];
//valores cargas
uniform float ePosition[MAX_CHARGES];

void main()
{
    gl_PointSize = 4.0;

    float campo = 0.0;

    gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1, 1);

/*
    for( int i=0; i<MAX_CHARGES; i++){
        if(i<counter){
            campo += ke * ePosition[i] / ( pow( (uPosition[i].x - vPosition.x), 2.0) + pow( (uPosition[i].y - vPosition.y), 2.0) );
        }
        
    }
*/


    

}

