import { pool } from '../config/db';
import { Message } from '../types';

export async function findByChatId(
  chatId: string,
  offset: number = 0,
  limit: number = 50
): Promise<Message[]> {
  const result = await pool.query(
    `SELECT id, chat_id, sender_id, text, image_url, created_at
     FROM messages
     WHERE chat_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [chatId, limit, offset]
  );
  return result.rows.map(mapMessage);
}

export async function create(
  chatId: string,
  senderId: string,
  text?: string,
  imageUrl?: string
): Promise<Message> {
  const result = await pool.query(
    `INSERT INTO messages (chat_id, sender_id, text, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, chat_id, sender_id, text, image_url, created_at`,
    [chatId, senderId, text || null, imageUrl || null]
  );
  return mapMessage(result.rows[0]);
}

function mapMessage(row: any): Message {
  return {
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    text: row.text || undefined,
    imageUrl: row.image_url || undefined,
    createdAt: row.created_at,
  };
}
