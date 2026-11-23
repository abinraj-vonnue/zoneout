import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

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
            title: 'Break Schedule',
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
        settings.bind('work-interval', workRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        scheduleGroup.add(workRow);

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
            subtitle: 'Restore the default 15-minute interval and 20-second popup',
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
        });
        resetRow.add_suffix(resetButton);
        resetGroup.add(resetRow);
    }
}
