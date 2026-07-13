# Cycle #13 — Avatar fixes + UI polish

## What was done

| # | Task | Files | Status |
|---|------|-------|--------|
| 1 | Avatar `onError` fallback (broken img → initials) | `Avatar.tsx` | ✅ |
| 2 | Show `url` in ChatList, ChatView, HomePage, modals | `ChatList.tsx`, `ChatView.tsx`, `HomePage.tsx`, `CreateChatModal.tsx`, `CreateGroupModal.tsx` | ✅ |
| 3 | Uploads volume mount in docker-compose.local.yml | `docker-compose.local.yml` | ✅ |
| 4 | `imgError` reset on `url` change (avatar vanished after upload) | `Avatar.tsx` | ✅ |
| 5 | `Zokul` heading (solid primary color) on `/login` + `/register` | `App.tsx`, `animations.css` | ✅ |

## Test results
- Server: **44/44** (12 suites)
- Client: **4/4** (2 suites)
- Docker build & compose: ✅
- Avatars persist across container restarts (named volume)
- Avatars visible from other accounts (ChatList, ChatView, etc.)
- Image load failure → graceful fallback to initials
