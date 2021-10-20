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
    vec2 vetor;
    vec2 normal;
    vec2 total = vec2(0.0,0.0);
    float campo;
    
    
    gl_PointSize = 4.0;


    for( int i=0; i<MAX_CHARGES; i++){
        if(i<counter){

            campo += ke * ePosition[i] / ( pow( (uPosition[i].x - vPosition.x), 2.0) + pow( (uPosition[i].y - vPosition.y), 2.0) );
            
            if(ePosition[i] > 0.0){
                vetor.x = (uPosition[i].x - vPosition.x);
                vetor.y = (uPosition[i].y - vPosition.y);
            } else {
                vetor.x = (vPosition.x - uPosition[i].x);
                vetor.y = (vPosition.y - uPosition[i].y);
            }
            
            normal = normalize(vetor);

            normal.x = normal.x * campo;
            normal.y = normal.y * campo;

            total.x += normal.x;
            total.y += normal.y;

            total.x= (total.x*0.25)/table_width;
            total.y= (total.y*0.25)/table_height;
        }
    }

    float variable = vPosition.z;

    if(variable == 2.0){
        gl_Position.x = (vPosition.x + total.x) / (table_width/2.0);
        gl_Position.y = (vPosition.y + total.y) / (table_height/2.0);
      
    } else {
        gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1, 1);
       
    }

    gl_Position.z = 0.0;

}

