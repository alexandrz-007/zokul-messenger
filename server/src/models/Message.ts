import { pool } from '../config/db';
import { Message, ReplyPreview } from '../types';

interface MessageRow {
  id: string; chat_id: string; sender_id: string;
  text: string | null; image_url: string | null;
  image_urls: string[] | null; voice_url: string | null;
  voice_duration: number | null; is_edited: boolean;
  created_at: string;
  reply_id?: string; reply_sender_id?: string;
  reply_sender_name?: string; reply_text?: string | null;
  reply_image_url?: string | null;
}

export async function findByChatId(
  chatId: string,
  offset: number = 0,
  limit: number = 50
): Promise<Message[]> {
  const result = await pool.query(
    `SELECT m.id, m.chat_id, m.sender_id, m.text, m.image_url, m.image_urls, m.voice_url, m.voice_duration,
            m.is_edited, m.created_at,
            rm.id as reply_id, rm.sender_id as reply_sender_id,
            ru.name as reply_sender_name, rm.text as reply_text, rm.image_url as reply_image_url
     FROM messages m
     LEFT JOIN messages rm ON rm.id = m.reply_to_id AND rm.deleted_at IS NULL
     LEFT JOIN users ru ON ru.id = rm.sender_id
     WHERE m.chat_id = $1 AND m.deleted_at IS NULL
     ORDER BY m.created_at DESC
     LIMIT $2 OFFSET $3`,
    [chatId, limit, offset]
  );
  return result.rows.map(mapMessage);
}

export async function create(
  chatId: string,
  senderId: string,
  text?: string,
  imageUrl?: string,
  voiceUrl?: string,
  voiceDuration?: number,
  replyToId?: string,
  imageUrls?: string[]
): Promise<Message> {
  const result = await pool.query(
    `INSERT INTO messages (chat_id, sender_id, text, image_url, image_urls, voice_url, voice_duration, reply_to_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, chat_id, sender_id, text, image_url, image_urls, voice_url, voice_duration, is_edited, created_at`,
    [chatId, senderId, text || null, imageUrl || null, imageUrls || null, voiceUrl || null, voiceDuration || null, replyToId || null]
  );
  const msg = mapMessage(result.rows[0]);
  if (replyToId) {
    msg.replyTo = await getReplyPreview(replyToId);
  }
  return msg;
}

export async function updateMessage(
  messageId: string,
  text: string
): Promise<Message | null> {
  const result = await pool.query(
    `UPDATE messages SET text = $1, is_edited = true, edited_at = NOW()
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING id, chat_id, sender_id, text, image_url, image_urls, voice_url, voice_duration, is_edited, created_at`,
    [text, messageId]
  );
  if (result.rows.length === 0) return null;
  return mapMessage(result.rows[0]);
}

export async function softDelete(messageId: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE messages SET deleted_at = NOW(), text = NULL
     WHERE id = $1 AND deleted_at IS NULL`,
    [messageId]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

export async function findById(messageId: string): Promise<Message | null> {
  const result = await pool.query(
    `SELECT id, chat_id, sender_id, text, image_url, image_urls, voice_url, voice_duration, is_edited, created_at
     FROM messages WHERE id = $1 AND deleted_at IS NULL`,
    [messageId]
  );
  if (result.rows.length === 0) return null;
  return mapMessage(result.rows[0]);
}

async function getReplyPreview(messageId: string): Promise<ReplyPreview | undefined> {
  const result = await pool.query(
    `SELECT m.id, m.sender_id, m.text, m.image_url, u.name as sender_name
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.id = $1 AND m.deleted_at IS NULL`,
    [messageId]
  );
  if (result.rows.length === 0) return undefined;
  const row = result.rows[0] as { id: string; sender_id: string; sender_name: string; text: string | null; image_url: string | null };
  return {
    messageId: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    text: row.text || undefined,
    imageUrl: row.image_url || undefined,
  };
}

function mapMessage(row: MessageRow): Message {
  const msg: Message = {
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    text: row.text || undefined,
    imageUrl: row.image_url || undefined,
    imageUrls: row.image_urls || (row.image_url ? [row.image_url] : undefined) || undefined,
    voiceUrl: row.voice_url || undefined,
    voiceDuration: row.voice_duration != null ? Number(row.voice_duration) : undefined,
    isEdited: row.is_edited || false,
    createdAt: row.created_at,
  };
  if (row.reply_id) {
    msg.replyTo = {
      messageId: row.reply_id,
      senderId: row.reply_sender_id!,
      senderName: row.reply_sender_name!,
      text: row.reply_text || undefined,
      imageUrl: row.reply_image_url || undefined,
    };
  }
  return msg;
}
