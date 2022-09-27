
precision mediump float;

varying vec2 tCoords;
varying vec3 vPosOrigin;
uniform float size;

uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;
uniform sampler2D uSampler4;
uniform sampler2D uSampler5;


void main(void) {
	vec4 color = vec4(0,0,0,1);

if(vPosOrigin.y==size){
	color = texture2D(uSampler0, vec2(tCoords.s, tCoords.t));
}
else (vPosOrigin.x==size){
	color = texture2D(uSampler1, vec2(tCoords.s, tCoords.t));
}
else (vPosOrigin.z==size){
	color = texture2D(uSampler2, vec2(tCoords.s, tCoords.t));
}
else (vPosOrigin.y==-size){
	color = texture2D(uSampler3, vec2(tCoords.s, tCoords.t));
}
else (vPosOrigin.z==-size){
	color = texture2D(uSampler4, vec2(tCoords.s, tCoords.t));
}
else {
	color = texture2D(uSampler5, vec2(tCoords.s, tCoords.t));
}

	gl_FragColor = color;
}
