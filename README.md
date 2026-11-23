# ZoneOut

ZoneOut is a GNOME Shell extension that reminds you to take eye and rest breaks. It shows a small countdown in the top panel and a friendly desktop buddy when it is time to pause.

## Features

- Configure the short work interval and break reminder duration.
- Set a separate long focused-work interval and long break duration.
- Choose long-break start/end notices or a persistent animated hourglass.
- Pause or resume the work timers, reset the schedule, or hide the panel countdown.
- See playful, rotating messages for short and long breaks.
- Track long-work progress with a compact hourglass in the panel.

## Settings

Open **Extensions**, select **ZoneOut**, and open its settings.

| Setting | Default | Unit |
| --- | ---: | --- |
| Short break interval | 15 | minutes |
| Long focused-work interval | 60 | minutes |
| Long break duration | 5 | minutes |
| Break popup duration | 20 | seconds |

Long breaks can show a brief notice when they start and end, or keep an hourglass card visible until the break finishes. Dismissing a card closes the card; it does not cancel the long-break timer.

## Install from source

The extension metadata currently uses the local development UUID `zoneout@local`. Install the repository in a directory with that name:

```bash
extension_dir="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/zoneout@local"
mkdir -p "$(dirname "$extension_dir")"
git clone https://github.com/abinraj-vonnue/zoneout.git "$extension_dir"
glib-compile-schemas "$extension_dir/schemas"
gnome-extensions enable zoneout@local
```

If GNOME Shell does not load the extension immediately, log out and back in, then enable ZoneOut from the Extensions app.

## Package for local installation

From the extension directory, run:

```bash
glib-compile-schemas schemas
gnome-extensions pack --schema=org.gnome.shell.extensions.zoneout .
```

This creates an extension archive that can be installed locally with GNOME’s Extensions app or `gnome-extensions install`.

## Compatibility and publishing

`metadata.json` currently declares GNOME Shell 45, 46, 47, and 48. The project has been developed and checked on GNOME Shell 46; other versions should be verified before claiming support.

Before submitting this extension to [GNOME Extensions](https://extensions.gnome.org/upload/), replace `zoneout@local` with a globally unique UUID and use that UUID as the installed extension directory name. Update the README installation commands to match the new UUID as well.
