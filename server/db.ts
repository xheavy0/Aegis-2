import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from './auth.js';
import { AuthUser, UserRole } from '../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'aegis.db');

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    role          TEXT NOT NULL,
    title         TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  password_hash: string;
}

// Default demo users seeded on first boot. All share the demo password below.
const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'aegis2026';
const SEED_USERS: AuthUser[] = [
  { id: 'admin', name: 'Admin', email: 'admin@company.com', role: 'Admin', title: 'Platform Administrator' },
  { id: 'auditor', name: 'External Auditor', email: 'auditor@auditfirm.com', role: 'Auditor', title: 'Audit Reviewer' },
  { id: 'compliance', name: 'Compliance Lead', email: 'compliance@company.com', role: 'Compliance', title: 'Compliance Manager' },
  { id: 'risk', name: 'Risk Officer', email: 'risk@company.com', role: 'Risk Officer', title: 'Enterprise Risk Officer' },
  { id: 'user', name: 'Alex C.', email: 'officer@company.com', role: 'User', title: 'GRC Contributor' },
];

function seedUsers(): void {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get() as unknown as { n: number };
  if (count.n > 0) return;
  const insert = db.prepare(
    'INSERT INTO users (id, name, email, role, title, password_hash) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const hash = hashPassword(DEMO_PASSWORD);
  for (const u of SEED_USERS) {
    insert.run(u.id, u.name, u.email.toLowerCase(), u.role, u.title, hash);
  }
  console.log(`Seeded ${SEED_USERS.length} demo users (password: "${DEMO_PASSWORD}")`);
}

seedUsers();

function toAuthUser(row: UserRow): AuthUser {
  return { id: row.id, name: row.name, email: row.email, role: row.role as UserRole, title: row.title };
}

export function findUserByEmail(email: string): (AuthUser & { passwordHash: string }) | null {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as unknown as UserRow | undefined;
  if (!row) return null;
  return { ...toAuthUser(row), passwordHash: row.password_hash };
}

export function findUserById(id: string): AuthUser | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRow | undefined;
  return row ? toAuthUser(row) : null;
}
