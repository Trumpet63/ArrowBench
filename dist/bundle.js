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
// If I create buffers repeatedly without deleting them then I'll cause a memory
// leak in at least FireFox but possibly other browsers. Not Chrome though.
let instanceBuffer;
let positionBuffer;
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
    // Create a buffer to store the per-instance data
    if (instanceBuffer !== undefined) {
        gl.deleteBuffer(instanceBuffer);
    }
    instanceBuffer = gl.createBuffer();
}
function setShaderTexture(gl, image) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}
function drawArrowsGl(gl, arrows) {
    // Populate the instance buffer with per-instance data
    let instanceVectors = [];
    for (let i = 0; i < arrows.length; i++) {
        instanceVectors.push(arrows[i].x);
        instanceVectors.push(arrows[i].y);
        instanceVectors.push(arrows[i].rotationIndex);
        instanceVectors.push(arrows[i].colorIndex);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFPLE1BQU0sS0FBSztDQU9qQjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNQTSxTQUFTLGNBQWMsQ0FBQyxDQUFTLEVBQUUsU0FBaUI7SUFDdkQsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDNUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDekMsQ0FBQztBQUVNLFNBQVMsaUJBQWlCLENBQUMsS0FBYSxFQUFFLFVBQWtCLEVBQUUsVUFBa0I7SUFDbkYsSUFBSSxLQUFLLEdBQUcsVUFBVSxFQUFFO1FBQ3BCLE9BQU8sVUFBVSxDQUFDO0tBQ3JCO0lBQ0QsSUFBSSxLQUFLLEdBQUcsVUFBVSxFQUFFO1FBQ3BCLE9BQU8sVUFBVSxDQUFDO0tBQ3JCO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQUVNLFNBQVMscUJBQXFCLENBQUMsR0FBVyxFQUFFLEdBQVc7SUFDMUQsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDN0QsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQkQsSUFBSSxjQUFzQixDQUFDO0FBRTNCLGdGQUFnRjtBQUNoRiwyRUFBMkU7QUFDM0UsSUFBSSxjQUEyQixDQUFDO0FBQ2hDLElBQUksY0FBMkIsQ0FBQztBQUV6QixTQUFTLGlCQUFpQixDQUFDLEVBQTBCLEVBQUUsU0FBaUI7SUFDM0UsSUFBSSxhQUFhLEdBQVcsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUUxQyxJQUFJLGVBQWUsR0FBRzs7Ozs7Ozt1REFPNkIsU0FBUyxLQUFLLFNBQVMsNkJBQTZCLGFBQWEsTUFBTSxhQUFhOzs7VUFHakk7SUFFTixJQUFJLGlCQUFpQixHQUFHOzs7Ozs7VUFNbEI7SUFFTixJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN4RCxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNoRCxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2xELEVBQUUsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVoQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDakMsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDeEMsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDeEMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXZCLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBRTtRQUMxRCxPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0tBQ3ZGO0lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1FBQzFELE9BQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7S0FDekY7SUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDbEQsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUMxRTtJQUVELElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDN0QsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ25FLGNBQWMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBRTdELElBQUksTUFBTSxHQUFHLElBQUksWUFBWSxDQUFDO1FBQzFCLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMzQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDVixDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUVoRCxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7UUFDOUIsRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNuQztJQUNELGNBQWMsR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDbkMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQy9DLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLFlBQVksQ0FBQztRQUM1QyxHQUFHLEVBQUcsR0FBRztRQUNULEdBQUcsRUFBRyxHQUFHO1FBQ1QsR0FBRyxFQUFHLEdBQUc7UUFDVCxHQUFHLEVBQUcsR0FBRztRQUNULEdBQUcsRUFBRyxHQUFHO1FBQ1QsR0FBRyxFQUFHLEdBQUc7S0FDWixDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3BCLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRW5FLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUNqQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JFLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyRSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuRSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVuRSx3QkFBd0I7SUFDeEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBRW5ELGlEQUFpRDtJQUNqRCxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7UUFDOUIsRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNuQztJQUNELGNBQWMsR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDdkMsQ0FBQztBQUVNLFNBQVMsZ0JBQWdCLENBQUMsRUFBMEIsRUFBRSxLQUF3QjtJQUNqRixFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9FLENBQUM7QUFFTSxTQUFTLFlBQVksQ0FBQyxFQUF5QixFQUFFLE1BQWU7SUFDbkUsc0RBQXNEO0lBQ3RELElBQUksZUFBZSxHQUFhLEVBQUUsQ0FBQztJQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM5QyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUM5QztJQUNELEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztJQUMvQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxZQUFZLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRWxGLHVEQUF1RDtJQUN2RCxFQUFFLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDM0MsRUFBRSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFMUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUQsQ0FBQzs7Ozs7OztVQzFIRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOZ0M7QUFDa0Q7QUFDTjtBQUU1RSxJQUFJLFFBQVEsR0FBdUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ2pGLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLElBQUksUUFBUSxHQUF1QixRQUFRLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDcEYsUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDdkIsSUFBSSxHQUFHLEdBQTZCLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsR0FBRyxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztBQUNsQyxJQUFJLEVBQUUsR0FBMkIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUUvRCxJQUFJLFlBQVksR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3RSxJQUFJLFVBQVUsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6RSxJQUFJLGtCQUFrQixHQUFxQixRQUFRLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFekYsSUFBSSxjQUFjLEdBQXNCLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNsRixjQUFjLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtJQUMxQyxTQUFTLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQztJQUN6QyxhQUFhLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUM5QixZQUFZLEVBQUUsQ0FBQztJQUNmLHlEQUFpQixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNqQyx3REFBZ0IsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUM1Qyx5QkFBeUIsR0FBRyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLGNBQWMsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2xGLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO0lBQzFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdEQsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLGNBQWMsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdkMsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLGlCQUFpQixHQUF1QixRQUFRLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDekYsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtJQUM3QyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxvQkFBb0IsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3pGLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7SUFDaEQseUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQyxDQUFDO0FBQ0gsSUFBSSx1QkFBdUIsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQy9GLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7SUFDbkQseUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxTQUFTLEdBQVcsY0FBYyxDQUFDLGFBQWEsQ0FBQztBQUNyRCxJQUFJLGFBQWEsR0FBVyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLElBQUksU0FBUyxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRSxJQUFJLGNBQXNCLENBQUM7QUFDM0IsSUFBSSwwQkFBa0MsQ0FBQztBQUV2Qyx5REFBaUIsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFFakMsSUFBSSxlQUFlLEdBQVcsNEJBQTRCLENBQUM7QUFDM0QsSUFBSSxlQUFlLEdBQVcsNEJBQTRCLENBQUM7QUFDM0QsSUFBSSxnQkFBZ0IsR0FBVyw2QkFBNkIsQ0FBQztBQUM3RCxJQUFJLGdCQUFnQixHQUFXLDZCQUE2QixDQUFDO0FBQzdELElBQUksZ0JBQWdCLEdBQVcsNkJBQTZCLENBQUM7QUFDN0QsSUFBSSxnQkFBZ0IsR0FBVyw2QkFBNkIsQ0FBQztBQUM3RCxJQUFJLGdCQUFnQixHQUFXLDZCQUE2QixDQUFDO0FBQzdELElBQUksZ0JBQWdCLEdBQVcsNkJBQTZCLENBQUM7QUFDN0QsSUFBSSxnQkFBZ0IsR0FBVyw2QkFBNkIsQ0FBQztBQUM3RCxJQUFJLGdCQUFnQixHQUFXLDZCQUE2QixDQUFDO0FBQzdELElBQUksaUJBQWlCLEdBQVcsOEJBQThCLENBQUM7QUFDL0QsSUFBSSxpQkFBaUIsR0FBVyw4QkFBOEIsQ0FBQztBQUMvRCxJQUFJLGVBQWUsR0FBeUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUV0RCxJQUFJLFdBQVcsR0FBdUI7SUFDbEMsU0FBUyxDQUFDLGVBQWUsQ0FBQztJQUMxQixTQUFTLENBQUMsZUFBZSxDQUFDO0lBQzFCLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztJQUMzQixTQUFTLENBQUMsZ0JBQWdCLENBQUM7SUFDM0IsU0FBUyxDQUFDLGdCQUFnQixDQUFDO0lBQzNCLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztJQUMzQixTQUFTLENBQUMsZ0JBQWdCLENBQUM7SUFDM0IsU0FBUyxDQUFDLGdCQUFnQixDQUFDO0lBQzNCLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztJQUMzQixTQUFTLENBQUMsZ0JBQWdCLENBQUM7SUFDM0IsU0FBUyxDQUFDLGlCQUFpQixDQUFDO0lBQzVCLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztDQUMvQixDQUFDO0FBRUYsSUFBSSxxQkFBd0MsQ0FBQztBQUU3QyxTQUFTLFlBQVk7SUFDakIsNEJBQTRCLEVBQUUsQ0FBQztBQUNuQyxDQUFDO0FBRUQsU0FBUyw0QkFBNEI7SUFDakMscUJBQXFCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6RCxxQkFBcUIsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7SUFDN0QscUJBQXFCLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDN0MsSUFBSSxjQUFjLEdBQTZCLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RixLQUFLLElBQUksYUFBYSxHQUFHLENBQUMsRUFBRSxhQUFhLEdBQUcsQ0FBQyxFQUFFLGFBQWEsRUFBRSxFQUFFO1FBQzVELElBQUksUUFBUSxHQUFXLGFBQWEsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuRCxLQUFLLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRTtZQUNwRSxJQUFJLFlBQVksR0FBVyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQ2xELElBQUksWUFBWSxHQUFXLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDckQsY0FBYyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsYUFBYSxFQUFFLFlBQVksR0FBRyxhQUFhLENBQUMsQ0FBQztZQUNyRixjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxTQUFTLENBQ3BCLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFDdkIsQ0FBQyxhQUFhLEVBQ2QsQ0FBQyxhQUFhLEVBQ2QsU0FBUyxFQUNULFNBQVMsQ0FDWixDQUFDO1lBQ0YsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDOUY7S0FDSjtBQUNMLENBQUM7QUFFRCxTQUFTO0FBQ1QseUVBQXlFO0FBQ3pFLHFFQUFxRTtBQUNyRSx3R0FBd0c7QUFDeEcsZ0dBQWdHO0FBQ2hHLG9GQUFvRjtBQUNwRiw2RkFBNkY7QUFDN0YsU0FBUyw4QkFBOEIsQ0FBQyxLQUFZO0lBQ2hELEdBQUcsQ0FBQyxTQUFTLENBQ1QscUJBQXFCLEVBQ3JCLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxFQUM1QixLQUFLLENBQUMsYUFBYSxHQUFHLFNBQVMsRUFDL0IsU0FBUyxFQUNULFNBQVMsRUFDVCxLQUFLLENBQUMsQ0FBQyxHQUFHLGFBQWEsRUFDdkIsS0FBSyxDQUFDLENBQUMsR0FBRyxhQUFhLEVBQ3ZCLFNBQVMsRUFDVCxTQUFTLENBQ1osQ0FBQztBQUNOLENBQUM7QUFFRCx3REFBd0Q7QUFDeEQsb0ZBQW9GO0FBQ3BGLFNBQVMsU0FBUyxDQUFDLFdBQW1CO0lBQ2xDLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7S0FDcEY7SUFDRCxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV4QywwREFBMEQ7SUFDMUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUN4QixLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtRQUNoQixlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0QsS0FBSyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUM7SUFFeEIsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQUVELElBQUksaUJBQWlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtJQUNyQyxJQUFJLFdBQVcsRUFBRSxFQUFFO1FBQ2YsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDakMsWUFBWSxFQUFFLENBQUM7UUFDZix3REFBZ0IsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdEM7QUFDTCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFUixTQUFTLFdBQVc7SUFDaEIsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxJQUFJLGVBQWUsRUFBRTtRQUN2QyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjtJQUFBLENBQUM7SUFDRixPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsSUFBSSxTQUFTLEdBQVksS0FBSyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFXLENBQUMsQ0FBQztBQUN2QixJQUFJLE1BQU0sR0FBVyxDQUFDLENBQUM7QUFFdkIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO0lBQ3JELFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDakIsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLGNBQWMsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdkMsQ0FBQyxDQUFDLENBQUM7QUFDSCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBYSxFQUFFLEVBQUUsR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEYsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO0lBQ3JELE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7SUFDekMsTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLGtCQUFrQixHQUFhLEVBQUUsQ0FBQztBQUN0QyxJQUFJLHVCQUF1QixHQUFXLEdBQUcsQ0FBQztBQUMxQyxJQUFJLHlCQUF5QixHQUFXLENBQUMsQ0FBQztBQUUxQyxJQUFJLE1BQU0sR0FBWSxFQUFFLENBQUM7QUFFekIsSUFBSSxVQUFVLEdBQVcsQ0FBQyxDQUFDO0FBRTNCLFNBQVMsSUFBSSxDQUFDLGlCQUF5QjtJQUNuQyxJQUFJLGtCQUFrQixDQUFDLE1BQU0sSUFBSSx1QkFBdUIsRUFBRTtRQUN0RCxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUM5QjtJQUNELGtCQUFrQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRTNDLElBQUksZUFBdUIsQ0FBQztJQUM1QixJQUFJLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDL0IsZUFBZSxHQUFHLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztLQUMzRjtJQUVELElBQUksU0FBUyxFQUFFO1FBQ1gsSUFBSSxvQkFBb0IsR0FBVyxpQkFBaUIsR0FBRyxjQUFjLENBQUM7UUFDdEUsSUFBSSxjQUFjLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDakYsT0FBTywwQkFBMEIsR0FBRyxjQUFjLEVBQUU7WUFDaEQsYUFBYSxFQUFFLENBQUM7WUFDaEIsMEJBQTBCLEVBQUUsQ0FBQztTQUNoQztLQUNKO0lBRUQsc0JBQXNCO0lBQ3RCLElBQUksa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUM7WUFFckQsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsR0FBRyxDQUFDLEVBQUUsRUFBRSxtQkFBbUI7Z0JBQ3RELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7YUFDOUM7WUFDRCxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxHQUFHLENBQUMsRUFBRSxFQUFFLGtCQUFrQjtnQkFDckQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzthQUM5QztZQUNELElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxhQUFhLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLG9CQUFvQjtnQkFDcEUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2xFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2FBQzlDO1lBQ0QsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUscUJBQXFCO2dCQUN0RSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7YUFDOUM7U0FDSjtLQUNKO0lBRUQsb0JBQW9CO0lBQ3BCLFlBQVksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDL0IsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxlQUFlLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN4RTtTQUFNO1FBQ0gsVUFBVSxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztLQUMzQztJQUNELElBQUkseUJBQXlCLElBQUksdUJBQXVCLEVBQUU7UUFDdEQsa0JBQWtCLENBQUMsU0FBUyxHQUFHLHFEQUFjLENBQ3pDLE1BQU0sQ0FBQyxNQUFNO2NBQ1gsQ0FBQyxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztjQUMzQyx1QkFBdUIsRUFDdkIsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkI7U0FBTTtRQUNILGtCQUFrQixDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztLQUNuRDtJQUVELEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyRCxrQkFBa0I7SUFDbEIsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUU7UUFDOUIsb0RBQVksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDNUI7U0FBTTtRQUNILEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsOEJBQThCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0M7S0FDSjtJQUVELHlCQUF5QixFQUFFLENBQUM7SUFFNUIsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRCxTQUFTLGFBQWE7SUFDbEIsSUFBSSxLQUFLLEdBQVUsSUFBSSx5Q0FBSyxFQUFFLENBQUM7SUFDL0IsS0FBSyxDQUFDLENBQUMsR0FBRyx3REFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2RCxLQUFLLENBQUMsQ0FBQyxHQUFHLHdEQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXhELElBQUkscUNBQXFDLEdBQVcsR0FBRyxDQUFDO0lBQ3hELElBQUksV0FBVyxHQUFXLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN0RCxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcscUNBQXFDLENBQUM7SUFDaEYsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLHFDQUFxQyxDQUFDO0lBRWhGLEtBQUssQ0FBQyxVQUFVLEdBQUcsNERBQXFCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELEtBQUssQ0FBQyxhQUFhLEdBQUcsNERBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWxELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkIseUJBQXlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4cG9ydHMvLi9zcmMvYXJyb3cudHMiLCJ3ZWJwYWNrOi8vZXhwb3J0cy8uL3NyYy91dGlsLnRzIiwid2VicGFjazovL2V4cG9ydHMvLi9zcmMvd2ViZ2wudHMiLCJ3ZWJwYWNrOi8vZXhwb3J0cy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHBvcnRzL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leHBvcnRzL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhwb3J0cy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4cG9ydHMvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEFycm93IHtcclxuICAgIHB1YmxpYyB4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgeTogbnVtYmVyO1xyXG4gICAgcHVibGljIHZlbG9jaXR5WDogbnVtYmVyO1xyXG4gICAgcHVibGljIHZlbG9jaXR5WTogbnVtYmVyO1xyXG4gICAgcHVibGljIGNvbG9ySW5kZXg6IG51bWJlcjtcclxuICAgIHB1YmxpYyByb3RhdGlvbkluZGV4OiBudW1iZXI7XHJcbn1cclxuIiwiZXhwb3J0IGZ1bmN0aW9uIHJvdW5kVG9OUGxhY2VzKHg6IG51bWJlciwgbnVtUGxhY2VzOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgbGV0IHNjYWxlOiBudW1iZXIgPSBNYXRoLnBvdygxMCwgbnVtUGxhY2VzKTtcclxuICAgIHJldHVybiBNYXRoLnJvdW5kKHggKiBzY2FsZSkgLyBzY2FsZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wVmFsdWVUb1JhbmdlKHZhbHVlOiBudW1iZXIsIGxvd2VyQm91bmQ6IG51bWJlciwgdXBwZXJCb3VuZDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGlmICh2YWx1ZSA8IGxvd2VyQm91bmQpIHtcclxuICAgICAgICByZXR1cm4gbG93ZXJCb3VuZDtcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZSA+IHVwcGVyQm91bmQpIHtcclxuICAgICAgICByZXR1cm4gdXBwZXJCb3VuZDtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbUludEluY2x1c2l2ZShtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgbWluID0gTWF0aC5jZWlsKG1pbik7XHJcbiAgICBtYXggPSBNYXRoLmZsb29yKG1heCk7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcclxufVxyXG4iLCJpbXBvcnQgeyBBcnJvdyB9IGZyb20gXCIuL2Fycm93XCI7XHJcblxyXG5sZXQgb2Zmc2V0TG9jYXRpb246IG51bWJlcjtcclxuXHJcbi8vIElmIEkgY3JlYXRlIGJ1ZmZlcnMgcmVwZWF0ZWRseSB3aXRob3V0IGRlbGV0aW5nIHRoZW0gdGhlbiBJJ2xsIGNhdXNlIGEgbWVtb3J5XHJcbi8vIGxlYWsgaW4gYXQgbGVhc3QgRmlyZUZveCBidXQgcG9zc2libHkgb3RoZXIgYnJvd3NlcnMuIE5vdCBDaHJvbWUgdGhvdWdoLlxyXG5sZXQgaW5zdGFuY2VCdWZmZXI6IFdlYkdMQnVmZmVyO1xyXG5sZXQgcG9zaXRpb25CdWZmZXI6IFdlYkdMQnVmZmVyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVTaGFkZXJzKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBhcnJvd1NpemU6IG51bWJlcikge1xyXG4gICAgbGV0IGhhbGZBcnJvd1NpemU6IG51bWJlciA9IGFycm93U2l6ZSAvIDI7XHJcblxyXG4gICAgbGV0IHZlcnRleFNoYWRlclNyYyA9IGBcclxuICAgICAgICBhdHRyaWJ1dGUgdmVjMiBhX3Bvc2l0aW9uO1xyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWM0IGFfaW5zdGFuY2U7XHJcbiAgICAgICAgdW5pZm9ybSBtYXQzIHVfbWF0cml4O1xyXG4gICAgICAgIHZhcnlpbmcgdmVjMiB2X3RleENvb3JkO1xyXG5cclxuICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgIHZlYzIgY2FudmFzX3Bvc2l0aW9uID0gYV9wb3NpdGlvbiAqIHZlYzIoJHthcnJvd1NpemV9LCAke2Fycm93U2l6ZX0pICsgYV9pbnN0YW5jZS54eSArIHZlYzIoLSR7aGFsZkFycm93U2l6ZX0sIC0ke2hhbGZBcnJvd1NpemV9KTtcclxuICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHVfbWF0cml4ICogdmVjMyhjYW52YXNfcG9zaXRpb24sIDEpLCAxKSArIHZlYzQoLTEsIDEsIDAsIDApO1xyXG4gICAgICAgICAgICB2X3RleENvb3JkID0gYV9wb3NpdGlvbiAvIHZlYzIoMTIsIDQpICsgdmVjMihhX2luc3RhbmNlLncsIGFfaW5zdGFuY2UueikgLyB2ZWMyKDEyLCA0KTtcclxuICAgICAgICB9YFxyXG5cclxuICAgIGxldCBmcmFnbWVudFNoYWRlclNyYyA9IGBcclxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuICAgICAgICB2YXJ5aW5nIHZlYzIgdl90ZXhDb29yZDtcclxuICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X2ltYWdlO1xyXG4gICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVfaW1hZ2UsIHZfdGV4Q29vcmQpO1xyXG4gICAgICAgIH1gXHJcblxyXG4gICAgbGV0IHZlcnRTaGFkZXJPYmogPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XHJcbiAgICBsZXQgZnJhZ1NoYWRlck9iaiA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xyXG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRTaGFkZXJPYmosIHZlcnRleFNoYWRlclNyYyk7XHJcbiAgICBnbC5zaGFkZXJTb3VyY2UoZnJhZ1NoYWRlck9iaiwgZnJhZ21lbnRTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0U2hhZGVyT2JqKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ1NoYWRlck9iaik7XHJcblxyXG4gICAgbGV0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydFNoYWRlck9iaik7XHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ1NoYWRlck9iaik7XHJcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XHJcblxyXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIodmVydFNoYWRlck9iaiwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY29tcGlsaW5nIHZlcnRleCBzaGFkZXI6JywgZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0U2hhZGVyT2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihmcmFnU2hhZGVyT2JqLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjb21waWxpbmcgZnJhZ21lbnQgc2hhZGVyOicsIGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ1NoYWRlck9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxpbmtpbmcgcHJvZ3JhbTonLCBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHVfbWF0cml4TG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIFwidV9tYXRyaXhcIik7XHJcbiAgICBsZXQgcG9zaXRpb25Mb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIFwiYV9wb3NpdGlvblwiKTtcclxuICAgIG9mZnNldExvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgXCJhX2luc3RhbmNlXCIpO1xyXG5cclxuICAgIGxldCBtYXRyaXggPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAyIC8gZ2wuY2FudmFzLndpZHRoLCAwLCAwLFxyXG4gICAgICAgIDAsIC0yIC8gZ2wuY2FudmFzLmhlaWdodCwgMCxcclxuICAgICAgICAwLCAwLCAxLFxyXG4gICAgXSk7XHJcbiAgICBnbC51bmlmb3JtTWF0cml4M2Z2KHVfbWF0cml4TG9jLCBmYWxzZSwgbWF0cml4KTtcclxuXHJcbiAgICBpZiAocG9zaXRpb25CdWZmZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGdsLmRlbGV0ZUJ1ZmZlcihwb3NpdGlvbkJ1ZmZlcik7XHJcbiAgICB9XHJcbiAgICBwb3NpdGlvbkJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHBvc2l0aW9uQnVmZmVyKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAwLjAsICAwLjAsXHJcbiAgICAgICAgMS4wLCAgMC4wLFxyXG4gICAgICAgIDAuMCwgIDEuMCxcclxuICAgICAgICAwLjAsICAxLjAsXHJcbiAgICAgICAgMS4wLCAgMC4wLFxyXG4gICAgICAgIDEuMCwgIDEuMCxcclxuICAgIF0pLCBnbC5TVEFUSUNfRFJBVyk7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwb3NpdGlvbkxvY2F0aW9uKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zaXRpb25Mb2NhdGlvbiwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuXHJcbiAgICBsZXQgdGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcclxuXHJcbiAgICAvLyBlbmFibGUgYWxwaGEgYmxlbmRpbmdcclxuICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XHJcbiAgICBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBidWZmZXIgdG8gc3RvcmUgdGhlIHBlci1pbnN0YW5jZSBkYXRhXHJcbiAgICBpZiAoaW5zdGFuY2VCdWZmZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGdsLmRlbGV0ZUJ1ZmZlcihpbnN0YW5jZUJ1ZmZlcik7XHJcbiAgICB9XHJcbiAgICBpbnN0YW5jZUJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0U2hhZGVyVGV4dHVyZShnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgaW1hZ2U6IEhUTUxDYW52YXNFbGVtZW50KSB7XHJcbiAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRyYXdBcnJvd3NHbChnbDpXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBhcnJvd3M6IEFycm93W10pIHtcclxuICAgIC8vIFBvcHVsYXRlIHRoZSBpbnN0YW5jZSBidWZmZXIgd2l0aCBwZXItaW5zdGFuY2UgZGF0YVxyXG4gICAgbGV0IGluc3RhbmNlVmVjdG9yczogbnVtYmVyW10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaW5zdGFuY2VWZWN0b3JzLnB1c2goYXJyb3dzW2ldLngpO1xyXG4gICAgICAgIGluc3RhbmNlVmVjdG9ycy5wdXNoKGFycm93c1tpXS55KTtcclxuICAgICAgICBpbnN0YW5jZVZlY3RvcnMucHVzaChhcnJvd3NbaV0ucm90YXRpb25JbmRleCk7XHJcbiAgICAgICAgaW5zdGFuY2VWZWN0b3JzLnB1c2goYXJyb3dzW2ldLmNvbG9ySW5kZXgpO1xyXG4gICAgfVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGluc3RhbmNlQnVmZmVyKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGluc3RhbmNlVmVjdG9ycyksIGdsLlNUQVRJQ19EUkFXKTtcclxuXHJcbiAgICAvLyBCaW5kIHRoZSBpbnN0YW5jZSBidWZmZXIgdG8gdGhlIGFfaW5zdGFuY2UgYXR0cmlidXRlXHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShvZmZzZXRMb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKG9mZnNldExvY2F0aW9uLCA0LCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG4gICAgZ2wudmVydGV4QXR0cmliRGl2aXNvcihvZmZzZXRMb2NhdGlvbiwgMSk7XHJcblxyXG4gICAgZ2wuZHJhd0FycmF5c0luc3RhbmNlZChnbC5UUklBTkdMRVMsIDAsIDYsIGFycm93cy5sZW5ndGgpO1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQXJyb3cgfSBmcm9tIFwiLi9hcnJvd1wiO1xyXG5pbXBvcnQgeyBjbGFtcFZhbHVlVG9SYW5nZSwgZ2V0UmFuZG9tSW50SW5jbHVzaXZlLCByb3VuZFRvTlBsYWNlcyB9IGZyb20gXCIuL3V0aWxcIjtcclxuaW1wb3J0IHsgZHJhd0Fycm93c0dsLCBpbml0aWFsaXplU2hhZGVycywgc2V0U2hhZGVyVGV4dHVyZSB9IGZyb20gXCIuL3dlYmdsXCI7XHJcblxyXG5sZXQgY2FudmFzMmQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dCZW5jaDJkQ2FudmFzXCIpO1xyXG5jYW52YXMyZC53aWR0aCA9IDE5MjA7XHJcbmNhbnZhczJkLmhlaWdodCA9IDEwODA7XHJcbmxldCBjYW52YXNnbCA9IDxIVE1MQ2FudmFzRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0JlbmNoV2ViR0xDYW52YXNcIik7XHJcbmNhbnZhc2dsLndpZHRoID0gMTkyMDtcclxuY2FudmFzZ2wuaGVpZ2h0ID0gMTA4MDtcclxubGV0IGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEID0gY2FudmFzMmQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbmxldCBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA9IGNhbnZhc2dsLmdldENvbnRleHQoXCJ3ZWJnbDJcIik7XHJcblxyXG5sZXQgYXJyb3dDb3VudGVyID0gPEhUTUxTcGFuRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0NvdW50ZXJcIik7XHJcbmxldCBmcHNDb3VudGVyID0gPEhUTUxTcGFuRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNDb3VudGVyXCIpO1xyXG5sZXQgYXJyb3dzUGVyTXNDb3VudGVyID0gPEhUTUxTcGFuRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd3NQZXJNc0NvdW50ZXJcIik7XHJcblxyXG5sZXQgYXJyb3dTaXplSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1NpemVJbnB1dFwiKTtcclxuYXJyb3dTaXplSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIGFycm93U2l6ZSA9IGFycm93U2l6ZUlucHV0LnZhbHVlQXNOdW1iZXI7XHJcbiAgICBoYWxmQXJyb3dTaXplID0gYXJyb3dTaXplIC8gMjtcclxuICAgIGNyZWF0ZUNhY2hlcygpO1xyXG4gICAgaW5pdGlhbGl6ZVNoYWRlcnMoZ2wsIGFycm93U2l6ZSk7XHJcbiAgICBzZXRTaGFkZXJUZXh0dXJlKGdsLCBhcnJvd0NhY2hlU3ByaXRlc2hlZXQpO1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IDA7XHJcbn0pO1xyXG5cclxubGV0IHNwYXduUmF0ZUlucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3Bhd25SYXRlSW5wdXRcIik7XHJcbnNwYXduUmF0ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICBzcGF3blJhdGUgPSBNYXRoLnBvdyhzcGF3blJhdGVJbnB1dC52YWx1ZUFzTnVtYmVyLCAzKTtcclxuICAgIGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duID0gMDtcclxuICAgIG1vdXNlRG93blN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbn0pO1xyXG5cclxubGV0IGNsZWFyQXJyb3dzQnV0dG9uID0gPEhUTUxCdXR0b25FbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsZWFyQXJyb3dzQnV0dG9uXCIpO1xyXG5jbGVhckFycm93c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgYXJyb3dzID0gW107XHJcbn0pO1xyXG5cclxubGV0IGRyYXdNZXRob2RXZWJHTElucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHJhd01ldGhvZFdlYkdMXCIpO1xyXG5kcmF3TWV0aG9kV2ViR0xJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IDA7XHJcbn0pO1xyXG5sZXQgZHJhd01ldGhvZFNvZnR3YXJlSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkcmF3TWV0aG9kU29mdHdhcmVcIik7XHJcbmRyYXdNZXRob2RTb2Z0d2FyZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID0gMDtcclxufSk7XHJcblxyXG5sZXQgYXJyb3dTaXplOiBudW1iZXIgPSBhcnJvd1NpemVJbnB1dC52YWx1ZUFzTnVtYmVyO1xyXG5sZXQgaGFsZkFycm93U2l6ZTogbnVtYmVyID0gYXJyb3dTaXplIC8gMjtcclxubGV0IHNwYXduUmF0ZTogbnVtYmVyID0gTWF0aC5wb3coc3Bhd25SYXRlSW5wdXQudmFsdWVBc051bWJlciwgMyk7XHJcbmxldCBtb3VzZURvd25TdGFydDogbnVtYmVyO1xyXG5sZXQgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd246IG51bWJlcjtcclxuXHJcbmluaXRpYWxpemVTaGFkZXJzKGdsLCBhcnJvd1NpemUpO1xyXG5cclxubGV0IG5vdGVza2luNHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fNHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW44dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl84dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjEydGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xMnRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4xNnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMTZ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMjB0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzIwdGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjI0dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8yNHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4zMm5kUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMzJuZC5wbmdcIjtcclxubGV0IG5vdGVza2luNDh0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzQ4dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjY0dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl82NHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW45NnRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fOTZ0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTI4dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xMjh0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTkybmRQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xOTJuZC5wbmdcIjtcclxubGV0IHByZWxvYWRSZWdpc3RyeTogTWFwPHN0cmluZywgYm9vbGVhbj4gPSBuZXcgTWFwKCk7XHJcblxyXG5sZXQgYXJyb3dDb2xvcnM6IEhUTUxJbWFnZUVsZW1lbnRbXSA9IFtcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjR0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luOHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xMnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xNnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4yMHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4yNHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4zMm5kUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW40OHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW42NHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW45NnRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xMjh0aFBhdGgpLFxyXG4gICAgbG9hZEltYWdlKG5vdGVza2luMTkybmRQYXRoKSxcclxuXTtcclxuXHJcbmxldCBhcnJvd0NhY2hlU3ByaXRlc2hlZXQ6IEhUTUxDYW52YXNFbGVtZW50O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2FjaGVzKCkge1xyXG4gICAgY3JlYXRlRnVsbFJlc2l6ZWRTcHJpdGVzaGVldCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVGdWxsUmVzaXplZFNwcml0ZXNoZWV0KCkge1xyXG4gICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGFycm93Q2FjaGVTcHJpdGVzaGVldC53aWR0aCA9IGFycm93Q29sb3JzLmxlbmd0aCAqIGFycm93U2l6ZTtcclxuICAgIGFycm93Q2FjaGVTcHJpdGVzaGVldC5oZWlnaHQgPSA0ICogYXJyb3dTaXplO1xyXG4gICAgbGV0IHNwcml0ZXNoZWV0Q3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgPSBhcnJvd0NhY2hlU3ByaXRlc2hlZXQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgZm9yIChsZXQgcm90YXRpb25JbmRleCA9IDA7IHJvdGF0aW9uSW5kZXggPCA0OyByb3RhdGlvbkluZGV4KyspIHtcclxuICAgICAgICBsZXQgcm90YXRpb246IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBNYXRoLlBJIC8gMjtcclxuICAgICAgICBmb3IgKGxldCBjb2xvckluZGV4ID0gMDsgY29sb3JJbmRleCA8IGFycm93Q29sb3JzLmxlbmd0aDsgY29sb3JJbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblg6IG51bWJlciA9IGNvbG9ySW5kZXggKiBhcnJvd1NpemU7XHJcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvblk6IG51bWJlciA9IHJvdGF0aW9uSW5kZXggKiBhcnJvd1NpemU7XHJcbiAgICAgICAgICAgIHNwcml0ZXNoZWV0Q3R4LnRyYW5zbGF0ZShkZXN0aW5hdGlvblggKyBoYWxmQXJyb3dTaXplLCBkZXN0aW5hdGlvblkgKyBoYWxmQXJyb3dTaXplKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHguZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICAgICAgYXJyb3dDb2xvcnNbY29sb3JJbmRleF0sXHJcbiAgICAgICAgICAgICAgICAtaGFsZkFycm93U2l6ZSxcclxuICAgICAgICAgICAgICAgIC1oYWxmQXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC5yb3RhdGUoLXJvdGF0aW9uKTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgudHJhbnNsYXRlKC0oZGVzdGluYXRpb25YICsgaGFsZkFycm93U2l6ZSksIC0oZGVzdGluYXRpb25ZICsgaGFsZkFycm93U2l6ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gTm90ZTogXHJcbi8vIFRyYW5zZm9ybWluZyBhbmQgdGhlbiB1bnRyYW5zZm9ybWluZyBpcyBmYXN0ZXIgdGhhbiB1c2luZyBzYXZlL3Jlc3RvcmVcclxuLy8gRHJhd2luZyB0aGUgcmVzaXplZCBhcnJvdyB0byBhbiBvZmZzY3JlZW4gY2FudmFzIHNvIHRoYXQgZHJhd0ltYWdlXHJcbi8vICAgICBkb2Vzbid0IGhhdmUgdG8gcmVzaXplIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIChleGNlcHQgb24gRmlyZUZveCB3aGVyZSBpdCdzIG9ubHkgbGlrZSAzJSBmYXN0ZXIpXHJcbi8vIEZvciBzb21lIHJlYXNvbiwgWzBdW2Fycm93LmNvbG9ySW5kZXhdIGlzIGZhc3RlciB0aGFuIFthcnJvdy5yb3RhdGlvbkluZGV4XVthcnJvdy5jb2xvckluZGV4XVxyXG4vLyBEcmF3aW5nIGZyb20gYW4gSFRNTENhbnZhc0VsZW1lbnQgaXMgZmFzdGVyIHRoYW4gZHJhd2luZyBmcm9tIGFuIEhUTUxJbWFnZUVsZW1lbnRcclxuLy8gRHJhd2luZyBmcm9tIHNpbmdsZSBzcHJpdGVzaGVldCBpcyBhYm91dCA4MCUgZmFzdGVyIHRoYW4gZHJhd2luZyBmcm9tIDQ4IHNlcGFyYXRlIGNhbnZhc2VzXHJcbmZ1bmN0aW9uIGRyYXdGcm9tRnVsbFJlc2l6ZWRTcHJpdGVzaGVldChhcnJvdzogQXJyb3cpIHtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0LFxyXG4gICAgICAgIGFycm93LmNvbG9ySW5kZXggKiBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3cucm90YXRpb25JbmRleCAqIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93LnggLSBoYWxmQXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93LnkgLSBoYWxmQXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICApO1xyXG59XHJcblxyXG4vLyBTZWUgdGhpcyBpZiBJIGVuY291bnRlciB3ZWlyZCBsb2FkaW5nIHByb2JsZW1zIGxhdGVyOlxyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjM1NDg2NS9pbWFnZS1vbmxvYWQtZXZlbnQtYW5kLWJyb3dzZXItY2FjaGVcclxuZnVuY3Rpb24gbG9hZEltYWdlKGltYWdlU291cmNlOiBzdHJpbmcpOiBIVE1MSW1hZ2VFbGVtZW50IHtcclxuICAgIGlmIChwcmVsb2FkUmVnaXN0cnkuaGFzKGltYWdlU291cmNlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBhdHRlbXB0ZWQgdG8gbG9hZCB0aGUgc2FtZSBpbWFnZSB0d2ljZSBkdXJpbmcgcHJlbG9hZGluZy5cIik7XHJcbiAgICB9XHJcbiAgICBwcmVsb2FkUmVnaXN0cnkuc2V0KGltYWdlU291cmNlLCBmYWxzZSk7XHJcblxyXG4gICAgLy8gVGhlIG9yZGVyIHRoZXNlIDMgdGhpbmdzIGFyZSBkb25lIGluIGlzIFZFUlkgaW1wb3J0YW50IVxyXG4gICAgbGV0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgcHJlbG9hZFJlZ2lzdHJ5LnNldChpbWFnZVNvdXJjZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBpbWFnZS5zcmMgPSBpbWFnZVNvdXJjZTtcclxuXHJcbiAgICByZXR1cm4gaW1hZ2U7XHJcbn1cclxuXHJcbmxldCBwcmVsb2FkSW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgIGlmIChwcmVsb2FkRG9uZSgpKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChwcmVsb2FkSW50ZXJ2YWxJZCk7XHJcbiAgICAgICAgY3JlYXRlQ2FjaGVzKCk7XHJcbiAgICAgICAgc2V0U2hhZGVyVGV4dHVyZShnbCwgYXJyb3dDYWNoZVNwcml0ZXNoZWV0KTtcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xyXG4gICAgfVxyXG59LCAxMDApO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZERvbmUoKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBba2V5LCBsb2FkZWRdIG9mIHByZWxvYWRSZWdpc3RyeSkge1xyXG4gICAgICAgIGlmICghbG9hZGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmxldCBtb3VzZURvd246IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IG1vdXNlWDogbnVtYmVyID0gMDtcclxubGV0IG1vdXNlWTogbnVtYmVyID0gMDtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgIG1vdXNlRG93biA9IHRydWU7XHJcbiAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93biA9IDA7XHJcbiAgICBtb3VzZURvd25TdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG59KTtcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHsgbW91c2VEb3duID0gZmFsc2U7IH0pO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBtb3VzZVggPSBlLmNsaWVudFggLSBjYW52YXMyZC5vZmZzZXRMZWZ0O1xyXG4gICAgbW91c2VZID0gZS5jbGllbnRZO1xyXG59KTtcclxuXHJcbmxldCBwcmV2aW91c0ZyYW1lVGltZXM6IG51bWJlcltdID0gW107XHJcbmxldCBudW1GcmFtZVRpbWVzVG9SZW1lbWJlcjogbnVtYmVyID0gMTAwO1xyXG5sZXQgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZTogbnVtYmVyID0gMDtcclxuXHJcbmxldCBhcnJvd3M6IEFycm93W10gPSBbXTtcclxuXHJcbmxldCBsb2dDb3VudGVyOiBudW1iZXIgPSAwO1xyXG5cclxuZnVuY3Rpb24gZHJhdyhjdXJyZW50VGltZU1pbGxpczogbnVtYmVyKSB7XHJcbiAgICBpZiAocHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCA+PSBudW1GcmFtZVRpbWVzVG9SZW1lbWJlcikge1xyXG4gICAgICAgIHByZXZpb3VzRnJhbWVUaW1lcy5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgcHJldmlvdXNGcmFtZVRpbWVzLnB1c2goY3VycmVudFRpbWVNaWxsaXMpO1xyXG5cclxuICAgIGxldCBkZWx0YVRpbWVNaWxsaXM6IG51bWJlcjtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGRlbHRhVGltZU1pbGxpcyA9IGN1cnJlbnRUaW1lTWlsbGlzIC0gcHJldmlvdXNGcmFtZVRpbWVzW3ByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggLSAyXTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW91c2VEb3duKSB7XHJcbiAgICAgICAgbGV0IG1vdXNlRG93bkRlbHRhTWlsbGlzOiBudW1iZXIgPSBjdXJyZW50VGltZU1pbGxpcyAtIG1vdXNlRG93blN0YXJ0O1xyXG4gICAgICAgIGxldCBleHBlY3RlZEFycm93czogbnVtYmVyID0gTWF0aC5mbG9vcihtb3VzZURvd25EZWx0YU1pbGxpcyAqIHNwYXduUmF0ZSAvIDEwMDApO1xyXG4gICAgICAgIHdoaWxlIChhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93biA8IGV4cGVjdGVkQXJyb3dzKSB7XHJcbiAgICAgICAgICAgIGdlbmVyYXRlQXJyb3coKTtcclxuICAgICAgICAgICAgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd24rKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2ltdWxhdGUgdGhlIGFycm93c1xyXG4gICAgaWYgKHByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJvd3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYXJyb3dzW2ldLnggKz0gYXJyb3dzW2ldLnZlbG9jaXR5WCAqIGRlbHRhVGltZU1pbGxpcztcclxuICAgICAgICAgICAgYXJyb3dzW2ldLnkgKz0gYXJyb3dzW2ldLnZlbG9jaXR5WSAqIGRlbHRhVGltZU1pbGxpcztcclxuXHJcbiAgICAgICAgICAgIGlmIChhcnJvd3NbaV0ueCAtIGhhbGZBcnJvd1NpemUgPCAwKSB7IC8vIGRvbmsgb24gdGhlIGxlZnRcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS54ICs9IDIgKiAoaGFsZkFycm93U2l6ZSAtIGFycm93c1tpXS54KTtcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS52ZWxvY2l0eVggPSAtYXJyb3dzW2ldLnZlbG9jaXR5WDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYXJyb3dzW2ldLnkgLSBoYWxmQXJyb3dTaXplIDwgMCkgeyAvLyBkb25rIG9uIHRoZSB0b3BcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS55ICs9IDIgKiAoaGFsZkFycm93U2l6ZSAtIGFycm93c1tpXS55KTtcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS52ZWxvY2l0eVkgPSAtYXJyb3dzW2ldLnZlbG9jaXR5WTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYXJyb3dzW2ldLnggKyBoYWxmQXJyb3dTaXplID4gY2FudmFzMmQud2lkdGgpIHsgLy8gZG9uayBvbiB0aGUgcmlnaHRcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS54IC09IDIgKiAoYXJyb3dzW2ldLnggKyBoYWxmQXJyb3dTaXplIC0gY2FudmFzMmQud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnZlbG9jaXR5WCA9IC1hcnJvd3NbaV0udmVsb2NpdHlYO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhcnJvd3NbaV0ueSArIGhhbGZBcnJvd1NpemUgPiBjYW52YXMyZC5oZWlnaHQpIHsgLy8gZG9uayBvbiB0aGUgYm90dG9tXHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0ueSAtPSAyICogKGFycm93c1tpXS55ICsgaGFsZkFycm93U2l6ZSAtIGNhbnZhczJkLmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlZID0gLWFycm93c1tpXS52ZWxvY2l0eVk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSB0b3AgVUlcclxuICAgIGFycm93Q291bnRlci5pbm5lclRleHQgPSBhcnJvd3MubGVuZ3RoLnRvU3RyaW5nKCk7XHJcbiAgICBpZiAocHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBmcHNDb3VudGVyLmlubmVyVGV4dCA9IE1hdGgucm91bmQoMTAwMCAvIGRlbHRhVGltZU1pbGxpcykudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZnBzQ291bnRlci5pbm5lclRleHQgPSBcImNhbGN1bGF0aW5nLi4uXCI7XHJcbiAgICB9XHJcbiAgICBpZiAoZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA+PSBudW1GcmFtZVRpbWVzVG9SZW1lbWJlcikge1xyXG4gICAgICAgIGFycm93c1Blck1zQ291bnRlci5pbm5lclRleHQgPSByb3VuZFRvTlBsYWNlcyhcclxuICAgICAgICAgICAgYXJyb3dzLmxlbmd0aFxyXG4gICAgICAgICAgICAvIChjdXJyZW50VGltZU1pbGxpcyAtIHByZXZpb3VzRnJhbWVUaW1lc1swXSlcclxuICAgICAgICAgICAgKiBudW1GcmFtZVRpbWVzVG9SZW1lbWJlclxyXG4gICAgICAgICAgICAsIDIpLnRvU3RyaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFycm93c1Blck1zQ291bnRlci5pbm5lclRleHQgPSBcImNhbGN1bGF0aW5nLi4uXCI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzMmQud2lkdGgsIGNhbnZhczJkLmhlaWdodCk7XHJcblxyXG4gICAgLy8gZHJhdyB0aGUgYXJyb3dzXHJcbiAgICBpZiAoZHJhd01ldGhvZFdlYkdMSW5wdXQuY2hlY2tlZCkge1xyXG4gICAgICAgIGRyYXdBcnJvd3NHbChnbCwgYXJyb3dzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJvd3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZHJhd0Zyb21GdWxsUmVzaXplZFNwcml0ZXNoZWV0KGFycm93c1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZyYW1lc1dpdGhvdXRBU3RhdGVDaGFuZ2UrKztcclxuXHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZW5lcmF0ZUFycm93KCkge1xyXG4gICAgbGV0IGFycm93OiBBcnJvdyA9IG5ldyBBcnJvdygpO1xyXG4gICAgYXJyb3cueCA9IGNsYW1wVmFsdWVUb1JhbmdlKG1vdXNlWCwgMCwgY2FudmFzMmQud2lkdGgpO1xyXG4gICAgYXJyb3cueSA9IGNsYW1wVmFsdWVUb1JhbmdlKG1vdXNlWSwgMCwgY2FudmFzMmQuaGVpZ2h0KTtcclxuICAgIFxyXG4gICAgbGV0IHZlbG9jaXR5TWFnbml0dWRlUGl4ZWxzUGVyTWlsbGlzZWNvbmQ6IG51bWJlciA9IDAuNDtcclxuICAgIGxldCByYW5kb21BbmdsZTogbnVtYmVyID0gTWF0aC5yYW5kb20oKSAqIDIgKiBNYXRoLlBJO1xyXG4gICAgYXJyb3cudmVsb2NpdHlYID0gTWF0aC5jb3MocmFuZG9tQW5nbGUpICogdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDtcclxuICAgIGFycm93LnZlbG9jaXR5WSA9IE1hdGguc2luKHJhbmRvbUFuZ2xlKSAqIHZlbG9jaXR5TWFnbml0dWRlUGl4ZWxzUGVyTWlsbGlzZWNvbmQ7XHJcblxyXG4gICAgYXJyb3cuY29sb3JJbmRleCA9IGdldFJhbmRvbUludEluY2x1c2l2ZSgwLCAxMSk7XHJcbiAgICBhcnJvdy5yb3RhdGlvbkluZGV4ID0gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKDAsIDMpO1xyXG5cclxuICAgIGFycm93cy5wdXNoKGFycm93KTtcclxuICAgIGZyYW1lc1dpdGhvdXRBU3RhdGVDaGFuZ2UgPSAtMTtcclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=