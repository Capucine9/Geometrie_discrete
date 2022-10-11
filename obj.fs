
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

uniform vec3 uType;

uniform float uCubeSizeTexture;



vec4 findTexturePixel (vec3 direction) {
	vec3 pos3D_scene = vec3(uInverseRMatrix * pos3D);


	float tBottom = (-uCubeSizeTexture - pos3D_scene.z)/direction.z;
	float tTop = (uCubeSizeTexture - pos3D_scene.z)/direction.z;

	float tRight = (uCubeSizeTexture - pos3D_scene.x)/direction.x;
	float tLeft = (-uCubeSizeTexture - pos3D_scene.x)/direction.x;

	float tForward = (uCubeSizeTexture - pos3D_scene.y)/direction.y;
	float tBackward = (-uCubeSizeTexture - pos3D_scene.y)/direction.y;


	// compute intersection points
	vec3 interBottom = pos3D_scene + direction * tBottom;
	vec3 interTop = pos3D_scene + direction * tTop;
	vec3 interRight = pos3D_scene + direction * tRight;
	vec3 interLeft = pos3D_scene + direction * tLeft;
	vec3 interForward = pos3D_scene + direction * tForward;
	vec3 interBackward = pos3D_scene + direction * tBackward;


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
	else return vec4(0.8,0.2,0.5,1.0);
}


vec4 computeLambert(vec4 point) {
	vec3 col = vec3(0.4,0.9,0.4) * dot(N,normalize(vec3(-pos3D))); // Lambert rendering, eye light source
	return vec4(col,1.0);
}


vec4 computeMirror( vec4 point, vec3 norm ) {
	// reflect ray around normal from eye to surface
	vec3 incident_eye = normalize(vec3(point));
	vec3 normal = normalize(N);

	vec3 reflected = reflect(incident_eye, norm);
	// convert from eye to world space
	reflected = vec3(uInverseRMatrix * vec4(reflected, 0.0));

	return findTexturePixel(reflected);
}


vec4 computeTransparent( vec4 point, vec3 norm ) {
	vec3 incident_eye = normalize(vec3(point));
	vec3 normal = normalize(N);

	vec3 refracted = refract(incident_eye, normal, 1.0/(1.1));
	refracted = vec3(uInverseRMatrix * vec4(refracted, 0.0));
	refracted = vec3(findTexturePixel(refracted));

	vec3 reflected = vec3(computeMirror(point, norm));

	float coef = 0.8;
	return vec4(refracted*coef + reflected*(1.0-coef),1.0);
}





// ==============================================
void main(void)
{
	if ( uType.x == 1.0 )
		gl_FragColor = computeLambert(pos3D);
	else if ( uType.z == 1.0 )
		gl_FragColor = computeMirror(pos3D, N);	
	else
		gl_FragColor = computeTransparent(pos3D, N);
}

