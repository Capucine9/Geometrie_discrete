
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


void calulateTexture(sampler2D s, vec3 reflected, int case) {

	// X (left and right)
	if ( case == 1 ) {
		if ( reflected.y < 0.0 ) {
			if ( reflected.z > 0.0 )
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.y/2.0, 0.5 + reflected.z/2.0));
			else
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.y/2.0, 0.5 + reflected.z/2.0));
		}else{
			if ( reflected.z > 0.0 )
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.y/2.0, 0.5 + reflected.z/2.0));
			else
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.y/2.0, 0.5 + reflected.z/2.0));
		}

	
	// Y (forward and backward)
	}else if ( case == 2 ) {
		if ( reflected.x < 0.0 ) {
			if ( reflected.z > 0.0 )
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.x/2.0, 0.5 + reflected.z/2.0));
			else
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.x/2.0, 0.5 + reflected.z/2.0));
		}else{
			if ( reflected.z > 0.0 )
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.x/2.0, 0.5 + reflected.z/2.0));
			else
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.x/2.0, 0.5 + reflected.z/2.0));
		}
	
	

	// Z (top and bottom)
	}else if ( case == 3 ) {
		if ( reflected.x < 0.0 ) {
			if ( reflected.y > 0.0 )
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.x/2.0, 0.5 + reflected.y/2.0));
			else
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.x/2.0, 0.5 + reflected.y/2.0));
		}else{
			if ( reflected.y > 0.0 )
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.x/2.0, 0.5 + reflected.y/2.0));
			else
				gl_FragColor = texture2D(s, vec2(0.5 + reflected.x/2.0, 0.5 + reflected.y/2.0));
		}
	}
}


// ==============================================
void main(void)
{

	// ------------------------------------------------------- LAMBERT
	//vec3 col = vec3(0.4,0.9,0.4) * dot(N,normalize(vec3(-pos3D))); // Lambert rendering, eye light source
	//gl_FragColor = vec4(col,1.0);
	

	// ------------------------------------------------------- MIROIR
	// reflect ray around normal from eye to surface
	vec3 incident_eye = normalize(vec3(pos3D));
	vec3 normal = normalize(N);

	vec3 reflected = reflect(incident_eye, normal);
	// convert from eye to world space
	reflected = vec3(uInverseRMatrix * vec4(reflected, 0.0));
	vec3 pos3D_scene = vec3(uInverseRMatrix * pos3D);

	gl_FragColor = vec4(0.2,0.4,0.2,1.0);


	// pnt.z + t*dir.z = plan.z     =>    t = (plan.z - pnt.z)/dir.z
	
	float tBottom = (-uCubeSizeTexture - pos3D_scene.z)/reflected.z;
	float tTop = (uCubeSizeTexture - pos3D_scene.z)/reflected.z;

	float tRight = (uCubeSizeTexture - pos3D_scene.x)/reflected.x;
	float tLeft = (-uCubeSizeTexture - pos3D_scene.x)/reflected.x;

	float tForward = (uCubeSizeTexture - pos3D_scene.y)/reflected.y;
	float tBackward = (-uCubeSizeTexture - pos3D_scene.y)/reflected.y;

	vec3 interBottom = pos3D_scene + reflected * tBottom;
	if (  tBottom > 0.0 && interBottom.z == -uCubeSizeTexture && abs(interBottom.x) <= uCubeSizeTexture && abs(interBottom.y) <= uCubeSizeTexture )
		gl_FragColor = texture2D(uCubeTexture4, vec2(0.5 + interBottom.x/(2.0*uCubeSizeTexture), 0.5 + interBottom.y/(2.0*uCubeSizeTexture)));
		//gl_FragColor = vec4(0.8,0.4,0.2,1.0);
		







	// // if ray go to the right
	// if ( reflected.x > 0.5 && reflected.y < 0.5 && reflected.y > -0.5 && reflected.z < 0.5 && reflected.z > -0.5 )
	// 		calulateTexture(uCubeTexture5, reflected, 1);
	// // if ray go to the left
	// else if ( reflected.x < -0.5 && reflected.y < 0.5 && reflected.y > -0.5 && reflected.z < 0.5 && reflected.z > -0.5 )
	// 		calulateTexture(uCubeTexture1, reflected, 1);
	
	// // if ray go to the forward
	// else if ( reflected.y > 0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.z < 0.5 && reflected.z > -0.5 )
	// 	calulateTexture(uCubeTexture0, reflected, 2);

	// // if ray go to the backwards
	// else if (reflected.y < -0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.z < 0.5 && reflected.z > -0.5 )
	// 	calulateTexture(uCubeTexture3, reflected, 2);

	// // if ray go to the top
	// else if ( reflected.z > 0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.y < 0.5 && reflected.y > -0.5 )
	// 	calulateTexture(uCubeTexture2, reflected, 3);

	// // if ray go to the bottom
	// else if (reflected.z < -0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.y < 0.5 && reflected.y > -0.5 ) 
	// 	calulateTexture(uCubeTexture4, reflected, 3);
	
	 
	// //if (reflected.z < -0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.y < 0.5 && reflected.y > -0.5 ) 
	// 	//gl_FragColor = vec4(0.3,0.1,0.1,1.0);

	// //float coef ( reflected.x - reflected.y ) -1/-0.5 (x)   0/-0.5 (y) 
	// if ( reflected.z < -0.5 || ( reflected.z < -0.1 && reflected.x > -1.0 && reflected.x < -0.5 && reflected.y < 0.0 && reflected.y > -0.5) )
	// 	calulateTexture(uCubeTexture4, reflected, 3);

	
}

