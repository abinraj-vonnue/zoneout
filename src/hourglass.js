export function getHourglassSandGeometry(progress) {
    const fill = Math.max(0, Math.min(1, progress));
    const topY = 10;
    const neckY = 64;
    const bottomY = 118;
    const side = 32;
    const neckTopY = neckY - 4;
    const neckBottomY = neckY + 4;
    const topBaseY = topY + 4;
    const bottomBaseY = bottomY - 4;
    const edgeSandWidth = side - 4;
    const neckSandWidth = 3;

    return {
        progress: fill,
        upper: {
            surfaceY: topBaseY + (neckTopY - topBaseY) * fill,
            surfaceHalfWidth: edgeSandWidth * (1 - fill) + neckSandWidth * fill,
            neckY: neckTopY,
            neckHalfWidth: neckSandWidth,
        },
        lower: {
            surfaceY: bottomBaseY - (bottomBaseY - neckBottomY) * fill,
            surfaceHalfWidth: edgeSandWidth * (1 - fill) + neckSandWidth * fill,
            neckY: neckBottomY,
            baseY: bottomBaseY,
            baseHalfWidth: edgeSandWidth,
        },
        streamVisible: fill > 0.01 && fill < 0.99,
    };
}

export function drawHourglass(area, progress) {
    const [width, height] = area.get_surface_size();
    const context = area.get_context();
    const centerX = 50;
    const topY = 10;
    const neckY = 64;
    const bottomY = 118;
    const side = 32;
    const sand = getHourglassSandGeometry(progress);

    try {
        context.scale(width / 100, height / 128);

        context.setSourceRGBA(0.91, 0.94, 0.98, 0.94);
        context.setLineWidth(3);
        context.moveTo(centerX - side, topY);
        context.lineTo(centerX + side, topY);
        context.lineTo(centerX + 3, neckY - 4);
        context.lineTo(centerX + 3, neckY + 4);
        context.lineTo(centerX + side, bottomY);
        context.lineTo(centerX - side, bottomY);
        context.lineTo(centerX - 3, neckY + 4);
        context.lineTo(centerX - 3, neckY - 4);
        context.closePath();
        context.stroke();

        context.setSourceRGBA(0.38, 0.70, 0.91, 0.96);

        // The upper sand remains in the bottom of its chamber and shrinks
        // toward the neck as progress advances.
        context.moveTo(centerX - sand.upper.surfaceHalfWidth, sand.upper.surfaceY);
        context.lineTo(centerX + sand.upper.surfaceHalfWidth, sand.upper.surfaceY);
        context.lineTo(centerX + sand.upper.neckHalfWidth, sand.upper.neckY);
        context.lineTo(centerX - sand.upper.neckHalfWidth, sand.upper.neckY);
        context.closePath();
        context.fill();

        // The lower pile starts at the base and rises toward the neck.
        context.moveTo(centerX - sand.lower.baseHalfWidth, sand.lower.baseY);
        context.lineTo(centerX + sand.lower.baseHalfWidth, sand.lower.baseY);
        context.lineTo(centerX + sand.lower.surfaceHalfWidth, sand.lower.surfaceY);
        context.lineTo(centerX - sand.lower.surfaceHalfWidth, sand.lower.surfaceY);
        context.closePath();
        context.fill();

        if (sand.streamVisible) {
            context.setSourceRGBA(0.38, 0.70, 0.91, 0.96);
            context.setLineWidth(2);
            context.moveTo(centerX, sand.upper.neckY);
            context.lineTo(centerX, sand.lower.neckY);
            context.stroke();
        }
    } finally {
        context.$dispose();
    }
}
