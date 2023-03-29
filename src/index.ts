
let canvas = <HTMLCanvasElement> document.getElementById("arrowBenchCanvas");
canvas.width = 1920;
canvas.height = 1080;
let ctx: CanvasRenderingContext2D = canvas.getContext("2d");

let arrowCounter = <HTMLSpanElement> document.getElementById("arrowCounter");
let fpsCounter = <HTMLSpanElement> document.getElementById("fpsCounter");

let arrowSize: number = 40;
let halfArrowSize: number = arrowSize / 2;

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

let arrowCacheResized: HTMLCanvasElement[][];
let arrowCacheNotResized: HTMLCanvasElement[][];

function createResizedCache() {
    arrowCacheResized = [];
    for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
        let colorCache: HTMLCanvasElement[] = []
        for (let colorIndex = 0; colorIndex < arrowColors.length; colorIndex++) {
            let canvas: HTMLCanvasElement = document.createElement("canvas");
            canvas.width = arrowSize;
            canvas.height = arrowSize;
            let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
            drawArrowToCacheResized(ctx, rotationIndex, colorIndex);
            colorCache.push(canvas);
        }
        arrowCacheResized.push(colorCache);
    }
}

function drawArrowToCacheResized(ctx: CanvasRenderingContext2D, rotationIndex: number, colorIndex: number) {
    ctx.save();
    ctx.translate(halfArrowSize, halfArrowSize);
    ctx.rotate(rotationIndex * Math.PI / 2);
    ctx.drawImage(arrowColors[colorIndex], -halfArrowSize, -halfArrowSize, arrowSize, arrowSize);
    ctx.restore();
}

function createNotResizedCache() {
    arrowCacheNotResized = [];
    for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
        let colorCache: HTMLCanvasElement[] = []
        for (let colorIndex = 0; colorIndex < arrowColors.length; colorIndex++) {
            let canvas: HTMLCanvasElement = document.createElement("canvas");
            canvas.width = arrowSize;
            canvas.height = arrowSize;
            let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
            drawArrowToCacheNotResized(ctx, rotationIndex, colorIndex);
            colorCache.push(canvas);
        }
        arrowCacheNotResized.push(colorCache);
    }
}

function drawArrowToCacheNotResized(ctx: CanvasRenderingContext2D, rotationIndex: number, colorIndex: number) {
    let arrowSize: number = arrowColors[colorIndex].height;
    let halfArrowSize = arrowSize / 2;
    ctx.save();
    ctx.translate(halfArrowSize, halfArrowSize);
    ctx.rotate(rotationIndex * Math.PI / 2);
    ctx.drawImage(arrowColors[colorIndex], -halfArrowSize, -halfArrowSize, arrowSize, arrowSize);
    ctx.restore();
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
        createResizedCache();
        createNotResizedCache();
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

document.addEventListener("mousedown", (e: MouseEvent) => { mouseDown = true; });
document.addEventListener("mouseup", (e: MouseEvent) => { mouseDown = false; });
document.addEventListener("mousemove", (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

let previousFrameTimes: number[] = [];
let numFrameTimesToRemember: number = 100;

let arrows: Arrow[] = [];

class Arrow {
    public x: number;
    public y: number;
    public velocityX: number;
    public velocityY: number;
    public colorIndex: number;
    public rotationIndex: number;
}

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

    // simiulate the arrows
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
            if (arrows[i].x + halfArrowSize > canvas.width) { // donk on the right
                arrows[i].x -= 2 * (arrows[i].x + halfArrowSize - canvas.width);
                arrows[i].velocityX = -arrows[i].velocityX;
            }
            if (arrows[i].y + halfArrowSize > canvas.height) { // donk on the bottom
                arrows[i].y -= 2 * (arrows[i].y + halfArrowSize - canvas.height);
                arrows[i].velocityY = -arrows[i].velocityY;
            }
        }
    }

    if (mouseDown) {
        generateArrow();
    }

    // update the UI
    arrowCounter.innerText = arrows.length.toString();
    if (previousFrameTimes.length > 1) {
        fpsCounter.innerHTML = Math.round(1000 / deltaTimeMillis).toString();
    } else {
        fpsCounter.innerHTML = "unknown";
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the arrows
    for (let i = 0; i < arrows.length; i++) {
        drawArrow(arrows[i]);
    }

    window.requestAnimationFrame(draw);
}

function generateArrow() {
    let arrow: Arrow = new Arrow();
    arrow.x = clampValueToRange(mouseX, 0, canvas.width);
    arrow.y = clampValueToRange(mouseY, 0, canvas.height);
    
    let velocityMagnitudePixelsPerMillisecond: number = 0.4;
    let randomAngle: number = Math.random() * 2 * Math.PI;
    arrow.velocityX = Math.cos(randomAngle) * velocityMagnitudePixelsPerMillisecond;
    arrow.velocityY = Math.sin(randomAngle) * velocityMagnitudePixelsPerMillisecond;

    arrow.colorIndex = getRandomIntInclusive(0, 11);
    arrow.rotationIndex = getRandomIntInclusive(0, 3);

    arrows.push(arrow);
}

function clampValueToRange(value: number, lowerBound: number, upperBound: number): number {
    if (value < lowerBound) {
        return lowerBound;
    }
    if (value > upperBound) {
        return upperBound;
    }
    return value;
}

function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function drawArrow(arrow: Arrow) {
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotationIndex * Math.PI / 2);
    ctx.drawImage(arrowColors[arrow.colorIndex], -halfArrowSize, -halfArrowSize, arrowSize, arrowSize);
    ctx.restore();
}

function drawArrowNoResizing(arrow: Arrow) {
    let cachedCanvas: HTMLCanvasElement = arrowCacheResized[0][arrow.colorIndex];
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotationIndex * Math.PI / 2);
    ctx.drawImage(cachedCanvas, -halfArrowSize, -halfArrowSize, arrowSize, arrowSize);
    ctx.restore();
}

function drawArrowNoRotating(arrow: Arrow) {
    let cachedCanvas: HTMLCanvasElement = arrowCacheNotResized[arrow.rotationIndex][arrow.colorIndex];
    ctx.save();
    ctx.drawImage(cachedCanvas, arrow.x - halfArrowSize, arrow.y - halfArrowSize, arrowSize, arrowSize);
    ctx.restore();
}

function drawArrowNoReszingOrRotating(arrow: Arrow) {
    let cachedCanvas: HTMLCanvasElement = arrowCacheResized[arrow.rotationIndex][arrow.colorIndex];
    ctx.save();
    ctx.drawImage(cachedCanvas, arrow.x - halfArrowSize, arrow.y - halfArrowSize, arrowSize, arrowSize);
    ctx.restore();
}
