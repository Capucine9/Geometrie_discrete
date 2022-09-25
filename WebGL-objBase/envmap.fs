
precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

void main(void) {
	gl_FragColor = texture2D(uSampler, vec2(tCoords.s, tCoords.t)); //*2.0
}
