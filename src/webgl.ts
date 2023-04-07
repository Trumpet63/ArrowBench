import { Arrow } from "./arrow";

let instancePositionsLocation: number;
let instanceTraitsLocation: number;

// If I create buffers repeatedly without deleting them then I'll cause a memory
// leak in at least FireFox but possibly other browsers. Not Chrome though.
let instancePositionsBuffer: WebGLBuffer;
let instanceTraitsBuffer: WebGLBuffer;
let positionBuffer: WebGLBuffer;

let previousNumArrows: number;

export function initializeShaders(gl: WebGL2RenderingContext, arrowSize: number) {
    let halfArrowSize: number = arrowSize / 2;

    let vertexShaderSrc = `
        attribute vec2 a_position;
        attribute vec2 a_instance_position;
        attribute vec2 a_instance_traits;
        uniform mat3 u_matrix;
        varying vec2 v_texCoord;

        void main() {
            vec2 canvas_position = a_position * vec2(${arrowSize}, ${arrowSize}) + a_instance_position + vec2(-${halfArrowSize}, -${halfArrowSize});
            gl_Position = vec4(u_matrix * vec3(canvas_position, 1), 1) + vec4(-1, 1, 0, 0);
            // v_texCoord = a_position / vec2(12, 4);
            v_texCoord = a_position / vec2(12, 4) + a_instance_traits / vec2(12, 4);
        }`

    let fragmentShaderSrc = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        void main() {
            gl_FragColor = texture2D(u_image, v_texCoord);
        }`

    let vertShaderObj = gl.createShader(gl.VERTEX_SHADER);
    let fragShaderObj = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertShaderObj, vertexShaderSrc);
    gl.shaderSource(fragShaderObj, fragmentShaderSrc);
    gl.compileShader(vertShaderObj);
    gl.compileShader(fragShaderObj);

    let program = gl.createProgram();
    gl.attachShader(program, vertShaderObj);
    gl.attachShader(program, fragShaderObj);
    gl.linkProgram(program);
    gl.useProgram(program);

    if (!gl.getShaderParameter(vertShaderObj, gl.COMPILE_STATUS)) {
        console.error('Error compiling vertex shader:', gl.getShaderInfoLog(vertShaderObj));
    }
    if (!gl.getShaderParameter(fragShaderObj, gl.COMPILE_STATUS)) {
        console.error('Error compiling fragment shader:', gl.getShaderInfoLog(fragShaderObj));
    }
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
    }

    let u_matrixLoc = gl.getUniformLocation(program, "u_matrix");
    let positionLocation = gl.getAttribLocation(program, "a_position");
    instancePositionsLocation = gl.getAttribLocation(program, "a_instance_position");
    instanceTraitsLocation = gl.getAttribLocation(program, "a_instance_traits");

    let matrix = new Float32Array([
        2 / gl.canvas.width, 0, 0,
        0, -2 / gl.canvas.height, 0,
        0, 0, 1,
    ]);
    gl.uniformMatrix3fv(u_matrixLoc, false, matrix);

    if (positionBuffer !== undefined) {
        gl.deleteBuffer(positionBuffer);
    }
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // enable alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if (instancePositionsBuffer !== undefined) {
        gl.deleteBuffer(instancePositionsBuffer);
    }
    instancePositionsBuffer = gl.createBuffer();

    if (instanceTraitsBuffer !== undefined) {
        gl.deleteBuffer(instanceTraitsBuffer);
    }
    instanceTraitsBuffer = gl.createBuffer();

    previousNumArrows = undefined;
}

export function setShaderTexture(gl: WebGL2RenderingContext, image: HTMLCanvasElement) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

export function drawArrowsGl(gl:WebGL2RenderingContext, arrows: Arrow[]) {
    if (arrows.length === previousNumArrows) {
        justSendPosition(gl, arrows);
    } else {
        sendPositionAndTraits(gl, arrows);
    }

    previousNumArrows = arrows.length;
}

function sendPositionAndTraits(gl: WebGL2RenderingContext, arrows: Arrow[]) {
    let instancePositions: number[] = [];
    for (let i = 0; i < arrows.length; i++) {
        instancePositions.push(arrows[i].x);
        instancePositions.push(arrows[i].y);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, instancePositionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instancePositions), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(instancePositionsLocation);
    gl.vertexAttribPointer(instancePositionsLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instancePositionsLocation, 1);

    let instanceTraits: number[] = [];
    for (let i = 0; i < arrows.length; i++) {
        instanceTraits.push(arrows[i].colorIndex);
        instanceTraits.push(arrows[i].rotationIndex);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceTraitsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceTraits), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(instanceTraitsLocation);
    gl.vertexAttribPointer(instanceTraitsLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instanceTraitsLocation, 1);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, arrows.length);
}

function justSendPosition(gl: WebGL2RenderingContext, arrows: Arrow[]) {
    let instancePositions: number[] = [];
    for (let i = 0; i < arrows.length; i++) {
        instancePositions.push(arrows[i].x);
        instancePositions.push(arrows[i].y);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, instancePositionsBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(instancePositions));

    gl.enableVertexAttribArray(instancePositionsLocation);
    gl.vertexAttribPointer(instancePositionsLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instancePositionsLocation, 1);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, arrows.length);
}
