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


});
