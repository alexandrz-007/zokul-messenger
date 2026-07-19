<h1 align="center">Zokul</h1>

<p align="center">
  <strong>Mobile-first realtime messenger built as a full-stack production-ready web app.</strong>
</p>

<p align="center">
  <a href="https://zokul.zhichkin.space">Live Demo</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#architecture">Architecture</a>
  ·
  <a href="#local-development">Local Development</a>
  ·
  <a href="#documentation">Documentation</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white">
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socketdotio&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Deployable-2496ED?logo=docker&logoColor=white">
</p>

<p align="center">
  <img src="docs/assets/screenshots/chat-dark.png" alt="Zokul messenger chat interface" width="960">
</p>

## Overview

Zokul is a realtime web messenger with a clean dark interface, responsive layout, voice messages, media sharing, online presence, and Docker-based deployment.

The project is designed as a real product rather than a UI prototype: it has a client, API server, database, realtime transport, file uploads, production compose files, release scripts, tests, and project documentation for AI-assisted development.

## Features

- Realtime private and group chats powered by Socket.IO.
- Text messages, image attachments, multiple image upload, replies, editing, and deletion.
- Voice messages with browser recording and audio playback.
- Online status, typing states, and message delivery/read-state foundation.
- User profile editing with avatar upload.
- Dark and soft-light themes.
- Mobile-first responsive messenger layout.
- PWA-ready frontend for app-like browser usage.
- Rate limiting, validation, authentication, and production-oriented server configuration.
- Docker Compose environments for local and production checks.

## Screenshots

### Chat Experience

<p align="center">
  <img src="docs/assets/screenshots/chat-dark.png" alt="Zokul dark chat screen" width="920">
</p>

### Authentication

<p align="center">
  <img src="docs/assets/screenshots/login.png" alt="Zokul login screen" width="920">
</p>

## Architecture

```mermaid
flowchart LR
  User["Browser / PWA"] --> Client["React + TypeScript client"]
  Client --> API["Express REST API"]
  Client <-->|"Socket.IO events"| Realtime["Socket.IO server"]
  API --> DB["PostgreSQL"]
  Realtime --> DB
  API --> Uploads["Local upload storage"]
  API --> Redis["Redis / rate-limit support"]
  Nginx["Nginx / production reverse proxy"] --> Client
  Nginx --> API
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, PWA |
| Realtime | Socket.IO |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Cache / limits | Redis |
| Storage | Local uploads volume |
| Deployment | Docker, Docker Compose, Nginx |
| Quality | Unit/integration tests, release scripts, project protocol docs |

## Local Development

Install dependencies:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Run the client and server in development mode:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build the project:

```bash
npm run build
```

## Docker Check

Run the local Docker environment:

```bash
docker compose -f docker-compose.local.yml up -d --build
```

Open:

```text
http://localhost
```

Stop containers:

```bash
docker compose -f docker-compose.local.yml down
```

## Production Deployment

Production deployment uses the dedicated compose file. Build and run on your server:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Secrets, certificates, and runtime `.env` files are not stored in the repository
(see [Deploy on your own server](#deploy-on-your-own-server) for the required `.env` setup).

## Deploy on your own server

This project is a Dockerized full-stack app (Node API/Socket.IO + React/Vite static client behind nginx).
To run it on your own host you need: a Linux server with Docker, a domain pointing at it, and TLS certificates.

### 1. Prerequisites

- Docker + Docker Compose v2 installed on the server.
- A domain (e.g. `chat.example.com`) with an A/AAAA record pointing to the server.
- TLS certificate + private key for that domain, placed in `./ssl/` as:
  - `ssl/fullchain.pem`
  - `ssl/privkey.pem`

> The compose file mounts `./ssl:/etc/nginx/ssl:ro`. Certbot example:
> `certbot certonly --webroot -w /var/www/certbot -d chat.example.com`
> then copy `/etc/letsencrypt/live/chat.example.com/fullchain.pem` and `privkey.pem` into `./ssl/`.

### 2. Create `.env`

Copy the example and fill in real values (this file is git-ignored and must NOT be committed):

```bash
cp .env.example .env
```

Edit `.env`:

```ini
JWT_SECRET=replace-with-a-long-random-string
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
# optional overrides:
# DATABASE_URL=postgresql://zokul:zokul@postgres:5432/zokul
# REDIS_URL=redis://redis:6379
# CORS_ORIGIN=https://chat.example.com
# UPLOAD_DIR=/app/uploads
```

Generate VAPID keys (for web push) with:

```bash
npx web-push generate-vapid-keys
```

### 3. Point the app at your domain

Two files hardcode the public domain. Replace `zokul.zhichkin.space` with your own in both:

- `docker-compose.prod.yml` → `CORS_ORIGIN` and the `nginx` `server_name`.
- `client/nginx.conf` → `server_name`.

(When `CORS_ORIGIN` is empty the container defaults to `https://zokul.zhichkin.space`, so set it explicitly.)

### 4. Build and run

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Then verify:

```bash
curl -s https://chat.example.com/api/health
# -> {"status":"ok", ...}
```

### 5. Notes

- Postgres and Redis data persist in the `pgdata` / `redisdata` volumes.
- Uploads live in the `uploads` volume (git-ignored).
- For a clean start that wipes runtime data, remove the volumes:
  `docker compose -f docker-compose.prod.yml down -v` (then re-run step 4).

## Documentation

This public repository ships the runnable application only. The internal project
documentation, agent prompts, and task/audit logs are kept in a separate
development workspace and are intentionally not included here.

For architecture and the tech stack, see [Architecture](#architecture) and
[Tech Stack](#tech-stack) above.

## Repository Model

- `master` - main source branch with code and documentation.
- `production` - deployable branch for server updates.

The project keeps generated artifacts, runtime uploads, local reports, and secrets out of Git.

## Roadmap

- Improve read receipts and message state clarity.
- Add user profile viewing for chat participants.
- Expand group chat controls.
- Add an admin panel for moderation and operational visibility.
- Continue strengthening automated tests around realtime and media flows.

## Project Status

Zokul is actively developed as a portfolio-grade full-stack messenger. The current focus is product polish, stable deployment, clean documentation, and a workflow where planning and implementation can be safely split between different AI agents.
