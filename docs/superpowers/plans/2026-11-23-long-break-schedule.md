# Configurable Long Breaks Implementation Plan

> **For agentic workers:** Use this plan to implement the approved design in small commits.

**Goal:** Add a configurable long-break cycle alongside the existing short breaks, with start/end notices or a persistent hourglass card.

**Architecture:** Keep scheduling and GSettings integration in `extension.js`. Extend `ZoneOutPopup` to render short-break cards, transient long-break notices, and a persistent hourglass. Bind the new settings in the existing libadwaita preferences page.

**Tech Stack:** GNOME Shell 46 JavaScript modules, GSettings, libadwaita/GTK4 preferences, `St.DrawingArea` and Cairo.

**Spec:** `docs/superpowers/specs/2026-11-23-long-break-design.md`

## Global Constraints

- Short breaks remain 15 minutes of focused work followed by the existing 20-second break by default.
- Long breaks default to 60 minutes of focused work followed by a 5-minute break.
- Short breaks pause, but do not reset, the long focused-work counter.
- A long break takes priority when both work counters expire together.
- The persistent hourglass stays visible until its configured duration ends.
- Long-break notices use ZoneOut cards, not native GNOME notifications.

## Review Focus

- Short break during a long work interval must pause and resume the long counter.
- Simultaneous timer expiry must start only the long break.
- Changing interval settings during a cycle must not create a negative or zero-length work timer.
- Switching long-break mode must affect the next long break without corrupting an active one.
- Disabling the extension during a break must remove actors and GLib sources.

---

### Task 1: Add long-break settings

**Files:**
- Modify: `schemas/org.gnome.shell.extensions.zoneout.gschema.xml`
- Modify: `schemas/gschemas.compiled`
- Modify: `prefs.js`

**Interfaces:**
- Produces `long-work-interval` (integer minutes, default 60, range 1–480), `long-break-duration` (integer minutes, default 5, range 1–120), and `long-break-mode` (integer: 0 = notices, 1 = hourglass; default 1).

- [ ] Add the three keys to the schema and regenerate `schemas/gschemas.compiled`.
- [ ] Add a Long Break preferences group with work interval, duration, and mode controls; include all three in Reset Settings.
- [ ] Validate the schema with `glib-compile-schemas --strict --dry-run schemas` and parse `metadata.json`.
- [ ] Commit as `feat: add configurable long-break settings` with a body describing the new interval, duration, and display-mode controls.

### Task 2: Add long-break cards and hourglass

**Files:**
- Modify: `src/popup.js`
- Modify: `stylesheet.css`

**Interfaces:**
- `showShortBreak(remainingSeconds, onDismiss)` shows the short-break card and calls `onDismiss` when the user dismisses it.
- `showNotice(title, subtitle, autoCloseSeconds)` shows a transient ZoneOut card without ending a scheduled break.
- `showHourglass(totalSeconds)` creates a persistent hourglass card.
- `updateCountdown(remainingSeconds, totalSeconds)` updates the timer label and hourglass sand.
- `dismiss()` and `destroy()` remove the card and clear its display timeout.

- [ ] Refactor the popup to use those methods while preserving the pet card and slide animation.
- [ ] Draw top-chamber sand draining and bottom-chamber sand filling in `St.DrawingArea`; dispose the Cairo context after repaint.
- [ ] Style the hourglass card and countdown with the existing ZoneOut CSS classes.
- [ ] Check changed JavaScript syntax and `git diff --check`.
- [ ] Commit as `feat: add long-break notices and hourglass` with a body describing the two card modes and animated remaining-time display.

### Task 3: Schedule both break cycles

**Files:**
- Modify: `extension.js`

**Interfaces:**
- Keep separate short-work and long-work remaining-time counters.
- Use `_startShortBreak()`, `_startLongBreak()`, `_finishBreak()`, and `_updateLabel()` to manage mutually exclusive break state.
- The existing one-second source advances focused-work counters only while not paused or on break; it advances the active break countdown while a break is active.

- [ ] Start the long break before the short break when both counters reach zero on the same tick.
- [ ] Pause both work counters during either break; reset only the short counter after a short break and both counters after a long break.
- [ ] In notice mode, show a start card and a completion card; in hourglass mode, keep the card visible until the long countdown ends.
- [ ] Read new settings on the next cycle and disconnect all setting handlers and timers on disable.
- [ ] Check changed JavaScript syntax, schema validity, and `git diff --check`.
- [ ] Commit as `feat: schedule short and long break cycles` with a body describing focus-time timing, precedence, and both completion modes.

### Task 4: Final review

- [ ] Review the complete diff against the approved design and confirm the branch is clean.
- [ ] Confirm no changes were pushed to `main` or any remote branch.
- [ ] Report static validation separately from live GNOME Shell verification.
