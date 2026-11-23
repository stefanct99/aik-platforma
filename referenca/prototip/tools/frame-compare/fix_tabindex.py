#!/usr/bin/env python3
# Faza 10, korak 4: dodaje tabIndex/role/Enter-Space na h('span',{...onClick...}) i h('div',{...onClick...})
# pozive koji ga nemaju, zamenom {props} -> Object.assign({ostali props}, window.AIK.a11yClick(fn)).
# Bezbedno parsira zagrade (ne naivni regex) da ne pokvari onClick funkcije koje same sadrže { }.
import re, sys

SKIP_SUBSTRINGS = [
    "onClick:(e)=>e.stopPropagation()",  # dropdown-panel kontejner, nije sam po sebi kontrola
]

def find_matching_brace(s, start):
    depth = 0
    i = start
    while i < len(s):
        if s[i] == '{': depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0: return i
        i += 1
    return -1

def split_top_level_props(inner):
    # inner je sadržaj IZMEĐU { i } (bez spoljnih zagrada). Deli na top-level "key:value" parove
    # poštujući ugnježdene {}, (), [] i stringove.
    parts = []
    depth = 0
    in_str = None
    cur = []
    i = 0
    while i < len(inner):
        c = inner[i]
        if in_str:
            cur.append(c)
            if c == '\\' and i+1 < len(inner):
                cur.append(inner[i+1]); i += 2; continue
            if c == in_str: in_str = None
            i += 1; continue
        if c in "'\"`":
            in_str = c; cur.append(c); i += 1; continue
        if c in '{([':
            depth += 1
        elif c in '})]':
            depth -= 1
        if c == ',' and depth == 0:
            parts.append(''.join(cur)); cur = []
            i += 1; continue
        cur.append(c); i += 1
    if ''.join(cur).strip(): parts.append(''.join(cur))
    return [p.strip() for p in parts if p.strip()]

def process_file(path):
    with open(path, encoding='utf-8') as f:
        src = f.read()
    out = []
    i = 0
    n_fixed = 0
    pattern = re.compile(r"h\('(span|div)',\{")
    while True:
        m = pattern.search(src, i)
        if not m:
            out.append(src[i:])
            break
        brace_start = m.end() - 1
        brace_end = find_matching_brace(src, brace_start)
        if brace_end == -1:
            out.append(src[i:m.end()]); i = m.end(); continue
        inner = src[brace_start+1:brace_end]
        if 'onClick' not in inner or 'tabIndex' in inner:
            out.append(src[i:brace_end+1]); i = brace_end+1; continue
        skip = any(s in inner for s in SKIP_SUBSTRINGS)
        if skip:
            out.append(src[i:brace_end+1]); i = brace_end+1; continue
        props = split_top_level_props(inner)
        onclick_val = None
        rest = []
        for p in props:
            km = re.match(r'^onClick\s*:\s*(.*)$', p, re.S)
            if km and onclick_val is None:
                onclick_val = km.group(1)
            else:
                rest.append(p)
        if onclick_val is None:
            out.append(src[i:brace_end+1]); i = brace_end+1; continue
        new_props = '{' + ', '.join(rest) + '}'
        replacement = 'Object.assign(' + new_props + ', window.AIK.a11yClick(' + onclick_val + '))'
        out.append(src[i:m.start()])
        out.append("h('" + m.group(1) + "'," + replacement)
        i = brace_end + 1
        n_fixed += 1
    new_src = ''.join(out)
    if n_fixed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_src)
    return n_fixed

if __name__ == '__main__':
    total = 0
    for path in sys.argv[1:]:
        n = process_file(path)
        print(path, n)
        total += n
    print('TOTAL', total)
