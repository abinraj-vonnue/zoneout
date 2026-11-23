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


});
