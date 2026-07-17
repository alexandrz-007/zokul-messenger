# Change Requests

## CR-2026-07-17-001: Add index.css to Allowed Files for ZOKUL-MOBILE-001

Status: Approved
Task ID: ZOKUL-MOBILE-001
Requested by: Executor
Date: 2026-07-17

Reason: The `safe-area-top` CSS class in `client/src/index.css` is the mechanism used by `AppLayout.tsx` to add top safe-area padding. The class originally had `padding-top: env(safe-area-inset-top)` with no fallback, which evaluates to `0` on non-PWA iPhone Safari. Adding `, 12px` fallback is required for the iPhone header overlap fix — without it the `safe-area-top` class is effectively `padding-top: 0px` when the app is used in a browser (not PWA).

Requested scope change: Add `client/src/index.css` to the active task's Allowed Files.

Files affected: `client/src/index.css` (one-line change: `, 12px` fallback added to `safe-area-top`).

Risk: Low. CSS class with `env()` fallback is well-supported on modern browsers. The original file already used `env()`.

Governor decision: Approved. The change is a narrow one-line CSS fallback required by the mobile safe-area task, and `client/src/index.css` is now included in the active task's Allowed Files.

Use this format when scope must change:

```markdown
## CR-YYYY-MM-DD-NNN: Title

Status: Pending | Approved | Rejected | Superseded
Task ID:
Requested by:
Date:

Reason:

Requested scope change:

Files affected:

Risk:

Governor decision:
```
