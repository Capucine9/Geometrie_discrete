
precision mediump float;

varying vec4 pos3D;
varying vec3 N;

// can be calculated in the shader
uniform mat4 uInverseRMatrix;

uniform sampler2D uCubeTexture0;
uniform sampler2D uCubeTexture1;
uniform sampler2D uCubeTexture2;
uniform sampler2D uCubeTexture3;
uniform sampler2D uCubeTexture4;
uniform sampler2D uCubeTexture5;

uniform float uCubeSizeTexture;



vec4 computeLambert(vec4 point) {
	vec3 col = vec3(0.4,0.9,0.4) * dot(N,normalize(vec3(-pos3D))); // Lambert rendering, eye light source
	return vec4(col,1.0);
}


vec4 computeMirror(vec4 point, vec3 norm) {
	// reflect ray around normal from eye to surface
	vec3 incident_eye = normalize(vec3(point));
	vec3 normal = normalize(N);

	vec3 reflected = reflect(incident_eye, norm);
	// convert from eye to world space
	reflected = vec3(uInverseRMatrix * vec4(reflected, 0.0));
	vec3 pos3D_scene = vec3(uInverseRMatrix * pos3D);


	// pnt.z + t*dir.z = face.z     =>    t = (face.z - pnt.z)/dir.z
	float tBottom = (-uCubeSizeTexture - pos3D_scene.z)/reflected.z;
	float tTop = (uCubeSizeTexture - pos3D_scene.z)/reflected.z;

	float tRight = (uCubeSizeTexture - pos3D_scene.x)/reflected.x;
	float tLeft = (-uCubeSizeTexture - pos3D_scene.x)/reflected.x;

	float tForward = (uCubeSizeTexture - pos3D_scene.y)/reflected.y;
	float tBackward = (-uCubeSizeTexture - pos3D_scene.y)/reflected.y;

	// compute intersection points
	vec3 interBottom = pos3D_scene + reflected * tBottom;
	vec3 interTop = pos3D_scene + reflected * tTop;
	vec3 interRight = pos3D_scene + reflected * tRight;
	vec3 interLeft = pos3D_scene + reflected * tLeft;
	vec3 interForward = pos3D_scene + reflected * tForward;
	vec3 interBackward = pos3D_scene + reflected * tBackward;


	if ( tBottom > 0.0 && abs(interBottom.x) <= uCubeSizeTexture && abs(interBottom.y) <= uCubeSizeTexture )
		return texture2D(uCubeTexture4, vec2(0.5 + interBottom.x/(2.0*uCubeSizeTexture), 0.5 + interBottom.y/(2.0*uCubeSizeTexture)));
	else if ( tTop > 0.0 && abs(interTop.x) <= uCubeSizeTexture && abs(interTop.y) <= uCubeSizeTexture )
		return texture2D(uCubeTexture2, vec2(0.5 + (interTop.x)/(2.0*uCubeSizeTexture), 0.5 + (-interTop.y)/(2.0*uCubeSizeTexture)));
	
	
	else if ( tRight > 0.0 && abs(interRight.z) <= uCubeSizeTexture && abs(interRight.y) <= uCubeSizeTexture )
		return texture2D(uCubeTexture1, vec2(0.5 + (-interRight.y)/(2.0*uCubeSizeTexture), 0.5 + interRight.z/(2.0*uCubeSizeTexture)));
	else if ( tLeft > 0.0 && abs(interLeft.z) <= uCubeSizeTexture && abs(interLeft.y) <= uCubeSizeTexture )
		return texture2D(uCubeTexture5, vec2(0.5 + interLeft.y/(2.0*uCubeSizeTexture), 0.5 + interLeft.z/(2.0*uCubeSizeTexture)));
	

	else if ( tForward > 0.0 && abs(interForward.x) <= uCubeSizeTexture && abs(interForward.z) <= uCubeSizeTexture )
		return texture2D(uCubeTexture0, vec2(0.5 + interForward.x/(2.0*uCubeSizeTexture), 0.5 + interForward.z/(2.0*uCubeSizeTexture)));	
	else if ( tBackward > 0.0 && abs(interBackward.x) <= uCubeSizeTexture && abs(interBackward.z) <= uCubeSizeTexture )
		return texture2D(uCubeTexture3, vec2(0.5 + (-interBackward.x)/(2.0*uCubeSizeTexture), 0.5 + interBackward.z/(2.0*uCubeSizeTexture)));

}




// ==============================================
void main(void)
{
	//gl_FragColor = computeLambert(pos3D);
	gl_FragColor = computeMirror(pos3D, N);	
}

