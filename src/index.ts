
let canvas = <HTMLCanvasElement> document.getElementById("arrowBenchCanvas");
canvas.width = 1920;
canvas.height = 1080;
let ctx: CanvasRenderingContext2D = canvas.getContext("2d");

let arrowCounter = <HTMLSpanElement> document.getElementById("arrowCounter");
let fpsCounter = <HTMLSpanElement> document.getElementById("fpsCounter");
let arrowsPerMsCounter = <HTMLSpanElement> document.getElementById("arrowsPerMsCounter");

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
    let arrowImageSize: number = arrowColors[0].height;
    for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
        let colorCache: HTMLCanvasElement[] = []
        for (let colorIndex = 0; colorIndex < arrowColors.length; colorIndex++) {
            let canvas: HTMLCanvasElement = document.createElement("canvas");
            canvas.width = arrowImageSize;
            canvas.height = arrowImageSize;
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
let numFrameTimesToRemember: number = 200;
let framesWithoutAStateChange: number = 0;

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

let drawMethod: ((arrow: Arrow) => void)[] = [
    drawArrow000,
    drawArrow001,
    drawArrow010,
    drawArrow011,
    // drawArrow100,
    // drawArrow101,
    // drawArrow110,
    // drawArrow111,
];

function draw(currentTimeMillis: number) {
    if (previousFrameTimes.length >= numFrameTimesToRemember) {
        previousFrameTimes.shift();
    }
    previousFrameTimes.push(currentTimeMillis);

    let deltaTimeMillis: number;
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
        for (let i = 0; i < 3; i++) {
            generateArrow();
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

    // read the state of the right UI
    let cacheRotationYes = (<HTMLInputElement> document.getElementById("cacheRotationYes")).checked;
    let cacheResizeYes = (<HTMLInputElement> document.getElementById("cacheResizeYes")).checked;
    let integerPositionYes = (<HTMLInputElement> document.getElementById("integerPositionYes")).checked;
    let drawMethodIndex: number =
        (cacheRotationYes ? 1 : 0)
        + (cacheResizeYes ? 2 : 0)
        + (integerPositionYes ? 4 : 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the arrows
    for (let i = 0; i < arrows.length; i++) {
        drawMethod[drawMethodIndex](arrows[i]);
    }

    framesWithoutAStateChange++;

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
    framesWithoutAStateChange = -1;
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

function drawArrow000(arrow: Arrow) {
    let rotation: number = arrow.rotationIndex * Math.PI / 2;
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(rotation);
    ctx.drawImage(arrowColors[arrow.colorIndex], -halfArrowSize, -halfArrowSize, arrowSize, arrowSize);
    ctx.rotate(-rotation);
    ctx.translate(-arrow.x, -arrow.y);
}

function drawArrow010(arrow: Arrow) {
    let cachedCanvas: HTMLCanvasElement = arrowCacheResized[0][arrow.colorIndex];
    let rotation: number = arrow.rotationIndex * Math.PI / 2;
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(rotation);
    ctx.drawImage(cachedCanvas, -halfArrowSize, -halfArrowSize);
    ctx.rotate(-rotation);
    ctx.translate(-arrow.x, -arrow.y);
}

function drawArrow001(arrow: Arrow) {
    let cachedCanvas: HTMLCanvasElement = arrowCacheNotResized[arrow.rotationIndex][arrow.colorIndex];
    ctx.drawImage(cachedCanvas, arrow.x - halfArrowSize, arrow.y - halfArrowSize, arrowSize, arrowSize);
}

function drawArrow011(arrow: Arrow) {
    let cachedCanvas: HTMLCanvasElement = arrowCacheResized[arrow.rotationIndex][arrow.colorIndex];
    // ctx.save();

    // ctx.translate(arrow.x, arrow.y);
    // ctx.drawImage(cachedCanvas, -halfArrowSize, -halfArrowSize);
    ctx.drawImage(cachedCanvas, arrow.x - halfArrowSize, arrow.y - halfArrowSize);

    // ctx.restore();
}

export function roundToNPlaces(x: number, numPlaces: number): number {
    let scale: number = Math.pow(10, numPlaces);
    return Math.round(x * scale) / scale;
}
