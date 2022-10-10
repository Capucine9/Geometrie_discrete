
precision mediump float;

varying vec4 pos3D;
varying vec3 N;

uniform mat4 uInverseRMatrix;
uniform sampler2D uCubeTexture0;
uniform sampler2D uCubeTexture1;
uniform sampler2D uCubeTexture2;
uniform sampler2D uCubeTexture3;
uniform sampler2D uCubeTexture4;
uniform sampler2D uCubeTexture5;


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
	

	gl_FragColor = vec4(0.2,0.4,0.2,1.0);

	// if ray go to the right
	if ( reflected.x > 0.5 && reflected.y < 0.5 && reflected.y > -0.5 && reflected.z < 0.5 && reflected.z > -0.5 )
			calulateTexture(uCubeTexture5, reflected, 1);
	// if ray go to the left
	else if ( reflected.x < -0.5 && reflected.y < 0.5 && reflected.y > -0.5 && reflected.z < 0.5 && reflected.z > -0.5 )
			calulateTexture(uCubeTexture1, reflected, 1);
	
	// if ray go to the forward
	else if ( reflected.y > 0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.z < 0.5 && reflected.z > -0.5 )
		calulateTexture(uCubeTexture0, reflected, 2);

	// if ray go to the backwards
	else if (reflected.y < -0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.z < 0.5 && reflected.z > -0.5 )
		calulateTexture(uCubeTexture3, reflected, 2);

	// if ray go to the top
	else if ( reflected.z > 0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.y < 0.5 && reflected.y > -0.5 )
		calulateTexture(uCubeTexture2, reflected, 3);

	// if ray go to the bottom
	else if (reflected.z < -0.5 && reflected.x < 0.5 && reflected.x > -0.5 && reflected.y < 0.5 && reflected.y > -0.5 ) 
		calulateTexture(uCubeTexture4, reflected, 3);

}

