import test from 'node:test';
import assert from 'node:assert/strict';
import { WISHLIST_PENDING_KEY, WishlistSync } from '../lib/wishlist-sync';

const allowed = new Set(['one', 'two']);
function memoryStorage() {
  const entries = new Map<string, string>();
  return { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value); }, removeItem: (key: string) => { entries.delete(key); } };
}
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('wishlist persists intent before sending and serializes rapid changes to the latest list', async () => {
  const storage = memoryStorage(), first = deferred<number>();
  const calls: { owner: string; ids: string[]; revision: number }[] = [];
  let sequence = 0;
  const sync = new WishlistSync({ storage, makeId: () => String(++sequence), onConflict: () => {}, save: async (owner, ids, revision) => { calls.push({ owner, ids, revision }); return calls.length === 1 ? first.promise : revision + 1; } });
  sync.activate('owner-a', [], 0, [], false, allowed);
  sync.reconcile(['one'], [], 0, allowed);
  assert.deepEqual(JSON.parse(storage.getItem(WISHLIST_PENDING_KEY)!).productIds, ['one']);
  await Promise.resolve();
  sync.reconcile(['two'], [], 0, allowed);
  sync.reconcile([], [], 0, allowed);
  assert.equal(calls.length, 1, 'later writes wait for the first acknowledgement');
  assert.deepEqual(JSON.parse(storage.getItem(WISHLIST_PENDING_KEY)!).productIds, []);
  first.resolve(1); await sync.whenIdle();
  assert.deepEqual(calls, [{ owner: 'owner-a', ids: ['one'], revision: 0 }, { owner: 'owner-a', ids: [], revision: 1 }]);
  assert.equal(sync.pending, false); assert.equal(storage.getItem(WISHLIST_PENDING_KEY), null);
});

test('a reload replays pending intent even when it equals the current server list', async () => {
  const storage = memoryStorage(), oldRequest = deferred<number>();
  const old = new WishlistSync({ storage, makeId: (() => { let n = 0; return () => `old-${++n}`; })(), onConflict: () => {}, save: () => oldRequest.promise });
  old.activate('owner-a', [], 0, [], false, allowed);
  old.reconcile(['one'], [], 0, allowed); await Promise.resolve();
  old.reconcile([], [], 0, allowed);
  let serverRevision = 0; let serverIds: string[] = [];
  const fresh = new WishlistSync({ storage, onConflict: () => {}, save: async (_owner, ids, revision) => { assert.equal(revision, serverRevision); serverIds = ids; return ++serverRevision; } });
  assert.deepEqual(fresh.activate('owner-a', [], 0, ['one'], false, allowed), []);
  await fresh.whenIdle();
  assert.equal(serverRevision, 1, 'the no-op-looking replay invalidates the older opposite request');
  assert.deepEqual(serverIds, []);
  oldRequest.reject({ code: 'wishlistConflict' }); await old.whenIdle();
  old.reconcile([], serverIds, serverRevision, allowed); await old.whenIdle();
  assert.equal(old.pending, false, 'the superseded page cannot revive its old outbox');
  assert.equal(storage.getItem(WISHLIST_PENDING_KEY), null);
});

test('wishlist outbox is restored only for its owner and failed saves survive reconnection', async () => {
  const storage = memoryStorage();
  const failing = new WishlistSync({ storage, onConflict: () => {}, save: async () => { throw new Error('offline'); } });
  failing.activate('owner-a', [], undefined, [], false, allowed);
  failing.reconcile(['one'], [], undefined, allowed); await failing.whenIdle();
  assert.equal(failing.pending, true);
  const recovered: string[][] = [];
  const fresh = new WishlistSync({ storage, onConflict: () => {}, save: async (_owner, ids) => { recovered.push(ids); return 1; } });
  assert.deepEqual(fresh.activate('owner-a', [], 0, [], false, allowed), ['one']);
  await fresh.whenIdle(); assert.deepEqual(recovered, [['one']]);
  failing.reconcile(['two'], [], 0, allowed); await failing.whenIdle();
  const other = new WishlistSync({ storage, onConflict: () => {}, save: async () => { throw new Error('unexpected write'); } });
  assert.deepEqual(other.activate('owner-b', ['two'], 0, [], false, allowed), ['two']);
  assert.equal(storage.getItem(WISHLIST_PENDING_KEY), null);
});

test('stale snapshots cannot overwrite an acknowledged wishlist and newer server edits are adopted', async () => {
  const storage = memoryStorage();
  const sync = new WishlistSync({ storage, onConflict: () => {}, save: async (_owner, _ids, revision) => revision + 1 });
  sync.activate('owner-a', [], 0, [], false, allowed);
  sync.reconcile(['one'], [], 0, allowed); await sync.whenIdle();
  assert.equal(sync.reconcile(['one'], [], 0, allowed), null);
  assert.deepEqual(sync.productIds, ['one']);
  assert.deepEqual(sync.reconcile(['one'], ['two'], 2, allowed), ['two']);
  assert.equal(sync.pending, false);
});

test('guest merging and storage failures preserve usable, bounded wishlists', async () => {
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
  const writes: string[][] = [];
  const sync = new WishlistSync({ storage: broken, onConflict: () => {}, save: async (_owner, ids) => { writes.push(ids); return 1; } });
  assert.deepEqual(sync.activate('owner-a', ['two'], 0, ['one', 'retired', 'one'], true, allowed), ['one', 'two']);
  await sync.whenIdle(); assert.deepEqual(writes, [['one', 'two']]);
  sync.reset(); assert.equal(sync.owner, null); assert.deepEqual(sync.productIds, []);
});
