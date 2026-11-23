import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('nextBreakMessage', () => {
    let nextBreakMessage;

    beforeEach(async () => {
        vi.resetModules();
        ({ nextBreakMessage } = await import('../src/messages.js'));
    });

    it('cycles through short-break messages and then starts over', () => {
        const first = nextBreakMessage('short');
        const second = nextBreakMessage('short');

        expect(first).not.toBe(second);
        for (let i = 0; i < 4; i++)
            nextBreakMessage('short');
        expect(nextBreakMessage('short')).toBe(first);
    });

    it('keeps the long-break message rotation independent', () => {
        const shortMessage = nextBreakMessage('short');
        const longMessage = nextBreakMessage('long');

        expect(shortMessage).not.toBe(longMessage);
        expect(nextBreakMessage('long')).not.toBe(longMessage);
    });
});
