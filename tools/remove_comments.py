#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXTS = ['.js', '.css', '.html', '.htm', '.svg', '.md']

# Patterns
BLOCK_COMMENT = re.compile(r'/\*[\s\S]*?\*/', re.MULTILINE)
HTML_COMMENT = re.compile(r'<!--([\s\S]*?)-->')
# full-line // comments (leading whitespace allowed)
LINE_COMMENT = re.compile(r'^[ \t]*//.*$', re.MULTILINE)
# trailing // comments not in strings: naive removal (best-effort)
TRAILING_SLASHES = re.compile(r'(?<!:)//.*$')

changed_files = []

for p in ROOT.rglob('*'):
    if p.is_file() and p.suffix.lower() in EXTS:
        try:
            s = p.read_text(encoding='utf-8')
        except Exception:
            continue
        orig = s
        if p.suffix.lower() in ['.html', '.htm']:
            # remove HTML comments
            s = HTML_COMMENT.sub('', s)
            # remove JS-style comments within script blocks
            def strip_script(m):
                script = m.group(0)
                script = BLOCK_COMMENT.sub('', script)
                script = LINE_COMMENT.sub('', script)
                script = TRAILING_SLASHES.sub('', script)
                return script
            s = re.sub(r'<script[\s\S]*?</script>', lambda m: strip_script(m), s, flags=re.IGNORECASE)
        elif p.suffix.lower() == '.css':
            s = BLOCK_COMMENT.sub('', s)
        else: # .js, .md, .svg
            s = BLOCK_COMMENT.sub('', s)
            s = LINE_COMMENT.sub('', s)
            s = TRAILING_SLASHES.sub('', s)
        if s != orig:
            p.write_text(s, encoding='utf-8')
            changed_files.append(str(p.relative_to(ROOT)))

print('Updated', len(changed_files), 'files:')
for f in changed_files:
    print('-', f)
