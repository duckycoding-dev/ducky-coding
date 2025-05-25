import { migrate } from 'drizzle-orm/libsql/migrator';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db } from './client';
import { serverLogger } from '@utils/logs/logger';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  serverLogger.log('⏳ Running migrations...');
  try {
    const migrationDirectory = join(__dirname, 'migrations');
    console.log('Migrations folder:', migrationDirectory);
    await migrate(db, { migrationsFolder: migrationDirectory });
    serverLogger.log('✅⌛️ Migrated successfully');
  } catch (err) {
    serverLogger.error('❌⌛️ Migration failed');
    serverLogger.error(err);
  }
}

main().then(() => {
  console.log('Migration script completed');
});
