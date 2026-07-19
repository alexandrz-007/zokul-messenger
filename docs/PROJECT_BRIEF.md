# Zokul Project Overview

Last reviewed: 2026-07-17
Source commit: 96d5818

## Purpose

Zokul is a web messenger/PWA with direct chats, group chats, realtime messaging, media uploads, voice messages, presence, typing indicators, push notifications, and profile editing.

## Current Stack

| Area | Technology |
|---|---|
| Client | React 18, TypeScript, Vite, Tailwind CSS, PWA, Socket.IO client |
| Server | Node.js, Express, TypeScript, Socket.IO |
| Database | PostgreSQL |
| Realtime/cache | Redis, Socket.IO Redis adapter |
| Media | Local upload storage processed by multer/sharp |
| Auth | JWT in httpOnly cookie, tokenVersion revocation |
| Tests | Vitest client tests, Jest server tests |
| Deployment | Docker Compose, nginx, GitHub Actions CI |

## Implemented Capabilities

- Login/register/logout.
- Authenticated REST API.
- Direct and group chats.
- Message send/edit/delete.
- Text, image, multiple image, and voice message support.
- Reply/edit/delete UI context.
- Online/offline presence.
- Typing indicator.
- Push subscription support.
- Profile editor and avatar upload.
- Dark/light theme infrastructure.

## Important Commands

Root:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd test
npm.cmd run lint
```

Client:

```powershell
cd client
npm.cmd run dev
npm.cmd run build
npm.cmd test
npm.cmd run lint
```

Server:

```powershell
cd server
npm.cmd run dev
npm.cmd run build
npm.cmd test
npm.cmd run lint
npm.cmd run migrate
```

Use `npm.cmd` on Windows PowerShell if `npm.ps1` is blocked by execution policy.

## Branch Policy

- `master`: full code/documentation branch and integration branch.
- `production`: deploy/fresh production branch, do not touch without explicit request.
- `codex/*`: preferred feature branches for AI work.

Current local state at migration time:

- branch: `master`;
- ahead of `origin/master` by 2 commits;
- latest hardening commits: `7609f40`, `96d5818`.

## Legacy Documentation

Historical project docs have been consolidated into the current `docs/` layout. Content from legacy files was merged into the following canonical documents:

| Legacy | Consolidated Into |
|---|---|
| `00_PROJECT_PLAN.md`, `05_IMPROVEMENT_OVERVIEW.md` | `PROJECT_BRIEF.md` |
| `01_STRUCTURE.md`, `02_ARCHITECTURE.md`, `10_ARCHITECTURE_MAP_SOURCE.md` | `ARCHITECTURE.md` |
| `03_TASKS_BACKLOG.md`, `06_IMPROVEMENT_TASKS.md` | `BACKLOG.md` |
| `04_QA_STRATEGY.md`, `08_IMPROVEMENT_QA_SECURITY.md` | `DEFINITION_OF_DONE.md` |
| `07_AGENT_IMPLEMENTATION_GUIDE.md` | `00_README_FOR_AGENTS.md` |
| `08_DATABASE_MIGRATION_POLICY.md` | `BACKLOG.md`, `DEPLOYMENT.md` |
| `09_UI_REDESIGN_IMPLEMENTATION_GUIDE.md` | `BACKLOG.md` |
| `FUTURE_PLAN.md`, `PROCESS.md`, `PROGRESS.md` | Various current docs |

Prefer `docs` for all AI workflow state.
