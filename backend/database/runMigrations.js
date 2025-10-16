import fs from 'fs';
import path from 'path';
import { getPool } from './connectAzureSQL.js';

// Split SQL content by GO batches (case-insensitive, handles CRLF)
function splitByGo(sqlText) {
  const goRegex = /^\s*GO\s*$/gmi;
  // Replace GO lines with a delimiter and then split
  const normalized = sqlText.replace(/\r\n/g, '\n');
  const parts = normalized
    .split('\n')
    .reduce((acc, line) => {
      if (line.match(/^\s*GO\s*$/i)) {
        acc.push('__GO__');
      } else {
        acc.push(line);
      }
      return acc;
    }, [])
    .join('\n')
    .split('__GO__');
  return parts.map(p => p.trim()).filter(p => p.length > 0);
}

export async function runMigrations() {
  const migrationsDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'migrations');
  const pool = await getPool();

  let files = [];
  try {
    files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.error('Failed to read migrations directory:', err.message);
    throw err;
  }

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    console.log(`Running migration: ${file}`);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const batches = splitByGo(content);
      for (const batch of batches) {
        const request = pool.request();
        await request.query(batch);
      }
      console.log(`Migration completed: ${file}`);
    } catch (err) {
      const msg = err.message || '';
      // Ignore common idempotent errors (object already exists)
      const ignorable = (
        msg.includes('already an object named') ||
        msg.includes('already exists') ||
        msg.includes('Cannot create') && msg.includes('because it already exists')
      );
      if (ignorable) {
        console.warn(`Migration warning (ignored): ${msg}`);
        continue;
      }
      console.error(`Migration failed for ${file}: ${msg}`);
      throw err;
    }
  }
}