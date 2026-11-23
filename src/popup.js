import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { drawHourglass } from './hourglass.js';

export class ZoneOutPopup {
    constructor(extensionPath) {
        this._extensionPath = extensionPath;
        this._popup = null;
        this._displayTimerId = null;
        this._subtitle = null;
        this._dismissButton = null;
        this._hourglassArea = null;
        this._hourglassProgress = 0;
        this._hourglassTotalSeconds = 0;
        this._cardKind = null;
    }

    showShortBreak(remainingSeconds, onDismiss) {
        this._showCard({
            kind: 'short',
            title: 'Short break',
            subtitle: `Look away from the screen (${this._formatTime(remainingSeconds)})`,
            showDismiss: true,
        });

        this._dismissButton.connect('clicked', () => {
            this.dismiss();
            onDismiss?.();
        });
    }

    showNotice(title, subtitle, autoCloseSeconds) {
        this._showCard({ kind: 'notice', title, subtitle });

        this._displayTimerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, autoCloseSeconds, () => {
            this._displayTimerId = null;
            this.dismiss();
            return GLib.SOURCE_REMOVE;
        });
    }

    showHourglass(totalSeconds) {
        this._hourglassTotalSeconds = totalSeconds;
        this._showCard({
            kind: 'hourglass',
            title: 'Long break',
            subtitle: `Time remaining: ${this._formatTime(totalSeconds)}`,
            hourglass: true,
        });
        this.updateCountdown(totalSeconds, totalSeconds);
    }

    updateCountdown(remainingSeconds, totalSeconds = this._hourglassTotalSeconds) {
        if (this._cardKind === 'short' && this._subtitle)
            this._subtitle.set_text(`Look away from the screen (${this._formatTime(remainingSeconds)})`);
        else if (this._cardKind === 'hourglass' && this._subtitle)
            this._subtitle.set_text(`Time remaining: ${this._formatTime(remainingSeconds)}`);

        if (this._hourglassArea && totalSeconds > 0) {
            this._hourglassProgress = Math.max(0, Math.min(1, 1 - remainingSeconds / totalSeconds));
            this._hourglassArea.queue_repaint();
        }
    }

    _formatTime(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const remainder = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainder}`;
    }

    _showCard({ kind, title, subtitle, showDismiss = false, hourglass = false }) {
        this.dismiss();

        const popup = new St.BoxLayout({
            style_class: 'zoneout-popup',
            vertical: false,
            reactive: true,
            can_focus: false,
        });

        const iconFile = Gio.File.new_for_path(`${this._extensionPath}/assets/pet.svg`);
        const petIcon = new St.Icon({
            gicon: new Gio.FileIcon({ file: iconFile }),
            icon_size: hourglass ? 48 : 64,
            y_align: Clutter.ActorAlign.CENTER,
        });
        popup.add_child(petIcon);

        if (hourglass) {
            this._hourglassArea = new St.DrawingArea({
                width: 96,
                height: 128,
                style_class: 'zoneout-hourglass',
            });
            this._hourglassArea.connect('repaint', area => drawHourglass(area, this._hourglassProgress));
            popup.add_child(this._hourglassArea);
        } else {
            this._hourglassArea = null;
        }

        const textBox = new St.BoxLayout({
            vertical: true,
            style: 'margin-left: 14px;',
        });
        const titleLabel = new St.Label({
            text: title,
            style_class: 'zoneout-title',
        });
        this._subtitle = new St.Label({
            text: subtitle,
            style_class: 'zoneout-subtitle',
        });

        textBox.add_child(titleLabel);
        textBox.add_child(this._subtitle);

        if (showDismiss) {
            this._dismissButton = new St.Button({
                label: 'Dismiss',
                style_class: 'zoneout-dismiss-btn',
                x_align: Clutter.ActorAlign.START,
                can_focus: false,
            });
            textBox.add_child(this._dismissButton);
        } else {
            this._dismissButton = null;
        }

        popup.add_child(textBox);
        this._popup = popup;
        this._cardKind = kind;

        Main.layoutManager.addChrome(popup, {
            affectsInputRegion: true,
            trackFullscreen: true,
        });

        const monitor = Main.layoutManager.primaryMonitor;
        const [, naturalWidth] = popup.get_preferred_width(-1);
        const [, naturalHeight] = popup.get_preferred_height(-1);
        const targetX = monitor.x + monitor.width - naturalWidth - 24;
        const targetY = monitor.y + monitor.height - naturalHeight - 24;

        popup.set_position(targetX, monitor.y + monitor.height);
        popup.ease({
            y: targetY,
            duration: 300,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
    }

    dismiss() {
        if (this._displayTimerId) {
            GLib.source_remove(this._displayTimerId);
            this._displayTimerId = null;
        }

        if (!this._popup)
            return;

        const popupToClose = this._popup;
        this._popup = null;
        this._subtitle = null;
        this._dismissButton = null;
        this._hourglassArea = null;
        this._cardKind = null;
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
    }

    destroy() {
        if (this._displayTimerId) {
            GLib.source_remove(this._displayTimerId);
            this._displayTimerId = null;
        }

        if (this._popup) {
            this._popup.remove_all_transitions();
            Main.layoutManager.removeChrome(this._popup);
            this._popup.destroy();
            this._popup = null;
        }

        this._subtitle = null;
        this._dismissButton = null;
        this._hourglassArea = null;
        this._cardKind = null;
    }
}
