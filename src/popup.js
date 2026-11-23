import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class ZoneOutPopup {
    constructor(extensionPath, onDismiss) {
        this._extensionPath = extensionPath;
        this._onDismiss = onDismiss;
        this._popup = null;
        this._timerId = null;
    }

    show(autoCloseSeconds) {
        if (this._popup)
            return;

        let remaining = autoCloseSeconds;
        this._popup = new St.BoxLayout({
            style_class: 'zoneout-popup',
            vertical: false,
            reactive: true,
            can_focus: false,
        });

        const iconFile = Gio.File.new_for_path(`${this._extensionPath}/assets/pet.svg`);
        const petIcon = new St.Icon({
            gicon: new Gio.FileIcon({ file: iconFile }),
            icon_size: 64,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._popup.add_child(petIcon);

        const textBox = new St.BoxLayout({
            vertical: true,
            style: 'margin-left: 14px;',
        });
        const title = new St.Label({
            text: `Zone out for ${remaining}s`,
            style_class: 'zoneout-title',
        });
        const subtitle = new St.Label({
            text: `Look away from the screen (${remaining}s)`,
            style_class: 'zoneout-subtitle',
        });
        const dismissButton = new St.Button({
            label: 'Dismiss',
            style_class: 'zoneout-dismiss-btn',
            x_align: Clutter.ActorAlign.START,
            can_focus: false,
        });
        dismissButton.connect('clicked', () => this.dismiss());

        textBox.add_child(title);
        textBox.add_child(subtitle);
        textBox.add_child(dismissButton);
        this._popup.add_child(textBox);

        Main.layoutManager.addChrome(this._popup, {
            affectsInputRegion: true,
            trackFullscreen: true,
        });

        const monitor = Main.layoutManager.primaryMonitor;
        const [, naturalWidth] = this._popup.get_preferred_width(-1);
        const [, naturalHeight] = this._popup.get_preferred_height(-1);
        const targetX = monitor.x + monitor.width - naturalWidth - 24;
        const targetY = monitor.y + monitor.height - naturalHeight - 24;

        this._popup.set_position(targetX, monitor.y + monitor.height);
        this._popup.ease({
            y: targetY,
            duration: 300,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });

        this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            remaining -= 1;
            if (remaining <= 0) {
                this._timerId = null;
                this.dismiss();
                return GLib.SOURCE_REMOVE;
            }

            subtitle.set_text(`Look away from the screen (${remaining}s)`);
            return GLib.SOURCE_CONTINUE;
        });
    }

    dismiss() {
        if (!this._popup)
            return;

        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }

        const popupToClose = this._popup;
        this._popup = null;
        const monitor = Main.layoutManager.primaryMonitor;
        popupToClose.ease({
            y: monitor.y + monitor.height,
            duration: 200,
            mode: Clutter.AnimationMode.EASE_IN_QUAD,
            onComplete: () => {
                Main.layoutManager.removeChrome(popupToClose);
                popupToClose.destroy();
            },
        });

        this._onDismiss?.();
    }

    destroy() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }

        if (this._popup) {
            Main.layoutManager.removeChrome(this._popup);
            this._popup.destroy();
            this._popup = null;
        }
    }
}
