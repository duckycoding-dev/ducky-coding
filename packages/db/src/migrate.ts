import { migrate } from 'drizzle-orm/libsql/migrator';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db } from './client';
import { logger } from './utils/logger';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  logger.log('⏳ Running migrations...');
  try {
    await migrate(db, { migrationsFolder: join(__dirname, 'migrations') });
    logger.log('✅⌛️ Migrated successfully');
  } catch (err) {
    logger.error('❌⌛️ Migration failed');
    logger.error(err);
  }
}

main();
