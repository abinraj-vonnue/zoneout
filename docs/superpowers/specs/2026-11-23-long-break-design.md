# Configurable Long Breaks

## Intent

Add a second, longer break cycle to ZoneOut while keeping the existing short eye-break cycle. Users can choose whether long breaks appear as brief start/end notices or as a persistent hourglass card.

## Goals

- Keep the current short-break interval and duration settings.
- Add a long-break work interval and a long-break duration, defaulting to 60 minutes and 5 minutes.
- Let users choose between start/end notices and a persistent hourglass card; default to the hourglass.
- Make the hourglass visibly drain its upper sand and fill its lower chamber as the break progresses, with a remaining-time label.

## Non-goals

- Native GNOME desktop notifications.
- Persisting countdown state across logout or Shell restart.
- Multiple long-break schedules or custom hourglass artwork.

## Approaches

1. **Use ZoneOut cards for both long-break modes (chosen).** Reuse the Shell overlay for brief start/end notices and for the persistent hourglass. This keeps both modes visually consistent with the existing short-break popup.
2. **Use native GNOME notifications for start/end and a Shell overlay for the hourglass.** This is more native for brief notices, but splits the experience across two surfaces and cannot show the requested custom hourglass in the notification.

## Behavior

- The short cycle defaults to 15 minutes of focused work followed by its existing 20-second break.
- The long cycle defaults to 60 minutes of focused work followed by a 5-minute break.
- Both work counters decrement during focused work. Both pause during short and long breaks.
- A short break resets only the short work counter. Its duration does not reduce the remaining long focused-work interval.
- If both work counters expire together, the long break takes priority and suppresses the short break.
- Completing a long break resets both work counters.
- In **Start and end notices** mode, ZoneOut shows a brief card when the long break begins and another when it ends. The long-break timer runs while no card is visible between them.
- In **Hourglass** mode, one card remains visible for the full long-break duration. The upper sand drains as the lower chamber fills; the card disappears when the timer reaches zero, ending the break.

## Settings and implementation

- Add `long-work-interval` (minutes), `long-break-duration` (minutes), and `long-break-mode` (notice or hourglass) to the existing GSettings schema.
- Add matching controls to the current libadwaita preferences page.
- Keep scheduling in `extension.js`; extend the popup component to show short notices, completion notices, and a persistent long-break hourglass.
- Draw the hourglass in a `St.DrawingArea` using the stage's `St.ThemeContext`; update its fill from the remaining long-break time.
- Keep the current GSettings schema ID and GNOME Shell 46 compatibility.

## Review decisions

- The long interval measures focused work time and pauses during short breaks.
- Long-break notices use ZoneOut cards rather than native GNOME notifications.
- The persistent hourglass cannot be dismissed early; it disappears when the configured long break ends.
