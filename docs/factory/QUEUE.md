# Factory queue snapshot

The operational queue lives in GitHub issue labels. This file is a reviewable snapshot
written by `factory-triage` and reported by `/factory`; implementation routines query
GitHub directly.

An unmerged update to this file must never block a later routine from seeing work. Durable
run evidence lives in one file per run under `docs/factory/runs/`.

**Dispositions**

| Disposition | Next stage |
|---|---|
| `ready-to-implement` | factory-implement picks it up |
| `ready-to-spec` | human runs factory-spec |
| `needs-info` | parked, question is on the issue |
| `wait-to-implement` | parked, blocker named below |
| `awaiting-review` | PR open, human owns it |
| `done` | merged by a human |

The corresponding live labels use the `factory:` prefix, for example
`factory:ready-to-implement` and `factory:awaiting-review`. The live issue also carries a
`factory-handoff:v1` comment with the fields needed by implementation.

---

## FQ-1: Add a persistent light and dark theme toggle
- disposition: ready-to-implement
- source: https://github.com/SujathaKarthikeyan/factory-demo/issues/1
- last_triaged: 2026-10-23
- repro: not-attempted (feature request, nothing to reproduce)
- files_expected: lib/theme.ts, lib/theme.test.ts, components/theme-toggle.tsx, app/layout.tsx, app/globals.css
- load_bearing: false
- gate_level: full
- done_when: A new test file `lib/theme.test.ts` covers system-preference resolution with nothing stored, a stored explicit choice overriding the system preference, and persistence of an explicit choice with invalid stored values ignored; the test fails without `lib/theme.ts`; `gates.sh full` reports `FACTORY_GATES` status=GREEN; the PR body records manual checks at 375px and 1440px (keyboard-operable toggle with visible focus, both nav links usable at 375px, no flash of the wrong theme on reload).
- confidence: medium
- notes: Matches the charter's AUTOMATABLE "theme UI" entry and touches about 5 files, none load-bearing. Keep the local-storage logic in a small pure module in `lib/` so Vitest's `node` environment can test it with a storage stub; do not add jsdom or any other dependency, because `package.json` is load-bearing. Avoiding the flash needs a small inline script in `app/layout.tsx` that sets the theme before hydration (with `suppressHydrationWarning` on `<html>`). Confidence is medium only because that pre-hydration step and the manual width checks cannot be proved by unit tests alone.
