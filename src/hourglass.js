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

        context.setSourceRGBA(0.91, 0.67, 0.29, 0.96);

        const topSandY = neckY - (neckY - topY) * fill;
        const topSandHalfWidth = side * fill;
        context.moveTo(centerX - side + 4, topY + 4);
        context.lineTo(centerX + side - 4, topY + 4);
        context.lineTo(centerX + topSandHalfWidth, topSandY);
        context.lineTo(centerX - topSandHalfWidth, topSandY);
        context.closePath();
        context.fill();

        const lowerSandY = bottomY - (bottomY - neckY) * fill;
        const lowerSandHalfWidth = side * (1 - fill);
        context.moveTo(centerX - side + 4, bottomY - 4);
        context.lineTo(centerX + side - 4, bottomY - 4);
        context.lineTo(centerX + lowerSandHalfWidth, lowerSandY);
        context.lineTo(centerX - lowerSandHalfWidth, lowerSandY);
        context.closePath();
        context.fill();

        if (fill > 0.01 && fill < 0.99) {
            context.setLineWidth(2);
            context.moveTo(centerX, neckY - 2);
            context.lineTo(centerX, neckY + 5);
            context.stroke();
        }
    } finally {
        context.$dispose();
    }
}
