# DAWN visual refinement

Palette: midnight #101a29, surface #172437, border #2c3b4d, sunrise #e9be78, mist #a9b7c9, white #f3f5f7.
Typography: locally available Trebuchet MS for friendly, open interface text; Georgia for the short reflective message. No remote font requests.
Layout: left-aligned greeting → sunrise routine panel → six named ritual shortcuts → weekly activity → personal goals and support. Desktop uses a two-column dashboard; compact phones use a single column with fixed safe-area navigation.

    Greeting / date
    [ Morning routine / sunrise ] [ Weekly activity ]
    [ Six ritual shortcuts      ] [ Personal goals  ]
    [ Daily reflection          ] [ Support         ]

The sunrise is the signature visual. Everything else uses matte surfaces, quiet borders, restrained gold, and no continuous decorative animation. Full ritual names replace ambiguous SAVERS initials. The original brief asks for navy, gold, rounded cards, and compact mobile navigation; those remain, while repeated glass, glows, badges, and tiny labels are removed.

## Liquid glass refinement

Updated at the user's request: retain the dashboard structure, with translucent navy surfaces, static blue/gold/violet light behind them, fine reflective edges, softly rounded controls, and a floating glass navigation capsule. The gold routine button remains opaque for contrast. Native system typography suits the translucent material.

Use CSS backdrop-filter with its WebKit prefix and a painted fallback. Avoid displacement filters, animated blur, and pointer-tracking effects. Small mobile ritual tiles use painted glass to limit compositing. Reduced transparency and increased contrast preferences switch major surfaces to solid navy. Navigation keeps safe-area clearance and the page reserves enough scrolling room below it.
