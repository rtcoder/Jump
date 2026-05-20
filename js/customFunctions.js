export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function resizeCanvas(canvas, ctx) {
    const width = Math.min(450, window.innerWidth);
    const height = window.innerHeight;
    const ratio = window.devicePixelRatio || 1;

    canvas.logicalWidth = width;
    canvas.logicalHeight = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
