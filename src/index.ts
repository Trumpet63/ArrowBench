import { Arrow } from "./arrow";
import { clampValueToRange, getRandomIntInclusive, roundToNPlaces } from "./util";
import { drawArrowsGl, initializeShaders, setShaderTexture } from "./webgl";

let canvas2d = <HTMLCanvasElement> document.getElementById("arrowBench2dCanvas");
canvas2d.width = 1920;
canvas2d.height = 1080;
let canvasgl = <HTMLCanvasElement> document.getElementById("arrowBenchWebGLCanvas");
canvasgl.width = 1920;
canvasgl.height = 1080;
let ctx: CanvasRenderingContext2D = canvas2d.getContext("2d");
ctx.imageSmoothingEnabled = false;
let gl: WebGL2RenderingContext = canvasgl.getContext("webgl2");

let arrowCounter = <HTMLSpanElement> document.getElementById("arrowCounter");
let fpsCounter = <HTMLSpanElement> document.getElementById("fpsCounter");
let arrowsPerMsCounter = <HTMLSpanElement> document.getElementById("arrowsPerMsCounter");

let arrowSizeInput = <HTMLInputElement> document.getElementById("arrowSizeInput");
arrowSizeInput.addEventListener("input", () => {
    arrowSize = arrowSizeInput.valueAsNumber;
    halfArrowSize = arrowSize / 2;
    createCaches();
    initializeShaders(gl, arrowSize);
    setShaderTexture(gl, arrowCacheSpritesheet);
    framesWithoutAStateChange = 0;
});

let arrowSpeedInput = <HTMLInputElement> document.getElementById("arrowSpeedInput");
arrowSpeedInput.addEventListener("input", () => {
    speedModifier = arrowSpeedInput.valueAsNumber;
});

let spawnRateInput = <HTMLInputElement> document.getElementById("spawnRateInput");
spawnRateInput.addEventListener("input", () => {
    spawnRate = Math.pow(spawnRateInput.valueAsNumber, 3);
    arrowsSpawnedThisMouseDown = 0;
    mouseDownStart = performance.now();
});

let clearArrowsButton = <HTMLButtonElement> document.getElementById("clearArrowsButton");
clearArrowsButton.addEventListener("click", () => {
    arrows = [];
});

let drawMethodWebGLInput = <HTMLInputElement> document.getElementById("drawMethodWebGL");
drawMethodWebGLInput.addEventListener("input", () => {
    framesWithoutAStateChange = 0;
});
let drawMethodSoftwareInput = <HTMLInputElement> document.getElementById("drawMethodSoftware");
drawMethodSoftwareInput.addEventListener("input", () => {
    framesWithoutAStateChange = 0;
});

let arrowSize: number = arrowSizeInput.valueAsNumber;
let speedModifier: number = arrowSpeedInput.valueAsNumber;
let halfArrowSize: number = arrowSize / 2;
let spawnRate: number = Math.pow(spawnRateInput.valueAsNumber, 3);
let mouseDownStart: number;
let arrowsSpawnedThisMouseDown: number;

initializeShaders(gl, arrowSize);

let noteskin4thPath: string = "../assets/noteskin_4th.png";
let noteskin8thPath: string = "../assets/noteskin_8th.png";
let noteskin12thPath: string = "../assets/noteskin_12th.png";
let noteskin16thPath: string = "../assets/noteskin_16th.png";
let noteskin20thPath: string = "../assets/noteskin_20th.png";
let noteskin24thPath: string = "../assets/noteskin_24th.png";
let noteskin32ndPath: string = "../assets/noteskin_32nd.png";
let noteskin48thPath: string = "../assets/noteskin_48th.png";
let noteskin64thPath: string = "../assets/noteskin_64th.png";
let noteskin96thPath: string = "../assets/noteskin_96th.png";
let noteskin128thPath: string = "../assets/noteskin_128th.png";
let noteskin192ndPath: string = "../assets/noteskin_192nd.png";
let preloadRegistry: Map<string, boolean> = new Map();

let arrowColors: HTMLImageElement[] = [
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

let arrowCacheSpritesheet: HTMLCanvasElement;

function createCaches() {
    createFullResizedSpritesheet();
}

function createFullResizedSpritesheet() {
    arrowCacheSpritesheet = document.createElement("canvas");
    arrowCacheSpritesheet.width = arrowColors.length * arrowSize;
    arrowCacheSpritesheet.height = 4 * arrowSize;
    let spritesheetCtx: CanvasRenderingContext2D = arrowCacheSpritesheet.getContext("2d");
    for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
        let rotation: number = rotationIndex * Math.PI / 2;
        for (let colorIndex = 0; colorIndex < arrowColors.length; colorIndex++) {
            let destinationX: number = colorIndex * arrowSize;
            let destinationY: number = rotationIndex * arrowSize;
            spritesheetCtx.translate(destinationX + halfArrowSize, destinationY + halfArrowSize);
            spritesheetCtx.rotate(rotation);
            spritesheetCtx.drawImage(
                arrowColors[colorIndex],
                -halfArrowSize,
                -halfArrowSize,
                arrowSize,
                arrowSize,
            );
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
function drawFromFullResizedSpritesheet(arrow: Arrow) {
    ctx.drawImage(
        arrowCacheSpritesheet,
        arrow.colorIndex * arrowSize,
        arrow.rotationIndex * arrowSize,
        arrowSize,
        arrowSize,
        arrow.x - halfArrowSize,
        arrow.y - halfArrowSize,
        arrowSize,
        arrowSize,
    );
}

// See this if I encounter weird loading problems later:
// https://stackoverflow.com/questions/12354865/image-onload-event-and-browser-cache
function loadImage(imageSource: string): HTMLImageElement {
    if (preloadRegistry.has(imageSource)) {
        throw new Error("You attempted to load the same image twice during preloading.");
    }
    preloadRegistry.set(imageSource, false);

    // The order these 3 things are done in is VERY important!
    let image = new Image();
    image.onload = () => {
        preloadRegistry.set(imageSource, true);
    }
    image.src = imageSource;

    return image;
}

let preloadIntervalId = setInterval(() => {
    if (preloadDone()) {
        clearInterval(preloadIntervalId);
        createCaches();
        setShaderTexture(gl, arrowCacheSpritesheet);
        window.requestAnimationFrame(draw);
    }
}, 100);

function preloadDone(): boolean {
    for (let [key, loaded] of preloadRegistry) {
        if (!loaded) {
            return false;
        }
    };
    return true;
}

let mouseDown: boolean = false;
let mouseX: number = 0;
let mouseY: number = 0;

document.addEventListener("mousedown", (e: MouseEvent) => {
    mouseDown = true;
    arrowsSpawnedThisMouseDown = 0;
    mouseDownStart = performance.now();
});
document.addEventListener("mouseup", (e: MouseEvent) => { mouseDown = false; });
document.addEventListener("mousemove", (e: MouseEvent) => {
    mouseX = e.clientX - canvas2d.offsetLeft;
    mouseY = e.clientY;
});

let previousFrameTimes: number[] = [];
let numFrameTimesToRemember: number = 100;
let framesWithoutAStateChange: number = 0;

let arrows: Arrow[] = [];

let logCounter: number = 0;

function draw(currentTimeMillis: number) {
    if (previousFrameTimes.length >= numFrameTimesToRemember) {
        previousFrameTimes.shift();
    }
    previousFrameTimes.push(currentTimeMillis);

    let deltaTimeMillis: number;
    if (previousFrameTimes.length > 1) {
        deltaTimeMillis = currentTimeMillis - previousFrameTimes[previousFrameTimes.length - 2];
    }

    if (mouseDown) {
        let mouseDownDeltaMillis: number = currentTimeMillis - mouseDownStart;
        let expectedArrows: number = Math.floor(mouseDownDeltaMillis * spawnRate / 1000);
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
    } else {
        fpsCounter.innerText = "calculating...";
    }
    if (framesWithoutAStateChange >= numFrameTimesToRemember) {
        arrowsPerMsCounter.innerText = roundToNPlaces(
            arrows.length
            / (currentTimeMillis - previousFrameTimes[0])
            * numFrameTimesToRemember
            , 2).toString();
    } else {
        arrowsPerMsCounter.innerText = "calculating...";
    }
    
    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);

    // draw the arrows
    if (drawMethodWebGLInput.checked) {
        drawArrowsGl(gl, arrows);
    } else {
        gl.clear(gl.COLOR_BUFFER_BIT);
        for (let i = 0; i < arrows.length; i++) {
            drawFromFullResizedSpritesheet(arrows[i]);
        }
    }

    framesWithoutAStateChange++;

    window.requestAnimationFrame(draw);
}

function generateArrow() {
    let arrow: Arrow = new Arrow();
    arrow.x = clampValueToRange(mouseX, 0, canvas2d.width);
    arrow.y = clampValueToRange(mouseY, 0, canvas2d.height);
    
    let velocityMagnitudePixelsPerMillisecond: number = 0.4;
    let randomAngle: number = Math.random() * 2 * Math.PI;
    arrow.velocityX = Math.cos(randomAngle) * velocityMagnitudePixelsPerMillisecond;
    arrow.velocityY = Math.sin(randomAngle) * velocityMagnitudePixelsPerMillisecond;

    arrow.colorIndex = getRandomIntInclusive(0, 11);
    arrow.rotationIndex = getRandomIntInclusive(0, 3);

    arrows.push(arrow);
    framesWithoutAStateChange = -1;
}
