# For developers

The game is plain HTML, CSS and JavaScript with no framework and no dependencies. `morning-wave.html` is a built file; edit the files in `src/` and rebuild.

## Layout

| Path | What it holds |
| --- | --- |
| `src/core.js` | The rules: scenarios, the shift generator, live disruption events, scoring, the house controller and the solver that sets medal targets. No browser code, so it runs in Node too |
| `src/page.html` | The screen: layout, styles and interface code. `/*CORE*/` marks where `core.js` is inserted |
| `src/test.js` | Rule checks |
| `tools/build.py` | Joins `core.js` into `page.html` and writes `morning-wave.html` |
| `tools/calibrate.js` | Prints house, silver and gold scores for every shift, to check difficulty after a rules change |

## Requirements

- [Node.js](https://nodejs.org) 18 or newer, for the tests and the calibration script.
- Python 3.8 or newer, for the build script.

## Commands

Run the rule checks:

```bash
node src/test.js
```

Rebuild the game after editing `src/`:

```bash
python3 tools/build.py
```

This writes `morning-wave.html` as a complete page. To also write the page without its `<html>` wrapper, for a host that adds its own, pass `--fragment` and a path:

```bash
python3 tools/build.py --fragment build/fragment.html
```

Check difficulty across shifts 1 to 10 (takes about 20 seconds):

```bash
node tools/calibrate.js
```

## Balance numbers

All scoring and timing values are in `RULES` at the top of `src/core.js`. After changing one, run the calibration script and check that gold stays above the house on every shift and that the house starts failing flights from about shift 7.
