import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { ZoneOutIndicator } from './src/indicator.js';
import { ZoneOutPopup } from './src/popup.js';

export default class ZoneOutExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._remaining = this._getWorkSeconds();
        this._paused = false;
        this._inBreak = false;
        this._timerId = null;
        this._workChangedId = null;
        this._showTimerChangedId = null;

        this._theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        this._stylesheet = Gio.File.new_for_path(`${this.path}/stylesheet.css`);
        this._theme.load_stylesheet(this._stylesheet);

        this._popup = new ZoneOutPopup(this.path, () => {
            this._inBreak = false;
            this._remaining = this._getWorkSeconds();
            this._updateLabel();
        });

        this._indicator = new ZoneOutIndicator(this.uuid, {
            onTogglePause: () => this._togglePause(),
            onReset: () => this._resetTimer(),
            onTestBreak: () => this._triggerBreak(),
            onOpenSettings: () => this.openPreferences(),
        });

        this._indicator.setVisible(this._settings.get_boolean('show-timer'));
        this._updateLabel();

        this._workChangedId = this._settings.connect('changed::work-interval', () => {
            if (!this._inBreak) {
                this._remaining = this._getWorkSeconds();
                this._updateLabel();
            }
        });

        this._showTimerChangedId = this._settings.connect('changed::show-timer', () => {
            this._indicator.setVisible(this._settings.get_boolean('show-timer'));
        });

        this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            if (!this._paused && !this._inBreak) {
                this._remaining -= 1;
                if (this._remaining <= 0)
                    this._triggerBreak();
                else
                    this._updateLabel();
            }

            return GLib.SOURCE_CONTINUE;
        });
    }

    _getWorkSeconds() {
        return this._settings.get_int('work-interval') * 60;
    }

    _formatTime(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const remainder = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainder}`;
    }

    _updateLabel() {
        if (!this._indicator)
            return;

        let text = this._formatTime(this._remaining);
        if (this._inBreak)
            text = 'Break';
        else if (this._paused)
            text = 'Paused';

        this._indicator.setText(text);
    }

    _togglePause() {
        this._paused = !this._paused;
        this._indicator.setPaused(this._paused);
        this._updateLabel();
    }

    _resetTimer() {
        this._popup.dismiss();
        this._inBreak = false;
        this._remaining = this._getWorkSeconds();
        this._updateLabel();
    }

    _triggerBreak() {
        if (this._inBreak)
            return;

        this._inBreak = true;
        this._updateLabel();
        this._popup.show(this._settings.get_int('auto-close-seconds'));
    }

    disable() {
        if (this._workChangedId)
            this._settings.disconnect(this._workChangedId);
        if (this._showTimerChangedId)
            this._settings.disconnect(this._showTimerChangedId);
        if (this._timerId)
            GLib.source_remove(this._timerId);

        this._timerId = null;
        this._workChangedId = null;
        this._showTimerChangedId = null;

        this._popup?.destroy();
        this._popup = null;
        this._indicator?.destroy();
        this._indicator = null;

        this._theme.unload_stylesheet(this._stylesheet);
        this._theme = null;
        this._stylesheet = null;
        this._settings = null;
    }
}
