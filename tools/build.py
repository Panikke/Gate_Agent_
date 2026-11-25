"""Build the game.

Writes morning-wave.html: a complete web page that opens with a double-click.
With --fragment PATH, also writes the page body without the document wrapper,
for hosts that add their own (such as a claude.ai artifact).
"""
import pathlib, sys
r = pathlib.Path(__file__).resolve().parent.parent
core = (r/'src/core.js').read_text().replace("if (typeof module !== 'undefined') module.exports = Core;", "")
page = (r/'src/page.html').read_text().replace('/*CORE*/', core)
head, _, body = page.partition('<div class="wrap">')
doc = ('<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<style>[hidden]{display:none!important}body{margin:0}</style>\n'
       + head + '</head>\n<body>\n<div class="wrap">' + body + '</body>\n</html>\n')
(r/'morning-wave.html').write_text(doc, encoding='utf-8')
if '--fragment' in sys.argv:
    pathlib.Path(sys.argv[sys.argv.index('--fragment') + 1]).write_text(page, encoding='utf-8')
