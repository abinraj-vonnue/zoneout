const SHORT_BREAK_MESSAGES = [
    'Your eyes called. They would like a tiny vacation.',
    'Blink twice if you can read this. Great. Keep blinking.',
    'Look at something far away. Tiny text does not count.',
    'Give your eyeballs a loading screen.',
    'Neck check! You are not a question mark.',
    'The screen will still be here. It has nowhere else to be.',
];

const LONG_BREAK_MESSAGES = [
    'Go meet the mysterious world beyond this rectangle.',
    'Your chair will keep your seat warm. Probably.',
    'Take a lap. Your legs have been in airplane mode.',
    'Hydrate. Your houseplant is judging your water intake.',
    'Step away. The pixels can gossip without you.',
    'Congratulations: you unlocked the stretch level.',
];

const messageIndexes = { short: 0, long: 0 };

export function nextBreakMessage(kind) {
    const messages = kind === 'long' ? LONG_BREAK_MESSAGES : SHORT_BREAK_MESSAGES;
    const index = messageIndexes[kind] ?? 0;
    messageIndexes[kind] = (index + 1) % messages.length;
    return messages[index];
}
