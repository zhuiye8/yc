import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  host: process.env.HOST ?? '127.0.0.1',
  port: Number(process.env.PORT ?? 38071),
  dbPath: process.env.DB_PATH ?? path.resolve(__dirname, '../../industry-cache.db'),
};
