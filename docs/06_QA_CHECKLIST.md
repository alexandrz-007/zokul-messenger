# QA Checklist

Last reviewed: 2026-07-17
Source commit: 96d5818

## Standard Verification

Root:

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short
```

## Client

```powershell
cd client
npm.cmd run build
npm.cmd test
npm.cmd run lint
cd ..
```

## Server

```powershell
cd server
npm.cmd run build
npm.cmd test
npm.cmd run lint
cd ..
```

## Current Known Status

Last observed during review:

- `npm.cmd run build`: passed
- `npm.cmd test`: passed, 71/71 tests
- React Router future warnings appear in client test output; not currently failing.

## Manual Smoke Scenarios

If environment is available:

- register/login/logout;
- create direct chat;
- create group chat;
- send text message;
- send image;
- send multiple images if supported;
- send voice message if supported;
- edit/delete message;
- upload avatar;
- open image viewer;
- test two tabs for presence behavior;
- verify protected API returns 401 after logout.

## UI QA

For UI/design tasks:

- desktop around 1920x1080;
- laptop around 1366x768;
- mobile around 390x844;
- narrow desktop window;
- no text overlap/clipping;
- no controls for unavailable features;
- focus/disabled states visible.
