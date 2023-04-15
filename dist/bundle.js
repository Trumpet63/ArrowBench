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
            v_texCoord = a_position / vec2(12.0, 4.0) * vec2(0.9985, 0.9985) + a_instance_traits / vec2(12.0, 4.0);
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
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,
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
    createFullResizedSpritesheet();
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
function createFullResizedSpritesheet() {
    arrowCacheSpritesheet = document.createElement("canvas");
    arrowCacheSpritesheet.width = arrowColors.length * arrowSize + arrowColors.length;
    arrowCacheSpritesheet.height = 4 * arrowSize + 4;
    let spritesheetCtx = arrowCacheSpritesheet.getContext("2d");
    for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
        let rotation = rotationIndex * Math.PI / 2;
        for (let colorIndex = 0; colorIndex < arrowColors.length; colorIndex++) {
            let destinationX = colorIndex * arrowSize + colorIndex;
            let destinationY = rotationIndex * arrowSize + rotationIndex;
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
    ctx.drawImage(arrowCacheSpritesheet, arrow.colorIndex * arrowSize + arrow.colorIndex, arrow.rotationIndex * arrowSize + arrow.rotationIndex, arrowSize, arrowSize, arrow.x - halfArrowSize, arrow.y - halfArrowSize, arrowSize, arrowSize);
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
        createFullResizedSpritesheet();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcscUNBQXFDLENBQUM7SUFFaEYsS0FBSyxDQUFDLFVBQVUsR0FBRyw0REFBcUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDaEQsS0FBSyxDQUFDLGFBQWEsR0FBRyw0REFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQix5QkFBeUIsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhwb3J0cy8uL3NyYy9hcnJvdy50cyIsIndlYnBhY2s6Ly9leHBvcnRzLy4vc3JjL3V0aWwudHMiLCJ3ZWJwYWNrOi8vZXhwb3J0cy8uL3NyYy93ZWJnbC50cyIsIndlYnBhY2s6Ly9leHBvcnRzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4cG9ydHMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4cG9ydHMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leHBvcnRzL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhwb3J0cy8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQXJyb3cge1xyXG4gICAgcHVibGljIHg6IG51bWJlcjtcclxuICAgIHB1YmxpYyB5OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdmVsb2NpdHlYOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdmVsb2NpdHlZOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgY29sb3JJbmRleDogbnVtYmVyO1xyXG4gICAgcHVibGljIHJvdGF0aW9uSW5kZXg6IG51bWJlcjtcclxufVxyXG4iLCJleHBvcnQgZnVuY3Rpb24gcm91bmRUb05QbGFjZXMoeDogbnVtYmVyLCBudW1QbGFjZXM6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBsZXQgc2NhbGU6IG51bWJlciA9IE1hdGgucG93KDEwLCBudW1QbGFjZXMpO1xyXG4gICAgcmV0dXJuIE1hdGgucm91bmQoeCAqIHNjYWxlKSAvIHNjYWxlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xhbXBWYWx1ZVRvUmFuZ2UodmFsdWU6IG51bWJlciwgbG93ZXJCb3VuZDogbnVtYmVyLCB1cHBlckJvdW5kOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgaWYgKHZhbHVlIDwgbG93ZXJCb3VuZCkge1xyXG4gICAgICAgIHJldHVybiBsb3dlckJvdW5kO1xyXG4gICAgfVxyXG4gICAgaWYgKHZhbHVlID4gdXBwZXJCb3VuZCkge1xyXG4gICAgICAgIHJldHVybiB1cHBlckJvdW5kO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcclxuICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xyXG59XHJcbiIsImltcG9ydCB7IEFycm93IH0gZnJvbSBcIi4vYXJyb3dcIjtcclxuXHJcbmxldCBpbnN0YW5jZVBvc2l0aW9uc0xvY2F0aW9uOiBudW1iZXI7XHJcbmxldCBpbnN0YW5jZVRyYWl0c0xvY2F0aW9uOiBudW1iZXI7XHJcblxyXG4vLyBJZiBJIGNyZWF0ZSBidWZmZXJzIHJlcGVhdGVkbHkgd2l0aG91dCBkZWxldGluZyB0aGVtIHRoZW4gSSdsbCBjYXVzZSBhIG1lbW9yeVxyXG4vLyBsZWFrIGluIGF0IGxlYXN0IEZpcmVGb3ggYnV0IHBvc3NpYmx5IG90aGVyIGJyb3dzZXJzLiBOb3QgQ2hyb21lIHRob3VnaC5cclxubGV0IGluc3RhbmNlUG9zaXRpb25zQnVmZmVyOiBXZWJHTEJ1ZmZlcjtcclxubGV0IGluc3RhbmNlVHJhaXRzQnVmZmVyOiBXZWJHTEJ1ZmZlcjtcclxubGV0IHBvc2l0aW9uQnVmZmVyOiBXZWJHTEJ1ZmZlcjtcclxuXHJcbmxldCBwcmV2aW91c051bUFycm93czogbnVtYmVyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVTaGFkZXJzKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBhcnJvd1NpemU6IG51bWJlcikge1xyXG4gICAgbGV0IGhhbGZBcnJvd1NpemU6IG51bWJlciA9IGFycm93U2l6ZSAvIDI7XHJcblxyXG4gICAgbGV0IHZlcnRleFNoYWRlclNyYyA9IGBcclxuICAgICAgICBhdHRyaWJ1dGUgdmVjMiBhX3Bvc2l0aW9uO1xyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMyIGFfaW5zdGFuY2VfcG9zaXRpb247XHJcbiAgICAgICAgYXR0cmlidXRlIHZlYzIgYV9pbnN0YW5jZV90cmFpdHM7XHJcbiAgICAgICAgdW5pZm9ybSBtYXQzIHVfbWF0cml4O1xyXG4gICAgICAgIHZhcnlpbmcgdmVjMiB2X3RleENvb3JkO1xyXG5cclxuICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgIHZlYzIgY2FudmFzX3Bvc2l0aW9uID0gYV9wb3NpdGlvbiAqIHZlYzIoJHthcnJvd1NpemV9LCAke2Fycm93U2l6ZX0pICsgYV9pbnN0YW5jZV9wb3NpdGlvbiArIHZlYzIoLSR7aGFsZkFycm93U2l6ZX0sIC0ke2hhbGZBcnJvd1NpemV9KTtcclxuICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHVfbWF0cml4ICogdmVjMyhjYW52YXNfcG9zaXRpb24sIDEpLCAxKSArIHZlYzQoLTEsIDEsIDAsIDApO1xyXG4gICAgICAgICAgICB2X3RleENvb3JkID0gYV9wb3NpdGlvbiAvIHZlYzIoMTIuMCwgNC4wKSAqIHZlYzIoMC45OTg1LCAwLjk5ODUpICsgYV9pbnN0YW5jZV90cmFpdHMgLyB2ZWMyKDEyLjAsIDQuMCk7XHJcbiAgICAgICAgfWBcclxuXHJcbiAgICBsZXQgZnJhZ21lbnRTaGFkZXJTcmMgPSBgXHJcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7XHJcbiAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbWFnZTtcclxuICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1X2ltYWdlLCB2X3RleENvb3JkKTtcclxuICAgICAgICB9YFxyXG5cclxuICAgIGxldCB2ZXJ0U2hhZGVyT2JqID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG4gICAgbGV0IGZyYWdTaGFkZXJPYmogPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcclxuICAgIGdsLnNoYWRlclNvdXJjZSh2ZXJ0U2hhZGVyT2JqLCB2ZXJ0ZXhTaGFkZXJTcmMpO1xyXG4gICAgZ2wuc2hhZGVyU291cmNlKGZyYWdTaGFkZXJPYmosIGZyYWdtZW50U2hhZGVyU3JjKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIodmVydFNoYWRlck9iaik7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKGZyYWdTaGFkZXJPYmopO1xyXG5cclxuICAgIGxldCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRTaGFkZXJPYmopO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdTaGFkZXJPYmopO1xyXG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xyXG5cclxuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHZlcnRTaGFkZXJPYmosIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNvbXBpbGluZyB2ZXJ0ZXggc2hhZGVyOicsIGdsLmdldFNoYWRlckluZm9Mb2codmVydFNoYWRlck9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoZnJhZ1NoYWRlck9iaiwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY29tcGlsaW5nIGZyYWdtZW50IHNoYWRlcjonLCBnbC5nZXRTaGFkZXJJbmZvTG9nKGZyYWdTaGFkZXJPYmopKTtcclxuICAgIH1cclxuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsaW5raW5nIHByb2dyYW06JywgZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB1X21hdHJpeExvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcInVfbWF0cml4XCIpO1xyXG4gICAgbGV0IHBvc2l0aW9uTG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBcImFfcG9zaXRpb25cIik7XHJcbiAgICBpbnN0YW5jZVBvc2l0aW9uc0xvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgXCJhX2luc3RhbmNlX3Bvc2l0aW9uXCIpO1xyXG4gICAgaW5zdGFuY2VUcmFpdHNMb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIFwiYV9pbnN0YW5jZV90cmFpdHNcIik7XHJcblxyXG4gICAgbGV0IG1hdHJpeCA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgIDIgLyBnbC5jYW52YXMud2lkdGgsIDAsIDAsXHJcbiAgICAgICAgMCwgLTIgLyBnbC5jYW52YXMuaGVpZ2h0LCAwLFxyXG4gICAgICAgIDAsIDAsIDEsXHJcbiAgICBdKTtcclxuICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYodV9tYXRyaXhMb2MsIGZhbHNlLCBtYXRyaXgpO1xyXG5cclxuICAgIGlmIChwb3NpdGlvbkJ1ZmZlciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZ2wuZGVsZXRlQnVmZmVyKHBvc2l0aW9uQnVmZmVyKTtcclxuICAgIH1cclxuICAgIHBvc2l0aW9uQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgcG9zaXRpb25CdWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgIDAsICAwLFxyXG4gICAgICAgIDEsICAwLFxyXG4gICAgICAgIDAsICAxLFxyXG4gICAgICAgIDAsICAxLFxyXG4gICAgICAgIDEsICAwLFxyXG4gICAgICAgIDEsICAxLFxyXG4gICAgXSksIGdsLlNUQVRJQ19EUkFXKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHBvc2l0aW9uTG9jYXRpb24pO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NpdGlvbkxvY2F0aW9uLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG5cclxuICAgIGxldCB0ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cclxuICAgIC8vIGVuYWJsZSBhbHBoYSBibGVuZGluZ1xyXG4gICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcclxuICAgIGdsLmJsZW5kRnVuYyhnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xyXG5cclxuICAgIGlmIChpbnN0YW5jZVBvc2l0aW9uc0J1ZmZlciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZ2wuZGVsZXRlQnVmZmVyKGluc3RhbmNlUG9zaXRpb25zQnVmZmVyKTtcclxuICAgIH1cclxuICAgIGluc3RhbmNlUG9zaXRpb25zQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblxyXG4gICAgaWYgKGluc3RhbmNlVHJhaXRzQnVmZmVyICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIoaW5zdGFuY2VUcmFpdHNCdWZmZXIpO1xyXG4gICAgfVxyXG4gICAgaW5zdGFuY2VUcmFpdHNCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHJcbiAgICBwcmV2aW91c051bUFycm93cyA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFNoYWRlclRleHR1cmUoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGltYWdlOiBIVE1MQ2FudmFzRWxlbWVudCkge1xyXG4gICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWFnZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkcmF3QXJyb3dzR2woZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGFycm93czogQXJyb3dbXSkge1xyXG4gICAgaWYgKGFycm93cy5sZW5ndGggPT09IHByZXZpb3VzTnVtQXJyb3dzKSB7XHJcbiAgICAgICAganVzdFNlbmRQb3NpdGlvbihnbCwgYXJyb3dzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VuZFBvc2l0aW9uQW5kVHJhaXRzKGdsLCBhcnJvd3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByZXZpb3VzTnVtQXJyb3dzID0gYXJyb3dzLmxlbmd0aDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZFBvc2l0aW9uQW5kVHJhaXRzKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBhcnJvd3M6IEFycm93W10pIHtcclxuICAgIGxldCBpbnN0YW5jZVBvc2l0aW9uczogbnVtYmVyW10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnMucHVzaChhcnJvd3NbaV0ueCk7XHJcbiAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnMucHVzaChhcnJvd3NbaV0ueSk7XHJcbiAgICB9XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgaW5zdGFuY2VQb3NpdGlvbnNCdWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoaW5zdGFuY2VQb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5zdGFuY2VQb3NpdGlvbnNMb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb24sIDEpO1xyXG5cclxuICAgIGxldCBpbnN0YW5jZVRyYWl0czogbnVtYmVyW10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaW5zdGFuY2VUcmFpdHMucHVzaChhcnJvd3NbaV0uY29sb3JJbmRleCk7XHJcbiAgICAgICAgaW5zdGFuY2VUcmFpdHMucHVzaChhcnJvd3NbaV0ucm90YXRpb25JbmRleCk7XHJcbiAgICB9XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgaW5zdGFuY2VUcmFpdHNCdWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoaW5zdGFuY2VUcmFpdHMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5zdGFuY2VUcmFpdHNMb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGluc3RhbmNlVHJhaXRzTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGluc3RhbmNlVHJhaXRzTG9jYXRpb24sIDEpO1xyXG5cclxuICAgIGdsLmRyYXdBcnJheXNJbnN0YW5jZWQoZ2wuVFJJQU5HTEVTLCAwLCA2LCBhcnJvd3MubGVuZ3RoKTtcclxufVxyXG5cclxuZnVuY3Rpb24ganVzdFNlbmRQb3NpdGlvbihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgYXJyb3dzOiBBcnJvd1tdKSB7XHJcbiAgICBsZXQgaW5zdGFuY2VQb3NpdGlvbnM6IG51bWJlcltdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGluc3RhbmNlUG9zaXRpb25zLnB1c2goYXJyb3dzW2ldLngpO1xyXG4gICAgICAgIGluc3RhbmNlUG9zaXRpb25zLnB1c2goYXJyb3dzW2ldLnkpO1xyXG4gICAgfVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGluc3RhbmNlUG9zaXRpb25zQnVmZmVyKTtcclxuICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2wuQVJSQVlfQlVGRkVSLCAwLCBuZXcgRmxvYXQzMkFycmF5KGluc3RhbmNlUG9zaXRpb25zKSk7XHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5zdGFuY2VQb3NpdGlvbnNMb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGluc3RhbmNlUG9zaXRpb25zTG9jYXRpb24sIDEpO1xyXG5cclxuICAgIGdsLmRyYXdBcnJheXNJbnN0YW5jZWQoZ2wuVFJJQU5HTEVTLCAwLCA2LCBhcnJvd3MubGVuZ3RoKTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEFycm93IH0gZnJvbSBcIi4vYXJyb3dcIjtcclxuaW1wb3J0IHsgY2xhbXBWYWx1ZVRvUmFuZ2UsIGdldFJhbmRvbUludEluY2x1c2l2ZSwgcm91bmRUb05QbGFjZXMgfSBmcm9tIFwiLi91dGlsXCI7XHJcbmltcG9ydCB7IGRyYXdBcnJvd3NHbCwgaW5pdGlhbGl6ZVNoYWRlcnMsIHNldFNoYWRlclRleHR1cmUgfSBmcm9tIFwiLi93ZWJnbFwiO1xyXG5cclxubGV0IGNhbnZhczJkID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93QmVuY2gyZENhbnZhc1wiKTtcclxuY2FudmFzMmQud2lkdGggPSAxOTIwO1xyXG5jYW52YXMyZC5oZWlnaHQgPSAxMDgwO1xyXG5sZXQgY2FudmFzZ2wgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dCZW5jaFdlYkdMQ2FudmFzXCIpO1xyXG5jYW52YXNnbC53aWR0aCA9IDE5MjA7XHJcbmNhbnZhc2dsLmhlaWdodCA9IDEwODA7XHJcbmxldCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCA9IGNhbnZhczJkLmdldENvbnRleHQoXCIyZFwiKTtcclxuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5sZXQgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSBjYW52YXNnbC5nZXRDb250ZXh0KFwid2ViZ2wyXCIpO1xyXG5cclxubGV0IGFycm93Q291bnRlciA9IDxIVE1MU3BhbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dDb3VudGVyXCIpO1xyXG5sZXQgZnBzQ291bnRlciA9IDxIVE1MU3BhbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKTtcclxubGV0IGFycm93c1Blck1zQ291bnRlciA9IDxIVE1MU3BhbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dzUGVyTXNDb3VudGVyXCIpO1xyXG5cclxubGV0IGFycm93U2l6ZUlucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dTaXplSW5wdXRcIik7XHJcbmFycm93U2l6ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICBhcnJvd1NpemUgPSBhcnJvd1NpemVJbnB1dC52YWx1ZUFzTnVtYmVyO1xyXG4gICAgaGFsZkFycm93U2l6ZSA9IGFycm93U2l6ZSAvIDI7XHJcbiAgICBjcmVhdGVGdWxsUmVzaXplZFNwcml0ZXNoZWV0KCk7XHJcbiAgICBpbml0aWFsaXplU2hhZGVycyhnbCwgYXJyb3dTaXplKTtcclxuICAgIHNldFNoYWRlclRleHR1cmUoZ2wsIGFycm93Q2FjaGVTcHJpdGVzaGVldCk7XHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID0gMDtcclxufSk7XHJcblxyXG5sZXQgYXJyb3dTcGVlZElucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dTcGVlZElucHV0XCIpO1xyXG5hcnJvd1NwZWVkSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIHNwZWVkTW9kaWZpZXIgPSBhcnJvd1NwZWVkSW5wdXQudmFsdWVBc051bWJlcjtcclxufSk7XHJcblxyXG5sZXQgc3Bhd25SYXRlSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcGF3blJhdGVJbnB1dFwiKTtcclxuc3Bhd25SYXRlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIHNwYXduUmF0ZSA9IE1hdGgucG93KHNwYXduUmF0ZUlucHV0LnZhbHVlQXNOdW1iZXIsIDMpO1xyXG4gICAgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd24gPSAwO1xyXG4gICAgbW91c2VEb3duU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxufSk7XHJcblxyXG5sZXQgY2xlYXJBcnJvd3NCdXR0b24gPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXJBcnJvd3NCdXR0b25cIik7XHJcbmNsZWFyQXJyb3dzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBhcnJvd3MgPSBbXTtcclxufSk7XHJcblxyXG5sZXQgZHJhd01ldGhvZFdlYkdMSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkcmF3TWV0aG9kV2ViR0xcIik7XHJcbmRyYXdNZXRob2RXZWJHTElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID0gMDtcclxufSk7XHJcbmxldCBkcmF3TWV0aG9kU29mdHdhcmVJbnB1dCA9IDxIVE1MSW5wdXRFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRyYXdNZXRob2RTb2Z0d2FyZVwiKTtcclxuZHJhd01ldGhvZFNvZnR3YXJlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIGZyYW1lc1dpdGhvdXRBU3RhdGVDaGFuZ2UgPSAwO1xyXG59KTtcclxuXHJcbmxldCBhcnJvd1NpemU6IG51bWJlciA9IGFycm93U2l6ZUlucHV0LnZhbHVlQXNOdW1iZXI7XHJcbmxldCBzcGVlZE1vZGlmaWVyOiBudW1iZXIgPSBhcnJvd1NwZWVkSW5wdXQudmFsdWVBc051bWJlcjtcclxubGV0IGhhbGZBcnJvd1NpemU6IG51bWJlciA9IGFycm93U2l6ZSAvIDI7XHJcbmxldCBzcGF3blJhdGU6IG51bWJlciA9IE1hdGgucG93KHNwYXduUmF0ZUlucHV0LnZhbHVlQXNOdW1iZXIsIDMpO1xyXG5sZXQgbW91c2VEb3duU3RhcnQ6IG51bWJlcjtcclxubGV0IGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duOiBudW1iZXI7XHJcblxyXG5pbml0aWFsaXplU2hhZGVycyhnbCwgYXJyb3dTaXplKTtcclxuXHJcbmxldCBub3Rlc2tpbjR0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzR0aC5wbmdcIjtcclxubGV0IG5vdGVza2luOHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fOHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4xMnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMTJ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTZ0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzE2dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjIwdGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8yMHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4yNHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMjR0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMzJuZFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzMybmQucG5nXCI7XHJcbmxldCBub3Rlc2tpbjQ4dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl80OHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW42NHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fNjR0aC5wbmdcIjtcclxubGV0IG5vdGVza2luOTZ0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzk2dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjEyOHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMTI4dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjE5Mm5kUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMTkybmQucG5nXCI7XHJcbmxldCBwcmVsb2FkUmVnaXN0cnk6IE1hcDxzdHJpbmcsIGJvb2xlYW4+ID0gbmV3IE1hcCgpO1xyXG5cclxubGV0IGFycm93Q29sb3JzOiBIVE1MSW1hZ2VFbGVtZW50W10gPSBbXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW40dGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjh0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMTJ0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMTZ0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMjB0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMjR0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMzJuZFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luNDh0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luNjR0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luOTZ0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMTI4dGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjE5Mm5kUGF0aCksXHJcbl07XHJcblxyXG5sZXQgYXJyb3dDYWNoZVNwcml0ZXNoZWV0OiBIVE1MQ2FudmFzRWxlbWVudDtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZ1bGxSZXNpemVkU3ByaXRlc2hlZXQoKSB7XHJcbiAgICBhcnJvd0NhY2hlU3ByaXRlc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0LndpZHRoID0gYXJyb3dDb2xvcnMubGVuZ3RoICogYXJyb3dTaXplICsgYXJyb3dDb2xvcnMubGVuZ3RoO1xyXG4gICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0LmhlaWdodCA9IDQgKiBhcnJvd1NpemUgKyA0O1xyXG4gICAgbGV0IHNwcml0ZXNoZWV0Q3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgPSBhcnJvd0NhY2hlU3ByaXRlc2hlZXQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgZm9yIChsZXQgcm90YXRpb25JbmRleCA9IDA7IHJvdGF0aW9uSW5kZXggPCA0OyByb3RhdGlvbkluZGV4KyspIHtcclxuICAgICAgICBsZXQgcm90YXRpb246IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBNYXRoLlBJIC8gMjtcclxuICAgICAgICBmb3IgKGxldCBjb2xvckluZGV4ID0gMDsgY29sb3JJbmRleCA8IGFycm93Q29sb3JzLmxlbmd0aDsgY29sb3JJbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblg6IG51bWJlciA9IGNvbG9ySW5kZXggKiBhcnJvd1NpemUgKyBjb2xvckluZGV4O1xyXG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb25ZOiBudW1iZXIgPSByb3RhdGlvbkluZGV4ICogYXJyb3dTaXplICsgcm90YXRpb25JbmRleDtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgudHJhbnNsYXRlKGRlc3RpbmF0aW9uWCArIGhhbGZBcnJvd1NpemUsIGRlc3RpbmF0aW9uWSArIGhhbGZBcnJvd1NpemUpO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC5yb3RhdGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICBhcnJvd0NvbG9yc1tjb2xvckluZGV4XSxcclxuICAgICAgICAgICAgICAgIC1oYWxmQXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgLWhhbGZBcnJvd1NpemUsXHJcbiAgICAgICAgICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHNwcml0ZXNoZWV0Q3R4LnJvdGF0ZSgtcm90YXRpb24pO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC50cmFuc2xhdGUoLShkZXN0aW5hdGlvblggKyBoYWxmQXJyb3dTaXplKSwgLShkZXN0aW5hdGlvblkgKyBoYWxmQXJyb3dTaXplKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBOb3RlOiBcclxuLy8gVHJhbnNmb3JtaW5nIGFuZCB0aGVuIHVudHJhbnNmb3JtaW5nIGlzIGZhc3RlciB0aGFuIHVzaW5nIHNhdmUvcmVzdG9yZVxyXG4vLyBEcmF3aW5nIHRoZSByZXNpemVkIGFycm93IHRvIGFuIG9mZnNjcmVlbiBjYW52YXMgc28gdGhhdCBkcmF3SW1hZ2VcclxuLy8gICAgIGRvZXNuJ3QgaGF2ZSB0byByZXNpemUgaXMgc2lnbmlmaWNhbnRseSBmYXN0ZXIgKGV4Y2VwdCBvbiBGaXJlRm94IHdoZXJlIGl0J3Mgb25seSBsaWtlIDMlIGZhc3RlcilcclxuLy8gRm9yIHNvbWUgcmVhc29uLCBbMF1bYXJyb3cuY29sb3JJbmRleF0gaXMgZmFzdGVyIHRoYW4gW2Fycm93LnJvdGF0aW9uSW5kZXhdW2Fycm93LmNvbG9ySW5kZXhdXHJcbi8vIERyYXdpbmcgZnJvbSBhbiBIVE1MQ2FudmFzRWxlbWVudCBpcyBmYXN0ZXIgdGhhbiBkcmF3aW5nIGZyb20gYW4gSFRNTEltYWdlRWxlbWVudFxyXG4vLyBEcmF3aW5nIGZyb20gc2luZ2xlIHNwcml0ZXNoZWV0IGlzIGFib3V0IDgwJSBmYXN0ZXIgdGhhbiBkcmF3aW5nIGZyb20gNDggc2VwYXJhdGUgY2FudmFzZXNcclxuZnVuY3Rpb24gZHJhd0Zyb21GdWxsUmVzaXplZFNwcml0ZXNoZWV0KGFycm93OiBBcnJvdykge1xyXG4gICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICBhcnJvd0NhY2hlU3ByaXRlc2hlZXQsXHJcbiAgICAgICAgYXJyb3cuY29sb3JJbmRleCAqIGFycm93U2l6ZSArIGFycm93LmNvbG9ySW5kZXgsXHJcbiAgICAgICAgYXJyb3cucm90YXRpb25JbmRleCAqIGFycm93U2l6ZSArIGFycm93LnJvdGF0aW9uSW5kZXgsXHJcbiAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvdy54IC0gaGFsZkFycm93U2l6ZSxcclxuICAgICAgICBhcnJvdy55IC0gaGFsZkFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgKTtcclxufVxyXG5cclxuLy8gU2VlIHRoaXMgaWYgSSBlbmNvdW50ZXIgd2VpcmQgbG9hZGluZyBwcm9ibGVtcyBsYXRlcjpcclxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIzNTQ4NjUvaW1hZ2Utb25sb2FkLWV2ZW50LWFuZC1icm93c2VyLWNhY2hlXHJcbmZ1bmN0aW9uIGxvYWRJbWFnZShpbWFnZVNvdXJjZTogc3RyaW5nKTogSFRNTEltYWdlRWxlbWVudCB7XHJcbiAgICBpZiAocHJlbG9hZFJlZ2lzdHJ5LmhhcyhpbWFnZVNvdXJjZSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgYXR0ZW1wdGVkIHRvIGxvYWQgdGhlIHNhbWUgaW1hZ2UgdHdpY2UgZHVyaW5nIHByZWxvYWRpbmcuXCIpO1xyXG4gICAgfVxyXG4gICAgcHJlbG9hZFJlZ2lzdHJ5LnNldChpbWFnZVNvdXJjZSwgZmFsc2UpO1xyXG5cclxuICAgIC8vIFRoZSBvcmRlciB0aGVzZSAzIHRoaW5ncyBhcmUgZG9uZSBpbiBpcyBWRVJZIGltcG9ydGFudCFcclxuICAgIGxldCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgIHByZWxvYWRSZWdpc3RyeS5zZXQoaW1hZ2VTb3VyY2UsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgaW1hZ2Uuc3JjID0gaW1hZ2VTb3VyY2U7XHJcblxyXG4gICAgcmV0dXJuIGltYWdlO1xyXG59XHJcblxyXG5sZXQgcHJlbG9hZEludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICBpZiAocHJlbG9hZERvbmUoKSkge1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwocHJlbG9hZEludGVydmFsSWQpO1xyXG4gICAgICAgIGNyZWF0ZUZ1bGxSZXNpemVkU3ByaXRlc2hlZXQoKTtcclxuICAgICAgICBzZXRTaGFkZXJUZXh0dXJlKGdsLCBhcnJvd0NhY2hlU3ByaXRlc2hlZXQpO1xyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XHJcbiAgICB9XHJcbn0sIDEwMCk7XHJcblxyXG5mdW5jdGlvbiBwcmVsb2FkRG9uZSgpOiBib29sZWFuIHtcclxuICAgIGZvciAobGV0IFtrZXksIGxvYWRlZF0gb2YgcHJlbG9hZFJlZ2lzdHJ5KSB7XHJcbiAgICAgICAgaWYgKCFsb2FkZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxubGV0IG1vdXNlRG93bjogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgbW91c2VYOiBudW1iZXIgPSAwO1xyXG5sZXQgbW91c2VZOiBudW1iZXIgPSAwO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duID0gMDtcclxuICAgIG1vdXNlRG93blN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbn0pO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTogTW91c2VFdmVudCkgPT4geyBtb3VzZURvd24gPSBmYWxzZTsgfSk7XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgIG1vdXNlWCA9IGUuY2xpZW50WCAtIGNhbnZhczJkLm9mZnNldExlZnQ7XHJcbiAgICBtb3VzZVkgPSBlLmNsaWVudFk7XHJcbn0pO1xyXG5cclxubGV0IHByZXZpb3VzRnJhbWVUaW1lczogbnVtYmVyW10gPSBbXTtcclxubGV0IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyOiBudW1iZXIgPSAxMDA7XHJcbmxldCBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlOiBudW1iZXIgPSAwO1xyXG5cclxubGV0IGFycm93czogQXJyb3dbXSA9IFtdO1xyXG5cclxubGV0IGxvZ0NvdW50ZXI6IG51bWJlciA9IDA7XHJcblxyXG5mdW5jdGlvbiBkcmF3KGN1cnJlbnRUaW1lTWlsbGlzOiBudW1iZXIpIHtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID49IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyKSB7XHJcbiAgICAgICAgcHJldmlvdXNGcmFtZVRpbWVzLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBwcmV2aW91c0ZyYW1lVGltZXMucHVzaChjdXJyZW50VGltZU1pbGxpcyk7XHJcblxyXG4gICAgbGV0IGRlbHRhVGltZU1pbGxpczogbnVtYmVyO1xyXG4gICAgaWYgKHByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZGVsdGFUaW1lTWlsbGlzID0gY3VycmVudFRpbWVNaWxsaXMgLSBwcmV2aW91c0ZyYW1lVGltZXNbcHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCAtIDJdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb3VzZURvd24pIHtcclxuICAgICAgICBsZXQgbW91c2VEb3duRGVsdGFNaWxsaXM6IG51bWJlciA9IGN1cnJlbnRUaW1lTWlsbGlzIC0gbW91c2VEb3duU3RhcnQ7XHJcbiAgICAgICAgbGV0IGV4cGVjdGVkQXJyb3dzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1vdXNlRG93bkRlbHRhTWlsbGlzICogc3Bhd25SYXRlIC8gMTAwMCk7XHJcbiAgICAgICAgd2hpbGUgKGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duIDwgZXhwZWN0ZWRBcnJvd3MpIHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVBcnJvdygpO1xyXG4gICAgICAgICAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93bisrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBzaW11bGF0ZSB0aGUgYXJyb3dzXHJcbiAgICBpZiAocHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhcnJvd3NbaV0ueCArPSBhcnJvd3NbaV0udmVsb2NpdHlYICogc3BlZWRNb2RpZmllciAqIGRlbHRhVGltZU1pbGxpcztcclxuICAgICAgICAgICAgYXJyb3dzW2ldLnkgKz0gYXJyb3dzW2ldLnZlbG9jaXR5WSAqIHNwZWVkTW9kaWZpZXIgKiBkZWx0YVRpbWVNaWxsaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYXJyb3dzW2ldLnggLSBoYWxmQXJyb3dTaXplIDwgMCkgeyAvLyBkb25rIG9uIHRoZSBsZWZ0XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueCArPSAyICogKGhhbGZBcnJvd1NpemUgLSBhcnJvd3NbaV0ueCk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlYID0gLWFycm93c1tpXS52ZWxvY2l0eVg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS55IC0gaGFsZkFycm93U2l6ZSA8IDApIHsgLy8gZG9uayBvbiB0aGUgdG9wXHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueSArPSAyICogKGhhbGZBcnJvd1NpemUgLSBhcnJvd3NbaV0ueSk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlZID0gLWFycm93c1tpXS52ZWxvY2l0eVk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS54ICsgaGFsZkFycm93U2l6ZSA+IGNhbnZhczJkLndpZHRoKSB7IC8vIGRvbmsgb24gdGhlIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueCAtPSAyICogKGFycm93c1tpXS54ICsgaGFsZkFycm93U2l6ZSAtIGNhbnZhczJkLndpZHRoKTtcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS52ZWxvY2l0eVggPSAtYXJyb3dzW2ldLnZlbG9jaXR5WDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYXJyb3dzW2ldLnkgKyBoYWxmQXJyb3dTaXplID4gY2FudmFzMmQuaGVpZ2h0KSB7IC8vIGRvbmsgb24gdGhlIGJvdHRvbVxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnkgLT0gMiAqIChhcnJvd3NbaV0ueSArIGhhbGZBcnJvd1NpemUgLSBjYW52YXMyZC5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnZlbG9jaXR5WSA9IC1hcnJvd3NbaV0udmVsb2NpdHlZO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgdG9wIFVJXHJcbiAgICBhcnJvd0NvdW50ZXIuaW5uZXJUZXh0ID0gYXJyb3dzLmxlbmd0aC50b1N0cmluZygpO1xyXG4gICAgaWYgKHByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZnBzQ291bnRlci5pbm5lclRleHQgPSBNYXRoLnJvdW5kKDEwMDAgLyBkZWx0YVRpbWVNaWxsaXMpLnRvU3RyaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZwc0NvdW50ZXIuaW5uZXJUZXh0ID0gXCJjYWxjdWxhdGluZy4uLlwiO1xyXG4gICAgfVxyXG4gICAgaWYgKGZyYW1lc1dpdGhvdXRBU3RhdGVDaGFuZ2UgPj0gbnVtRnJhbWVUaW1lc1RvUmVtZW1iZXIpIHtcclxuICAgICAgICBhcnJvd3NQZXJNc0NvdW50ZXIuaW5uZXJUZXh0ID0gcm91bmRUb05QbGFjZXMoXHJcbiAgICAgICAgICAgIGFycm93cy5sZW5ndGhcclxuICAgICAgICAgICAgLyAoY3VycmVudFRpbWVNaWxsaXMgLSBwcmV2aW91c0ZyYW1lVGltZXNbMF0pXHJcbiAgICAgICAgICAgICogbnVtRnJhbWVUaW1lc1RvUmVtZW1iZXJcclxuICAgICAgICAgICAgLCAyKS50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBhcnJvd3NQZXJNc0NvdW50ZXIuaW5uZXJUZXh0ID0gXCJjYWxjdWxhdGluZy4uLlwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhczJkLndpZHRoLCBjYW52YXMyZC5oZWlnaHQpO1xyXG5cclxuICAgIC8vIGRyYXcgdGhlIGFycm93c1xyXG4gICAgaWYgKGRyYXdNZXRob2RXZWJHTElucHV0LmNoZWNrZWQpIHtcclxuICAgICAgICBkcmF3QXJyb3dzR2woZ2wsIGFycm93cyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGRyYXdGcm9tRnVsbFJlc2l6ZWRTcHJpdGVzaGVldChhcnJvd3NbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlKys7XHJcblxyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2VuZXJhdGVBcnJvdygpIHtcclxuICAgIGxldCBhcnJvdzogQXJyb3cgPSBuZXcgQXJyb3coKTtcclxuICAgIGFycm93LnggPSBjbGFtcFZhbHVlVG9SYW5nZShtb3VzZVgsIDAsIGNhbnZhczJkLndpZHRoKTtcclxuICAgIGFycm93LnkgPSBjbGFtcFZhbHVlVG9SYW5nZShtb3VzZVksIDAsIGNhbnZhczJkLmhlaWdodCk7XHJcbiAgICBcclxuICAgIGxldCB2ZWxvY2l0eU1hZ25pdHVkZVBpeGVsc1Blck1pbGxpc2Vjb25kOiBudW1iZXIgPSAwLjQ7XHJcbiAgICBsZXQgcmFuZG9tQW5nbGU6IG51bWJlciA9IE1hdGgucmFuZG9tKCkgKiAyICogTWF0aC5QSTtcclxuICAgIGFycm93LnZlbG9jaXR5WCA9IE1hdGguY29zKHJhbmRvbUFuZ2xlKSAqIHZlbG9jaXR5TWFnbml0dWRlUGl4ZWxzUGVyTWlsbGlzZWNvbmQ7XHJcbiAgICBhcnJvdy52ZWxvY2l0eVkgPSBNYXRoLnNpbihyYW5kb21BbmdsZSkgKiB2ZWxvY2l0eU1hZ25pdHVkZVBpeGVsc1Blck1pbGxpc2Vjb25kO1xyXG5cclxuICAgIGFycm93LmNvbG9ySW5kZXggPSBnZXRSYW5kb21JbnRJbmNsdXNpdmUoMCwgMTEpO1xyXG4gICAgYXJyb3cucm90YXRpb25JbmRleCA9IGdldFJhbmRvbUludEluY2x1c2l2ZSgwLCAzKTtcclxuXHJcbiAgICBhcnJvd3MucHVzaChhcnJvdyk7XHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID0gLTE7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9