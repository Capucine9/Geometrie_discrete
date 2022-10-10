
attribute vec3 aVertexPosition;
attribute vec2 aTexCoords;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

//varying car varie d'un pixel a l'autre
varying vec2 tCoords;
varying vec3 vPosOrigin;

void main(void) {
	tCoords = aTexCoords;
	vPosOrigin = aVertexPosition;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
