export function advanceWorkIntervals({ shortRemaining, longRemaining }) {
    const nextShortRemaining = shortRemaining - 1;
    const nextLongRemaining = longRemaining - 1;

    let breakDue = null;
    if (nextLongRemaining <= 0)
        breakDue = 'long';
    else if (nextShortRemaining <= 0)
        breakDue = 'short';

    return {
        shortRemaining: nextShortRemaining,
        longRemaining: nextLongRemaining,
        breakDue,
    };
}
