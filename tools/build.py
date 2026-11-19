import pathlib
r = pathlib.Path(__file__).resolve().parent.parent
core = (r/'src/core.js').read_text().replace("if (typeof module !== 'undefined') module.exports = Core;", "")
(r/'morning-wave.html').write_text((r/'src/page.html').read_text().replace('/*CORE*/', core))
