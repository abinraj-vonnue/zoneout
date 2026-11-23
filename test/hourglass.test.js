import { describe, expect, it } from 'vitest';
import { getHourglassSandGeometry } from '../src/hourglass.js';

describe('getHourglassSandGeometry', () => {
    it('starts with sand in the upper chamber and an empty lower chamber', () => {
        const geometry = getHourglassSandGeometry(0);

        expect(geometry.upper.surfaceY).toBe(14);
        expect(geometry.upper.surfaceHalfWidth).toBe(28);
        expect(geometry.lower.surfaceY).toBe(114);
        expect(geometry.streamVisible).toBe(false);
    });

    it('drains upper sand toward the neck while the lower pile rises', () => {
        const start = getHourglassSandGeometry(0);
        const middle = getHourglassSandGeometry(0.5);

        expect(middle.upper.surfaceY).toBeGreaterThan(start.upper.surfaceY);
        expect(middle.upper.surfaceY).toBeLessThan(middle.upper.neckY);
        expect(middle.upper.surfaceHalfWidth).toBeLessThan(start.upper.surfaceHalfWidth);
        expect(middle.lower.surfaceY).toBeLessThan(start.lower.surfaceY);
        expect(middle.lower.surfaceY).toBeGreaterThan(middle.lower.neckY);
        expect(middle.streamVisible).toBe(true);
    });

    it('ends with an empty upper chamber and sand accumulated in the lower chamber', () => {
        const geometry = getHourglassSandGeometry(1);

        expect(geometry.upper.surfaceY).toBe(60);
        expect(geometry.upper.surfaceHalfWidth).toBe(3);
        expect(geometry.lower.surfaceY).toBe(68);
        expect(geometry.lower.surfaceHalfWidth).toBe(3);
        expect(geometry.streamVisible).toBe(false);
    });


});
