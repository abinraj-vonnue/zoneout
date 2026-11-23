import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

function addUnitSuffix(row, unit) {
    row.add_suffix(new Gtk.Label({
        label: unit,
        css_classes: ['dim-label'],
    }));
}

export default class ZoneOutPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.set_default_size(520, 480);

        const settings = this.getSettings();
        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        const scheduleGroup = new Adw.PreferencesGroup({
            title: 'Short Break Schedule',
            description: 'Set how often ZoneOut reminds you to look away.',
        });
        page.add(scheduleGroup);

        const workRow = new Adw.SpinRow({
            title: 'Break Interval',
            subtitle: 'Minutes between eye breaks',
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 180,
                step_increment: 1,
                page_increment: 5,
            }),
        });
        addUnitSuffix(workRow, 'minutes');
        settings.bind('work-interval', workRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        scheduleGroup.add(workRow);

        const longScheduleGroup = new Adw.PreferencesGroup({
            title: 'Long Break Schedule',
            description: 'Schedule a longer rest after a focused work interval.',
        });
        page.add(longScheduleGroup);

        const longWorkRow = new Adw.SpinRow({
            title: 'Long Break Interval',
            subtitle: 'Minutes of focused work before a long break',
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 480,
                step_increment: 5,
                page_increment: 30,
            }),
        });
        addUnitSuffix(longWorkRow, 'minutes');
        settings.bind('long-work-interval', longWorkRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        longScheduleGroup.add(longWorkRow);

        const longDurationRow = new Adw.SpinRow({
            title: 'Long Break Duration',
            subtitle: 'Minutes to rest before the next work cycle',
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 120,
                step_increment: 1,
                page_increment: 5,
            }),
        });
        addUnitSuffix(longDurationRow, 'minutes');
        settings.bind('long-break-duration', longDurationRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        longScheduleGroup.add(longDurationRow);

        const longModeRow = new Adw.ComboRow({
            title: 'Long Break Display',
            subtitle: 'Choose how ZoneOut shows the long break',
            model: Gtk.StringList.new([
                'Start and end notices',
                'Persistent hourglass',
            ]),
        });
        settings.bind('long-break-mode', longModeRow, 'selected', Gio.SettingsBindFlags.DEFAULT);
        longScheduleGroup.add(longModeRow);

        const panelGroup = new Adw.PreferencesGroup({
            title: 'Notification & Panel',
            description: 'Choose how long the break popup stays visible and whether the countdown appears in the top bar.',
        });
        page.add(panelGroup);

        const closeRow = new Adw.SpinRow({
            title: 'Break Popup Duration',
            subtitle: 'Seconds before the popup closes automatically',
            adjustment: new Gtk.Adjustment({
                lower: 5,
                upper: 600,
                step_increment: 5,
                page_increment: 30,
            }),
        });
        addUnitSuffix(closeRow, 'seconds');
        settings.bind('auto-close-seconds', closeRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        panelGroup.add(closeRow);

        const showTimerRow = new Adw.SwitchRow({
            title: 'Show Countdown in Top Bar',
            subtitle: 'Display the remaining time in the panel',
        });
        settings.bind('show-timer', showTimerRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        panelGroup.add(showTimerRow);

        const resetGroup = new Adw.PreferencesGroup();
        page.add(resetGroup);

        const resetRow = new Adw.ActionRow({
            title: 'Reset Settings',
            subtitle: 'Restore the default short and long break schedules',
        });
        const resetButton = new Gtk.Button({
            label: 'Reset',
            valign: Gtk.Align.CENTER,
            css_classes: ['destructive-action'],
        });
        resetButton.connect('clicked', () => {
            settings.reset('work-interval');
            settings.reset('auto-close-seconds');
            settings.reset('show-timer');
            settings.reset('long-work-interval');
            settings.reset('long-break-duration');
            settings.reset('long-break-mode');
        });
        resetRow.add_suffix(resetButton);
        resetGroup.add(resetRow);
    }
}
