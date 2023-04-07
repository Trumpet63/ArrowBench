var exports;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/arrow.ts":
/*!**********************!*\
  !*** ./src/arrow.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Arrow": () => (/* binding */ Arrow)
/* harmony export */ });
class Arrow {
}


/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clampValueToRange": () => (/* binding */ clampValueToRange),
/* harmony export */   "getRandomIntInclusive": () => (/* binding */ getRandomIntInclusive),
/* harmony export */   "roundToNPlaces": () => (/* binding */ roundToNPlaces)
/* harmony export */ });
function roundToNPlaces(x, numPlaces) {
    let scale = Math.pow(10, numPlaces);
    return Math.round(x * scale) / scale;
}
function clampValueToRange(value, lowerBound, upperBound) {
    if (value < lowerBound) {
        return lowerBound;
    }
    if (value > upperBound) {
        return upperBound;
    }
    return value;
}
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}


/***/ }),

/***/ "./src/webgl.ts":
/*!**********************!*\
  !*** ./src/webgl.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawArrowsGl": () => (/* binding */ drawArrowsGl),
/* harmony export */   "initializeShaders": () => (/* binding */ initializeShaders),
/* harmony export */   "setShaderTexture": () => (/* binding */ setShaderTexture)
/* harmony export */ });
let instancePositionsLocation;
let instanceTraitsLocation;
// If I create buffers repeatedly without deleting them then I'll cause a memory
// leak in at least FireFox but possibly other browsers. Not Chrome though.
let instancePositionsBuffer;
let instanceTraitsBuffer;
let positionBuffer;
let previousNumArrows;
function initializeShaders(gl, arrowSize) {
    let halfArrowSize = arrowSize / 2;
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
        }`;
    let fragmentShaderSrc = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        void main() {
            gl_FragColor = texture2D(u_image, v_texCoord);
        }`;
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
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
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
function setShaderTexture(gl, image) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}
function drawArrowsGl(gl, arrows) {
    if (arrows.length === previousNumArrows) {
        justSendPosition(gl, arrows);
    }
    else {
        sendPositionAndTraits(gl, arrows);
    }
    previousNumArrows = arrows.length;
}
function sendPositionAndTraits(gl, arrows) {
    let instancePositions = [];
    for (let i = 0; i < arrows.length; i++) {
        instancePositions.push(arrows[i].x);
        instancePositions.push(arrows[i].y);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, instancePositionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instancePositions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(instancePositionsLocation);
    gl.vertexAttribPointer(instancePositionsLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instancePositionsLocation, 1);
    let instanceTraits = [];
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
function justSendPosition(gl, arrows) {
    let instancePositions = [];
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _arrow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrow */ "./src/arrow.ts");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util */ "./src/util.ts");
/* harmony import */ var _webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./webgl */ "./src/webgl.ts");



let canvas2d = document.getElementById("arrowBench2dCanvas");
canvas2d.width = 1920;
canvas2d.height = 1080;
let canvasgl = document.getElementById("arrowBenchWebGLCanvas");
canvasgl.width = 1920;
canvasgl.height = 1080;
let ctx = canvas2d.getContext("2d");
ctx.imageSmoothingEnabled = false;
let gl = canvasgl.getContext("webgl2");
let arrowCounter = document.getElementById("arrowCounter");
let fpsCounter = document.getElementById("fpsCounter");
let arrowsPerMsCounter = document.getElementById("arrowsPerMsCounter");
let arrowSizeInput = document.getElementById("arrowSizeInput");
arrowSizeInput.addEventListener("input", () => {
    arrowSize = arrowSizeInput.valueAsNumber;
    halfArrowSize = arrowSize / 2;
    createCaches();
    (0,_webgl__WEBPACK_IMPORTED_MODULE_2__.initializeShaders)(gl, arrowSize);
    (0,_webgl__WEBPACK_IMPORTED_MODULE_2__.setShaderTexture)(gl, arrowCacheSpritesheet);
    framesWithoutAStateChange = 0;
});
let arrowSpeedInput = document.getElementById("arrowSpeedInput");
arrowSpeedInput.addEventListener("input", () => {
    speedModifier = arrowSpeedInput.valueAsNumber;
});
let spawnRateInput = document.getElementById("spawnRateInput");
spawnRateInput.addEventListener("input", () => {
    spawnRate = Math.pow(spawnRateInput.valueAsNumber, 3);
    arrowsSpawnedThisMouseDown = 0;
    mouseDownStart = performance.now();
});
let clearArrowsButton = document.getElementById("clearArrowsButton");
clearArrowsButton.addEventListener("click", () => {
    arrows = [];
});
let drawMethodWebGLInput = document.getElementById("drawMethodWebGL");
drawMethodWebGLInput.addEventListener("input", () => {
    framesWithoutAStateChange = 0;
});
let drawMethodSoftwareInput = document.getElementById("drawMethodSoftware");
drawMethodSoftwareInput.addEventListener("input", () => {
    framesWithoutAStateChange = 0;
});
let arrowSize = arrowSizeInput.valueAsNumber;
let speedModifier = arrowSpeedInput.valueAsNumber;
let halfArrowSize = arrowSize / 2;
let spawnRate = Math.pow(spawnRateInput.valueAsNumber, 3);
let mouseDownStart;
let arrowsSpawnedThisMouseDown;
(0,_webgl__WEBPACK_IMPORTED_MODULE_2__.initializeShaders)(gl, arrowSize);
let noteskin4thPath = "../assets/noteskin_4th.png";
let noteskin8thPath = "../assets/noteskin_8th.png";
let noteskin12thPath = "../assets/noteskin_12th.png";
let noteskin16thPath = "../assets/noteskin_16th.png";
let noteskin20thPath = "../assets/noteskin_20th.png";
let noteskin24thPath = "../assets/noteskin_24th.png";
let noteskin32ndPath = "../assets/noteskin_32nd.png";
let noteskin48thPath = "../assets/noteskin_48th.png";
let noteskin64thPath = "../assets/noteskin_64th.png";
let noteskin96thPath = "../assets/noteskin_96th.png";
let noteskin128thPath = "../assets/noteskin_128th.png";
let noteskin192ndPath = "../assets/noteskin_192nd.png";
let preloadRegistry = new Map();
let arrowColors = [
    loadImage(noteskin4thPath),
    loadImage(noteskin8thPath),
    loadImage(noteskin12thPath),
    loadImage(noteskin16thPath),
    loadImage(noteskin20thPath),
    loadImage(noteskin24thPath),
    loadImage(noteskin32ndPath),
    loadImage(noteskin48thPath),
    loadImage(noteskin64thPath),
    loadImage(noteskin96thPath),
    loadImage(noteskin128thPath),
    loadImage(noteskin192ndPath),
];
let arrowCacheSpritesheet;
function createCaches() {
    createFullResizedSpritesheet();
}
function createFullResizedSpritesheet() {
    arrowCacheSpritesheet = document.createElement("canvas");
    arrowCacheSpritesheet.width = arrowColors.length * arrowSize;
    arrowCacheSpritesheet.height = 4 * arrowSize;
    let spritesheetCtx = arrowCacheSpritesheet.getContext("2d");
    for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
        let rotation = rotationIndex * Math.PI / 2;
        for (let colorIndex = 0; colorIndex < arrowColors.length; colorIndex++) {
            let destinationX = colorIndex * arrowSize;
            let destinationY = rotationIndex * arrowSize;
            spritesheetCtx.translate(destinationX + halfArrowSize, destinationY + halfArrowSize);
            spritesheetCtx.rotate(rotation);
            spritesheetCtx.drawImage(arrowColors[colorIndex], -halfArrowSize, -halfArrowSize, arrowSize, arrowSize);
            spritesheetCtx.rotate(-rotation);
            spritesheetCtx.translate(-(destinationX + halfArrowSize), -(destinationY + halfArrowSize));
        }
    }
}
// Note: 
// Transforming and then untransforming is faster than using save/restore
// Drawing the resized arrow to an offscreen canvas so that drawImage
//     doesn't have to resize is significantly faster (except on FireFox where it's only like 3% faster)
// For some reason, [0][arrow.colorIndex] is faster than [arrow.rotationIndex][arrow.colorIndex]
// Drawing from an HTMLCanvasElement is faster than drawing from an HTMLImageElement
// Drawing from single spritesheet is about 80% faster than drawing from 48 separate canvases
function drawFromFullResizedSpritesheet(arrow) {
    ctx.drawImage(arrowCacheSpritesheet, arrow.colorIndex * arrowSize, arrow.rotationIndex * arrowSize, arrowSize, arrowSize, arrow.x - halfArrowSize, arrow.y - halfArrowSize, arrowSize, arrowSize);
}
// See this if I encounter weird loading problems later:
// https://stackoverflow.com/questions/12354865/image-onload-event-and-browser-cache
function loadImage(imageSource) {
    if (preloadRegistry.has(imageSource)) {
        throw new Error("You attempted to load the same image twice during preloading.");
    }
    preloadRegistry.set(imageSource, false);
    // The order these 3 things are done in is VERY important!
    let image = new Image();
    image.onload = () => {
        preloadRegistry.set(imageSource, true);
    };
    image.src = imageSource;
    return image;
}
let preloadIntervalId = setInterval(() => {
    if (preloadDone()) {
        clearInterval(preloadIntervalId);
        createCaches();
        (0,_webgl__WEBPACK_IMPORTED_MODULE_2__.setShaderTexture)(gl, arrowCacheSpritesheet);
        window.requestAnimationFrame(draw);
    }
}, 100);
function preloadDone() {
    for (let [key, loaded] of preloadRegistry) {
        if (!loaded) {
            return false;
        }
    }
    ;
    return true;
}
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
document.addEventListener("mousedown", (e) => {
    mouseDown = true;
    arrowsSpawnedThisMouseDown = 0;
    mouseDownStart = performance.now();
});
document.addEventListener("mouseup", (e) => { mouseDown = false; });
document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX - canvas2d.offsetLeft;
    mouseY = e.clientY;
});
let previousFrameTimes = [];
let numFrameTimesToRemember = 100;
let framesWithoutAStateChange = 0;
let arrows = [];
let logCounter = 0;
function draw(currentTimeMillis) {
    if (previousFrameTimes.length >= numFrameTimesToRemember) {
        previousFrameTimes.shift();
    }
    previousFrameTimes.push(currentTimeMillis);
    let deltaTimeMillis;
    if (previousFrameTimes.length > 1) {
        deltaTimeMillis = currentTimeMillis - previousFrameTimes[previousFrameTimes.length - 2];
    }
    if (mouseDown) {
        let mouseDownDeltaMillis = currentTimeMillis - mouseDownStart;
        let expectedArrows = Math.floor(mouseDownDeltaMillis * spawnRate / 1000);
        while (arrowsSpawnedThisMouseDown < expectedArrows) {
            generateArrow();
            arrowsSpawnedThisMouseDown++;
        }
    }
    // simulate the arrows
    if (previousFrameTimes.length > 1) {
        for (let i = 0; i < arrows.length; i++) {
            arrows[i].x += arrows[i].velocityX * speedModifier * deltaTimeMillis;
            arrows[i].y += arrows[i].velocityY * speedModifier * deltaTimeMillis;
            if (arrows[i].x - halfArrowSize < 0) { // donk on the left
                arrows[i].x += 2 * (halfArrowSize - arrows[i].x);
                arrows[i].velocityX = -arrows[i].velocityX;
            }
            if (arrows[i].y - halfArrowSize < 0) { // donk on the top
                arrows[i].y += 2 * (halfArrowSize - arrows[i].y);
                arrows[i].velocityY = -arrows[i].velocityY;
            }
            if (arrows[i].x + halfArrowSize > canvas2d.width) { // donk on the right
                arrows[i].x -= 2 * (arrows[i].x + halfArrowSize - canvas2d.width);
                arrows[i].velocityX = -arrows[i].velocityX;
            }
            if (arrows[i].y + halfArrowSize > canvas2d.height) { // donk on the bottom
                arrows[i].y -= 2 * (arrows[i].y + halfArrowSize - canvas2d.height);
                arrows[i].velocityY = -arrows[i].velocityY;
            }
        }
    }
    // update the top UI
    arrowCounter.innerText = arrows.length.toString();
    if (previousFrameTimes.length > 1) {
        fpsCounter.innerText = Math.round(1000 / deltaTimeMillis).toString();
    }
    else {
        fpsCounter.innerText = "calculating...";
    }
    if (framesWithoutAStateChange >= numFrameTimesToRemember) {
        arrowsPerMsCounter.innerText = (0,_util__WEBPACK_IMPORTED_MODULE_1__.roundToNPlaces)(arrows.length
            / (currentTimeMillis - previousFrameTimes[0])
            * numFrameTimesToRemember, 2).toString();
    }
    else {
        arrowsPerMsCounter.innerText = "calculating...";
    }
    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
    // draw the arrows
    if (drawMethodWebGLInput.checked) {
        (0,_webgl__WEBPACK_IMPORTED_MODULE_2__.drawArrowsGl)(gl, arrows);
    }
    else {
        gl.clear(gl.COLOR_BUFFER_BIT);
        for (let i = 0; i < arrows.length; i++) {
            drawFromFullResizedSpritesheet(arrows[i]);
        }
    }
    framesWithoutAStateChange++;
    window.requestAnimationFrame(draw);
}
function generateArrow() {
    let arrow = new _arrow__WEBPACK_IMPORTED_MODULE_0__.Arrow();
    arrow.x = (0,_util__WEBPACK_IMPORTED_MODULE_1__.clampValueToRange)(mouseX, 0, canvas2d.width);
    arrow.y = (0,_util__WEBPACK_IMPORTED_MODULE_1__.clampValueToRange)(mouseY, 0, canvas2d.height);
    let velocityMagnitudePixelsPerMillisecond = 0.4;
    let randomAngle = Math.random() * 2 * Math.PI;
    arrow.velocityX = Math.cos(randomAngle) * velocityMagnitudePixelsPerMillisecond;
    arrow.velocityY = Math.sin(randomAngle) * velocityMagnitudePixelsPerMillisecond;
    arrow.colorIndex = (0,_util__WEBPACK_IMPORTED_MODULE_1__.getRandomIntInclusive)(0, 11);
    arrow.rotationIndex = (0,_util__WEBPACK_IMPORTED_MODULE_1__.getRandomIntInclusive)(0, 3);
    arrows.push(arrow);
    framesWithoutAStateChange = -1;
}

})();

exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFLLENBQUMsVUFBVSxHQUFHLDREQUFxQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRCxLQUFLLENBQUMsYUFBYSxHQUFHLDREQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHBvcnRzLy4vc3JjL2Fycm93LnRzIiwid2VicGFjazovL2V4cG9ydHMvLi9zcmMvdXRpbC50cyIsIndlYnBhY2s6Ly9leHBvcnRzLy4vc3JjL3dlYmdsLnRzIiwid2VicGFjazovL2V4cG9ydHMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhwb3J0cy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZXhwb3J0cy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4cG9ydHMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leHBvcnRzLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBBcnJvdyB7XHJcbiAgICBwdWJsaWMgeDogbnVtYmVyO1xyXG4gICAgcHVibGljIHk6IG51bWJlcjtcclxuICAgIHB1YmxpYyB2ZWxvY2l0eVg6IG51bWJlcjtcclxuICAgIHB1YmxpYyB2ZWxvY2l0eVk6IG51bWJlcjtcclxuICAgIHB1YmxpYyBjb2xvckluZGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgcm90YXRpb25JbmRleDogbnVtYmVyO1xyXG59XHJcbiIsImV4cG9ydCBmdW5jdGlvbiByb3VuZFRvTlBsYWNlcyh4OiBudW1iZXIsIG51bVBsYWNlczogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGxldCBzY2FsZTogbnVtYmVyID0gTWF0aC5wb3coMTAsIG51bVBsYWNlcyk7XHJcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh4ICogc2NhbGUpIC8gc2NhbGU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGFtcFZhbHVlVG9SYW5nZSh2YWx1ZTogbnVtYmVyLCBsb3dlckJvdW5kOiBudW1iZXIsIHVwcGVyQm91bmQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBpZiAodmFsdWUgPCBsb3dlckJvdW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIGxvd2VyQm91bmQ7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWUgPiB1cHBlckJvdW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIHVwcGVyQm91bmQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21JbnRJbmNsdXNpdmUobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIG1pbiA9IE1hdGguY2VpbChtaW4pO1xyXG4gICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XHJcbn1cclxuIiwiaW1wb3J0IHsgQXJyb3cgfSBmcm9tIFwiLi9hcnJvd1wiO1xyXG5cclxubGV0IGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb246IG51bWJlcjtcclxubGV0IGluc3RhbmNlVHJhaXRzTG9jYXRpb246IG51bWJlcjtcclxuXHJcbi8vIElmIEkgY3JlYXRlIGJ1ZmZlcnMgcmVwZWF0ZWRseSB3aXRob3V0IGRlbGV0aW5nIHRoZW0gdGhlbiBJJ2xsIGNhdXNlIGEgbWVtb3J5XHJcbi8vIGxlYWsgaW4gYXQgbGVhc3QgRmlyZUZveCBidXQgcG9zc2libHkgb3RoZXIgYnJvd3NlcnMuIE5vdCBDaHJvbWUgdGhvdWdoLlxyXG5sZXQgaW5zdGFuY2VQb3NpdGlvbnNCdWZmZXI6IFdlYkdMQnVmZmVyO1xyXG5sZXQgaW5zdGFuY2VUcmFpdHNCdWZmZXI6IFdlYkdMQnVmZmVyO1xyXG5sZXQgcG9zaXRpb25CdWZmZXI6IFdlYkdMQnVmZmVyO1xyXG5cclxubGV0IHByZXZpb3VzTnVtQXJyb3dzOiBudW1iZXI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZVNoYWRlcnMoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGFycm93U2l6ZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgaGFsZkFycm93U2l6ZTogbnVtYmVyID0gYXJyb3dTaXplIC8gMjtcclxuXHJcbiAgICBsZXQgdmVydGV4U2hhZGVyU3JjID0gYFxyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMyIGFfcG9zaXRpb247XHJcbiAgICAgICAgYXR0cmlidXRlIHZlYzIgYV9pbnN0YW5jZV9wb3NpdGlvbjtcclxuICAgICAgICBhdHRyaWJ1dGUgdmVjMiBhX2luc3RhbmNlX3RyYWl0cztcclxuICAgICAgICB1bmlmb3JtIG1hdDMgdV9tYXRyaXg7XHJcbiAgICAgICAgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7XHJcblxyXG4gICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgdmVjMiBjYW52YXNfcG9zaXRpb24gPSBhX3Bvc2l0aW9uICogdmVjMigke2Fycm93U2l6ZX0sICR7YXJyb3dTaXplfSkgKyBhX2luc3RhbmNlX3Bvc2l0aW9uICsgdmVjMigtJHtoYWxmQXJyb3dTaXplfSwgLSR7aGFsZkFycm93U2l6ZX0pO1xyXG4gICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQodV9tYXRyaXggKiB2ZWMzKGNhbnZhc19wb3NpdGlvbiwgMSksIDEpICsgdmVjNCgtMSwgMSwgMCwgMCk7XHJcbiAgICAgICAgICAgIC8vIHZfdGV4Q29vcmQgPSBhX3Bvc2l0aW9uIC8gdmVjMigxMiwgNCk7XHJcbiAgICAgICAgICAgIHZfdGV4Q29vcmQgPSBhX3Bvc2l0aW9uIC8gdmVjMigxMiwgNCkgKyBhX2luc3RhbmNlX3RyYWl0cyAvIHZlYzIoMTIsIDQpO1xyXG4gICAgICAgIH1gXHJcblxyXG4gICAgbGV0IGZyYWdtZW50U2hhZGVyU3JjID0gYFxyXG4gICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xyXG4gICAgICAgIHZhcnlpbmcgdmVjMiB2X3RleENvb3JkO1xyXG4gICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfaW1hZ2U7XHJcbiAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodV9pbWFnZSwgdl90ZXhDb29yZCk7XHJcbiAgICAgICAgfWBcclxuXHJcbiAgICBsZXQgdmVydFNoYWRlck9iaiA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcclxuICAgIGxldCBmcmFnU2hhZGVyT2JqID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XHJcbiAgICBnbC5zaGFkZXJTb3VyY2UodmVydFNoYWRlck9iaiwgdmVydGV4U2hhZGVyU3JjKTtcclxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnU2hhZGVyT2JqLCBmcmFnbWVudFNoYWRlclNyYyk7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRTaGFkZXJPYmopO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihmcmFnU2hhZGVyT2JqKTtcclxuXHJcbiAgICBsZXQgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0U2hhZGVyT2JqKTtcclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnU2hhZGVyT2JqKTtcclxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG4gICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcclxuXHJcbiAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0U2hhZGVyT2JqLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjb21waWxpbmcgdmVydGV4IHNoYWRlcjonLCBnbC5nZXRTaGFkZXJJbmZvTG9nKHZlcnRTaGFkZXJPYmopKTtcclxuICAgIH1cclxuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZyYWdTaGFkZXJPYmosIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNvbXBpbGluZyBmcmFnbWVudCBzaGFkZXI6JywgZ2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnU2hhZGVyT2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbGlua2luZyBwcm9ncmFtOicsIGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdV9tYXRyaXhMb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJ1X21hdHJpeFwiKTtcclxuICAgIGxldCBwb3NpdGlvbkxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgXCJhX3Bvc2l0aW9uXCIpO1xyXG4gICAgaW5zdGFuY2VQb3NpdGlvbnNMb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIFwiYV9pbnN0YW5jZV9wb3NpdGlvblwiKTtcclxuICAgIGluc3RhbmNlVHJhaXRzTG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBcImFfaW5zdGFuY2VfdHJhaXRzXCIpO1xyXG5cclxuICAgIGxldCBtYXRyaXggPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAyIC8gZ2wuY2FudmFzLndpZHRoLCAwLCAwLFxyXG4gICAgICAgIDAsIC0yIC8gZ2wuY2FudmFzLmhlaWdodCwgMCxcclxuICAgICAgICAwLCAwLCAxLFxyXG4gICAgXSk7XHJcbiAgICBnbC51bmlmb3JtTWF0cml4M2Z2KHVfbWF0cml4TG9jLCBmYWxzZSwgbWF0cml4KTtcclxuXHJcbiAgICBpZiAocG9zaXRpb25CdWZmZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGdsLmRlbGV0ZUJ1ZmZlcihwb3NpdGlvbkJ1ZmZlcik7XHJcbiAgICB9XHJcbiAgICBwb3NpdGlvbkJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHBvc2l0aW9uQnVmZmVyKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAwLjAsICAwLjAsXHJcbiAgICAgICAgMS4wLCAgMC4wLFxyXG4gICAgICAgIDAuMCwgIDEuMCxcclxuICAgICAgICAwLjAsICAxLjAsXHJcbiAgICAgICAgMS4wLCAgMC4wLFxyXG4gICAgICAgIDEuMCwgIDEuMCxcclxuICAgIF0pLCBnbC5TVEFUSUNfRFJBVyk7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwb3NpdGlvbkxvY2F0aW9uKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zaXRpb25Mb2NhdGlvbiwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuXHJcbiAgICBsZXQgdGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHJcbiAgICAvLyBlbmFibGUgYWxwaGEgYmxlbmRpbmdcclxuICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XHJcbiAgICBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcclxuXHJcbiAgICBpZiAoaW5zdGFuY2VQb3NpdGlvbnNCdWZmZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGdsLmRlbGV0ZUJ1ZmZlcihpbnN0YW5jZVBvc2l0aW9uc0J1ZmZlcik7XHJcbiAgICB9XHJcbiAgICBpbnN0YW5jZVBvc2l0aW9uc0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cclxuICAgIGlmIChpbnN0YW5jZVRyYWl0c0J1ZmZlciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZ2wuZGVsZXRlQnVmZmVyKGluc3RhbmNlVHJhaXRzQnVmZmVyKTtcclxuICAgIH1cclxuICAgIGluc3RhbmNlVHJhaXRzQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblxyXG4gICAgcHJldmlvdXNOdW1BcnJvd3MgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRTaGFkZXJUZXh0dXJlKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBpbWFnZTogSFRNTENhbnZhc0VsZW1lbnQpIHtcclxuICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZHJhd0Fycm93c0dsKGdsOldlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGFycm93czogQXJyb3dbXSkge1xyXG4gICAgaWYgKGFycm93cy5sZW5ndGggPT09IHByZXZpb3VzTnVtQXJyb3dzKSB7XHJcbiAgICAgICAganVzdFNlbmRQb3NpdGlvbihnbCwgYXJyb3dzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VuZFBvc2l0aW9uQW5kVHJhaXRzKGdsLCBhcnJvd3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByZXZpb3VzTnVtQXJyb3dzID0gYXJyb3dzLmxlbmd0aDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZFBvc2l0aW9uQW5kVHJhaXRzKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBhcnJvd3M6IEFycm93W10pIHtcclxuICAgIGxldCBpbnN0YW5jZVBvc2l0aW9uczogbnVtYmVyW10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnMucHVzaChhcnJvd3NbaV0ueCk7XHJcbiAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnMucHVzaChhcnJvd3NbaV0ueSk7XHJcbiAgICB9XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgaW5zdGFuY2VQb3NpdGlvbnNCdWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoaW5zdGFuY2VQb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5zdGFuY2VQb3NpdGlvbnNMb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb24sIDEpO1xyXG5cclxuICAgIGxldCBpbnN0YW5jZVRyYWl0czogbnVtYmVyW10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaW5zdGFuY2VUcmFpdHMucHVzaChhcnJvd3NbaV0uY29sb3JJbmRleCk7XHJcbiAgICAgICAgaW5zdGFuY2VUcmFpdHMucHVzaChhcnJvd3NbaV0ucm90YXRpb25JbmRleCk7XHJcbiAgICB9XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgaW5zdGFuY2VUcmFpdHNCdWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoaW5zdGFuY2VUcmFpdHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5zdGFuY2VUcmFpdHNMb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGluc3RhbmNlVHJhaXRzTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGluc3RhbmNlVHJhaXRzTG9jYXRpb24sIDEpO1xyXG5cclxuICAgIGdsLmRyYXdBcnJheXNJbnN0YW5jZWQoZ2wuVFJJQU5HTEVTLCAwLCA2LCBhcnJvd3MubGVuZ3RoKTtcclxufVxyXG5cclxuZnVuY3Rpb24ganVzdFNlbmRQb3NpdGlvbihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgYXJyb3dzOiBBcnJvd1tdKSB7XHJcbiAgICBsZXQgaW5zdGFuY2VQb3NpdGlvbnM6IG51bWJlcltdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGluc3RhbmNlUG9zaXRpb25zLnB1c2goYXJyb3dzW2ldLngpO1xyXG4gICAgICAgIGluc3RhbmNlUG9zaXRpb25zLnB1c2goYXJyb3dzW2ldLnkpO1xyXG4gICAgfVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGluc3RhbmNlUG9zaXRpb25zQnVmZmVyKTtcclxuICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2wuQVJSQVlfQlVGRkVSLCAwLCBuZXcgRmxvYXQzMkFycmF5KGluc3RhbmNlUG9zaXRpb25zKSk7XHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5zdGFuY2VQb3NpdGlvbnNMb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb24sIDEpO1xyXG5cclxuICAgIGdsLmRyYXdBcnJheXNJbnN0YW5jZWQoZ2wuVFJJQU5HTEVTLCAwLCA2LCBhcnJvd3MubGVuZ3RoKTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEFycm93IH0gZnJvbSBcIi4vYXJyb3dcIjtcclxuaW1wb3J0IHsgY2xhbXBWYWx1ZVRvUmFuZ2UsIGdldFJhbmRvbUludEluY2x1c2l2ZSwgcm91bmRUb05QbGFjZXMgfSBmcm9tIFwiLi91dGlsXCI7XHJcbmltcG9ydCB7IGRyYXdBcnJvd3NHbCwgaW5pdGlhbGl6ZVNoYWRlcnMsIHNldFNoYWRlclRleHR1cmUgfSBmcm9tIFwiLi93ZWJnbFwiO1xyXG5cclxubGV0IGNhbnZhczJkID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93QmVuY2gyZENhbnZhc1wiKTtcclxuY2FudmFzMmQud2lkdGggPSAxOTIwO1xyXG5jYW52YXMyZC5oZWlnaHQgPSAxMDgwO1xyXG5sZXQgY2FudmFzZ2wgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dCZW5jaFdlYkdMQ2FudmFzXCIpO1xyXG5jYW52YXNnbC53aWR0aCA9IDE5MjA7XHJcbmNhbnZhc2dsLmhlaWdodCA9IDEwODA7XHJcbmxldCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCA9IGNhbnZhczJkLmdldENvbnRleHQoXCIyZFwiKTtcclxuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5sZXQgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSBjYW52YXNnbC5nZXRDb250ZXh0KFwid2ViZ2wyXCIpO1xyXG5cclxubGV0IGFycm93Q291bnRlciA9IDxIVE1MU3BhbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dDb3VudGVyXCIpO1xyXG5sZXQgZnBzQ291bnRlciA9IDxIVE1MU3BhbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKTtcclxubGV0IGFycm93c1Blck1zQ291bnRlciA9IDxIVE1MU3BhbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dzUGVyTXNDb3VudGVyXCIpO1xyXG5cclxubGV0IGFycm93U2l6ZUlucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dTaXplSW5wdXRcIik7XHJcbmFycm93U2l6ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICBhcnJvd1NpemUgPSBhcnJvd1NpemVJbnB1dC52YWx1ZUFzTnVtYmVyO1xyXG4gICAgaGFsZkFycm93U2l6ZSA9IGFycm93U2l6ZSAvIDI7XHJcbiAgICBjcmVhdGVDYWNoZXMoKTtcclxuICAgIGluaXRpYWxpemVTaGFkZXJzKGdsLCBhcnJvd1NpemUpO1xyXG4gICAgc2V0U2hhZGVyVGV4dHVyZShnbCwgYXJyb3dDYWNoZVNwcml0ZXNoZWV0KTtcclxuICAgIGZyYW1lc1dpdGhvdXRBU3RhdGVDaGFuZ2UgPSAwO1xyXG59KTtcclxuXHJcbmxldCBhcnJvd1NwZWVkSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1NwZWVkSW5wdXRcIik7XHJcbmFycm93U3BlZWRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgc3BlZWRNb2RpZmllciA9IGFycm93U3BlZWRJbnB1dC52YWx1ZUFzTnVtYmVyO1xyXG59KTtcclxuXHJcbmxldCBzcGF3blJhdGVJbnB1dCA9IDxIVE1MSW5wdXRFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwYXduUmF0ZUlucHV0XCIpO1xyXG5zcGF3blJhdGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgc3Bhd25SYXRlID0gTWF0aC5wb3coc3Bhd25SYXRlSW5wdXQudmFsdWVBc051bWJlciwgMyk7XHJcbiAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93biA9IDA7XHJcbiAgICBtb3VzZURvd25TdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG59KTtcclxuXHJcbmxldCBjbGVhckFycm93c0J1dHRvbiA9IDxIVE1MQnV0dG9uRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhckFycm93c0J1dHRvblwiKTtcclxuY2xlYXJBcnJvd3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGFycm93cyA9IFtdO1xyXG59KTtcclxuXHJcbmxldCBkcmF3TWV0aG9kV2ViR0xJbnB1dCA9IDxIVE1MSW5wdXRFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRyYXdNZXRob2RXZWJHTFwiKTtcclxuZHJhd01ldGhvZFdlYkdMSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIGZyYW1lc1dpdGhvdXRBU3RhdGVDaGFuZ2UgPSAwO1xyXG59KTtcclxubGV0IGRyYXdNZXRob2RTb2Z0d2FyZUlucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHJhd01ldGhvZFNvZnR3YXJlXCIpO1xyXG5kcmF3TWV0aG9kU29mdHdhcmVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IDA7XHJcbn0pO1xyXG5cclxubGV0IGFycm93U2l6ZTogbnVtYmVyID0gYXJyb3dTaXplSW5wdXQudmFsdWVBc051bWJlcjtcclxubGV0IHNwZWVkTW9kaWZpZXI6IG51bWJlciA9IGFycm93U3BlZWRJbnB1dC52YWx1ZUFzTnVtYmVyO1xyXG5sZXQgaGFsZkFycm93U2l6ZTogbnVtYmVyID0gYXJyb3dTaXplIC8gMjtcclxubGV0IHNwYXduUmF0ZTogbnVtYmVyID0gTWF0aC5wb3coc3Bhd25SYXRlSW5wdXQudmFsdWVBc051bWJlciwgMyk7XHJcbmxldCBtb3VzZURvd25TdGFydDogbnVtYmVyO1xyXG5sZXQgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd246IG51bWJlcjtcclxuXHJcbmluaXRpYWxpemVTaGFkZXJzKGdsLCBhcnJvd1NpemUpO1xyXG5cclxubGV0IG5vdGVza2luNHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fNHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW44dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl84dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjEydGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xMnRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4xNnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMTZ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMjB0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzIwdGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjI0dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8yNHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4zMm5kUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMzJuZC5wbmdcIjtcclxubGV0IG5vdGVza2luNDh0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzQ4dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjY0dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl82NHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW45NnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fOTZ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTI4dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xMjh0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTkybmRQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xOTJuZC5wbmdcIjtcclxubGV0IHByZWxvYWRSZWdpc3RyeTogTWFwPHN0cmluZywgYm9vbGVhbj4gPSBuZXcgTWFwKCk7XHJcblxyXG5sZXQgYXJyb3dDb2xvcnM6IEhUTUxJbWFnZUVsZW1lbnRbXSA9IFtcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjR0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luOHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xMnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xNnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4yMHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4yNHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4zMm5kUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW40OHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW42NHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW45NnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xMjh0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMTkybmRQYXRoKSxcclxuXTtcclxuXHJcbmxldCBhcnJvd0NhY2hlU3ByaXRlc2hlZXQ6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2FjaGVzKCkge1xyXG4gICAgY3JlYXRlRnVsbFJlc2l6ZWRTcHJpdGVzaGVldCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGdWxsUmVzaXplZFNwcml0ZXNoZWV0KCkge1xyXG4gICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGFycm93Q2FjaGVTcHJpdGVzaGVldC53aWR0aCA9IGFycm93Q29sb3JzLmxlbmd0aCAqIGFycm93U2l6ZTtcclxuICAgIGFycm93Q2FjaGVTcHJpdGVzaGVldC5oZWlnaHQgPSA0ICogYXJyb3dTaXplO1xyXG4gICAgbGV0IHNwcml0ZXNoZWV0Q3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgPSBhcnJvd0NhY2hlU3ByaXRlc2hlZXQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgZm9yIChsZXQgcm90YXRpb25JbmRleCA9IDA7IHJvdGF0aW9uSW5kZXggPCA0OyByb3RhdGlvbkluZGV4KyspIHtcclxuICAgICAgICBsZXQgcm90YXRpb246IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBNYXRoLlBJIC8gMjtcclxuICAgICAgICBmb3IgKGxldCBjb2xvckluZGV4ID0gMDsgY29sb3JJbmRleCA8IGFycm93Q29sb3JzLmxlbmd0aDsgY29sb3JJbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblg6IG51bWJlciA9IGNvbG9ySW5kZXggKiBhcnJvd1NpemU7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblk6IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBhcnJvd1NpemU7XHJcbiAgICAgICAgICAgIHNwcml0ZXNoZWV0Q3R4LnRyYW5zbGF0ZShkZXN0aW5hdGlvblggKyBoYWxmQXJyb3dTaXplLCBkZXN0aW5hdGlvblkgKyBoYWxmQXJyb3dTaXplKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHguZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICAgICAgYXJyb3dDb2xvcnNbY29sb3JJbmRleF0sXHJcbiAgICAgICAgICAgICAgICAtaGFsZkFycm93U2l6ZSxcclxuICAgICAgICAgICAgICAgIC1oYWxmQXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC5yb3RhdGUoLXJvdGF0aW9uKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgudHJhbnNsYXRlKC0oZGVzdGluYXRpb25YICsgaGFsZkFycm93U2l6ZSksIC0oZGVzdGluYXRpb25ZICsgaGFsZkFycm93U2l6ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gTm90ZTogXHJcbi8vIFRyYW5zZm9ybWluZyBhbmQgdGhlbiB1bnRyYW5zZm9ybWluZyBpcyBmYXN0ZXIgdGhhbiB1c2luZyBzYXZlL3Jlc3RvcmVcclxuLy8gRHJhd2luZyB0aGUgcmVzaXplZCBhcnJvdyB0byBhbiBvZmZzY3JlZW4gY2FudmFzIHNvIHRoYXQgZHJhd0ltYWdlXHJcbi8vICAgICBkb2Vzbid0IGhhdmUgdG8gcmVzaXplIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIChleGNlcHQgb24gRmlyZUZveCB3aGVyZSBpdCdzIG9ubHkgbGlrZSAzJSBmYXN0ZXIpXHJcbi8vIEZvciBzb21lIHJlYXNvbiwgWzBdW2Fycm93LmNvbG9ySW5kZXhdIGlzIGZhc3RlciB0aGFuIFthcnJvdy5yb3RhdGlvbkluZGV4XVthcnJvdy5jb2xvckluZGV4XVxyXG4vLyBEcmF3aW5nIGZyb20gYW4gSFRNTENhbnZhc0VsZW1lbnQgaXMgZmFzdGVyIHRoYW4gZHJhd2luZyBmcm9tIGFuIEhUTUxJbWFnZUVsZW1lbnRcclxuLy8gRHJhd2luZyBmcm9tIHNpbmdsZSBzcHJpdGVzaGVldCBpcyBhYm91dCA4MCUgZmFzdGVyIHRoYW4gZHJhd2luZyBmcm9tIDQ4IHNlcGFyYXRlIGNhbnZhc2VzXHJcbmZ1bmN0aW9uIGRyYXdGcm9tRnVsbFJlc2l6ZWRTcHJpdGVzaGVldChhcnJvdzogQXJyb3cpIHtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0LFxyXG4gICAgICAgIGFycm93LmNvbG9ySW5kZXggKiBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3cucm90YXRpb25JbmRleCAqIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93LnggLSBoYWxmQXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93LnkgLSBoYWxmQXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICApO1xyXG59XHJcblxyXG4vLyBTZWUgdGhpcyBpZiBJIGVuY291bnRlciB3ZWlyZCBsb2FkaW5nIHByb2JsZW1zIGxhdGVyOlxyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjM1NDg2NS9pbWFnZS1vbmxvYWQtZXZlbnQtYW5kLWJyb3dzZXItY2FjaGVcclxuZnVuY3Rpb24gbG9hZEltYWdlKGltYWdlU291cmNlOiBzdHJpbmcpOiBIVE1MSW1hZ2VFbGVtZW50IHtcclxuICAgIGlmIChwcmVsb2FkUmVnaXN0cnkuaGFzKGltYWdlU291cmNlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBhdHRlbXB0ZWQgdG8gbG9hZCB0aGUgc2FtZSBpbWFnZSB0d2ljZSBkdXJpbmcgcHJlbG9hZGluZy5cIik7XHJcbiAgICB9XHJcbiAgICBwcmVsb2FkUmVnaXN0cnkuc2V0KGltYWdlU291cmNlLCBmYWxzZSk7XHJcblxyXG4gICAgLy8gVGhlIG9yZGVyIHRoZXNlIDMgdGhpbmdzIGFyZSBkb25lIGluIGlzIFZFUlkgaW1wb3J0YW50IVxyXG4gICAgbGV0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgcHJlbG9hZFJlZ2lzdHJ5LnNldChpbWFnZVNvdXJjZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBpbWFnZS5zcmMgPSBpbWFnZVNvdXJjZTtcclxuXHJcbiAgICByZXR1cm4gaW1hZ2U7XHJcbn1cclxuXHJcbmxldCBwcmVsb2FkSW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgIGlmIChwcmVsb2FkRG9uZSgpKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChwcmVsb2FkSW50ZXJ2YWxJZCk7XHJcbiAgICAgICAgY3JlYXRlQ2FjaGVzKCk7XHJcbiAgICAgICAgc2V0U2hhZGVyVGV4dHVyZShnbCwgYXJyb3dDYWNoZVNwcml0ZXNoZWV0KTtcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xyXG4gICAgfVxyXG59LCAxMDApO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZERvbmUoKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBba2V5LCBsb2FkZWRdIG9mIHByZWxvYWRSZWdpc3RyeSkge1xyXG4gICAgICAgIGlmICghbG9hZGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmxldCBtb3VzZURvd246IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IG1vdXNlWDogbnVtYmVyID0gMDtcclxubGV0IG1vdXNlWTogbnVtYmVyID0gMDtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgIG1vdXNlRG93biA9IHRydWU7XHJcbiAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93biA9IDA7XHJcbiAgICBtb3VzZURvd25TdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG59KTtcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHsgbW91c2VEb3duID0gZmFsc2U7IH0pO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBtb3VzZVggPSBlLmNsaWVudFggLSBjYW52YXMyZC5vZmZzZXRMZWZ0O1xyXG4gICAgbW91c2VZID0gZS5jbGllbnRZO1xyXG59KTtcclxuXHJcbmxldCBwcmV2aW91c0ZyYW1lVGltZXM6IG51bWJlcltdID0gW107XHJcbmxldCBudW1GcmFtZVRpbWVzVG9SZW1lbWJlcjogbnVtYmVyID0gMTAwO1xyXG5sZXQgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZTogbnVtYmVyID0gMDtcclxuXHJcbmxldCBhcnJvd3M6IEFycm93W10gPSBbXTtcclxuXHJcbmxldCBsb2dDb3VudGVyOiBudW1iZXIgPSAwO1xyXG5cclxuZnVuY3Rpb24gZHJhdyhjdXJyZW50VGltZU1pbGxpczogbnVtYmVyKSB7XHJcbiAgICBpZiAocHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCA+PSBudW1GcmFtZVRpbWVzVG9SZW1lbWJlcikge1xyXG4gICAgICAgIHByZXZpb3VzRnJhbWVUaW1lcy5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgcHJldmlvdXNGcmFtZVRpbWVzLnB1c2goY3VycmVudFRpbWVNaWxsaXMpO1xyXG5cclxuICAgIGxldCBkZWx0YVRpbWVNaWxsaXM6IG51bWJlcjtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGRlbHRhVGltZU1pbGxpcyA9IGN1cnJlbnRUaW1lTWlsbGlzIC0gcHJldmlvdXNGcmFtZVRpbWVzW3ByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggLSAyXTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW91c2VEb3duKSB7XHJcbiAgICAgICAgbGV0IG1vdXNlRG93bkRlbHRhTWlsbGlzOiBudW1iZXIgPSBjdXJyZW50VGltZU1pbGxpcyAtIG1vdXNlRG93blN0YXJ0O1xyXG4gICAgICAgIGxldCBleHBlY3RlZEFycm93czogbnVtYmVyID0gTWF0aC5mbG9vcihtb3VzZURvd25EZWx0YU1pbGxpcyAqIHNwYXduUmF0ZSAvIDEwMDApO1xyXG4gICAgICAgIHdoaWxlIChhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93biA8IGV4cGVjdGVkQXJyb3dzKSB7XHJcbiAgICAgICAgICAgIGdlbmVyYXRlQXJyb3coKTtcclxuICAgICAgICAgICAgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd24rKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2ltdWxhdGUgdGhlIGFycm93c1xyXG4gICAgaWYgKHByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJvd3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYXJyb3dzW2ldLnggKz0gYXJyb3dzW2ldLnZlbG9jaXR5WCAqIHNwZWVkTW9kaWZpZXIgKiBkZWx0YVRpbWVNaWxsaXM7XHJcbiAgICAgICAgICAgIGFycm93c1tpXS55ICs9IGFycm93c1tpXS52ZWxvY2l0eVkgKiBzcGVlZE1vZGlmaWVyICogZGVsdGFUaW1lTWlsbGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS54IC0gaGFsZkFycm93U2l6ZSA8IDApIHsgLy8gZG9uayBvbiB0aGUgbGVmdFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnggKz0gMiAqIChoYWxmQXJyb3dTaXplIC0gYXJyb3dzW2ldLngpO1xyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnZlbG9jaXR5WCA9IC1hcnJvd3NbaV0udmVsb2NpdHlYO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhcnJvd3NbaV0ueSAtIGhhbGZBcnJvd1NpemUgPCAwKSB7IC8vIGRvbmsgb24gdGhlIHRvcFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnkgKz0gMiAqIChoYWxmQXJyb3dTaXplIC0gYXJyb3dzW2ldLnkpO1xyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnZlbG9jaXR5WSA9IC1hcnJvd3NbaV0udmVsb2NpdHlZO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhcnJvd3NbaV0ueCArIGhhbGZBcnJvd1NpemUgPiBjYW52YXMyZC53aWR0aCkgeyAvLyBkb25rIG9uIHRoZSByaWdodFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnggLT0gMiAqIChhcnJvd3NbaV0ueCArIGhhbGZBcnJvd1NpemUgLSBjYW52YXMyZC53aWR0aCk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlYID0gLWFycm93c1tpXS52ZWxvY2l0eVg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS55ICsgaGFsZkFycm93U2l6ZSA+IGNhbnZhczJkLmhlaWdodCkgeyAvLyBkb25rIG9uIHRoZSBib3R0b21cclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS55IC09IDIgKiAoYXJyb3dzW2ldLnkgKyBoYWxmQXJyb3dTaXplIC0gY2FudmFzMmQuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS52ZWxvY2l0eVkgPSAtYXJyb3dzW2ldLnZlbG9jaXR5WTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHRvcCBVSVxyXG4gICAgYXJyb3dDb3VudGVyLmlubmVyVGV4dCA9IGFycm93cy5sZW5ndGgudG9TdHJpbmcoKTtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZwc0NvdW50ZXIuaW5uZXJUZXh0ID0gTWF0aC5yb3VuZCgxMDAwIC8gZGVsdGFUaW1lTWlsbGlzKS50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBmcHNDb3VudGVyLmlubmVyVGV4dCA9IFwiY2FsY3VsYXRpbmcuLi5cIjtcclxuICAgIH1cclxuICAgIGlmIChmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID49IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyKSB7XHJcbiAgICAgICAgYXJyb3dzUGVyTXNDb3VudGVyLmlubmVyVGV4dCA9IHJvdW5kVG9OUGxhY2VzKFxyXG4gICAgICAgICAgICBhcnJvd3MubGVuZ3RoXHJcbiAgICAgICAgICAgIC8gKGN1cnJlbnRUaW1lTWlsbGlzIC0gcHJldmlvdXNGcmFtZVRpbWVzWzBdKVxyXG4gICAgICAgICAgICAqIG51bUZyYW1lVGltZXNUb1JlbWVtYmVyXHJcbiAgICAgICAgICAgICwgMikudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXJyb3dzUGVyTXNDb3VudGVyLmlubmVyVGV4dCA9IFwiY2FsY3VsYXRpbmcuLi5cIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMyZC53aWR0aCwgY2FudmFzMmQuaGVpZ2h0KTtcclxuXHJcbiAgICAvLyBkcmF3IHRoZSBhcnJvd3NcclxuICAgIGlmIChkcmF3TWV0aG9kV2ViR0xJbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgZHJhd0Fycm93c0dsKGdsLCBhcnJvd3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBkcmF3RnJvbUZ1bGxSZXNpemVkU3ByaXRlc2hlZXQoYXJyb3dzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSsrO1xyXG5cclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXJyb3coKSB7XHJcbiAgICBsZXQgYXJyb3c6IEFycm93ID0gbmV3IEFycm93KCk7XHJcbiAgICBhcnJvdy54ID0gY2xhbXBWYWx1ZVRvUmFuZ2UobW91c2VYLCAwLCBjYW52YXMyZC53aWR0aCk7XHJcbiAgICBhcnJvdy55ID0gY2xhbXBWYWx1ZVRvUmFuZ2UobW91c2VZLCAwLCBjYW52YXMyZC5oZWlnaHQpO1xyXG4gICAgXHJcbiAgICBsZXQgdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDogbnVtYmVyID0gMC40O1xyXG4gICAgbGV0IHJhbmRvbUFuZ2xlOiBudW1iZXIgPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XHJcbiAgICBhcnJvdy52ZWxvY2l0eVggPSBNYXRoLmNvcyhyYW5kb21BbmdsZSkgKiB2ZWxvY2l0eU1hZ25pdHVkZVBpeGVsc1Blck1pbGxpc2Vjb25kO1xyXG4gICAgYXJyb3cudmVsb2NpdHlZID0gTWF0aC5zaW4ocmFuZG9tQW5nbGUpICogdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDtcclxuXHJcbiAgICBhcnJvdy5jb2xvckluZGV4ID0gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKDAsIDExKTtcclxuICAgIGFycm93LnJvdGF0aW9uSW5kZXggPSBnZXRSYW5kb21JbnRJbmNsdXNpdmUoMCwgMyk7XHJcblxyXG4gICAgYXJyb3dzLnB1c2goYXJyb3cpO1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IC0xO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==