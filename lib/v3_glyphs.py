# -*- coding: utf-8 -*-
"""Crisp one-colour glyphs for the v3 slide buttons (they inherit the button's text colour), replacing the
full-colour Lumio icons inside buttons, where those read as a small badge rather than part of the button."""
import re

_S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
GLYPHS = {
    "sound": f'<svg {_S}><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18.3 6.3a8 8 0 0 1 0 11.4"/></svg>',
    "play": f'<svg {_S}><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>',
    "eye": f'<svg {_S}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>',
    "check": f'<svg {_S} stroke-width="3"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    "dice": f'<svg {_S}><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.4" fill="currentColor" stroke="none"/></svg>',
    "star": f'<svg {_S}><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8-4.3-4.1 5.9-.8z" fill="currentColor" stroke="none"/></svg>',
    "clock": f'<svg {_S}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    "bolt": f'<svg {_S}><path d="M13 3L5 13.5h6L10 21l8.5-10.5h-6z" fill="currentColor" stroke="none"/></svg>',
}
_ICO = re.compile(r'<i class="v3-ico" data-ico="(\w+)"([^>]*)></i>\s*')


def buttons(html):
    """Inside every <button class="v3-btn ..."> swap a leading Lumio icon for a glyph, and wrap the label."""
    def fix(m):
        open_tag, inner = m.group(1), m.group(2)
        g = _ICO.search(inner)
        glyph = ""
        if g and g.group(1) in GLYPHS:
            glyph = f'<span class="v3-gl">{GLYPHS[g.group(1)]}</span>'
            inner = _ICO.sub("", inner, count=1)
        label = inner.strip()
        if not label and glyph:
            return f'{open_tag}{glyph}</button>'
        return f'{open_tag}{glyph}<span class="v3-bl">{label}</span></button>' if label else m.group(0)
    return re.sub(r'(<button\b[^>]*class="v3-btn[^"]*"[^>]*>)(.*?)</button>', fix, html, flags=re.S)
