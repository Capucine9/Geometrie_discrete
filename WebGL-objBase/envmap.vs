
attribute vec3 aVertexPosition;
attribute vec2 atCoords;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

//varying car varie d'un pixel a lautre
varying vec2 tCoords;
varying vec3 vPosOrigin;

void main(void) {
	tCoords = atCoords;
	vPosOrigin = aVertexPosition;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
