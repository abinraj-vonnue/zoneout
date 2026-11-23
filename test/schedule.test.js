import { describe, expect, it } from 'vitest';
import { advanceWorkIntervals } from '../src/schedule.js';

describe('advanceWorkIntervals', () => {
    it('decrements both work intervals without starting a break', () => {
        expect(advanceWorkIntervals({ shortRemaining: 10, longRemaining: 40 })).toEqual({
            shortRemaining: 9,
            longRemaining: 39,
            breakDue: null,
        });
    });

    it('starts a short break when the short interval reaches zero', () => {
        expect(advanceWorkIntervals({ shortRemaining: 1, longRemaining: 20 })).toEqual({
            shortRemaining: 0,
            longRemaining: 19,
            breakDue: 'short',
        });
    });

    it('gives a long break priority when both intervals expire together', () => {
        expect(advanceWorkIntervals({ shortRemaining: 1, longRemaining: 1 })).toEqual({
            shortRemaining: 0,
            longRemaining: 0,
            breakDue: 'long',
        });
    });
});
