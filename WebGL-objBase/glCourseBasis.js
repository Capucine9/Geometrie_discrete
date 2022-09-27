
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
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	}

	// --------------------------------------------
	setMatrixUniforms() {
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);
		gl.uniformMatrix4fv(this.shader.rMatrixUniform, false, rotMatrix);
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
		this.textureArray = [];
		this.indexBuffer = null;
		this.initAll();
	}

	// --------------------------------------------
	initAll() {
		var size = 10.0;
		var vertices = [
			// devant
			//abcd
			-size, -size, size,
			size, -size, size,
			size, -size, -size,
			-size, -size, -size,

			// gauche
			//adhg
			-size, -size, size,
			-size, -size, -size,
			-size, size, -size,
			-size, size, size,

			// haut
			//agfb
			-size, -size, size,
			-size, size, size,
			size, size, size,
			size, -size, size,

			// derriere
			//ghef
			-size, size, size,
			-size, size, -size,
			size, size, -size,
			size, size, size,

			// bas
			//hdce
			-size, size, -size,
			-size, -size, -size,
			size, -size, -size,
			size, size, -size,

			// droite
			//ecbf
			size, size, -size,
			size, -size, -size,
			size, -size, size,
			size, size, size,

		];

		var texcoords = [
			0.0,0.0,
			0.0,1.0,
			1.0,0.0,
			1.0,0.0,


			1.0,1.0,
			1.0,1.0,
			1.0,0.0,
			0.0,1.0,

			1.0,1.0,
			0.0,1.0,
			1.0,1.0,
			0.0,1.0,

			0.0,0.0,
			0.0,1.0,
			1.0,1.0,
			1.0,0.0,

			1.0,1.0,
			1.0,1.0,
			1.0,0.0,
			0.0,1.0,

			1.0,1.0,
			0.0,1.0,
			1.0,1.0,
			0.0,1.0,
		];

		this.indices = [
			// devant
			0, 1, 2,
			0, 3, 2,

			// gauche
			4, 5, 6,
			4, 7, 6,

			// haut
			8, 9, 10,
			8, 11, 10,

			// derriere
			12, 13, 14,
			12, 15, 14,

			// bas
			16, 17, 18,
			16, 19, 18,

			// droite
			20, 21, 22,
			20, 23, 22,
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
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(texcoords), gl.STATIC_DRAW);
		this.indexBuffer.itemSize = 1;
		this.indexBuffer.numItems = 36;

		this.initTextures();
		loadShaders(this);
	}


	// -------------------------------------
	initTextures() {
    var FilesTextures = ["posy.jpg", "posx.jpg", "posz.jpg", "negy.jpg", "negz.jpg", "negx.jpg"];

    for (var i=0; i<FilesTextures.length; i++){
        var texImage = new Image();
        var chemin = "./ForbiddenCity/";
        texImage.src = chemin+FilesTextures[i];
        var texture = gl.createTexture();
        texture.image = texImage;

        this.textureArray.push(texture);

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

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(rotMatrix);
	mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
	mat4.rotate(rotMatrix, rotY, [0, 0, 1]);

	distCENTER = vec3.create([0,-0.2,-3]);


	ENVMAP = new envMap();
	PLANE = new plane();
	OBJ1 = new objmesh('bunny.obj');
	OBJ2 = new objmesh('porsche.obj');
	OBJ3 = new objmesh('mustang.obj');
	OBJ4 = new objmesh('sphere.obj');

	tick();
}

// =====================================================
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	ENVMAP.draw();
	PLANE.draw();
	OBJ1.draw();
	//OBJ2.draw();
	//OBJ3.draw();
	//OBJ4.draw();
}
