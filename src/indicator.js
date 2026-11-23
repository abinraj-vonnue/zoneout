import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export class ZoneOutIndicator {
    constructor(uuid, callbacks) {
        this._button = new PanelMenu.Button(0.0, 'ZoneOut', false);
        this._label = new St.Label({
            text: '15:00',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'zoneout-panel-label',
        });
        this._button.add_child(this._label);

        this._pauseItem = new PopupMenu.PopupMenuItem('Pause');
        this._pauseItem.connect('activate', () => callbacks.onTogglePause());
        this._button.menu.addMenuItem(this._pauseItem);

        const resetItem = new PopupMenu.PopupMenuItem('Reset Timer');
        resetItem.connect('activate', () => callbacks.onReset());
        this._button.menu.addMenuItem(resetItem);

        const testItem = new PopupMenu.PopupMenuItem('Test Break Now');
        testItem.connect('activate', () => callbacks.onTestBreak());
        this._button.menu.addMenuItem(testItem);

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

    setVisible(visible) {
        this._button.visible = visible;
    }

    destroy() {
        this._button?.destroy();
        this._button = null;
    }
}
