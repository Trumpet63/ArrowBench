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
let offsetLocation;
function initializeShaders(gl, arrowSize) {
    let halfArrowSize = arrowSize / 2;
    let vertexShaderSrc = `
        attribute vec2 a_position;
        attribute vec4 a_instance;
        uniform mat3 u_matrix;
        varying vec2 v_texCoord;

        void main() {
            vec2 canvas_position = a_position * vec2(${arrowSize}, ${arrowSize}) + a_instance.xy + vec2(-${halfArrowSize}, -${halfArrowSize});
            gl_Position = vec4(u_matrix * vec3(canvas_position, 1), 1) + vec4(-1, 1, 0, 0);
            v_texCoord = a_position / vec2(12, 4) + vec2(a_instance.w, a_instance.z) / vec2(12, 4);
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
    offsetLocation = gl.getAttribLocation(program, "a_instance");
    let matrix = new Float32Array([
        2 / gl.canvas.width, 0, 0,
        0, -2 / gl.canvas.height, 0,
        0, 0, 1,
    ]);
    gl.uniformMatrix3fv(u_matrixLoc, false, matrix);
    let positionBuffer = gl.createBuffer();
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
}
function setShaderTexture(gl, image) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}
function drawArrowsGl(gl, arrows) {
    // Create a buffer to store the per-instance data
    let instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    // Populate the instance buffer with per-instance data
    let instanceVectors = [];
    for (let i = 0; i < arrows.length; i++) {
        instanceVectors.push(arrows[i].x);
        instanceVectors.push(arrows[i].y);
        instanceVectors.push(arrows[i].rotationIndex);
        instanceVectors.push(arrows[i].colorIndex);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceVectors), gl.STATIC_DRAW);
    // Bind the instance buffer to the a_instance attribute
    gl.enableVertexAttribArray(offsetLocation);
    gl.vertexAttribPointer(offsetLocation, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(offsetLocation, 1);
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
    mouseX = e.clientX;
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
    // simulate the arrows
    if (previousFrameTimes.length > 1) {
        for (let i = 0; i < arrows.length; i++) {
            arrows[i].x += arrows[i].velocityX * deltaTimeMillis;
            arrows[i].y += arrows[i].velocityY * deltaTimeMillis;
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
    if (mouseDown) {
        let mouseDownDeltaMillis = currentTimeMillis - mouseDownStart;
        let expectedArrows = Math.floor(mouseDownDeltaMillis * spawnRate / 1000);
        while (arrowsSpawnedThisMouseDown < expectedArrows) {
            generateArrow();
            arrowsSpawnedThisMouseDown++;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUM7QUFFRCxTQUFTLGFBQWE7SUFDbEIsSUFBSSxLQUFLLEdBQVUsSUFBSSx5Q0FBSyxFQUFFLENBQUM7SUFDL0IsS0FBSyxDQUFDLENBQUMsR0FBRyx3REFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2RCxLQUFLLENBQUMsQ0FBQyxHQUFHLHdEQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXhELElBQUkscUNBQXFDLEdBQVcsR0FBRyxDQUFDO0lBQ3hELElBQUksV0FBVyxHQUFXLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN0RCxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcscUNBQXFDLENBQUM7SUFDaEYsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLHFDQUFxQyxDQUFDO0lBRWhGLEtBQUssQ0FBQyxVQUFVLEdBQUcsNERBQXFCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELEtBQUssQ0FBQyxhQUFhLEdBQUcsNERBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWxELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkIseUJBQXlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4cG9ydHMvLi9zcmMvYXJyb3cudHMiLCJ3ZWJwYWNrOi8vZXhwb3J0cy8uL3NyYy91dGlsLnRzIiwid2VicGFjazovL2V4cG9ydHMvLi9zcmMvd2ViZ2wudHMiLCJ3ZWJwYWNrOi8vZXhwb3J0cy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHBvcnRzL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leHBvcnRzL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhwb3J0cy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4cG9ydHMvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEFycm93IHtcclxuICAgIHB1YmxpYyB4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgeTogbnVtYmVyO1xyXG4gICAgcHVibGljIHZlbG9jaXR5WDogbnVtYmVyO1xyXG4gICAgcHVibGljIHZlbG9jaXR5WTogbnVtYmVyO1xyXG4gICAgcHVibGljIGNvbG9ySW5kZXg6IG51bWJlcjtcclxuICAgIHB1YmxpYyByb3RhdGlvbkluZGV4OiBudW1iZXI7XHJcbn1cclxuIiwiZXhwb3J0IGZ1bmN0aW9uIHJvdW5kVG9OUGxhY2VzKHg6IG51bWJlciwgbnVtUGxhY2VzOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgbGV0IHNjYWxlOiBudW1iZXIgPSBNYXRoLnBvdygxMCwgbnVtUGxhY2VzKTtcclxuICAgIHJldHVybiBNYXRoLnJvdW5kKHggKiBzY2FsZSkgLyBzY2FsZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wVmFsdWVUb1JhbmdlKHZhbHVlOiBudW1iZXIsIGxvd2VyQm91bmQ6IG51bWJlciwgdXBwZXJCb3VuZDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGlmICh2YWx1ZSA8IGxvd2VyQm91bmQpIHtcclxuICAgICAgICByZXR1cm4gbG93ZXJCb3VuZDtcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZSA+IHVwcGVyQm91bmQpIHtcclxuICAgICAgICByZXR1cm4gdXBwZXJCb3VuZDtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbUludEluY2x1c2l2ZShtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgbWluID0gTWF0aC5jZWlsKG1pbik7XHJcbiAgICBtYXggPSBNYXRoLmZsb29yKG1heCk7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcclxufVxyXG4iLCJpbXBvcnQgeyBBcnJvdyB9IGZyb20gXCIuL2Fycm93XCI7XHJcblxyXG5sZXQgb2Zmc2V0TG9jYXRpb246IG51bWJlcjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplU2hhZGVycyhnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgYXJyb3dTaXplOiBudW1iZXIpIHtcclxuICAgIGxldCBoYWxmQXJyb3dTaXplOiBudW1iZXIgPSBhcnJvd1NpemUgLyAyO1xyXG5cclxuICAgIGxldCB2ZXJ0ZXhTaGFkZXJTcmMgPSBgXHJcbiAgICAgICAgYXR0cmlidXRlIHZlYzIgYV9wb3NpdGlvbjtcclxuICAgICAgICBhdHRyaWJ1dGUgdmVjNCBhX2luc3RhbmNlO1xyXG4gICAgICAgIHVuaWZvcm0gbWF0MyB1X21hdHJpeDtcclxuICAgICAgICB2YXJ5aW5nIHZlYzIgdl90ZXhDb29yZDtcclxuXHJcbiAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICB2ZWMyIGNhbnZhc19wb3NpdGlvbiA9IGFfcG9zaXRpb24gKiB2ZWMyKCR7YXJyb3dTaXplfSwgJHthcnJvd1NpemV9KSArIGFfaW5zdGFuY2UueHkgKyB2ZWMyKC0ke2hhbGZBcnJvd1NpemV9LCAtJHtoYWxmQXJyb3dTaXplfSk7XHJcbiAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdmVjNCh1X21hdHJpeCAqIHZlYzMoY2FudmFzX3Bvc2l0aW9uLCAxKSwgMSkgKyB2ZWM0KC0xLCAxLCAwLCAwKTtcclxuICAgICAgICAgICAgdl90ZXhDb29yZCA9IGFfcG9zaXRpb24gLyB2ZWMyKDEyLCA0KSArIHZlYzIoYV9pbnN0YW5jZS53LCBhX2luc3RhbmNlLnopIC8gdmVjMigxMiwgNCk7XHJcbiAgICAgICAgfWBcclxuXHJcbiAgICBsZXQgZnJhZ21lbnRTaGFkZXJTcmMgPSBgXHJcbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7XHJcbiAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbWFnZTtcclxuICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1X2ltYWdlLCB2X3RleENvb3JkKTtcclxuICAgICAgICB9YFxyXG5cclxuICAgIGxldCB2ZXJ0U2hhZGVyT2JqID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG4gICAgbGV0IGZyYWdTaGFkZXJPYmogPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcclxuICAgIGdsLnNoYWRlclNvdXJjZSh2ZXJ0U2hhZGVyT2JqLCB2ZXJ0ZXhTaGFkZXJTcmMpO1xyXG4gICAgZ2wuc2hhZGVyU291cmNlKGZyYWdTaGFkZXJPYmosIGZyYWdtZW50U2hhZGVyU3JjKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIodmVydFNoYWRlck9iaik7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKGZyYWdTaGFkZXJPYmopO1xyXG5cclxuICAgIGxldCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRTaGFkZXJPYmopO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdTaGFkZXJPYmopO1xyXG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xyXG5cclxuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHZlcnRTaGFkZXJPYmosIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNvbXBpbGluZyB2ZXJ0ZXggc2hhZGVyOicsIGdsLmdldFNoYWRlckluZm9Mb2codmVydFNoYWRlck9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoZnJhZ1NoYWRlck9iaiwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY29tcGlsaW5nIGZyYWdtZW50IHNoYWRlcjonLCBnbC5nZXRTaGFkZXJJbmZvTG9nKGZyYWdTaGFkZXJPYmopKTtcclxuICAgIH1cclxuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsaW5raW5nIHByb2dyYW06JywgZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB1X21hdHJpeExvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcInVfbWF0cml4XCIpO1xyXG4gICAgbGV0IHBvc2l0aW9uTG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBcImFfcG9zaXRpb25cIik7XHJcbiAgICBvZmZzZXRMb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIFwiYV9pbnN0YW5jZVwiKTtcclxuXHJcbiAgICBsZXQgbWF0cml4ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgMiAvIGdsLmNhbnZhcy53aWR0aCwgMCwgMCxcclxuICAgICAgICAwLCAtMiAvIGdsLmNhbnZhcy5oZWlnaHQsIDAsXHJcbiAgICAgICAgMCwgMCwgMSxcclxuICAgIF0pO1xyXG4gICAgZ2wudW5pZm9ybU1hdHJpeDNmdih1X21hdHJpeExvYywgZmFsc2UsIG1hdHJpeCk7XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgcG9zaXRpb25CdWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgIDAuMCwgIDAuMCxcclxuICAgICAgICAxLjAsICAwLjAsXHJcbiAgICAgICAgMC4wLCAgMS4wLFxyXG4gICAgICAgIDAuMCwgIDEuMCxcclxuICAgICAgICAxLjAsICAwLjAsXHJcbiAgICAgICAgMS4wLCAgMS4wLFxyXG4gICAgXSksIGdsLlNUQVRJQ19EUkFXKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHBvc2l0aW9uTG9jYXRpb24pO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NpdGlvbkxvY2F0aW9uLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG5cclxuICAgIGxldCB0ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cclxuICAgIC8vIGVuYWJsZSBhbHBoYSBibGVuZGluZ1xyXG4gICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcclxuICAgIGdsLmJsZW5kRnVuYyhnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0U2hhZGVyVGV4dHVyZShnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgaW1hZ2U6IEhUTUxDYW52YXNFbGVtZW50KSB7XHJcbiAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRyYXdBcnJvd3NHbChnbDpXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBhcnJvd3M6IEFycm93W10pIHtcclxuICAgIC8vIENyZWF0ZSBhIGJ1ZmZlciB0byBzdG9yZSB0aGUgcGVyLWluc3RhbmNlIGRhdGFcclxuICAgIGxldCBpbnN0YW5jZUJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGluc3RhbmNlQnVmZmVyKTtcclxuXHJcbiAgICAvLyBQb3B1bGF0ZSB0aGUgaW5zdGFuY2UgYnVmZmVyIHdpdGggcGVyLWluc3RhbmNlIGRhdGFcclxuICAgIGxldCBpbnN0YW5jZVZlY3RvcnM6IG51bWJlcltdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGluc3RhbmNlVmVjdG9ycy5wdXNoKGFycm93c1tpXS54KTtcclxuICAgICAgICBpbnN0YW5jZVZlY3RvcnMucHVzaChhcnJvd3NbaV0ueSk7XHJcbiAgICAgICAgaW5zdGFuY2VWZWN0b3JzLnB1c2goYXJyb3dzW2ldLnJvdGF0aW9uSW5kZXgpO1xyXG4gICAgICAgIGluc3RhbmNlVmVjdG9ycy5wdXNoKGFycm93c1tpXS5jb2xvckluZGV4KTtcclxuICAgIH1cclxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGluc3RhbmNlVmVjdG9ycyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHJcbiAgICAvLyBCaW5kIHRoZSBpbnN0YW5jZSBidWZmZXIgdG8gdGhlIGFfaW5zdGFuY2UgYXR0cmlidXRlXHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShvZmZzZXRMb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKG9mZnNldExvY2F0aW9uLCA0LCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG4gICAgZ2wudmVydGV4QXR0cmliRGl2aXNvcihvZmZzZXRMb2NhdGlvbiwgMSk7XHJcblxyXG4gICAgZ2wuZHJhd0FycmF5c0luc3RhbmNlZChnbC5UUklBTkdMRVMsIDAsIDYsIGFycm93cy5sZW5ndGgpO1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQXJyb3cgfSBmcm9tIFwiLi9hcnJvd1wiO1xyXG5pbXBvcnQgeyBjbGFtcFZhbHVlVG9SYW5nZSwgZ2V0UmFuZG9tSW50SW5jbHVzaXZlLCByb3VuZFRvTlBsYWNlcyB9IGZyb20gXCIuL3V0aWxcIjtcclxuaW1wb3J0IHsgZHJhd0Fycm93c0dsLCBpbml0aWFsaXplU2hhZGVycywgc2V0U2hhZGVyVGV4dHVyZSB9IGZyb20gXCIuL3dlYmdsXCI7XHJcblxyXG5sZXQgY2FudmFzMmQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dCZW5jaDJkQ2FudmFzXCIpO1xyXG5jYW52YXMyZC53aWR0aCA9IDE5MjA7XHJcbmNhbnZhczJkLmhlaWdodCA9IDEwODA7XHJcbmxldCBjYW52YXNnbCA9IDxIVE1MQ2FudmFzRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0JlbmNoV2ViR0xDYW52YXNcIik7XHJcbmNhbnZhc2dsLndpZHRoID0gMTkyMDtcclxuY2FudmFzZ2wuaGVpZ2h0ID0gMTA4MDtcclxubGV0IGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEID0gY2FudmFzMmQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbmxldCBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA9IGNhbnZhc2dsLmdldENvbnRleHQoXCJ3ZWJnbDJcIik7XHJcblxyXG5sZXQgYXJyb3dDb3VudGVyID0gPEhUTUxTcGFuRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0NvdW50ZXJcIik7XHJcbmxldCBmcHNDb3VudGVyID0gPEhUTUxTcGFuRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNDb3VudGVyXCIpO1xyXG5sZXQgYXJyb3dzUGVyTXNDb3VudGVyID0gPEhUTUxTcGFuRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd3NQZXJNc0NvdW50ZXJcIik7XHJcblxyXG5sZXQgYXJyb3dTaXplSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1NpemVJbnB1dFwiKTtcclxuYXJyb3dTaXplSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIGFycm93U2l6ZSA9IGFycm93U2l6ZUlucHV0LnZhbHVlQXNOdW1iZXI7XHJcbiAgICBoYWxmQXJyb3dTaXplID0gYXJyb3dTaXplIC8gMjtcclxuICAgIGNyZWF0ZUNhY2hlcygpO1xyXG4gICAgaW5pdGlhbGl6ZVNoYWRlcnMoZ2wsIGFycm93U2l6ZSk7XHJcbiAgICBzZXRTaGFkZXJUZXh0dXJlKGdsLCBhcnJvd0NhY2hlU3ByaXRlc2hlZXQpO1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IDA7XHJcbn0pO1xyXG5cclxubGV0IHNwYXduUmF0ZUlucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3Bhd25SYXRlSW5wdXRcIik7XHJcbnNwYXduUmF0ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICBzcGF3blJhdGUgPSBNYXRoLnBvdyhzcGF3blJhdGVJbnB1dC52YWx1ZUFzTnVtYmVyLCAzKTtcclxuICAgIGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duID0gMDtcclxuICAgIG1vdXNlRG93blN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbn0pO1xyXG5cclxubGV0IGNsZWFyQXJyb3dzQnV0dG9uID0gPEhUTUxCdXR0b25FbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsZWFyQXJyb3dzQnV0dG9uXCIpO1xyXG5jbGVhckFycm93c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgYXJyb3dzID0gW107XHJcbn0pO1xyXG5cclxubGV0IGRyYXdNZXRob2RXZWJHTElucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHJhd01ldGhvZFdlYkdMXCIpO1xyXG5kcmF3TWV0aG9kV2ViR0xJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IDA7XHJcbn0pO1xyXG5sZXQgZHJhd01ldGhvZFNvZnR3YXJlSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkcmF3TWV0aG9kU29mdHdhcmVcIik7XHJcbmRyYXdNZXRob2RTb2Z0d2FyZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID0gMDtcclxufSk7XHJcblxyXG5sZXQgYXJyb3dTaXplOiBudW1iZXIgPSBhcnJvd1NpemVJbnB1dC52YWx1ZUFzTnVtYmVyO1xyXG5sZXQgaGFsZkFycm93U2l6ZTogbnVtYmVyID0gYXJyb3dTaXplIC8gMjtcclxubGV0IHNwYXduUmF0ZTogbnVtYmVyID0gTWF0aC5wb3coc3Bhd25SYXRlSW5wdXQudmFsdWVBc051bWJlciwgMyk7XHJcbmxldCBtb3VzZURvd25TdGFydDogbnVtYmVyO1xyXG5sZXQgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd246IG51bWJlcjtcclxuXHJcbmluaXRpYWxpemVTaGFkZXJzKGdsLCBhcnJvd1NpemUpO1xyXG5cclxubGV0IG5vdGVza2luNHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fNHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW44dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl84dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjEydGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xMnRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4xNnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMTZ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMjB0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzIwdGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjI0dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8yNHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4zMm5kUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMzJuZC5wbmdcIjtcclxubGV0IG5vdGVza2luNDh0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzQ4dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjY0dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl82NHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW45NnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fOTZ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTI4dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xMjh0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTkybmRQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xOTJuZC5wbmdcIjtcclxubGV0IHByZWxvYWRSZWdpc3RyeTogTWFwPHN0cmluZywgYm9vbGVhbj4gPSBuZXcgTWFwKCk7XHJcblxyXG5sZXQgYXJyb3dDb2xvcnM6IEhUTUxJbWFnZUVsZW1lbnRbXSA9IFtcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjR0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luOHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xMnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xNnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4yMHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4yNHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4zMm5kUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW40OHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW42NHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW45NnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xMjh0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMTkybmRQYXRoKSxcclxuXTtcclxuXHJcbmxldCBhcnJvd0NhY2hlU3ByaXRlc2hlZXQ6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2FjaGVzKCkge1xyXG4gICAgY3JlYXRlRnVsbFJlc2l6ZWRTcHJpdGVzaGVldCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGdWxsUmVzaXplZFNwcml0ZXNoZWV0KCkge1xyXG4gICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGFycm93Q2FjaGVTcHJpdGVzaGVldC53aWR0aCA9IGFycm93Q29sb3JzLmxlbmd0aCAqIGFycm93U2l6ZTtcclxuICAgIGFycm93Q2FjaGVTcHJpdGVzaGVldC5oZWlnaHQgPSA0ICogYXJyb3dTaXplO1xyXG4gICAgbGV0IHNwcml0ZXNoZWV0Q3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgPSBhcnJvd0NhY2hlU3ByaXRlc2hlZXQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgZm9yIChsZXQgcm90YXRpb25JbmRleCA9IDA7IHJvdGF0aW9uSW5kZXggPCA0OyByb3RhdGlvbkluZGV4KyspIHtcclxuICAgICAgICBsZXQgcm90YXRpb246IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBNYXRoLlBJIC8gMjtcclxuICAgICAgICBmb3IgKGxldCBjb2xvckluZGV4ID0gMDsgY29sb3JJbmRleCA8IGFycm93Q29sb3JzLmxlbmd0aDsgY29sb3JJbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblg6IG51bWJlciA9IGNvbG9ySW5kZXggKiBhcnJvd1NpemU7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblk6IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBhcnJvd1NpemU7XHJcbiAgICAgICAgICAgIHNwcml0ZXNoZWV0Q3R4LnRyYW5zbGF0ZShkZXN0aW5hdGlvblggKyBoYWxmQXJyb3dTaXplLCBkZXN0aW5hdGlvblkgKyBoYWxmQXJyb3dTaXplKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHguZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICAgICAgYXJyb3dDb2xvcnNbY29sb3JJbmRleF0sXHJcbiAgICAgICAgICAgICAgICAtaGFsZkFycm93U2l6ZSxcclxuICAgICAgICAgICAgICAgIC1oYWxmQXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC5yb3RhdGUoLXJvdGF0aW9uKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgudHJhbnNsYXRlKC0oZGVzdGluYXRpb25YICsgaGFsZkFycm93U2l6ZSksIC0oZGVzdGluYXRpb25ZICsgaGFsZkFycm93U2l6ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gTm90ZTogXHJcbi8vIFRyYW5zZm9ybWluZyBhbmQgdGhlbiB1bnRyYW5zZm9ybWluZyBpcyBmYXN0ZXIgdGhhbiB1c2luZyBzYXZlL3Jlc3RvcmVcclxuLy8gRHJhd2luZyB0aGUgcmVzaXplZCBhcnJvdyB0byBhbiBvZmZzY3JlZW4gY2FudmFzIHNvIHRoYXQgZHJhd0ltYWdlXHJcbi8vICAgICBkb2Vzbid0IGhhdmUgdG8gcmVzaXplIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIChleGNlcHQgb24gRmlyZUZveCB3aGVyZSBpdCdzIG9ubHkgbGlrZSAzJSBmYXN0ZXIpXHJcbi8vIEZvciBzb21lIHJlYXNvbiwgWzBdW2Fycm93LmNvbG9ySW5kZXhdIGlzIGZhc3RlciB0aGFuIFthcnJvdy5yb3RhdGlvbkluZGV4XVthcnJvdy5jb2xvckluZGV4XVxyXG4vLyBEcmF3aW5nIGZyb20gYW4gSFRNTENhbnZhc0VsZW1lbnQgaXMgZmFzdGVyIHRoYW4gZHJhd2luZyBmcm9tIGFuIEhUTUxJbWFnZUVsZW1lbnRcclxuLy8gRHJhd2luZyBmcm9tIHNpbmdsZSBzcHJpdGVzaGVldCBpcyBhYm91dCA4MCUgZmFzdGVyIHRoYW4gZHJhd2luZyBmcm9tIDQ4IHNlcGFyYXRlIGNhbnZhc2VzXHJcbmZ1bmN0aW9uIGRyYXdGcm9tRnVsbFJlc2l6ZWRTcHJpdGVzaGVldChhcnJvdzogQXJyb3cpIHtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0LFxyXG4gICAgICAgIGFycm93LmNvbG9ySW5kZXggKiBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3cucm90YXRpb25JbmRleCAqIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93LnggLSBoYWxmQXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93LnkgLSBoYWxmQXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICApO1xyXG59XHJcblxyXG4vLyBTZWUgdGhpcyBpZiBJIGVuY291bnRlciB3ZWlyZCBsb2FkaW5nIHByb2JsZW1zIGxhdGVyOlxyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjM1NDg2NS9pbWFnZS1vbmxvYWQtZXZlbnQtYW5kLWJyb3dzZXItY2FjaGVcclxuZnVuY3Rpb24gbG9hZEltYWdlKGltYWdlU291cmNlOiBzdHJpbmcpOiBIVE1MSW1hZ2VFbGVtZW50IHtcclxuICAgIGlmIChwcmVsb2FkUmVnaXN0cnkuaGFzKGltYWdlU291cmNlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBhdHRlbXB0ZWQgdG8gbG9hZCB0aGUgc2FtZSBpbWFnZSB0d2ljZSBkdXJpbmcgcHJlbG9hZGluZy5cIik7XHJcbiAgICB9XHJcbiAgICBwcmVsb2FkUmVnaXN0cnkuc2V0KGltYWdlU291cmNlLCBmYWxzZSk7XHJcblxyXG4gICAgLy8gVGhlIG9yZGVyIHRoZXNlIDMgdGhpbmdzIGFyZSBkb25lIGluIGlzIFZFUlkgaW1wb3J0YW50IVxyXG4gICAgbGV0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgcHJlbG9hZFJlZ2lzdHJ5LnNldChpbWFnZVNvdXJjZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBpbWFnZS5zcmMgPSBpbWFnZVNvdXJjZTtcclxuXHJcbiAgICByZXR1cm4gaW1hZ2U7XHJcbn1cclxuXHJcbmxldCBwcmVsb2FkSW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgIGlmIChwcmVsb2FkRG9uZSgpKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChwcmVsb2FkSW50ZXJ2YWxJZCk7XHJcbiAgICAgICAgY3JlYXRlQ2FjaGVzKCk7XHJcbiAgICAgICAgc2V0U2hhZGVyVGV4dHVyZShnbCwgYXJyb3dDYWNoZVNwcml0ZXNoZWV0KTtcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xyXG4gICAgfVxyXG59LCAxMDApO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZERvbmUoKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBba2V5LCBsb2FkZWRdIG9mIHByZWxvYWRSZWdpc3RyeSkge1xyXG4gICAgICAgIGlmICghbG9hZGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmxldCBtb3VzZURvd246IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IG1vdXNlWDogbnVtYmVyID0gMDtcclxubGV0IG1vdXNlWTogbnVtYmVyID0gMDtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgIG1vdXNlRG93biA9IHRydWU7XHJcbiAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93biA9IDA7XHJcbiAgICBtb3VzZURvd25TdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG59KTtcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHsgbW91c2VEb3duID0gZmFsc2U7IH0pO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBtb3VzZVggPSBlLmNsaWVudFg7XHJcbiAgICBtb3VzZVkgPSBlLmNsaWVudFk7XHJcbn0pO1xyXG5cclxubGV0IHByZXZpb3VzRnJhbWVUaW1lczogbnVtYmVyW10gPSBbXTtcclxubGV0IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyOiBudW1iZXIgPSAxMDA7XHJcbmxldCBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlOiBudW1iZXIgPSAwO1xyXG5cclxubGV0IGFycm93czogQXJyb3dbXSA9IFtdO1xyXG5cclxubGV0IGxvZ0NvdW50ZXI6IG51bWJlciA9IDA7XHJcblxyXG5mdW5jdGlvbiBkcmF3KGN1cnJlbnRUaW1lTWlsbGlzOiBudW1iZXIpIHtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID49IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyKSB7XHJcbiAgICAgICAgcHJldmlvdXNGcmFtZVRpbWVzLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBwcmV2aW91c0ZyYW1lVGltZXMucHVzaChjdXJyZW50VGltZU1pbGxpcyk7XHJcblxyXG4gICAgbGV0IGRlbHRhVGltZU1pbGxpczogbnVtYmVyO1xyXG4gICAgaWYgKHByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZGVsdGFUaW1lTWlsbGlzID0gY3VycmVudFRpbWVNaWxsaXMgLSBwcmV2aW91c0ZyYW1lVGltZXNbcHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCAtIDJdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNpbXVsYXRlIHRoZSBhcnJvd3NcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFycm93c1tpXS54ICs9IGFycm93c1tpXS52ZWxvY2l0eVggKiBkZWx0YVRpbWVNaWxsaXM7XHJcbiAgICAgICAgICAgIGFycm93c1tpXS55ICs9IGFycm93c1tpXS52ZWxvY2l0eVkgKiBkZWx0YVRpbWVNaWxsaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYXJyb3dzW2ldLnggLSBoYWxmQXJyb3dTaXplIDwgMCkgeyAvLyBkb25rIG9uIHRoZSBsZWZ0XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueCArPSAyICogKGhhbGZBcnJvd1NpemUgLSBhcnJvd3NbaV0ueCk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlYID0gLWFycm93c1tpXS52ZWxvY2l0eVg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS55IC0gaGFsZkFycm93U2l6ZSA8IDApIHsgLy8gZG9uayBvbiB0aGUgdG9wXHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueSArPSAyICogKGhhbGZBcnJvd1NpemUgLSBhcnJvd3NbaV0ueSk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlZID0gLWFycm93c1tpXS52ZWxvY2l0eVk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS54ICsgaGFsZkFycm93U2l6ZSA+IGNhbnZhczJkLndpZHRoKSB7IC8vIGRvbmsgb24gdGhlIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueCAtPSAyICogKGFycm93c1tpXS54ICsgaGFsZkFycm93U2l6ZSAtIGNhbnZhczJkLndpZHRoKTtcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS52ZWxvY2l0eVggPSAtYXJyb3dzW2ldLnZlbG9jaXR5WDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYXJyb3dzW2ldLnkgKyBoYWxmQXJyb3dTaXplID4gY2FudmFzMmQuaGVpZ2h0KSB7IC8vIGRvbmsgb24gdGhlIGJvdHRvbVxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnkgLT0gMiAqIChhcnJvd3NbaV0ueSArIGhhbGZBcnJvd1NpemUgLSBjYW52YXMyZC5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnZlbG9jaXR5WSA9IC1hcnJvd3NbaV0udmVsb2NpdHlZO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb3VzZURvd24pIHtcclxuICAgICAgICBsZXQgbW91c2VEb3duRGVsdGFNaWxsaXM6IG51bWJlciA9IGN1cnJlbnRUaW1lTWlsbGlzIC0gbW91c2VEb3duU3RhcnQ7XHJcbiAgICAgICAgbGV0IGV4cGVjdGVkQXJyb3dzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1vdXNlRG93bkRlbHRhTWlsbGlzICogc3Bhd25SYXRlIC8gMTAwMCk7XHJcbiAgICAgICAgd2hpbGUgKGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duIDwgZXhwZWN0ZWRBcnJvd3MpIHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVBcnJvdygpO1xyXG4gICAgICAgICAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93bisrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHRvcCBVSVxyXG4gICAgYXJyb3dDb3VudGVyLmlubmVyVGV4dCA9IGFycm93cy5sZW5ndGgudG9TdHJpbmcoKTtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZwc0NvdW50ZXIuaW5uZXJUZXh0ID0gTWF0aC5yb3VuZCgxMDAwIC8gZGVsdGFUaW1lTWlsbGlzKS50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBmcHNDb3VudGVyLmlubmVyVGV4dCA9IFwiY2FsY3VsYXRpbmcuLi5cIjtcclxuICAgIH1cclxuICAgIGlmIChmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID49IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyKSB7XHJcbiAgICAgICAgYXJyb3dzUGVyTXNDb3VudGVyLmlubmVyVGV4dCA9IHJvdW5kVG9OUGxhY2VzKFxyXG4gICAgICAgICAgICBhcnJvd3MubGVuZ3RoXHJcbiAgICAgICAgICAgIC8gKGN1cnJlbnRUaW1lTWlsbGlzIC0gcHJldmlvdXNGcmFtZVRpbWVzWzBdKVxyXG4gICAgICAgICAgICAqIG51bUZyYW1lVGltZXNUb1JlbWVtYmVyXHJcbiAgICAgICAgICAgICwgMikudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXJyb3dzUGVyTXNDb3VudGVyLmlubmVyVGV4dCA9IFwiY2FsY3VsYXRpbmcuLi5cIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMyZC53aWR0aCwgY2FudmFzMmQuaGVpZ2h0KTtcclxuXHJcbiAgICAvLyBkcmF3IHRoZSBhcnJvd3NcclxuICAgIGlmIChkcmF3TWV0aG9kV2ViR0xJbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgZHJhd0Fycm93c0dsKGdsLCBhcnJvd3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBkcmF3RnJvbUZ1bGxSZXNpemVkU3ByaXRlc2hlZXQoYXJyb3dzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSsrO1xyXG5cclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXJyb3coKSB7XHJcbiAgICBsZXQgYXJyb3c6IEFycm93ID0gbmV3IEFycm93KCk7XHJcbiAgICBhcnJvdy54ID0gY2xhbXBWYWx1ZVRvUmFuZ2UobW91c2VYLCAwLCBjYW52YXMyZC53aWR0aCk7XHJcbiAgICBhcnJvdy55ID0gY2xhbXBWYWx1ZVRvUmFuZ2UobW91c2VZLCAwLCBjYW52YXMyZC5oZWlnaHQpO1xyXG4gICAgXHJcbiAgICBsZXQgdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDogbnVtYmVyID0gMC40O1xyXG4gICAgbGV0IHJhbmRvbUFuZ2xlOiBudW1iZXIgPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XHJcbiAgICBhcnJvdy52ZWxvY2l0eVggPSBNYXRoLmNvcyhyYW5kb21BbmdsZSkgKiB2ZWxvY2l0eU1hZ25pdHVkZVBpeGVsc1Blck1pbGxpc2Vjb25kO1xyXG4gICAgYXJyb3cudmVsb2NpdHlZID0gTWF0aC5zaW4ocmFuZG9tQW5nbGUpICogdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDtcclxuXHJcbiAgICBhcnJvdy5jb2xvckluZGV4ID0gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKDAsIDExKTtcclxuICAgIGFycm93LnJvdGF0aW9uSW5kZXggPSBnZXRSYW5kb21JbnRJbmNsdXNpdmUoMCwgMyk7XHJcblxyXG4gICAgYXJyb3dzLnB1c2goYXJyb3cpO1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IC0xO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==