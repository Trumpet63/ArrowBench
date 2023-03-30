// Get a reference to the WebGL context
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

// Create a texture from an image
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

// Draw the texture
const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
const positionLocation = gl.getAttribLocation(program, 'a_position');
const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  0, 0,
  0, 1,
  1, 0,
  1, 0,
  0, 1,
  1, 1,
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  0, 0,
  0, 1,
  1, 0,
  1, 0,
  0, 1,
  1, 1,
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(texCoordLocation);
gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);

gl.drawArrays(gl.TRIANGLES, 0, 6);
