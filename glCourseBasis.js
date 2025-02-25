
// =====================================================
var gl;

// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var rotMatrix = mat4.create();
var distCENTER;
// =====================================================

// Bunny
var OBJ1 = null;
// Porche
var OBJ2 = null;
// Mustang
var OBJ3 = null;
// Sphere
var OBJ4 = null;
var PLANE = null;
// EnvMap
var ENVMAP = null;

var CubeSize = 50.0;
var type = new Float32Array([1.0,0.0,0.0]);
var color = new Float32Array([0.0,0.0,1.0]);
var chemin = null;

// =====================================================
// OBJET 3D, lecture fichier obj
// =====================================================

class objmesh {

	// --------------------------------------------
	constructor(objFname) {
		this.objName = objFname;
		this.shaderName = 'obj';
		this.loaded = -1;
		this.shader = null;
		this.mesh = null;

		loadObjFile(this);
		loadShaders(this);
	}

	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.nAttrib = gl.getAttribLocation(this.shader, "aVertexNormal");
		gl.enableVertexAttribArray(this.shader.nAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
		gl.vertexAttribPointer(this.shader.nAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.rMatrixUniform = gl.getUniformLocation(this.shader, "uRMatrix");
		this.shader.InverseRMatrixUniform = gl.getUniformLocation(this.shader, "uInverseRMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");

		
		this.shader.uType = gl.getUniformLocation(this.shader, "uType");
		gl.uniform3fv(this.shader.uType, type);
		this.shader.uCol = gl.getUniformLocation(this.shader, "uColor");
		gl.uniform3fv(this.shader.uCol, color);

		this.shader.uCubeSizeTexture = gl.getUniformLocation(this.shader, "uCubeSizeTexture");
		gl.uniform1f(this.shader.uCubeSizeTexture, CubeSize)

		// pass all the sampler of the cube
		this.shader.sampler0 = gl.getUniformLocation(this.shader, "uCubeTexture0");
		gl.uniform1i(this.shader.sampler0, 0);
		this.shader.sampler1 = gl.getUniformLocation(this.shader, "uCubeTexture1");
		gl.uniform1i(this.shader.sampler1, 1);
		this.shader.sampler2 = gl.getUniformLocation(this.shader, "uCubeTexture2");
		gl.uniform1i(this.shader.sampler2, 2);
		this.shader.sampler3 = gl.getUniformLocation(this.shader, "uCubeTexture3");
		gl.uniform1i(this.shader.sampler3, 3);
		this.shader.sampler4 = gl.getUniformLocation(this.shader, "uCubeTexture4");
		gl.uniform1i(this.shader.sampler4, 4);
		this.shader.sampler5 = gl.getUniformLocation(this.shader, "uCubeTexture5");
		gl.uniform1i(this.shader.sampler5, 5);
	}

	// --------------------------------------------
	setMatrixUniforms() {
		// calculate the inverse of rotation matrix
		var tmp = mat4.create();
		tmp = mat4.transpose(rotMatrix, tmp);

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);
		gl.uniformMatrix4fv(this.shader.rMatrixUniform, false, rotMatrix);
		gl.uniformMatrix4fv(this.shader.InverseRMatrixUniform, false, tmp);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
	}

	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4 && this.mesh != null) {
			this.setShadersParams();
			this.setMatrixUniforms();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
			gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
}



// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

class plane {

	// --------------------------------------------
	constructor() {
		this.shaderName='plane';
		this.loaded=-1;
		this.shader=null;
		this.initAll();
	}

	// --------------------------------------------
	initAll() {
		var size=1.0;
		var vertices = [
			-size, -size, 0.0,
			 size, -size, 0.0,
			 size, size, 0.0,
			-size, size, 0.0
		];

		var texcoords = [
			0.0,0.0,
			0.0,1.0,
			1.0,1.0,
			1.0,0.0
		];

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = 4;

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
		this.tBuffer.itemSize = 2;
		this.tBuffer.numItems = 4;

		loadShaders(this);
	}


	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
		gl.enableVertexAttribArray(this.shader.tAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);

		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
	}

	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4) {
			this.setShadersParams();

			gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
			gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
		}
	}

}



// =====================================================
// 3D CUBE
// =====================================================
class envMap {
	// --------------------------------------------
	constructor() {
		this.shaderName='envmap';
		this.loaded=-1;
		this.shader=null;
		this.nbTextures = 0
		this.textureArray = null;
		this.indexBuffer = null;
		this.initAll();
	}

	// --------------------------------------------
	initAll() {
		var size = CubeSize;


		/*
				g____________ h
		Z	 _-*|		_-*	|
		c _-*_________-*	|
		 |		|	  | d	|
		 |		|     |		|
		 |	Y/f	| ____|_____| e
		 |	 _-*	  |	 _-*
		 |_-*_________|-*  X
		b			  a
		*/

		var vertices = [
			// derriere
			// abcd
			size, -size, -size,
			-size, -size, -size,
			-size, -size, size,
			size, -size, size,

			// gauche
			// bfgc
			-size, -size, -size,
			-size, size, -size,
			-size, size, size,
			-size, -size, size,

			// haut
			// ghdc
			-size, size, size,
			size, size, size,
			size, -size, size,
			-size, -size, size,
			
			

			// devant (la caméra, derrière le lapin)
			//ghef
			/*
			-size, size, size,
			-size, size, -size,
			size, size, -size,
			size, size, size,*/
			// fehg
			-size, size, -size,
			size, size, -size,
			size, size, size,
			-size, size, size,

			// bas
			//dceh
			-size, -size, -size,
			size, -size, -size,
			size, size, -size,
			-size, size, -size,

			// droite
			//ecbf
			size, size, -size,
			size, -size, -size,
			size, -size, size,
			size, size, size,

		];

		var texcoords = [
			0.0,0.0,
			1.0,0.0,
			1.0,1.0,
			0.0,1.0,

			0.0,0.0,
			1.0,0.0,
			1.0,1.0,
			0.0,1.0,

			// haut
			0.0,0.0,
			1.0,0.0,
			1.0,1.0,
			0.0,1.0,

			0.0,0.0,
			1.0,0.0,
			1.0,1.0,
			0.0,1.0,

			// bas
			0.0,0.0,
			1.0,0.0,
			1.0,1.0,
			0.0,1.0,

			0.0,0.0,
			1.0,0.0,
			1.0,1.0,
			0.0,1.0,
		];

		var indices = [
			// devant
			0, 1, 2,
			2, 3, 0,

			// gauche
			4, 5, 6,
			6, 7, 4,

			// haut
			8, 9, 10,
			10, 11, 8,

			// derriere
			12, 13, 14,
			14, 15, 12,

			// bas
			16, 17, 18,
			18, 19, 16,

			// droite
			20, 21, 22,
			22, 23, 20,
		];

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = 24;

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
		this.tBuffer.itemSize = 2;
		this.tBuffer.numItems = 24;

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		this.indexBuffer.itemSize = 1;
		this.indexBuffer.numItems = 36;

		this.initTextures();
		loadShaders(this);
	}


	// -------------------------------------
	initTextures() {
		var filesTextures = ["posz.jpg", "posx.jpg", "posy.jpg", "negz.jpg", "negy.jpg", "negx.jpg"];
		this.textureArray = [];

		for (var i=0; i<filesTextures.length; i++){
			var texImage = new Image();
			if (chemin == null)
				chemin = "./textures/SanFrancisco3/";
			texImage.src = chemin + filesTextures[i];
			var texture = gl.createTexture();
			texture.image = texImage;

			this.textureArray.push(texture);

			// TODO : verify texture id (in the array) and linked image
			texture.image.onload = () => {
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.bindTexture(gl.TEXTURE_2D, this.textureArray[this.nbTextures]);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureArray[this.nbTextures].image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				this.nbTextures ++;
			}
		}
	}

	newTexture() {
		var filesTextures = ["posz.jpg", "posx.jpg", "posy.jpg", "negz.jpg", "negy.jpg", "negx.jpg"];
		this.nbTextures = 0;
		for (var i=0; i<filesTextures.length; i++){
			this.textureArray[i].image = new Image();
			this.textureArray[i].image.src = chemin + filesTextures[i];


			// TODO : verify texture id (in the array) and linked image
			this.textureArray[i].image.onload = () => {
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.bindTexture(gl.TEXTURE_2D, this.textureArray[this.nbTextures]);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureArray[this.nbTextures].image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				this.nbTextures++;
			}
		}
	}


	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
		gl.enableVertexAttribArray(this.shader.tAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);

		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);

		this.shader.uCubeSize = gl.getUniformLocation(this.shader, "uCubeSize");
		gl.uniform1f(this.shader.uCubeSize, CubeSize)


		/////////////////////////////// All sampler
		// sampler 0
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textureArray[0]);
		this.shader.sampler0 = gl.getUniformLocation(this.shader, "uSampler0");
		gl.uniform1i(this.shader.sampler0, 0);
		// sampler 1
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.textureArray[1]);
		this.shader.sampler1 = gl.getUniformLocation(this.shader, "uSampler1");
		gl.uniform1i(this.shader.sampler1, 1);
		// sampler 2
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, this.textureArray[2]);
		this.shader.sampler2 = gl.getUniformLocation(this.shader, "uSampler2");
		gl.uniform1i(this.shader.sampler2, 2);
		// sampler 3
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.textureArray[3]);
		this.shader.sampler3 = gl.getUniformLocation(this.shader, "uSampler3");
		gl.uniform1i(this.shader.sampler3, 3);
		// sampler 4
		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, this.textureArray[4]);
		this.shader.sampler4 = gl.getUniformLocation(this.shader, "uSampler4");
		gl.uniform1i(this.shader.sampler4, 4);
		// sampler
		gl.activeTexture(gl.TEXTURE5);
		gl.bindTexture(gl.TEXTURE_2D, this.textureArray[5]);
		this.shader.sampler5 = gl.getUniformLocation(this.shader, "uSampler5");
		gl.uniform1i(this.shader.sampler5, 5);


	}

	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4) {
			this.setShadersParams();

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			//gl.drawArrays(gl.TRIANGLES, 0, this.vBuffer.numItems);
			//gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
		}
	}

}


// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================



// =====================================================
function initGL(canvas)
{
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.clearColor(0.7, 0.7, 0.7, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}


// =====================================================
loadObjFile = function(OBJ3D)
{
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var tmpMesh = new OBJ.Mesh(xhttp.responseText);
			OBJ.initMeshBuffers(gl,tmpMesh);
			OBJ3D.mesh=tmpMesh;
		}
	}

	xhttp.open("GET", OBJ3D.objName, true);
	xhttp.send();
}



// =====================================================
function loadShaders(Obj3D) {
	loadShaderText(Obj3D,'.vs');
	loadShaderText(Obj3D,'.fs');
}

// =====================================================
function loadShaderText(Obj3D,ext) {   // lecture asynchrone...
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		if(ext=='.vs') { Obj3D.vsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(ext=='.fs') { Obj3D.fsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(Obj3D.loaded==2) {
			Obj3D.loaded ++;
			compileShaders(Obj3D);
			Obj3D.loaded ++;
		}
	}
  }

  Obj3D.loaded = 0;
  xhttp.open("GET", Obj3D.shaderName+ext, true);
  xhttp.send();
}

// =====================================================
function compileShaders(Obj3D)
{
	Obj3D.vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(Obj3D.vshader, Obj3D.vsTxt);
	gl.compileShader(Obj3D.vshader);
	if (!gl.getShaderParameter(Obj3D.vshader, gl.COMPILE_STATUS)) {
		console.log("Vertex Shader FAILED... "+Obj3D.shaderName+".vs");
		console.log(gl.getShaderInfoLog(Obj3D.vshader));
	}

	Obj3D.fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(Obj3D.fshader, Obj3D.fsTxt);
	gl.compileShader(Obj3D.fshader);
	if (!gl.getShaderParameter(Obj3D.fshader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader FAILED... "+Obj3D.shaderName+".fs");
		console.log(gl.getShaderInfoLog(Obj3D.fshader));
	}

	Obj3D.shader = gl.createProgram();
	gl.attachShader(Obj3D.shader, Obj3D.vshader);
	gl.attachShader(Obj3D.shader, Obj3D.fshader);
	gl.linkProgram(Obj3D.shader);
	if (!gl.getProgramParameter(Obj3D.shader, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
		//console.log(gl.getShaderInfoLog(Obj3D.shader));
	}
}


// =====================================================
function webGLStart() {

	var canvas = document.getElementById("WebGL-test");

	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	canvas.onwheel = handleMouseWheel;

	initGL(canvas);

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);
	mat4.identity(rotMatrix);
	mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
	mat4.rotate(rotMatrix, rotY, [0, 0, 1]);

	distCENTER = vec3.create([0,-0.2,-3]);


	ENVMAP = new envMap();
	PLANE = new plane();
	OBJ1 = new objmesh('bunny.obj',);
	OBJ2 = new objmesh('porsche.obj');
	OBJ3 = new objmesh('mustang.obj');
	OBJ4 = new objmesh('sphere.obj');

	tick();
}

// =====================================================
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	ENVMAP.draw();
	
	// Recuperation du type de l'objet
	var type_material = document.querySelector('input[name="type"]:checked').value;
	if ( type_material == "opaque")
		type = new Float32Array([1.0,0.0,0.0])
	else if ( type_material == "transparent")
		type = new Float32Array([0.0,1.0,0.0])
	else if ( type_material == "miroir")
		type = new Float32Array([0.0,0.0,1.0])


	// Recuperation de l'objet a afficher
	var object = document.querySelector('input[name="object"]:checked').value;
	if ( object == "bunny")
		OBJ1.draw();
	else if ( object == "mustang")
		OBJ2.draw();
	else if ( object == "porsche")
		OBJ3.draw();
	else if ( object == "sphere")
		OBJ4.draw();


	// Recuperation de la couleur à afficher
	var e_c = document.getElementById("couleur");
	var tmp_c =  e_c.options[e_c.selectedIndex].value;
	if ( tmp_c == "bleu")
		color = new Float32Array([0.0,0.0,1.0]);
	else if ( tmp_c == "noir")
		color = new Float32Array([0.0,0.0,0.0]);
	else if ( tmp_c == "marron")
		color = new Float32Array([0.5,0.0,0.0]);
	else if ( tmp_c == "vert")
		color = new Float32Array([0.0,1.0,0.0]);
	else if ( tmp_c == "gris")
		color = new Float32Array([0.5,0.5,0.5]);
	else if ( tmp_c == "orange")
		color = new Float32Array([0.9,0.5,0.13]);
	else if ( tmp_c == "rose")
		color = new Float32Array([1.0,0.75,0.79]);
	else if ( tmp_c == "violet")
		color = new Float32Array([0.5,0.0,0.5]);
	else if ( tmp_c == "rouge")
		color = new Float32Array([1.0,0.0,0.0]);
	else if ( tmp_c == "blanc")
		color = new Float32Array([1.0,1.0,1.0]);
	else if ( tmp_c == "jaune")
		color = new Float32Array([1.0,1.0,0.0]);


	// Recuperation de la skybox a afficher
	var e = document.getElementById("skybox");
	var value = e.value;
	var tmp =  "./textures/" + e.options[e.selectedIndex].value;
	if ( tmp != chemin && ENVMAP.textureArray != null ) {
		chemin = tmp;
		ENVMAP.newTexture();
	}
	
}
