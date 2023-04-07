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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVELFNBQVMsYUFBYTtJQUNsQixJQUFJLEtBQUssR0FBVSxJQUFJLHlDQUFLLEVBQUUsQ0FBQztJQUMvQixLQUFLLENBQUMsQ0FBQyxHQUFHLHdEQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELEtBQUssQ0FBQyxDQUFDLEdBQUcsd0RBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFeEQsSUFBSSxxQ0FBcUMsR0FBVyxHQUFHLENBQUM7SUFDeEQsSUFBSSxXQUFXLEdBQVcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3RELEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxxQ0FBcUMsQ0FBQztJQUNoRixLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcscUNBQXFDLENBQUM7SUFFaEYsS0FBSyxDQUFDLFVBQVUsR0FBRyw0REFBcUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDaEQsS0FBSyxDQUFDLGFBQWEsR0FBRyw0REFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQix5QkFBeUIsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhwb3J0cy8uL3NyYy9hcnJvdy50cyIsIndlYnBhY2s6Ly9leHBvcnRzLy4vc3JjL3V0aWwudHMiLCJ3ZWJwYWNrOi8vZXhwb3J0cy8uL3NyYy93ZWJnbC50cyIsIndlYnBhY2s6Ly9leHBvcnRzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4cG9ydHMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4cG9ydHMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leHBvcnRzL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhwb3J0cy8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQXJyb3cge1xyXG4gICAgcHVibGljIHg6IG51bWJlcjtcclxuICAgIHB1YmxpYyB5OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdmVsb2NpdHlYOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdmVsb2NpdHlZOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgY29sb3JJbmRleDogbnVtYmVyO1xyXG4gICAgcHVibGljIHJvdGF0aW9uSW5kZXg6IG51bWJlcjtcclxufVxyXG4iLCJleHBvcnQgZnVuY3Rpb24gcm91bmRUb05QbGFjZXMoeDogbnVtYmVyLCBudW1QbGFjZXM6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBsZXQgc2NhbGU6IG51bWJlciA9IE1hdGgucG93KDEwLCBudW1QbGFjZXMpO1xyXG4gICAgcmV0dXJuIE1hdGgucm91bmQoeCAqIHNjYWxlKSAvIHNjYWxlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xhbXBWYWx1ZVRvUmFuZ2UodmFsdWU6IG51bWJlciwgbG93ZXJCb3VuZDogbnVtYmVyLCB1cHBlckJvdW5kOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgaWYgKHZhbHVlIDwgbG93ZXJCb3VuZCkge1xyXG4gICAgICAgIHJldHVybiBsb3dlckJvdW5kO1xyXG4gICAgfVxyXG4gICAgaWYgKHZhbHVlID4gdXBwZXJCb3VuZCkge1xyXG4gICAgICAgIHJldHVybiB1cHBlckJvdW5kO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcclxuICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xyXG59XHJcbiIsImltcG9ydCB7IEFycm93IH0gZnJvbSBcIi4vYXJyb3dcIjtcclxuXHJcbmxldCBvZmZzZXRMb2NhdGlvbjogbnVtYmVyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVTaGFkZXJzKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBhcnJvd1NpemU6IG51bWJlcikge1xyXG4gICAgbGV0IGhhbGZBcnJvd1NpemU6IG51bWJlciA9IGFycm93U2l6ZSAvIDI7XHJcblxyXG4gICAgbGV0IHZlcnRleFNoYWRlclNyYyA9IGBcclxuICAgICAgICBhdHRyaWJ1dGUgdmVjMiBhX3Bvc2l0aW9uO1xyXG4gICAgICAgIGF0dHJpYnV0ZSB2ZWM0IGFfaW5zdGFuY2U7XHJcbiAgICAgICAgdW5pZm9ybSBtYXQzIHVfbWF0cml4O1xyXG4gICAgICAgIHZhcnlpbmcgdmVjMiB2X3RleENvb3JkO1xyXG5cclxuICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgIHZlYzIgY2FudmFzX3Bvc2l0aW9uID0gYV9wb3NpdGlvbiAqIHZlYzIoJHthcnJvd1NpemV9LCAke2Fycm93U2l6ZX0pICsgYV9pbnN0YW5jZS54eSArIHZlYzIoLSR7aGFsZkFycm93U2l6ZX0sIC0ke2hhbGZBcnJvd1NpemV9KTtcclxuICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHVfbWF0cml4ICogdmVjMyhjYW52YXNfcG9zaXRpb24sIDEpLCAxKSArIHZlYzQoLTEsIDEsIDAsIDApO1xyXG4gICAgICAgICAgICB2X3RleENvb3JkID0gYV9wb3NpdGlvbiAvIHZlYzIoMTIsIDQpICsgdmVjMihhX2luc3RhbmNlLncsIGFfaW5zdGFuY2UueikgLyB2ZWMyKDEyLCA0KTtcclxuICAgICAgICB9YFxyXG5cclxuICAgIGxldCBmcmFnbWVudFNoYWRlclNyYyA9IGBcclxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuICAgICAgICB2YXJ5aW5nIHZlYzIgdl90ZXhDb29yZDtcclxuICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X2ltYWdlO1xyXG4gICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVfaW1hZ2UsIHZfdGV4Q29vcmQpO1xyXG4gICAgICAgIH1gXHJcblxyXG4gICAgbGV0IHZlcnRTaGFkZXJPYmogPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XHJcbiAgICBsZXQgZnJhZ1NoYWRlck9iaiA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xyXG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRTaGFkZXJPYmosIHZlcnRleFNoYWRlclNyYyk7XHJcbiAgICBnbC5zaGFkZXJTb3VyY2UoZnJhZ1NoYWRlck9iaiwgZnJhZ21lbnRTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0U2hhZGVyT2JqKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ1NoYWRlck9iaik7XHJcblxyXG4gICAgbGV0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydFNoYWRlck9iaik7XHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ1NoYWRlck9iaik7XHJcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XHJcblxyXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIodmVydFNoYWRlck9iaiwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY29tcGlsaW5nIHZlcnRleCBzaGFkZXI6JywgZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0U2hhZGVyT2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihmcmFnU2hhZGVyT2JqLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjb21waWxpbmcgZnJhZ21lbnQgc2hhZGVyOicsIGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ1NoYWRlck9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxpbmtpbmcgcHJvZ3JhbTonLCBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHVfbWF0cml4TG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIFwidV9tYXRyaXhcIik7XHJcbiAgICBsZXQgcG9zaXRpb25Mb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIFwiYV9wb3NpdGlvblwiKTtcclxuICAgIG9mZnNldExvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgXCJhX2luc3RhbmNlXCIpO1xyXG5cclxuICAgIGxldCBtYXRyaXggPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAyIC8gZ2wuY2FudmFzLndpZHRoLCAwLCAwLFxyXG4gICAgICAgIDAsIC0yIC8gZ2wuY2FudmFzLmhlaWdodCwgMCxcclxuICAgICAgICAwLCAwLCAxLFxyXG4gICAgXSk7XHJcbiAgICBnbC51bmlmb3JtTWF0cml4M2Z2KHVfbWF0cml4TG9jLCBmYWxzZSwgbWF0cml4KTtcclxuXHJcbiAgICBsZXQgcG9zaXRpb25CdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBwb3NpdGlvbkJ1ZmZlcik7XHJcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgMC4wLCAgMC4wLFxyXG4gICAgICAgIDEuMCwgIDAuMCxcclxuICAgICAgICAwLjAsICAxLjAsXHJcbiAgICAgICAgMC4wLCAgMS4wLFxyXG4gICAgICAgIDEuMCwgIDAuMCxcclxuICAgICAgICAxLjAsICAxLjAsXHJcbiAgICBdKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocG9zaXRpb25Mb2NhdGlvbik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHBvc2l0aW9uTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblxyXG4gICAgbGV0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblxyXG4gICAgLy8gZW5hYmxlIGFscGhhIGJsZW5kaW5nXHJcbiAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xyXG4gICAgZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRTaGFkZXJUZXh0dXJlKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBpbWFnZTogSFRNTENhbnZhc0VsZW1lbnQpIHtcclxuICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZHJhd0Fycm93c0dsKGdsOldlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGFycm93czogQXJyb3dbXSkge1xyXG4gICAgLy8gQ3JlYXRlIGEgYnVmZmVyIHRvIHN0b3JlIHRoZSBwZXItaW5zdGFuY2UgZGF0YVxyXG4gICAgbGV0IGluc3RhbmNlQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgaW5zdGFuY2VCdWZmZXIpO1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIHRoZSBpbnN0YW5jZSBidWZmZXIgd2l0aCBwZXItaW5zdGFuY2UgZGF0YVxyXG4gICAgbGV0IGluc3RhbmNlVmVjdG9yczogbnVtYmVyW10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaW5zdGFuY2VWZWN0b3JzLnB1c2goYXJyb3dzW2ldLngpO1xyXG4gICAgICAgIGluc3RhbmNlVmVjdG9ycy5wdXNoKGFycm93c1tpXS55KTtcclxuICAgICAgICBpbnN0YW5jZVZlY3RvcnMucHVzaChhcnJvd3NbaV0ucm90YXRpb25JbmRleCk7XHJcbiAgICAgICAgaW5zdGFuY2VWZWN0b3JzLnB1c2goYXJyb3dzW2ldLmNvbG9ySW5kZXgpO1xyXG4gICAgfVxyXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoaW5zdGFuY2VWZWN0b3JzKSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cclxuICAgIC8vIEJpbmQgdGhlIGluc3RhbmNlIGJ1ZmZlciB0byB0aGUgYV9pbnN0YW5jZSBhdHRyaWJ1dGVcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KG9mZnNldExvY2F0aW9uKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIob2Zmc2V0TG9jYXRpb24sIDQsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKG9mZnNldExvY2F0aW9uLCAxKTtcclxuXHJcbiAgICBnbC5kcmF3QXJyYXlzSW5zdGFuY2VkKGdsLlRSSUFOR0xFUywgMCwgNiwgYXJyb3dzLmxlbmd0aCk7XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBBcnJvdyB9IGZyb20gXCIuL2Fycm93XCI7XHJcbmltcG9ydCB7IGNsYW1wVmFsdWVUb1JhbmdlLCBnZXRSYW5kb21JbnRJbmNsdXNpdmUsIHJvdW5kVG9OUGxhY2VzIH0gZnJvbSBcIi4vdXRpbFwiO1xyXG5pbXBvcnQgeyBkcmF3QXJyb3dzR2wsIGluaXRpYWxpemVTaGFkZXJzLCBzZXRTaGFkZXJUZXh0dXJlIH0gZnJvbSBcIi4vd2ViZ2xcIjtcclxuXHJcbmxldCBjYW52YXMyZCA9IDxIVE1MQ2FudmFzRWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0JlbmNoMmRDYW52YXNcIik7XHJcbmNhbnZhczJkLndpZHRoID0gMTkyMDtcclxuY2FudmFzMmQuaGVpZ2h0ID0gMTA4MDtcclxubGV0IGNhbnZhc2dsID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93QmVuY2hXZWJHTENhbnZhc1wiKTtcclxuY2FudmFzZ2wud2lkdGggPSAxOTIwO1xyXG5jYW52YXNnbC5oZWlnaHQgPSAxMDgwO1xyXG5sZXQgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgPSBjYW52YXMyZC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxubGV0IGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0ID0gY2FudmFzZ2wuZ2V0Q29udGV4dChcIndlYmdsMlwiKTtcclxuXHJcbmxldCBhcnJvd0NvdW50ZXIgPSA8SFRNTFNwYW5FbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93Q291bnRlclwiKTtcclxubGV0IGZwc0NvdW50ZXIgPSA8SFRNTFNwYW5FbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc0NvdW50ZXJcIik7XHJcbmxldCBhcnJvd3NQZXJNc0NvdW50ZXIgPSA8SFRNTFNwYW5FbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93c1Blck1zQ291bnRlclwiKTtcclxuXHJcbmxldCBhcnJvd1NpemVJbnB1dCA9IDxIVE1MSW5wdXRFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93U2l6ZUlucHV0XCIpO1xyXG5hcnJvd1NpemVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgYXJyb3dTaXplID0gYXJyb3dTaXplSW5wdXQudmFsdWVBc051bWJlcjtcclxuICAgIGhhbGZBcnJvd1NpemUgPSBhcnJvd1NpemUgLyAyO1xyXG4gICAgY3JlYXRlQ2FjaGVzKCk7XHJcbiAgICBpbml0aWFsaXplU2hhZGVycyhnbCwgYXJyb3dTaXplKTtcclxuICAgIHNldFNoYWRlclRleHR1cmUoZ2wsIGFycm93Q2FjaGVTcHJpdGVzaGVldCk7XHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID0gMDtcclxufSk7XHJcblxyXG5sZXQgc3Bhd25SYXRlSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcGF3blJhdGVJbnB1dFwiKTtcclxuc3Bhd25SYXRlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIHNwYXduUmF0ZSA9IE1hdGgucG93KHNwYXduUmF0ZUlucHV0LnZhbHVlQXNOdW1iZXIsIDMpO1xyXG4gICAgYXJyb3dzU3Bhd25lZFRoaXNNb3VzZURvd24gPSAwO1xyXG4gICAgbW91c2VEb3duU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxufSk7XHJcblxyXG5sZXQgY2xlYXJBcnJvd3NCdXR0b24gPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXJBcnJvd3NCdXR0b25cIik7XHJcbmNsZWFyQXJyb3dzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBhcnJvd3MgPSBbXTtcclxufSk7XHJcblxyXG5sZXQgZHJhd01ldGhvZFdlYkdMSW5wdXQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkcmF3TWV0aG9kV2ViR0xcIik7XHJcbmRyYXdNZXRob2RXZWJHTElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID0gMDtcclxufSk7XHJcbmxldCBkcmF3TWV0aG9kU29mdHdhcmVJbnB1dCA9IDxIVE1MSW5wdXRFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRyYXdNZXRob2RTb2Z0d2FyZVwiKTtcclxuZHJhd01ldGhvZFNvZnR3YXJlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgIGZyYW1lc1dpdGhvdXRBU3RhdGVDaGFuZ2UgPSAwO1xyXG59KTtcclxuXHJcbmxldCBhcnJvd1NpemU6IG51bWJlciA9IGFycm93U2l6ZUlucHV0LnZhbHVlQXNOdW1iZXI7XHJcbmxldCBoYWxmQXJyb3dTaXplOiBudW1iZXIgPSBhcnJvd1NpemUgLyAyO1xyXG5sZXQgc3Bhd25SYXRlOiBudW1iZXIgPSBNYXRoLnBvdyhzcGF3blJhdGVJbnB1dC52YWx1ZUFzTnVtYmVyLCAzKTtcclxubGV0IG1vdXNlRG93blN0YXJ0OiBudW1iZXI7XHJcbmxldCBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93bjogbnVtYmVyO1xyXG5cclxuaW5pdGlhbGl6ZVNoYWRlcnMoZ2wsIGFycm93U2l6ZSk7XHJcblxyXG5sZXQgbm90ZXNraW40dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl80dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjh0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzh0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMTJ0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzEydGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjE2dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8xNnRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4yMHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fMjB0aC5wbmdcIjtcclxubGV0IG5vdGVza2luMjR0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzI0dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjMybmRQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl8zMm5kLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW40OHRoUGF0aDogc3RyaW5nID0gXCIuLi9hc3NldHMvbm90ZXNraW5fNDh0aC5wbmdcIjtcclxubGV0IG5vdGVza2luNjR0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzY0dGgucG5nXCI7XHJcbmxldCBub3Rlc2tpbjk2dGhQYXRoOiBzdHJpbmcgPSBcIi4uL2Fzc2V0cy9ub3Rlc2tpbl85NnRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4xMjh0aFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzEyOHRoLnBuZ1wiO1xyXG5sZXQgbm90ZXNraW4xOTJuZFBhdGg6IHN0cmluZyA9IFwiLi4vYXNzZXRzL25vdGVza2luXzE5Mm5kLnBuZ1wiO1xyXG5sZXQgcHJlbG9hZFJlZ2lzdHJ5OiBNYXA8c3RyaW5nLCBib29sZWFuPiA9IG5ldyBNYXAoKTtcclxuXHJcbmxldCBhcnJvd0NvbG9yczogSFRNTEltYWdlRWxlbWVudFtdID0gW1xyXG4gICAgbG9hZEltYWdlKG5vdGVza2luNHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW44dGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjEydGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjE2dGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjIwdGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjI0dGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjMybmRQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjQ4dGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjY0dGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjk2dGhQYXRoKSxcclxuICAgIGxvYWRJbWFnZShub3Rlc2tpbjEyOHRoUGF0aCksXHJcbiAgICBsb2FkSW1hZ2Uobm90ZXNraW4xOTJuZFBhdGgpLFxyXG5dO1xyXG5cclxubGV0IGFycm93Q2FjaGVTcHJpdGVzaGVldDogSFRNTENhbnZhc0VsZW1lbnQ7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDYWNoZXMoKSB7XHJcbiAgICBjcmVhdGVGdWxsUmVzaXplZFNwcml0ZXNoZWV0KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUZ1bGxSZXNpemVkU3ByaXRlc2hlZXQoKSB7XHJcbiAgICBhcnJvd0NhY2hlU3ByaXRlc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0LndpZHRoID0gYXJyb3dDb2xvcnMubGVuZ3RoICogYXJyb3dTaXplO1xyXG4gICAgYXJyb3dDYWNoZVNwcml0ZXNoZWV0LmhlaWdodCA9IDQgKiBhcnJvd1NpemU7XHJcbiAgICBsZXQgc3ByaXRlc2hlZXRDdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCA9IGFycm93Q2FjaGVTcHJpdGVzaGVldC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICBmb3IgKGxldCByb3RhdGlvbkluZGV4ID0gMDsgcm90YXRpb25JbmRleCA8IDQ7IHJvdGF0aW9uSW5kZXgrKykge1xyXG4gICAgICAgIGxldCByb3RhdGlvbjogbnVtYmVyID0gcm90YXRpb25JbmRleCAqIE1hdGguUEkgLyAyO1xyXG4gICAgICAgIGZvciAobGV0IGNvbG9ySW5kZXggPSAwOyBjb2xvckluZGV4IDwgYXJyb3dDb2xvcnMubGVuZ3RoOyBjb2xvckluZGV4KyspIHtcclxuICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uWDogbnVtYmVyID0gY29sb3JJbmRleCAqIGFycm93U2l6ZTtcclxuICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uWTogbnVtYmVyID0gcm90YXRpb25JbmRleCAqIGFycm93U2l6ZTtcclxuICAgICAgICAgICAgc3ByaXRlc2hlZXRDdHgudHJhbnNsYXRlKGRlc3RpbmF0aW9uWCArIGhhbGZBcnJvd1NpemUsIGRlc3RpbmF0aW9uWSArIGhhbGZBcnJvd1NpemUpO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC5yb3RhdGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICBhcnJvd0NvbG9yc1tjb2xvckluZGV4XSxcclxuICAgICAgICAgICAgICAgIC1oYWxmQXJyb3dTaXplLFxyXG4gICAgICAgICAgICAgICAgLWhhbGZBcnJvd1NpemUsXHJcbiAgICAgICAgICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHNwcml0ZXNoZWV0Q3R4LnJvdGF0ZSgtcm90YXRpb24pO1xyXG4gICAgICAgICAgICBzcHJpdGVzaGVldEN0eC50cmFuc2xhdGUoLShkZXN0aW5hdGlvblggKyBoYWxmQXJyb3dTaXplKSwgLShkZXN0aW5hdGlvblkgKyBoYWxmQXJyb3dTaXplKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBOb3RlOiBcclxuLy8gVHJhbnNmb3JtaW5nIGFuZCB0aGVuIHVudHJhbnNmb3JtaW5nIGlzIGZhc3RlciB0aGFuIHVzaW5nIHNhdmUvcmVzdG9yZVxyXG4vLyBEcmF3aW5nIHRoZSByZXNpemVkIGFycm93IHRvIGFuIG9mZnNjcmVlbiBjYW52YXMgc28gdGhhdCBkcmF3SW1hZ2VcclxuLy8gICAgIGRvZXNuJ3QgaGF2ZSB0byByZXNpemUgaXMgc2lnbmlmaWNhbnRseSBmYXN0ZXIgKGV4Y2VwdCBvbiBGaXJlRm94IHdoZXJlIGl0J3Mgb25seSBsaWtlIDMlIGZhc3RlcilcclxuLy8gRm9yIHNvbWUgcmVhc29uLCBbMF1bYXJyb3cuY29sb3JJbmRleF0gaXMgZmFzdGVyIHRoYW4gW2Fycm93LnJvdGF0aW9uSW5kZXhdW2Fycm93LmNvbG9ySW5kZXhdXHJcbi8vIERyYXdpbmcgZnJvbSBhbiBIVE1MQ2FudmFzRWxlbWVudCBpcyBmYXN0ZXIgdGhhbiBkcmF3aW5nIGZyb20gYW4gSFRNTEltYWdlRWxlbWVudFxyXG4vLyBEcmF3aW5nIGZyb20gc2luZ2xlIHNwcml0ZXNoZWV0IGlzIGFib3V0IDgwJSBmYXN0ZXIgdGhhbiBkcmF3aW5nIGZyb20gNDggc2VwYXJhdGUgY2FudmFzZXNcclxuZnVuY3Rpb24gZHJhd0Zyb21GdWxsUmVzaXplZFNwcml0ZXNoZWV0KGFycm93OiBBcnJvdykge1xyXG4gICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICBhcnJvd0NhY2hlU3ByaXRlc2hlZXQsXHJcbiAgICAgICAgYXJyb3cuY29sb3JJbmRleCAqIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvdy5yb3RhdGlvbkluZGV4ICogYXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93U2l6ZSxcclxuICAgICAgICBhcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3cueCAtIGhhbGZBcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3cueSAtIGhhbGZBcnJvd1NpemUsXHJcbiAgICAgICAgYXJyb3dTaXplLFxyXG4gICAgICAgIGFycm93U2l6ZSxcclxuICAgICk7XHJcbn1cclxuXHJcbi8vIFNlZSB0aGlzIGlmIEkgZW5jb3VudGVyIHdlaXJkIGxvYWRpbmcgcHJvYmxlbXMgbGF0ZXI6XHJcbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyMzU0ODY1L2ltYWdlLW9ubG9hZC1ldmVudC1hbmQtYnJvd3Nlci1jYWNoZVxyXG5mdW5jdGlvbiBsb2FkSW1hZ2UoaW1hZ2VTb3VyY2U6IHN0cmluZyk6IEhUTUxJbWFnZUVsZW1lbnQge1xyXG4gICAgaWYgKHByZWxvYWRSZWdpc3RyeS5oYXMoaW1hZ2VTb3VyY2UpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGF0dGVtcHRlZCB0byBsb2FkIHRoZSBzYW1lIGltYWdlIHR3aWNlIGR1cmluZyBwcmVsb2FkaW5nLlwiKTtcclxuICAgIH1cclxuICAgIHByZWxvYWRSZWdpc3RyeS5zZXQoaW1hZ2VTb3VyY2UsIGZhbHNlKTtcclxuXHJcbiAgICAvLyBUaGUgb3JkZXIgdGhlc2UgMyB0aGluZ3MgYXJlIGRvbmUgaW4gaXMgVkVSWSBpbXBvcnRhbnQhXHJcbiAgICBsZXQgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICBwcmVsb2FkUmVnaXN0cnkuc2V0KGltYWdlU291cmNlLCB0cnVlKTtcclxuICAgIH1cclxuICAgIGltYWdlLnNyYyA9IGltYWdlU291cmNlO1xyXG5cclxuICAgIHJldHVybiBpbWFnZTtcclxufVxyXG5cclxubGV0IHByZWxvYWRJbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgaWYgKHByZWxvYWREb25lKCkpIHtcclxuICAgICAgICBjbGVhckludGVydmFsKHByZWxvYWRJbnRlcnZhbElkKTtcclxuICAgICAgICBjcmVhdGVDYWNoZXMoKTtcclxuICAgICAgICBzZXRTaGFkZXJUZXh0dXJlKGdsLCBhcnJvd0NhY2hlU3ByaXRlc2hlZXQpO1xyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XHJcbiAgICB9XHJcbn0sIDEwMCk7XHJcblxyXG5mdW5jdGlvbiBwcmVsb2FkRG9uZSgpOiBib29sZWFuIHtcclxuICAgIGZvciAobGV0IFtrZXksIGxvYWRlZF0gb2YgcHJlbG9hZFJlZ2lzdHJ5KSB7XHJcbiAgICAgICAgaWYgKCFsb2FkZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxubGV0IG1vdXNlRG93bjogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgbW91c2VYOiBudW1iZXIgPSAwO1xyXG5sZXQgbW91c2VZOiBudW1iZXIgPSAwO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duID0gMDtcclxuICAgIG1vdXNlRG93blN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbn0pO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZTogTW91c2VFdmVudCkgPT4geyBtb3VzZURvd24gPSBmYWxzZTsgfSk7XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgIG1vdXNlWCA9IGUuY2xpZW50WCAtIGNhbnZhczJkLm9mZnNldExlZnQ7XHJcbiAgICBtb3VzZVkgPSBlLmNsaWVudFk7XHJcbn0pO1xyXG5cclxubGV0IHByZXZpb3VzRnJhbWVUaW1lczogbnVtYmVyW10gPSBbXTtcclxubGV0IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyOiBudW1iZXIgPSAxMDA7XHJcbmxldCBmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlOiBudW1iZXIgPSAwO1xyXG5cclxubGV0IGFycm93czogQXJyb3dbXSA9IFtdO1xyXG5cclxubGV0IGxvZ0NvdW50ZXI6IG51bWJlciA9IDA7XHJcblxyXG5mdW5jdGlvbiBkcmF3KGN1cnJlbnRUaW1lTWlsbGlzOiBudW1iZXIpIHtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID49IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyKSB7XHJcbiAgICAgICAgcHJldmlvdXNGcmFtZVRpbWVzLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBwcmV2aW91c0ZyYW1lVGltZXMucHVzaChjdXJyZW50VGltZU1pbGxpcyk7XHJcblxyXG4gICAgbGV0IGRlbHRhVGltZU1pbGxpczogbnVtYmVyO1xyXG4gICAgaWYgKHByZXZpb3VzRnJhbWVUaW1lcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZGVsdGFUaW1lTWlsbGlzID0gY3VycmVudFRpbWVNaWxsaXMgLSBwcmV2aW91c0ZyYW1lVGltZXNbcHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCAtIDJdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb3VzZURvd24pIHtcclxuICAgICAgICBsZXQgbW91c2VEb3duRGVsdGFNaWxsaXM6IG51bWJlciA9IGN1cnJlbnRUaW1lTWlsbGlzIC0gbW91c2VEb3duU3RhcnQ7XHJcbiAgICAgICAgbGV0IGV4cGVjdGVkQXJyb3dzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1vdXNlRG93bkRlbHRhTWlsbGlzICogc3Bhd25SYXRlIC8gMTAwMCk7XHJcbiAgICAgICAgd2hpbGUgKGFycm93c1NwYXduZWRUaGlzTW91c2VEb3duIDwgZXhwZWN0ZWRBcnJvd3MpIHtcclxuICAgICAgICAgICAgZ2VuZXJhdGVBcnJvdygpO1xyXG4gICAgICAgICAgICBhcnJvd3NTcGF3bmVkVGhpc01vdXNlRG93bisrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBzaW11bGF0ZSB0aGUgYXJyb3dzXHJcbiAgICBpZiAocHJldmlvdXNGcmFtZVRpbWVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhcnJvd3NbaV0ueCArPSBhcnJvd3NbaV0udmVsb2NpdHlYICogZGVsdGFUaW1lTWlsbGlzO1xyXG4gICAgICAgICAgICBhcnJvd3NbaV0ueSArPSBhcnJvd3NbaV0udmVsb2NpdHlZICogZGVsdGFUaW1lTWlsbGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS54IC0gaGFsZkFycm93U2l6ZSA8IDApIHsgLy8gZG9uayBvbiB0aGUgbGVmdFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnggKz0gMiAqIChoYWxmQXJyb3dTaXplIC0gYXJyb3dzW2ldLngpO1xyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnZlbG9jaXR5WCA9IC1hcnJvd3NbaV0udmVsb2NpdHlYO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhcnJvd3NbaV0ueSAtIGhhbGZBcnJvd1NpemUgPCAwKSB7IC8vIGRvbmsgb24gdGhlIHRvcFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnkgKz0gMiAqIChoYWxmQXJyb3dTaXplIC0gYXJyb3dzW2ldLnkpO1xyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnZlbG9jaXR5WSA9IC1hcnJvd3NbaV0udmVsb2NpdHlZO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhcnJvd3NbaV0ueCArIGhhbGZBcnJvd1NpemUgPiBjYW52YXMyZC53aWR0aCkgeyAvLyBkb25rIG9uIHRoZSByaWdodFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzW2ldLnggLT0gMiAqIChhcnJvd3NbaV0ueCArIGhhbGZBcnJvd1NpemUgLSBjYW52YXMyZC53aWR0aCk7XHJcbiAgICAgICAgICAgICAgICBhcnJvd3NbaV0udmVsb2NpdHlYID0gLWFycm93c1tpXS52ZWxvY2l0eVg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFycm93c1tpXS55ICsgaGFsZkFycm93U2l6ZSA+IGNhbnZhczJkLmhlaWdodCkgeyAvLyBkb25rIG9uIHRoZSBib3R0b21cclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS55IC09IDIgKiAoYXJyb3dzW2ldLnkgKyBoYWxmQXJyb3dTaXplIC0gY2FudmFzMmQuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGFycm93c1tpXS52ZWxvY2l0eVkgPSAtYXJyb3dzW2ldLnZlbG9jaXR5WTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHRvcCBVSVxyXG4gICAgYXJyb3dDb3VudGVyLmlubmVyVGV4dCA9IGFycm93cy5sZW5ndGgudG9TdHJpbmcoKTtcclxuICAgIGlmIChwcmV2aW91c0ZyYW1lVGltZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZwc0NvdW50ZXIuaW5uZXJUZXh0ID0gTWF0aC5yb3VuZCgxMDAwIC8gZGVsdGFUaW1lTWlsbGlzKS50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBmcHNDb3VudGVyLmlubmVyVGV4dCA9IFwiY2FsY3VsYXRpbmcuLi5cIjtcclxuICAgIH1cclxuICAgIGlmIChmcmFtZXNXaXRob3V0QVN0YXRlQ2hhbmdlID49IG51bUZyYW1lVGltZXNUb1JlbWVtYmVyKSB7XHJcbiAgICAgICAgYXJyb3dzUGVyTXNDb3VudGVyLmlubmVyVGV4dCA9IHJvdW5kVG9OUGxhY2VzKFxyXG4gICAgICAgICAgICBhcnJvd3MubGVuZ3RoXHJcbiAgICAgICAgICAgIC8gKGN1cnJlbnRUaW1lTWlsbGlzIC0gcHJldmlvdXNGcmFtZVRpbWVzWzBdKVxyXG4gICAgICAgICAgICAqIG51bUZyYW1lVGltZXNUb1JlbWVtYmVyXHJcbiAgICAgICAgICAgICwgMikudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXJyb3dzUGVyTXNDb3VudGVyLmlubmVyVGV4dCA9IFwiY2FsY3VsYXRpbmcuLi5cIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMyZC53aWR0aCwgY2FudmFzMmQuaGVpZ2h0KTtcclxuXHJcbiAgICAvLyBkcmF3IHRoZSBhcnJvd3NcclxuICAgIGlmIChkcmF3TWV0aG9kV2ViR0xJbnB1dC5jaGVja2VkKSB7XHJcbiAgICAgICAgZHJhd0Fycm93c0dsKGdsLCBhcnJvd3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBkcmF3RnJvbUZ1bGxSZXNpemVkU3ByaXRlc2hlZXQoYXJyb3dzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSsrO1xyXG5cclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXJyb3coKSB7XHJcbiAgICBsZXQgYXJyb3c6IEFycm93ID0gbmV3IEFycm93KCk7XHJcbiAgICBhcnJvdy54ID0gY2xhbXBWYWx1ZVRvUmFuZ2UobW91c2VYLCAwLCBjYW52YXMyZC53aWR0aCk7XHJcbiAgICBhcnJvdy55ID0gY2xhbXBWYWx1ZVRvUmFuZ2UobW91c2VZLCAwLCBjYW52YXMyZC5oZWlnaHQpO1xyXG4gICAgXHJcbiAgICBsZXQgdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDogbnVtYmVyID0gMC40O1xyXG4gICAgbGV0IHJhbmRvbUFuZ2xlOiBudW1iZXIgPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XHJcbiAgICBhcnJvdy52ZWxvY2l0eVggPSBNYXRoLmNvcyhyYW5kb21BbmdsZSkgKiB2ZWxvY2l0eU1hZ25pdHVkZVBpeGVsc1Blck1pbGxpc2Vjb25kO1xyXG4gICAgYXJyb3cudmVsb2NpdHlZID0gTWF0aC5zaW4ocmFuZG9tQW5nbGUpICogdmVsb2NpdHlNYWduaXR1ZGVQaXhlbHNQZXJNaWxsaXNlY29uZDtcclxuXHJcbiAgICBhcnJvdy5jb2xvckluZGV4ID0gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKDAsIDExKTtcclxuICAgIGFycm93LnJvdGF0aW9uSW5kZXggPSBnZXRSYW5kb21JbnRJbmNsdXNpdmUoMCwgMyk7XHJcblxyXG4gICAgYXJyb3dzLnB1c2goYXJyb3cpO1xyXG4gICAgZnJhbWVzV2l0aG91dEFTdGF0ZUNoYW5nZSA9IC0xO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==