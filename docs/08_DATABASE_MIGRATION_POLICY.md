# Zokul: Database Migration Policy

## Purpose

This document defines the rules and conventions for managing database schema changes in the Zokul project. As the project grows beyond MVP, a structured approach to schema evolution is needed to prevent drift, data loss, and coordination problems.

## Current state

Schema is managed from `server/src/config/db.ts` via a runtime `migrate()` function that runs `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... IF NOT EXISTS` statements. This is acceptable for MVP but does not scale.

## Rules for schema changes

### 1. Always use additive changes

- New tables: `CREATE TABLE IF NOT EXISTS`
- New columns: `ALTER TABLE ADD COLUMN IF NOT EXISTS`
- New indexes: `CREATE INDEX IF NOT EXISTS`
- Never drop or rename a column without a clear migration path and validation.

### 2. Always version your schema changes

Even without a migration framework, every schema-altering change must be documented with a version comment:

```ts
// v002: add avatar_url to chats
await pool.query('ALTER TABLE chats ADD COLUMN IF NOT EXISTS avatar_url TEXT');
```

The `migrate()` function in `db.ts` must run these in order and track applied versions.

### 3. Never modify production schema directly

- All schema changes must go through the migration pipeline.
- Hotfixes on production require a rollback plan.

### 4. Migration file convention (planned)

When a migration framework is adopted, migrations should live in `server/migrations/` with the naming convention:

```
YYYYMMDD_HHMMSS_description.sql
```

Each file contains only the SQL for that change, and an `undo.sql` comment if rollback is supported.

### 5. Test migrations

- Every migration must be tested against a clean database.
- The server test suite should run migrations before each test run.

### 6. CI checks

- CI must run `migrate()` against an empty test database.
- CI must verify that `migrate()` is idempotent (running twice produces the same result).

## Future migration framework evaluation

When adopting a formal framework, prefer:

| Requirement | Why |
|---|---|
| TypeScript-native | Matches project stack |
| Supports PostgreSQL | Primary database |
| Idempotent `up` | Safe for CI and redeploys |
| Rollback support | Critical for production |

Recommended candidates:

- **node-pg-migrate** — lightweight, PostgreSQL-focused, programmatic API.
- **Flyway** (via Java plugin) — battle-tested, but adds Java dependency.
- **Prisma Migrate** — if the project adopts Prisma ORM.

## Current migration plan (v001)

The current `migrate()` function in `db.ts` is considered `v001`. It creates the following schema:

- `users` table with token_version
- `chats` table with group support
- `chat_participants` join table
- `messages` table with full-text search
- `push_subscriptions` table

Do not modify `migrate()` to remove existing tables or columns. Only add new objects with conditional creation.

## Transitioning off migration()

When a migration framework is adopted:

1. Extract the current schema into a `migrations/v001_initial_schema.sql` file.
2. Replace `migrate()` calls with the framework's run mechanism.
3. Remove `migrate()` after all environments have applied v001.
4. Keep `db.ts` as a connection pool init only.
