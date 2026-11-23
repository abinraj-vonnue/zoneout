export function drawHourglass(area, progress) {
    const [width, height] = area.get_surface_size();
    const context = area.get_context();
    const centerX = 50;
    const topY = 10;
    const neckY = 64;
    const bottomY = 118;
    const side = 32;
    const fill = Math.max(0, Math.min(1, progress));

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

        const neckTopY = neckY - 4;
        const neckBottomY = neckY + 4;
        const topBaseY = topY + 4;
        const bottomBaseY = bottomY - 4;
        const edgeSandWidth = side - 4;
        const neckSandWidth = 3;

        // The upper sand remains in the bottom of its chamber and shrinks
        // toward the neck as progress advances.
        const topSandY = topBaseY + (neckTopY - topBaseY) * fill;
        const topSandHalfWidth = edgeSandWidth * (1 - fill) + neckSandWidth * fill;
        context.moveTo(centerX - topSandHalfWidth, topSandY);
        context.lineTo(centerX + topSandHalfWidth, topSandY);
        context.lineTo(centerX + neckSandWidth, neckTopY);
        context.lineTo(centerX - neckSandWidth, neckTopY);
        context.closePath();
        context.fill();

        // The lower pile starts at the base and rises toward the neck.
        const lowerSandY = bottomBaseY - (bottomBaseY - neckBottomY) * fill;
        const lowerSandHalfWidth = edgeSandWidth * (1 - fill) + neckSandWidth * fill;
        context.moveTo(centerX - edgeSandWidth, bottomBaseY);
        context.lineTo(centerX + edgeSandWidth, bottomBaseY);
        context.lineTo(centerX + lowerSandHalfWidth, lowerSandY);
        context.lineTo(centerX - lowerSandHalfWidth, lowerSandY);
        context.closePath();
        context.fill();

        if (fill > 0.01 && fill < 0.99) {
            context.setSourceRGBA(0.38, 0.70, 0.91, 0.96);
            context.setLineWidth(2);
            context.moveTo(centerX, neckTopY);
            context.lineTo(centerX, neckBottomY);
            context.stroke();
        }
    } finally {
        context.$dispose();
    }
}
