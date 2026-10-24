import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { PRODUCTS } from '../catalog';
import type { AccountProfile, Announcement, Booking, DemoUser, Order, Product, ShopNotification } from '../types';
import { localDemo } from './config';

export interface Account extends DemoUser { passwordHash: string; profile?: AccountProfile }
export interface Session { hash: string; userId: string; expiresAt: number }
export interface Subscription { userId: string; endpoint: string; keys: { p256dh: string; auth: string }; locale: 'en' | 'fr' }
export interface Database {
  products: Product[]; users: Account[]; sessions: Session[]; orders: Order[]; bookings: Booking[];
  announcements: Announcement[]; notifications: ShopNotification[]; subscriptions: Subscription[];
  requests: Record<string, { count: number; expires: number }>;
  idempotency: Record<string, string>;
}
export function seedDatabase(): Database {
  return { products: structuredClone(PRODUCTS).map((product) => ({ ...product, published: true })), users: [], sessions: [], orders: [], bookings: [], announcements: [], notifications: [], subscriptions: [], requests: {}, idempotency: {} };
}
/** Correct only untouched archive listings; retain stock, prices, uploads and order snapshots. */
export function reconcileDemoCatalog(db: Database): Database {
  const oldImages = [4, 5, 6, 7, 8, 9, 10, 11];
  const oldNames = ['Le Francesco Loafer', 'L’Artisan Kanvo Oxford', 'Royal Raffia Monk Strap', 'Cotonou Patina Leather Tote', 'Italian Calfskin Belt', 'Kente Accent Derby', 'Décontracté Chic Mule', 'Heritage Weekender Bag'];
  db.products = db.products.map((product) => {
    const index = PRODUCTS.findIndex((seed) => seed.id === product.id);
    if (index < 0 || product.images?.length) return product;
    const corrected = PRODUCTS[index];
    const legacy = product.image === oldImages[index] && product.name.en === oldNames[index];
    const encodingDefect = product.image === corrected.image && product.name.en === corrected.name.en.replace(/[^ -~]/g, '?') && JSON.stringify([product.name, product.description, product.material, product.color]).includes('?');
    // The correct English title can be ASCII even when only French text was affected.
    const frenchEncodingDefect = product.image === corrected.image && product.name.en === corrected.name.en && JSON.stringify([product.name.fr, product.description.fr, product.material.fr, product.color.fr]).includes('?');
    if (!legacy && !encodingDefect && !frenchEncodingDefect) return product;
    return { ...product, ...structuredClone(corrected), prices: product.prices, stock: product.kind === corrected.kind ? product.stock : corrected.stock, published: product.published, updatedAt: product.updatedAt };
  });
  return db;
}
const dataFile = () => process.env.DEMO_DATA_FILE || path.join(process.cwd(), '.data', 'shop.json');
const LOCAL_RENAME_RETRY_DELAYS = [25, 50, 75, 100, 125] as const;
let queue: Promise<unknown> = Promise.resolve();
let initialized: Promise<void> | undefined;

async function replaceLocalFile(temporary: string, target: string): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try { await rename(temporary, target); return; }
    catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      // Windows scanners can briefly prevent atomic replacement of an open file.
      // Retry that operation only; permanent permissions and other failures still surface.
      if (process.platform !== 'win32' || (code !== 'EPERM' && code !== 'EBUSY') || attempt >= LOCAL_RENAME_RETRY_DELAYS.length) throw error;
      await delay(LOCAL_RENAME_RETRY_DELAYS[attempt]);
    }
  }
}

function sqlClient() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required on hosting.');
  return neon(process.env.DATABASE_URL);
}
async function initialize() {
  const sql = sqlClient();
  await sql`CREATE TABLE IF NOT EXISTS maison_demo_store (id integer PRIMARY KEY CHECK (id = 1), revision bigint NOT NULL DEFAULT 1, data jsonb NOT NULL)`;
  await sql`INSERT INTO maison_demo_store (id, data) VALUES (1, ${JSON.stringify(seedDatabase())}::jsonb) ON CONFLICT (id) DO NOTHING`;
}
function requireStorage() {
  if (!process.env.DATABASE_URL && !localDemo()) throw new Error('Configure DATABASE_URL before publishing this demo. Run npm run setup:demo for local use.');
}
export async function readDatabase(): Promise<{ data: Database; revision: number }> {
  requireStorage();
  if (process.env.DATABASE_URL) {
    initialized ??= initialize().catch((error) => { initialized = undefined; throw error; });
    await initialized;
    const rows = await sqlClient()`SELECT data, revision FROM maison_demo_store WHERE id = 1`;
    return { data: reconcileDemoCatalog(rows[0].data as Database), revision: Number(rows[0].revision) };
  }
  try { const stored = JSON.parse(await readFile(/* turbopackIgnore: true */ dataFile(), 'utf8')); return { ...stored, data: reconcileDemoCatalog(stored.data) }; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return { data: seedDatabase(), revision: 0 };
  }
}

/** Single atomic aggregate for a small demonstration shop. PostgreSQL compare-and-swap
 * prevents concurrent checkouts from overselling, including across serverless instances.
 * Callbacks must be synchronous and side-effect free because conflicts are retried. */
export async function mutateDatabase<T>(change: (db: Database) => T): Promise<T> {
  requireStorage();
  const run = async () => {
    for (let attempt = 0; attempt < 12; attempt++) {
      const { data, revision } = await readDatabase();
      const result = change(data);
      if (process.env.DATABASE_URL) {
        const rows = await sqlClient()`UPDATE maison_demo_store SET data = ${JSON.stringify(data)}::jsonb, revision = revision + 1 WHERE id = 1 AND revision = ${revision} RETURNING revision`;
        if (!rows.length) continue;
      } else {
        const target = dataFile();
        await mkdir(path.dirname(target), { recursive: true });
        const temporary = `${target}.${randomUUID()}.tmp`;
        await writeFile(temporary, JSON.stringify({ data, revision: revision + 1 }), { mode: 0o600 });
        await replaceLocalFile(temporary, target);
      }
      return result;
    }
    throw new Error('The boutique is busy. Please try again.');
  };
  const pending = queue.then(run, run);
  queue = pending.then(() => undefined, () => undefined);
  return pending;
}
