import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const WORK_SECONDS = 15 * 60; // 15 minutes
const BREAK_SECONDS = 20;     // 20-second eye break

export default class ZoneOutExtension extends Extension {
    enable() {
        this._remaining = WORK_SECONDS;
        this._paused = false;
        this._inBreak = false;
        this._popup = null;
        this._breakTimerId = null;

        // Top bar indicator
        this._indicator = new PanelMenu.Button(0.0, 'ZoneOut', false);
        this._label = new St.Label({
            text: this._formatTime(this._remaining),
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'zoneout-panel-label',
        });
        this._indicator.add_child(this._label);

        // Dropdown menu
        this._pauseItem = new PopupMenu.PopupMenuItem('Pause');
        this._pauseItem.connect('activate', () => this._togglePause());
        this._indicator.menu.addMenuItem(this._pauseItem);

        const resetItem = new PopupMenu.PopupMenuItem('Reset Timer');
        resetItem.connect('activate', () => {
            this._dismissBreak();
            this._remaining = WORK_SECONDS;
            this._updateLabel();
        });
        this._indicator.menu.addMenuItem(resetItem);

        const testItem = new PopupMenu.PopupMenuItem('Test Break Now');
        testItem.connect('activate', () => this._showBreak());
        this._indicator.menu.addMenuItem(testItem);

        Main.panel.addToStatusArea(this.uuid, this._indicator);

        // Main 1-second tick
        this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            if (!this._paused && !this._inBreak) {
                this._remaining -= 1;
                if (this._remaining <= 0) {
                    this._showBreak();
                } else {
                    this._updateLabel();
                }
            }
            return GLib.SOURCE_CONTINUE;
        });
    }

    _formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    _updateLabel() {
        this._label.set_text(this._paused ? 'Paused' : this._formatTime(this._remaining));
    }

    _togglePause() {
        this._paused = !this._paused;
        this._pauseItem.label.set_text(this._paused ? 'Resume' : 'Pause');
        this._updateLabel();
    }

    _showBreak() {
        if (this._inBreak) return;
        this._inBreak = true;
        this._label.set_text('Break');

        let breakLeft = BREAK_SECONDS;

        // Container for pet + speech card
        this._popup = new St.BoxLayout({
            style_class: 'zoneout-popup',
            vertical: false,
            reactive: true,
        });

        // Pet icon
        const iconFile = Gio.File.new_for_path(`${this.path}/pet.svg`);
        const petIcon = new St.Icon({
            gicon: new Gio.FileIcon({ file: iconFile }),
            icon_size: 64,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._popup.add_child(petIcon);

        // Text + button column
        const textBox = new St.BoxLayout({
            vertical: true,
            style: 'margin-left: 14px;',
        });

        const title = new St.Label({
            text: 'Zone out for 20s',
            style_class: 'zoneout-title',
        });

        const subtitle = new St.Label({
            text: `Look away from the screen (${breakLeft}s)`,
            style_class: 'zoneout-subtitle',
        });

        const dismissBtn = new St.Button({
            label: 'Dismiss',
            style_class: 'zoneout-dismiss-btn',
            x_align: Clutter.ActorAlign.START,
        });
        dismissBtn.connect('clicked', () => this._dismissBreak());

        textBox.add_child(title);
        textBox.add_child(subtitle);
        textBox.add_child(dismissBtn);
        this._popup.add_child(textBox);

        Main.uiGroup.add_child(this._popup);

        // Position at bottom-right of primary monitor and slide up
        const monitor = Main.layoutManager.primaryMonitor;
        const [, natW] = this._popup.get_preferred_width(-1);
        const [, natH] = this._popup.get_preferred_height(-1);

        const targetX = monitor.x + monitor.width - natW - 24;
        const targetY = monitor.y + monitor.height - natH - 24;

        this._popup.set_position(targetX, monitor.y + monitor.height);
        this._popup.ease({
            y: targetY,
            duration: 300,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });

        // 20-second break countdown
        this._breakTimerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            breakLeft -= 1;
            if (breakLeft <= 0) {
                this._dismissBreak();
                return GLib.SOURCE_REMOVE;
            }
            subtitle.set_text(`Look away from the screen (${breakLeft}s)`);
            return GLib.SOURCE_CONTINUE;
        });
    }

    _dismissBreak() {
        if (this._breakTimerId) {
            GLib.source_remove(this._breakTimerId);
            this._breakTimerId = null;
        }
        if (this._popup) {
            const popupToClose = this._popup;
            this._popup = null;
            const monitor = Main.layoutManager.primaryMonitor;
            popupToClose.ease({
                y: monitor.y + monitor.height,
                duration: 200,
                mode: Clutter.AnimationMode.EASE_IN_QUAD,
                onComplete: () => popupToClose.destroy(),
            });
        }
        this._inBreak = false;
        this._remaining = WORK_SECONDS;
        this._updateLabel();
    }

    disable() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
        if (this._breakTimerId) {
            GLib.source_remove(this._breakTimerId);
            this._breakTimerId = null;
        }
        if (this._popup) {
            this._popup.destroy();
            this._popup = null;
        }
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
