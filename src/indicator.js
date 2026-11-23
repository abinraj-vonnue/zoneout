import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { drawHourglass } from './hourglass.js';

export class ZoneOutIndicator {
    constructor(uuid, callbacks) {
        this._button = new PanelMenu.Button(0.0, 'ZoneOut', false);
        this._label = new St.Label({
            text: '15:00',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'zoneout-panel-label',
        });
        this._button.add_child(this._label);

        this._longProgress = 0;
        this._hourglass = new St.DrawingArea({
            width: 22,
            height: 28,
            style_class: 'zoneout-panel-hourglass',
        });
        this._hourglass.connect('repaint', area => drawHourglass(area, this._longProgress));
        this._button.add_child(this._hourglass);

        this._pauseItem = new PopupMenu.PopupMenuItem('Pause');
        this._pauseItem.connect('activate', () => callbacks.onTogglePause());
        this._button.menu.addMenuItem(this._pauseItem);

        this._longBreakItem = new PopupMenu.PopupMenuItem('Long break in 60:00');
        this._longBreakItem.setSensitive(false);
        this._button.menu.addMenuItem(this._longBreakItem);

        const resetItem = new PopupMenu.PopupMenuItem('Reset Timer');
        resetItem.connect('activate', () => callbacks.onReset());
        this._button.menu.addMenuItem(resetItem);

        this._button.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this._button.menu.addAction('Settings', () => callbacks.onOpenSettings());

        Main.panel.addToStatusArea(uuid, this._button);
    }

    setText(text) {
        this._label.set_text(text);
    }

    setPaused(paused) {
        this._pauseItem.label.set_text(paused ? 'Resume' : 'Pause');
    }

    setLongWorkProgress(remainingSeconds, totalSeconds) {
        const total = Math.max(1, totalSeconds);
        const remaining = Math.max(0, Math.min(total, remainingSeconds));
        this._longProgress = 1 - remaining / total;
        this._hourglass.queue_repaint();

        const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
        const seconds = (remaining % 60).toString().padStart(2, '0');
        const label = remaining === 0 ? 'Long break now' : `Long break in ${minutes}:${seconds}`;
        this._longBreakItem.label.set_text(label);
    }

    setVisible(visible) {
        this._button.visible = visible;
    }

    destroy() {
        this._button?.destroy();
        this._button = null;
    }
}
