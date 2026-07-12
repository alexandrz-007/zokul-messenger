import { pool } from '../config/db';
import { User, UserRow } from '../types';

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url || undefined,
    createdAt: row.created_at,
  };
}

export async function findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const row: UserRow | undefined = result.rows[0];
  if (!row) return null;
  return { ...toUser(row), passwordHash: row.password_hash };
}

export async function findById(id: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1',
    [id]
  );
  const row: UserRow | undefined = result.rows[0];
  return row ? toUser(row) : null;
}

export async function search(query: string, excludeUserId: string, limit: number = 10): Promise<User[]> {
  const result = await pool.query(
    `SELECT id, email, name, avatar_url, created_at FROM users
     WHERE (email ILIKE $1 OR name ILIKE $1) AND id != $2
     LIMIT $3`,
    [`%${query}%`, excludeUserId, limit]
  );
  return result.rows.map(toUser);
}

export async function create(email: string, passwordHash: string, name: string): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, avatar_url, created_at`,
    [email, passwordHash, name]
  );
  return toUser(result.rows[0]);
}

export async function updateProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string }
): Promise<User | null> {
  const sets: string[] = [];
  const params: any[] = [];
  if (data.name !== undefined) {
    sets.push('name = $' + (params.length + 1));
    params.push(data.name);
  }
  if (data.avatarUrl !== undefined) {
    sets.push('avatar_url = $' + (params.length + 1));
    params.push(data.avatarUrl);
  }
  if (sets.length === 0) return findById(userId);
  params.push(userId);
  const result = await pool.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length}
     RETURNING id, email, name, avatar_url, created_at`,
    params
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}
