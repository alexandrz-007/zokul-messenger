import { pool } from '../config/db';
import { ChatWithUsers } from '../types';
import * as chatModel from '../models/Chat';

export async function createGroup(
  creatorId: string,
  name: string,
  participantIds: string[]
): Promise<ChatWithUsers> {
  const allIds = [creatorId, ...participantIds.filter((id) => id !== creatorId)];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const chatResult = await client.query(
      `INSERT INTO chats (name, is_group) VALUES ($1, true) RETURNING id, created_at`,
      [name]
    );
    const chatId = chatResult.rows[0].id;
    for (const userId of allIds) {
      await client.query(
        'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
        [chatId, userId]
      );
    }
    await client.query('COMMIT');
    const chat = await chatModel.findChatById(chatId);
    return chat!;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function addMember(chatId: string, userId: string): Promise<void> {
  await pool.query(
    'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [chatId, userId]
  );
}

export async function removeMember(chatId: string, userId: string): Promise<void> {
  await pool.query(
    'DELETE FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
    [chatId, userId]
  );
}
