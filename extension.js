import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { ZoneOutIndicator } from './src/indicator.js';
import { ZoneOutPopup } from './src/popup.js';
import { nextBreakMessage } from './src/messages.js';
import { advanceWorkIntervals } from './src/schedule.js';

const LONG_BREAK_MODE_NOTICES = 0;
const LONG_BREAK_MODE_HOURGLASS = 1;
const LONG_BREAK_NOTICE_MAX_SECONDS = 20;

export default class ZoneOutExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._shortRemaining = this._getShortWorkSeconds();
        this._longRemaining = this._getLongWorkSeconds();
        this._breakRemaining = 0;
        this._breakTotal = 0;
        this._activeBreak = null;
        this._activeLongBreakMode = null;
        this._paused = false;
        this._timerId = null;
        this._shortWorkChangedId = null;
        this._longWorkChangedId = null;
        this._showTimerChangedId = null;

        this._theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        this._stylesheet = Gio.File.new_for_path(`${this.path}/stylesheet.css`);
        this._theme.load_stylesheet(this._stylesheet);

        this._popup = new ZoneOutPopup(this.path);
        this._indicator = new ZoneOutIndicator(this.uuid, {
            onTogglePause: () => this._togglePause(),
            onReset: () => this._resetTimers(),
            onOpenSettings: () => this.openPreferences(),
        });

        this._indicator.setVisible(this._settings.get_boolean('show-timer'));
        this._updateLabel();

        this._shortWorkChangedId = this._settings.connect('changed::work-interval', () => {
            if (this._activeBreak !== 'short')
                this._shortRemaining = this._getShortWorkSeconds();
            this._updateLabel();
        });

        this._longWorkChangedId = this._settings.connect('changed::long-work-interval', () => {
            if (this._activeBreak !== 'long')
                this._longRemaining = this._getLongWorkSeconds();
            this._updateLabel();
        });

        this._showTimerChangedId = this._settings.connect('changed::show-timer', () => {
            this._indicator.setVisible(this._settings.get_boolean('show-timer'));
        });

        this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => this._tick());
    }

    _getShortWorkSeconds() {
        return this._settings.get_int('work-interval') * 60;
    }

    _getLongWorkSeconds() {
        return this._settings.get_int('long-work-interval') * 60;
    }

    _getLongBreakSeconds() {
        return this._settings.get_int('long-break-duration') * 60;
    }

    _formatTime(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const remainder = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainder}`;
    }

    _updateLabel() {
        if (!this._indicator)
            return;

        let text = this._formatTime(this._shortRemaining);
        if (this._activeBreak === 'long')
            text = 'Long break';
        else if (this._activeBreak === 'short')
            text = 'Break';
        else if (this._paused)
            text = 'Paused';

        this._indicator.setText(text);
        this._indicator.setLongWorkProgress(this._longRemaining, this._getLongWorkSeconds());
    }

    _tick() {
        if (this._activeBreak) {
            this._breakRemaining -= 1;

            if (this._activeBreak === 'short' || this._activeLongBreakMode === LONG_BREAK_MODE_HOURGLASS)
                this._popup.updateCountdown(this._breakRemaining, this._breakTotal);

            if (this._breakRemaining <= 0)
                this._finishBreak();

            return GLib.SOURCE_CONTINUE;
        }

        if (this._paused)
            return GLib.SOURCE_CONTINUE;

        const intervals = advanceWorkIntervals({
            shortRemaining: this._shortRemaining,
            longRemaining: this._longRemaining,
        });
        this._shortRemaining = intervals.shortRemaining;
        this._longRemaining = intervals.longRemaining;

        if (intervals.breakDue === 'long')
            this._startLongBreak();
        else if (intervals.breakDue === 'short')
            this._startShortBreak();
        else
            this._updateLabel();

        return GLib.SOURCE_CONTINUE;
    }

    _startShortBreak() {
        if (this._activeBreak)
            return;

        this._activeBreak = 'short';
        this._breakRemaining = this._settings.get_int('auto-close-seconds');
        this._breakTotal = this._breakRemaining;
        this._activeLongBreakMode = null;
        this._popup.showShortBreak(this._breakRemaining, nextBreakMessage('short'), () => this._finishBreak());
        this._updateLabel();
    }

    _startLongBreak() {
        if (this._activeBreak)
            return;

        this._activeBreak = 'long';
        this._breakRemaining = this._getLongBreakSeconds();
        this._breakTotal = this._breakRemaining;
        this._activeLongBreakMode = this._settings.get_int('long-break-mode');

        if (this._activeLongBreakMode === LONG_BREAK_MODE_HOURGLASS) {
            this._popup.showHourglass(this._breakTotal, nextBreakMessage('long'));
        } else {
            this._popup.showNotice(
                'Long break started',
                this._formatTime(this._breakTotal),
                Math.min(this._settings.get_int('auto-close-seconds'), LONG_BREAK_NOTICE_MAX_SECONDS),
                { message: nextBreakMessage('long'), showDismiss: true });
        }

        this._updateLabel();
    }

    _finishBreak() {
        if (!this._activeBreak)
            return;

        const finishedBreak = this._activeBreak;
        const finishedMode = this._activeLongBreakMode;
        this._popup.dismiss();

        this._activeBreak = null;
        this._activeLongBreakMode = null;
        this._breakRemaining = 0;
        this._breakTotal = 0;
        this._shortRemaining = this._getShortWorkSeconds();

        if (finishedBreak === 'long') {
            this._longRemaining = this._getLongWorkSeconds();
            if (finishedMode === LONG_BREAK_MODE_NOTICES) {
                this._popup.showNotice(
                    'Long break over',
                    'Your break is complete. Ready to get back to work?',
                    Math.min(this._settings.get_int('auto-close-seconds'), LONG_BREAK_NOTICE_MAX_SECONDS),
                    { message: nextBreakMessage('long'), showDismiss: true });
            }
        }

        this._updateLabel();
    }

    _togglePause() {
        this._paused = !this._paused;
        this._indicator.setPaused(this._paused);
        this._updateLabel();
    }

    _resetTimers() {
        this._popup.dismiss();
        this._activeBreak = null;
        this._activeLongBreakMode = null;
        this._breakRemaining = 0;
        this._breakTotal = 0;
        this._shortRemaining = this._getShortWorkSeconds();
        this._longRemaining = this._getLongWorkSeconds();
        this._updateLabel();
    }

    disable() {
        if (this._shortWorkChangedId)
            this._settings.disconnect(this._shortWorkChangedId);
        if (this._longWorkChangedId)
            this._settings.disconnect(this._longWorkChangedId);
        if (this._showTimerChangedId)
            this._settings.disconnect(this._showTimerChangedId);
        if (this._timerId)
            GLib.source_remove(this._timerId);

        this._timerId = null;
        this._shortWorkChangedId = null;
        this._longWorkChangedId = null;
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
