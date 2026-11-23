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

The extension UUID is `zoneout@abinraj`. Install the repository in a directory with that name:

```bash
extension_dir="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/zoneout@abinraj"
mkdir -p "$(dirname "$extension_dir")"
git clone https://github.com/abinraj-vonnue/zoneout.git "$extension_dir"
glib-compile-schemas "$extension_dir/schemas"
gnome-extensions enable zoneout@abinraj
```

If GNOME Shell does not load the extension immediately, log out and back in, then enable ZoneOut from the Extensions app.

## Run tests

The logic tests use Vitest and Node.js. Install the development dependency and run the suite with:

```bash
npm install
npm test
```

The tests cover work-interval scheduling, message rotation, and the hourglass sand geometry. GNOME Shell UI integration still needs to be checked in a running Shell session.

## Package for local installation

From the extension directory, run:

```bash
glib-compile-schemas schemas
gnome-extensions pack \
  --schema=schemas/org.gnome.shell.extensions.zoneout.gschema.xml \
  --extra-source=src \
  --extra-source=assets \
  --extra-source=README.md \
  --extra-source=LICENSE \
  --out-dir=dist .
```

This creates an extension archive that can be installed locally with GNOME’s Extensions app or `gnome-extensions install`.

## Compatibility and publishing

`metadata.json` declares GNOME Shell 46, the version used for development and verification. Verify compatibility on other GNOME Shell versions before adding them to the metadata.

To publish the extension, package it with the commands above and submit the ZIP at [GNOME Extensions](https://extensions.gnome.org/upload/). GNOME Extensions requires a unique UUID and a GPL-compatible license.

## License

ZoneOut is distributed under the GNU General Public License, version 2 or (at your option) any later version. See [LICENSE](LICENSE) for the full terms.
