import { Pool } from 'pg';
import { config } from './app';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
});

export async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100),
        avatar_url VARCHAR(500),
        is_group BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS name VARCHAR(100)`);
    await client.query(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)`);
    await client.query(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (chat_id, user_id)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        text TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, endpoint)
      );
    `);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_url VARCHAR(500)`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_duration NUMERIC(5,1)`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}'`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS text_search_vector tsvector`);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_text_search ON messages USING GIN(text_search_vector);
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_reads (
        message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        read_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (message_id, user_id)
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);
    `);
    await client.query(`
      CREATE OR REPLACE FUNCTION messages_text_search_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.text_search_vector := to_tsvector('english', COALESCE(NEW.text, ''));
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TRIGGER trg_messages_text_search
          BEFORE INSERT OR UPDATE OF text ON messages
          FOR EACH ROW EXECUTE FUNCTION messages_text_search_trigger();
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    console.log('Migration completed successfully');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
