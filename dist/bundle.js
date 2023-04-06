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
    // read the state of the right UI
    let drawMethodWebGL = document.getElementById("drawMethodWebGL").checked;
    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
    ctx.imageSmoothingEnabled = false;
    // draw the arrows
    if (drawMethodWebGL) {
        (0,_webgl__WEBPACK_IMPORTED_MODULE_2__.drawArrowsGl)(gl, arrows);
    }
    else {
        for (let i = 0; i < arrows.length; i++) {
            drawFromFullResizedSpritesheet(arrows[i]);
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEdBQUcsQ0FBQztJQUN4RCxJQUFJLFdBQVcsR0FBVyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDdEQsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLHFDQUFxQyxDQUFDO0lBQ2hGLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxxQ0FBcUMsQ0FBQztJQUVoRixLQUFLLENBQUMsVUFBVSxHQUFHLDREQUFxQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRCxLQUFLLENBQUMsYUFBYSxHQUFHLDREQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHBvcnRzLy4vc3JjL2Fycm93LnRzIiwid2VicGFjazovL2V4cG9ydHMvLi9zcmMvdXRpbC50cyIsIndlYnBhY2s6Ly9leHBvcnRzLy4vc3JjL3dlYmdsLnRzIiwid2VicGFjazovL2V4cG9ydHMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhwb3J0cy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZXhwb3J0cy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4cG9ydHMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leHBvcnRzLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBBcnJvdyB7XHJcbiAgICBwdWJsaWMgeDogbnVtYmVyO1xyXG4gICAgcHVibGljIHk6IG51bWJlcjtcclxuICAgIHB1YmxpYyB2ZWxvY2l0eVg6IG51bWJlcjtcclxuICAgIHB1YmxpYyB2ZWxvY2l0eVk6IG51bWJlcjtcclxuICAgIHB1YmxpYyBjb2xvckluZGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgcm90YXRpb25JbmRleDogbnVtYmVyO1xyXG59XHJcbiIsImV4cG9ydCBmdW5jdGlvbiByb3VuZFRvTlBsYWNlcyh4OiBudW1iZXIsIG51bVBsYWNlczogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGxldCBzY2FsZTogbnVtYmVyID0gTWF0aC5wb3coMTAsIG51bVBsYWNlcyk7XHJcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh4ICogc2NhbGUpIC8gc2NhbGU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGFtcFZhbHVlVG9SYW5nZSh2YWx1ZTogbnVtYmVyLCBsb3dlckJvdW5kOiBudW1iZXIsIHVwcGVyQm91bmQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBpZiAodmFsdWUgPCBsb3dlckJvdW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIGxvd2VyQm91bmQ7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWUgPiB1cHBlckJvdW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIHVwcGVyQm91bmQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21JbnRJbmNsdXNpdmUobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIG1pbiA9IE1hdGguY2VpbChtaW4pO1xyXG4gICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XHJcbn1cclxuIiwiaW1wb3J0IHsgQXJyb3cgfSBmcm9tIFwiLi9hcnJvd1wiO1xyXG5cclxubGV0IG9mZnNldExvY2F0aW9uOiBudW1iZXI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZVNoYWRlcnMoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGFycm93U2l6ZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgaGFsZkFycm93U2l6ZTogbnVtYmVyID0gYXJyb3dTaXplIC8gMjtcclxuXHJcbiAgICBsZXQgdmVydGV4U2hhZGVyU3JjID0gYFxyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMyIGFfcG9zaXRpb247XHJcbiAgICAgICAgYXR0cmlidXRlIHZlYzQgYV9pbnN0YW5jZTtcclxuICAgICAgICB1bmlmb3JtIG1hdDMgdV9tYXRyaXg7XHJcbiAgICAgICAgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7XHJcblxyXG4gICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgdmVjMiBjYW52YXNfcG9zaXRpb24gPSBhX3Bvc2l0aW9uICogdmVjMigke2Fycm93U2l6ZX0sICR7YXJyb3dTaXplfSkgKyBhX2luc3RhbmNlLnh5ICsgdmVjMigtJHtoYWxmQXJyb3dTaXplfSwgLSR7aGFsZkFycm93U2l6ZX0pO1xyXG4gICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQodV9tYXRyaXggKiB2ZWMzKGNhbnZhc19wb3NpdGlvbiwgMSksIDEpICsgdmVjNCgtMSwgMSwgMCwgMCk7XHJcbiAgICAgICAgICAgIHZfdGV4Q29vcmQgPSBhX3Bvc2l0aW9uIC8gdmVjMigxMiwgNCkgKyB2ZWMyKGFfaW5zdGFuY2UudywgYV9pbnN0YW5jZS56KSAvIHZlYzIoMTIsIDQpO1xyXG4gICAgICAgIH1gXHJcblxyXG4gICAgbGV0IGZyYWdtZW50U2hhZGVyU3JjID0gYFxyXG4gICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xyXG4gICAgICAgIHZhcnlpbmcgdmVjMiB2X3RleENvb3JkO1xyXG4gICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfaW1hZ2U7XHJcbiAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodV9pbWFnZSwgdl90ZXhDb29yZCk7XHJcbiAgICAgICAgfWBcclxuXHJcbiAgICBsZXQgdmVydFNoYWRlck9iaiA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcclxuICAgIGxldCBmcmFnU2hhZGVyT2JqID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XHJcbiAgICBnbC5zaGFkZXJTb3VyY2UodmVydFNoYWRlck9iaiwgdmVydGV4U2hhZGVyU3JjKTtcclxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnU2hhZGVyT2JqLCBmcmFnbWVudFNoYWRlclNyYyk7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRTaGFkZXJPYmopO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihmcmFnU2hhZGVyT2JqKTtcclxuXHJcbiAgICBsZXQgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0U2hhZGVyT2JqKTtcclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnU2hhZGVyT2JqKTtcclxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG4gICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcclxuXHJcbiAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0U2hhZGVyT2JqLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjb21waWxpbmcgdmVydGV4IHNoYWRlcjonLCBnbC5nZXRTaGFkZXJJbmZvTG9nKHZlcnRTaGFkZXJPYmopKTtcclxuICAgIH1cclxuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZyYWdTaGFkZXJPYmosIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNvbXBpbGluZyBmcmFnbWVudCBzaGFkZXI6JywgZ2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnU2hhZGVyT2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbGlua2luZyBwcm9ncmFtOicsIGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdV9tYXRyaXhMb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJ1X21hdHJpeFwiKTtcclxuICAgIGxldCBwb3NpdGlvbkxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgXCJhX3Bvc2l0aW9uXCIpO1xyXG4gICAgb2Zmc2V0TG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBcImFfaW5zdGFuY2VcIik7XHJcblxyXG4gICAgbGV0IG1hdHJpeCA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgIDIgLyBnbC5jYW52YXMud2lkdGgsIDAsIDAsXHJcbiAgICAgICAgMCwgLTIgLyBnbC5jYW52YXMuaGVpZ2h0LCAwLFxyXG4gICAgICAgIDAsIDAsIDEsXHJcbiAgICBdKTtcclxuICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYodV9tYXRyaXhMb2MsIGZhbHNlLCBtYXRyaXgpO1xyXG5cclxuICAgIGxldCBwb3NpdGlvbkJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHBvc2l0aW9uQnVmZmVyKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAwLjAsICAwLjAsXHJcbiAgICAgICAgMS4wLCAgMC4wLFxyXG4gICAgICAgIDAuMCwgIDEuMCxcclxuICAgICAgICAwLjAsICAxLjAsXHJcbiAgICAgICAgMS4wLCAgMC4wLFxyXG4gICAgICAgIDEuMCwgIDEuMCxcclxuICAgIF0pLCBnbC5TVEFUSUNfRFJBVyk7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwb3NpdGlvbkxvY2F0aW9uKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zaXRpb25Mb2NhdGlvbiwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuXHJcbiAgICBsZXQgdGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHJcbiAgICAvLyBlbmFibGUgYWxwaGEgYmxlbmRpbmdcclxuICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XHJcbiAgICBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFNoYWRlclRleHR1cmUoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGltYWdlOiBIVE1MQ2FudmFzRWxlbWVudCkge1xyXG4gICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWFnZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkcmF3QXJyb3dzR2woZ2w6V2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgYXJyb3dzOiBBcnJvd1tdKSB7XHJcbiAgICAvLyBDcmVhdGUgYSBidWZmZXIgdG8gc3RvcmUgdGhlIHBlci1pbnN0YW5jZSBkYXRhXHJcbiAgICBsZXQgaW5zdGFuY2VCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBpbnN0YW5jZUJ1ZmZlcik7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgdGhlIGluc3RhbmNlIGJ1ZmZlciB3aXRoIHBlci1pbnN0YW5jZSBkYXRhXHJcbiAgICBsZXQgaW5zdGFuY2VWZWN0b3JzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJvd3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpbnN0YW5jZVZlY3RvcnMucHVzaChhcnJvd3NbaV0ueCk7XHJcbiAgICAgICAgaW5zdGFuY2VWZWN0b3JzLnB1c2goYXJyb3dzW2ldLnkpO1xyXG4gICAgICAgIGluc3RhbmNlVmVjdG9ycy5wdXNoKGFycm93c1tpXS5yb3RhdGlvbkluZGV4KTtcclxuICAgICAgICBpbnN0YW5jZVZlY3RvcnMucHVzaChhcnJvd3NbaV0uY29sb3JJbmRleCk7XHJcbiAgICB9XHJcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShpbnN0YW5jZVZlY3RvcnMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgLy8gQmluZCB0aGUgaW5zdGFuY2UgYnVmZmVyIHRvIHRoZSBhX2luc3RhbmNlIGF0dHJpYnV0ZVxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkob2Zmc2V0TG9jYXRpb24pO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihvZmZzZXRMb2NhdGlvbiwgNCwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYkRpdmlzb3Iob2Zmc2V0TG9jYXRpb24sIDEpO1xyXG5cclxuICAgIGdsLmRyYXdBcnJheXNJbnN0YW5jZWQoZ2wuVFJJQU5HTEVTLCAwLCA2LCBhcnJvd3MubGVuZ3RoKTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEFycm93IH0gZnJvbSBcIi4vYXJyb3dcIjtcclxuaW1wb3J0IHsgY2xhbXBWYWx1ZVRvUmFuZ2UsIGdldFJhbmRvbUludEluY2x1c2l2ZSwgcm91bmRUb05QbGFjZXMgfSBmcm9tIFwiLi91dGlsXCI7XHJcbmltcG9ydCB7IGRyYXdBcnJvd3NHbCwgaW5pdGlhbGl6ZVNoYWRlcnMsIHNldFNoYWRlclRleHR1cmUgfSBmcm9tIFwiLi93ZWJnbFwiO1xyXG5cclxubGV0IGNhbnZhczJkID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93QmVuY2gyZENhbnZhc1wiKTtcclxuY2FudmFzMmQud2lkdGggPSAxOTIwO1xyXG5jYW52YXMyZC5oZWlnaHQgPSAxMDgwO1xyXG5sZXQgY2FudmFzZ2wgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dCZW5jaFdlYkdMQ2FudmFzXCIpO1xyXG5jYW52YXNnbC53aWR0aCA9IDE5MjA7XHJcbmNhbnZhc2dsLmhlaWdodCA9IDEwODA7XHJcbmxldCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCA9IGNhbnZhczJkLmdldENvbnRleHQoXCIyZFwiKTtcclxubGV0IGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0ID0gY2FudmFzZ2wuZ2V0Q29udGV4dChcIndlYmdsMlwiKTtcclxuXHJcbmxldCBhcnJvd0NvdW50ZXIgPSA8SFRNTFNwYW5FbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93Q291bnRlclwiKTtcclxubGV0IGZwc0NvdW50ZXIgPSA8SFRNTFNwYW5FbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc0NvdW50ZXJcIik7XHJcbmxldCBhcnJvd3NQZXJNc0NvdW50ZXIgPSA8SFRNTFNwYW5FbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93c1Blck1zQ291bnRlclwiKTtcclxuXHJcbmxldCBhcnJvd1NpemVJbnB1dCA9IDxIVE1MSW5wdXRFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93U2l6ZUlucHV0XCIpO1xyXG5hcnJvd1NpemVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgYXJyb3dTaXplID0gYXJyb3dTaXplSW5wdXQudmFsdWVBc051bWJlcjtcclxuICAgIGhhbGZBcnJvd1NpemUgPSBhcnJvd1NpemUgLyAyO1xyXG4gICAgY3JlYXRlQ2FjaGVzKCk7XHJcbiAgICBpbml0aWFsaXplU2hhZGVycyhnbCwgYXJyb3dTaXplKTtcclxuICAgIHNldFNoYWRlclRleHR1cmUoZ2wsIGFycm93Q2FjaGVTcHJpdGVzaGVldCk7XHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID0gMDtcclxufSk7XHJcblxyXG5sZXQgc3Bhd25SYXRlSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcGF3blJhdGVJbnB1dFwiKTtcclxuc3Bhd25SYXRlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIHNwYXduUmF0ZSA9IE1hdGgucG93KHNwYXduUmF0ZUlucHV0LnZhbHVlQXNOdW1iZXIsIDMpO1xyXG4gICAgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd24gPSAwO1xyXG4gICAgbW91c2VEb3duU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxufSk7XHJcblxyXG5sZXQgY2xlYXJBcnJvd3NCdXR0b24gPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXJBcnJvd3NCdXR0b25cIik7XHJcbmNsZWFyQXJyb3dzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBhcnJvd3MgPSBbXTtcclxufSk7XHJcblxyXG5sZXQgYXJyb3dTaXplOiBudW1iZXIgPSBhcnJvd1NpemVJbnB1dC52YWx1ZUFzTnVtYmVyO1xyXG5sZXQgaGFsZkFycm93U2l6ZTogbnVtYmVyID0gYXJyb3dTaXplIC8gMjtcclxubGV0IHNwYXduUmF0ZTogbnVtYmVyID0gTWF0aC5wb3coc3Bhd25SYXRlSW5wdXQudmFsdWVBc051bWJlciwgMyk7XHJcbmxldCBtb3VzZURvd25TdGFydDogbnVtYmVyO1xyXG5sZXQgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd246IG51bWJlcjtcclxuXHJcbmluaXRpYWxpemVTaGFkZXJzKGdsLCBhcnJvd1NpemUpO1xyXG5cclxubGV0IG5vdGVza2luNHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fNHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW44dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl84dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjEydGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xMnRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4xNnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMTZ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMjB0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzIwdGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjI0dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8yNHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4zMm5kUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMzJuZC5wbmdcIjtcclxubGV0IG5vdGVza2luNDh0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzQ4dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjY0dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl82NHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW45NnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fOTZ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTI4dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xMjh0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTkybmRQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xOTJuZC5wbmdcIjtcclxubGV0IHByZWxvYWRSZWdpc3RyeTogTWFwPHN0cmluZywgYm9vbGVhbj4gPSBuZXcgTWFwKCk7XHJcblxyXG5sZXQgYXJyb3dDb2xvcnM6IEhUTUxJbWFnZUVsZW1lbnRbXSA9IFtcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjR0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luOHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xMnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xNnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4yMHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4yNHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4zMm5kUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW40OHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW42NHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW45NnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xMjh0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMTkybmRQYXRoKSxcclxuXTtcclxuXHJcbmxldCBhcnJvd0NhY2hlU3ByaXRlc2hlZXQ6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2FjaGVzKCkge1xyXG4gICAgY3JlYXRlRnVsbFJlc2l6ZWRTcHJpdGVzaGVldCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGdWxsUmVzaXplZFNwcml0ZXNoZWV0KCkge1xyXG4gICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGFycm93Q2FjaGVTcHJpdGVzaGVldC53aWR0aCA9IGFycm93Q29sb3JzLmxlbmd0aCAqIGFycm93U2l6ZTtcclxuICAgIGFycm93Q2FjaGVTcHJpdGVzaGVldC5oZWlnaHQgPSA0ICogYXJyb3dTaXplO1xyXG4gICAgbGV0IHNwcml0ZXNoZWV0Q3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgPSBhcnJvd0NhY2hlU3ByaXRlc2hlZXQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgZm9yIChsZXQgcm90YXRpb25JbmRleCA9IDA7IHJvdGF0aW9uSW5kZXggPCA0OyByb3RhdGlvbkluZGV4KyspIHtcclxuICAgICAgICBsZXQgcm90YXRpb246IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBNYXRoLlBJIC8gMjtcclxuICAgICAgICBmb3IgKGxldCBjb2xvckluZGV4ID0gMDsgY29sb3JJbmRleCA8IGFycm93Q29sb3JzLmxlbmd0aDsgY29sb3JJbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblg6IG51bWJlciA9IGNvbG9ySW5kZXggKiBhcnJvd1NpemU7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblk6IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBhcnJvd1NpemU7XHJcbiAgICAgICAgICAgIHNwcml0ZXNoZWV0Q3R4LnRyYW5zbGF0ZShkZXN0aW5hdGlvblggKyBoYWxmQXJyb3dTaXplLCBkZXN0aW5hdGlvblkgKyBoYWxmQXJyb3dTaXplKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHguZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICAgICAgYXJyb3dDb2xvcnNbY29sb3JJbmRleF0sXHJcbiAgICAgICAgICAgICAgICAtaGFsZkFycm93U2l6ZSxcclxuICAgICAgICAgICAgICAgIC1oYWxmQXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC5yb3RhdGUoLXJvdGF0aW9uKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgudHJhbnNsYXRlKC0oZGVzdGluYXRpb25YICsgaGFsZkFycm93U2l6ZSksIC0oZGVzdGluYXRpb25ZICsgaGFsZkFycm93U2l6ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gTm90ZTogXHJcbi8vIFRyYW5zZm9ybWluZyBhbmQgdGhlbiB1bnRyYW5zZm9ybWluZyBpcyBmYXN0ZXIgdGhhbiB1c2luZyBzYXZlL3Jlc3RvcmVcclxuLy8gRHJhd2luZyB0aGUgcmVzaXplZCBhcnJvdyB0byBhbiBvZmZzY3JlZW4gY2FudmFzIHNvIHRoYXQgZHJhd0ltYWdlXHJcbi8vICAgICBkb2Vzbid0IGhhdmUgdG8gcmVzaXplIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIChleGNlcHQgb24gRmlyZUZveCB3aGVyZSBpdCdzIG9ubHkgbGlrZSAzJSBmYXN0ZXIpXHJcbi8vIEZvciBzb21lIHJlYXNvbiwgWzBdW2Fycm93LmNvbG9ySW5kZXhdIGlzIGZhc3RlciB0aGFuIFthcnJvdy5yb3RhdGlvbkluZGV4XVthcnJvdy5jb2xvckluZGV4XVxyXG4vLyBEcmF3aW5nIGZyb20gYW4gSFRNTENhbnZhc0VsZW1lbnQgaXMgZmFzdGVyIHRoYW4gZHJhd2luZyBmcm9tIGFuIEhUTUxJbWFnZUVsZW1lbnRcclxuLy8gRHJhd2luZyBmcm9tIHNpbmdsZSBzcHJpdGVzaGVldCBpcyBhYm91dCA4MCUgZmFzdGVyIHRoYW4gZHJhd2luZyBmcm9tIDQ4IHNlcGFyYXRlIGNhbnZhc2VzXHJcbmZ1bmN0aW9uIGRyYXdGcm9tRnVsbFJlc2l6ZWRTcHJpdGVzaGVldChhcnJvdzogQXJyb3cpIHtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0LFxyXG4gICAgICAgIGFycm93LmNvbG9ySW5kZXggKiBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3cucm90YXRpb25JbmRleCAqIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93LnggLSBoYWxmQXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93LnkgLSBoYWxmQXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICApO1xyXG59XHJcblxyXG4vLyBTZWUgdGhpcyBpZiBJIGVuY291bnRlciB3ZWlyZCBsb2FkaW5nIHByb2JsZW1zIGxhdGVyOlxyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjM1NDg2NS9pbWFnZS1vbmxvYWQtZXZlbnQtYW5kLWJyb3dzZXItY2FjaGVcclxuZnVuY3Rpb24gbG9hZEltYWdlKGltYWdlU291cmNlOiBzdHJpbmcpOiBIVE1MSW1hZ2VFbGVtZW50IHtcclxuICAgIGlmIChwcmVsb2FkUmVnaXN0cnkuaGFzKGltYWdlU291cmNlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBhdHRlbXB0ZWQgdG8gbG9hZCB0aGUgc2FtZSBpbWFnZSB0d2ljZSBkdXJpbmcgcHJlbG9hZGluZy5cIik7XHJcbiAgICB9XHJcbiAgICBwcmVsb2FkUmVnaXN0cnkuc2V0KGltYWdlU291cmNlLCBmYWxzZSk7XHJcblxyXG4gICAgLy8gVGhlIG9yZGVyIHRoZXNlIDMgdGhpbmdzIGFyZSBkb25lIGluIGlzIFZFUlkgaW1wb3J0YW50IVxyXG4gICAgbGV0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgcHJlbG9hZFJlZ2lzdHJ5LnNldChpbWFnZVNvdXJjZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBpbWFnZS5zcmMgPSBpbWFnZVNvdXJjZTtcclxuXHJcbiAgICByZXR1cm4gaW1hZ2U7XHJcbn1cclxuXHJcbmxldCBwcmVsb2FkSW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgIGlmIChwcmVsb2FkRG9uZSgpKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChwcmVsb2FkSW50ZXJ2YWxJZCk7XHJcbiAgICAgICAgY3JlYXRlQ2FjaGVzKCk7XHJcbiAgICAgICAgc2V0U2hhZGVyVGV4dHVyZShnbCwgYXJyb3dDYWNoZVNwcml0ZXNoZWV0KTtcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xyXG4gICAgfVxyXG59LCAxMDApO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZERvbmUoKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBba2V5LCBsb2FkZWRdIG9mIHByZWxvYWRSZWdpc3RyeSkge1xyXG4gICAgICAgIGlmICghbG9hZGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmxldCBtb3VzZURvd246IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IG1vdXNlWDogbnVtYmVyID0gMDtcclxubGV0IG1vdXNlWTogbnVtYmVyID0gMDtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgIG1vdXNlRG93biA9IHRydWU7XHJcbiAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93biA9IDA7XHJcbiAgICBtb3VzZURvd25TdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG59KTtcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHsgbW91c2VEb3duID0gZmFsc2U7IH0pO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBtb3VzZVggPSBlLmNsaWVudFg7XHJcbiAgICBtb3VzZVkgPSBlLmNsaWVudFk7XHJcbn0pO1xyXG5cclxubGV0IHByZXZpb3VzRnJhbWVUaW1lczogbnVtYmVyW10gPSBbXTtcclxubGV0IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyOiBudW1iZXIgPSAxMDA7XHJcbmxldCBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlOiBudW1iZXIgPSAwO1xyXG5cclxubGV0IGFycm93czogQXJyb3dbXSA9IFtdO1xyXG5cclxubGV0IGxvZ0NvdW50ZXI6IG51bWJlciA9IDA7XHJcblxyXG5mdW5jdGlvbiBkcmF3KGN1cnJlbnRUaW1lTWlsbGlzOiBudW1iZXIpIHtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID49IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyKSB7XHJcbiAgICAgICAgcHJldmlvdXNGcmFtZVRpbWVzLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBwcmV2aW91c0ZyYW1lVGltZXMucHVzaChjdXJyZW50VGltZU1pbGxpcyk7XHJcblxyXG4gICAgbGV0IGRlbHRhVGltZU1pbGxpczogbnVtYmVyO1xyXG4gICAgaWYgKHByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZGVsdGFUaW1lTWlsbGlzID0gY3VycmVudFRpbWVNaWxsaXMgLSBwcmV2aW91c0ZyYW1lVGltZXNbcHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCAtIDJdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNpbXVsYXRlIHRoZSBhcnJvd3NcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFycm93c1tpXS54ICs9IGFycm93c1tpXS52ZWxvY2l0eVggKiBkZWx0YVRpbWVNaWxsaXM7XHJcbiAgICAgICAgICAgIGFycm93c1tpXS55ICs9IGFycm93c1tpXS52ZWxvY2l0eVkgKiBkZWx0YVRpbWVNaWxsaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYXJyb3dzW2ldLnggLSBoYWxmQXJyb3dTaXplIDwgMCkgeyAvLyBkb25rIG9uIHRoZSBsZWZ0XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueCArPSAyICogKGhhbGZBcnJvd1NpemUgLSBhcnJvd3NbaV0ueCk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlYID0gLWFycm93c1tpXS52ZWxvY2l0eVg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS55IC0gaGFsZkFycm93U2l6ZSA8IDApIHsgLy8gZG9uayBvbiB0aGUgdG9wXHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueSArPSAyICogKGhhbGZBcnJvd1NpemUgLSBhcnJvd3NbaV0ueSk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlZID0gLWFycm93c1tpXS52ZWxvY2l0eVk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS54ICsgaGFsZkFycm93U2l6ZSA+IGNhbnZhczJkLndpZHRoKSB7IC8vIGRvbmsgb24gdGhlIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueCAtPSAyICogKGFycm93c1tpXS54ICsgaGFsZkFycm93U2l6ZSAtIGNhbnZhczJkLndpZHRoKTtcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS52ZWxvY2l0eVggPSAtYXJyb3dzW2ldLnZlbG9jaXR5WDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYXJyb3dzW2ldLnkgKyBoYWxmQXJyb3dTaXplID4gY2FudmFzMmQuaGVpZ2h0KSB7IC8vIGRvbmsgb24gdGhlIGJvdHRvbVxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnkgLT0gMiAqIChhcnJvd3NbaV0ueSArIGhhbGZBcnJvd1NpemUgLSBjYW52YXMyZC5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnZlbG9jaXR5WSA9IC1hcnJvd3NbaV0udmVsb2NpdHlZO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb3VzZURvd24pIHtcclxuICAgICAgICBsZXQgbW91c2VEb3duRGVsdGFNaWxsaXM6IG51bWJlciA9IGN1cnJlbnRUaW1lTWlsbGlzIC0gbW91c2VEb3duU3RhcnQ7XHJcbiAgICAgICAgbGV0IGV4cGVjdGVkQXJyb3dzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1vdXNlRG93bkRlbHRhTWlsbGlzICogc3Bhd25SYXRlIC8gMTAwMCk7XHJcbiAgICAgICAgd2hpbGUgKGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duIDwgZXhwZWN0ZWRBcnJvd3MpIHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVBcnJvdygpO1xyXG4gICAgICAgICAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93bisrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHRvcCBVSVxyXG4gICAgYXJyb3dDb3VudGVyLmlubmVyVGV4dCA9IGFycm93cy5sZW5ndGgudG9TdHJpbmcoKTtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZwc0NvdW50ZXIuaW5uZXJUZXh0ID0gTWF0aC5yb3VuZCgxMDAwIC8gZGVsdGFUaW1lTWlsbGlzKS50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBmcHNDb3VudGVyLmlubmVyVGV4dCA9IFwiY2FsY3VsYXRpbmcuLi5cIjtcclxuICAgIH1cclxuICAgIGlmIChmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID49IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyKSB7XHJcbiAgICAgICAgYXJyb3dzUGVyTXNDb3VudGVyLmlubmVyVGV4dCA9IHJvdW5kVG9OUGxhY2VzKFxyXG4gICAgICAgICAgICBhcnJvd3MubGVuZ3RoXHJcbiAgICAgICAgICAgIC8gKGN1cnJlbnRUaW1lTWlsbGlzIC0gcHJldmlvdXNGcmFtZVRpbWVzWzBdKVxyXG4gICAgICAgICAgICAqIG51bUZyYW1lVGltZXNUb1JlbWVtYmVyXHJcbiAgICAgICAgICAgICwgMikudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXJyb3dzUGVyTXNDb3VudGVyLmlubmVyVGV4dCA9IFwiY2FsY3VsYXRpbmcuLi5cIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZWFkIHRoZSBzdGF0ZSBvZiB0aGUgcmlnaHQgVUlcclxuICAgIGxldCBkcmF3TWV0aG9kV2ViR0wgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHJhd01ldGhvZFdlYkdMXCIpKS5jaGVja2VkO1xyXG4gICAgXHJcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhczJkLndpZHRoLCBjYW52YXMyZC5oZWlnaHQpO1xyXG4gICAgXHJcbiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gZHJhdyB0aGUgYXJyb3dzXHJcbiAgICBpZiAoZHJhd01ldGhvZFdlYkdMKSB7XHJcbiAgICAgICAgZHJhd0Fycm93c0dsKGdsLCBhcnJvd3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBkcmF3RnJvbUZ1bGxSZXNpemVkU3ByaXRlc2hlZXQoYXJyb3dzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSsrO1xyXG5cclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXJyb3coKSB7XHJcbiAgICBsZXQgYXJyb3c6IEFycm93ID0gbmV3IEFycm93KCk7XHJcbiAgICBhcnJvdy54ID0gY2xhbXBWYWx1ZVRvUmFuZ2UobW91c2VYLCAwLCBjYW52YXMyZC53aWR0aCk7XHJcbiAgICBhcnJvdy55ID0gY2xhbXBWYWx1ZVRvUmFuZ2UobW91c2VZLCAwLCBjYW52YXMyZC5oZWlnaHQpO1xyXG4gICAgXHJcbiAgICBsZXQgdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDogbnVtYmVyID0gMC40O1xyXG4gICAgbGV0IHJhbmRvbUFuZ2xlOiBudW1iZXIgPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XHJcbiAgICBhcnJvdy52ZWxvY2l0eVggPSBNYXRoLmNvcyhyYW5kb21BbmdsZSkgKiB2ZWxvY2l0eU1hZ25pdHVkZVBpeGVsc1Blck1pbGxpc2Vjb25kO1xyXG4gICAgYXJyb3cudmVsb2NpdHlZID0gTWF0aC5zaW4ocmFuZG9tQW5nbGUpICogdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDtcclxuXHJcbiAgICBhcnJvdy5jb2xvckluZGV4ID0gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKDAsIDExKTtcclxuICAgIGFycm93LnJvdGF0aW9uSW5kZXggPSBnZXRSYW5kb21JbnRJbmNsdXNpdmUoMCwgMyk7XHJcblxyXG4gICAgYXJyb3dzLnB1c2goYXJyb3cpO1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IC0xO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==