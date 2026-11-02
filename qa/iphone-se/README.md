# iPhone SE 2020 layout audit

Date: November 2, 2026
Target: 375 × 667 CSS pixels. Browser viewport testing, not physical iPhone testing.

## Verified results

| Screen | Horizontal overflow at 375px | Enabled buttons below 44 × 44px | Result |
|---|---|---|---|
| Home | None | 0 | Pass |
| Rituals | None | 0 | Pass |
| Focus | None | 0 | Pass |
| Progress | None | 0 | Pass |

Measurements cover the rendered DOM, including content below the first viewport. Decorative sunrise shapes intentionally clipped within their illustration were excluded from the content overflow check. The preview browser reserves a few pixels for its scrollbar, so its document width was 371px inside the 375px viewport.

Additional checks:

- All four tabs fit at 320px and 390px widths without horizontal overflow. At 320px, seven-column calendar dates necessarily have narrower targets; the primary 375px SE target has no undersized enabled buttons.
- All four tabs fit at 375 × 500 and 667 × 375 without horizontal overflow.
- All six ritual screens opened and had no content overflow or undersized enabled buttons at 375 × 667.
- Visible Exercise, Reading, Scribing and Settings form controls computed to 16px text.
- Support grounding, activities, and reflection sections had no overflow or undersized buttons. Breathing view visually inspected.
- Settings custom durations remained horizontally contained at 375 × 400. Its panel was about 376px tall and independently scrollable through 1137px of content.
- Restart and install-guide overlays visually inspected. Escape closed the install guide; the Settings flow intentionally closes Settings when opening that guide.
- Home's final privacy note scrolled above navigation (bottom about 549px; navigation top about 598px). Progress's journal archive also cleared navigation (bottom about 521px).
- Switching from a scrolled page to Home returned scroll position to 0.

## Changes made

- `src/liquid-glass.css:199`: shared 44px touch targets, 16px form controls inherited from the base stylesheet, scrollable overlays, more legible mobile labels, fewer simultaneous blur layers on ritual screens.
- `src/components/RitualsTab.tsx:151`: ritual rows became accessible buttons; text columns shrink instead of crowding trailing actions.
- `src/components/FocusTab.tsx:162`: milestone name and remaining days use separate rows. Check-in confetti respects reduced motion.
- `src/components/ProgressTab.tsx:169`: calendar mode and goal filters wrap into full-width rows; calendar cells use the available width; arrows enlarged; dates have full accessible names; journal archive uses page scrolling.
- `src/components/SettingsModal.tsx:151`: custom durations use one column on compact screens, with named numeric fields and touch-sized controls.
- `src/components/ActiveRitualRunner.tsx:325`: compact header, constrained tagline, larger timer controls, and additional form labels.
- `src/components/Modal.tsx:1`: shared portal avoids transformed/blurred parent containment; locks background scrolling, keeps focus inside the dialog, restores focus when closed, and follows visualViewport changes to accommodate mobile keyboards.
- `src/App.tsx:28`: tab navigation returns to the top; shared dialog used for installation instructions.
- `index.html` and `vite.config.ts`: browser/PWA theme colors match the navy shell.

## Validation

- `npm run build`: passed, including service worker generation.
- `npm test`: 26 existing tests passed across five files. These are unit tests; the browser measurements above supply the layout evidence.
- `npm run lint`: completed with 13 existing warnings, no errors.
- `git diff --check`: passed.

## Remaining device checks

A physical iPhone SE is still required to verify Safari's actual keyboard, toolbar resizing, standalone Add to Home Screen behavior, VoiceOver, battery use, and smoothness of the glass effects. Reduced-height browser checks approximate limited vertical space but do not emulate iOS keyboard behavior. No frame-rate or battery benchmark was performed.

The journal archive empty state was exercised; editing a populated historical journal was code-reviewed but not exercised with a saved entry. Backup import/export and destructive history actions were outside this layout audit. No test journal, check-in, or restart records were saved.

## Evidence

- [Home](home.jpg)
- [Rituals](rituals.jpg)
- [Focus](focus.jpg)
- [Progress](progress.jpg)
- [Progress scrolled to journal](progress-bottom.jpg)
- [DOM measurements](measurements.json)
- [Reduced-height measurements](short-viewports.json)

Review reference: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).
