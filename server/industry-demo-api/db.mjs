import Database from 'better-sqlite3';
import { config } from './config.mjs';

let dbInstance;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(config.dbPath, {
      readonly: true,
      fileMustExist: true,
    });
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('busy_timeout = 5000');
  }

  return dbInstance;
}
