import sqlite3 from 'sqlite3';

const dbPath = process.env.SQLITE_DB_PATH || 'data/agent.db';

export function initializeDatabase(): sqlite3.Database {
  const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
      console.error('Failed to open SQLite database:', error.message);
      return;
    }

    db.run('CREATE TABLE IF NOT EXISTS memory (id INTEGER PRIMARY KEY AUTOINCREMENT, prompt TEXT, plan TEXT, tool_output TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
    console.log(`SQLite initialized at ${dbPath}`);
  });

  return db;
}
