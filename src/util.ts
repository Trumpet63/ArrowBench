export function roundToNPlaces(x: number, numPlaces: number): number {
    let scale: number = Math.pow(10, numPlaces);
    return Math.round(x * scale) / scale;
}

export function clampValueToRange(value: number, lowerBound: number, upperBound: number): number {
    if (value < lowerBound) {
        return lowerBound;
    }
    if (value > upperBound) {
        return upperBound;
    }
    return value;
}

export function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
