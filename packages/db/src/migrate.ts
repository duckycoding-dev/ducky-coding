import { migrate } from 'drizzle-orm/libsql/migrator';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db } from './client';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('⏳ Running migrations...');
  try {
    await migrate(db, { migrationsFolder: join(__dirname, 'migrations') });
    console.log('✅⌛️ Migrated successfully');
  } catch (err) {
    console.error('❌⌛️ Migration failed');
    console.error(err);
  }
}

main();
