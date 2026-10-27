export const WISHLIST_PENDING_KEY = 'maison-goya:wishlist-pending:v1';
type WishlistStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type PendingWishlist = { version: 1; owner: string; changeId: string; productIds: string[] };
type Options = {
  storage: WishlistStorage;
  save: (owner: string, productIds: string[], expectedRevision: number) => Promise<number>;
  onConflict: () => void;
  makeId?: () => string;
};
const same = (left: readonly string[], right: readonly string[]) => JSON.stringify(left) === JSON.stringify(right);
const validRevision = (value: number | undefined) => Number.isSafeInteger(value) && value! >= 0 ? value! : 0;
const normalize = (ids: readonly string[], allowed: ReadonlySet<string>) => [...new Set(ids.filter(id => allowed.has(id)))].slice(0, 100);

/** An owner-bound outbox survives reloads; one request at a time preserves intent.
 * Server revisions reject stale requests from a previous page or another tab. */
export class WishlistSync {
  owner: string | null = null;
  private desired: string[] = [];
  private revision = 0;
  private generation = 0;
  private changeId = '';
  private dirty = false;
  private persisted = false;
  private running: Promise<void> | null = null;
  constructor(private options: Options) {}
  get productIds(): readonly string[] { return this.desired; }
  get pending(): boolean { return this.dirty; }

  private read(): { available: boolean; record: PendingWishlist | null } {
    try {
      const raw = this.options.storage.getItem(WISHLIST_PENDING_KEY);
      const value = raw && raw.length < 32_000 ? JSON.parse(raw) as Partial<PendingWishlist> : null;
      const valid = value?.version === 1 && typeof value.owner === 'string' && value.owner.length <= 160 && typeof value.changeId === 'string' && value.changeId.length <= 160 && Array.isArray(value.productIds) && value.productIds.length <= 100 && value.productIds.every(id => typeof id === 'string' && id.length <= 100);
      return { available: true, record: valid ? value as PendingWishlist : null };
    } catch { return { available: false, record: null }; }
  }
  private store() {
    try {
      this.options.storage.setItem(WISHLIST_PENDING_KEY, JSON.stringify({ version: 1, owner: this.owner, changeId: this.changeId, productIds: this.desired }));
      this.persisted = true;
    } catch { this.persisted = false; }
  }
  private clear(owner: string, changeId: string) {
    const current = this.read().record;
    if (current?.owner === owner && current.changeId === changeId) {
      try { this.options.storage.removeItem(WISHLIST_PENDING_KEY); } catch { /* Storage can be unavailable in private browsing. */ }
    }
  }
  reset() {
    this.generation++; this.owner = null; this.desired = []; this.dirty = false; this.running = null; this.persisted = false;
    try { this.options.storage.removeItem(WISHLIST_PENDING_KEY); } catch { /* In-memory shopping remains available. */ }
  }
  activate(owner: string, serverIds: readonly string[], revision: number | undefined, localIds: readonly string[], mergeGuest: boolean, allowed: ReadonlySet<string>): string[] {
    this.generation++; this.owner = owner; this.running = null; this.revision = validRevision(revision);
    const pending = this.read().record;
    const restored = pending?.owner === owner ? pending : null;
    if (pending && !restored) this.clear(pending.owner, pending.changeId);
    const server = normalize(serverIds, allowed);
    this.desired = normalize(restored?.productIds ?? (mergeGuest ? [...localIds, ...server] : server), allowed);
    // Even an equal restored list must advance the revision: an older closing
    // page may still have an opposite request in flight.
    this.dirty = Boolean(restored) || !same(this.desired, server);
    this.changeId = restored?.changeId ?? (this.options.makeId?.() ?? crypto.randomUUID());
    this.persisted = false;
    if (this.dirty) { this.store(); this.pump(); }
    return [...this.desired];
  }
  reconcile(localIds: readonly string[], serverIds: readonly string[], revision: number | undefined, allowed: ReadonlySet<string>): string[] | null {
    if (!this.owner) return null;
    const local = normalize(localIds, allowed);
    const nextRevision = validRevision(revision);
    this.revision = Math.max(this.revision, nextRevision);
    if (!same(local, this.desired)) {
      this.desired = local; this.changeId = this.options.makeId?.() ?? crypto.randomUUID(); this.dirty = true;
      this.store(); this.pump();
      return null;
    }
    if (this.dirty) { this.pump(); return null; }
    // A GET started before the save may arrive after its acknowledgement.
    if (this.running || nextRevision < this.revision) return null;
    const server = normalize(serverIds, allowed);
    if (same(server, this.desired)) return null;
    this.desired = server;
    return [...server];
  }
  private pump() {
    if (!this.owner || !this.dirty || this.running) return;
    const stored = this.read();
    if (this.persisted && stored.available && (stored.record?.owner !== this.owner || stored.record.changeId !== this.changeId)) {
      // A newer page/tab already replaced or acknowledged this outbox entry.
      this.dirty = false; this.persisted = false; this.options.onConflict(); return;
    }
    const owner = this.owner, ids = [...this.desired], changeId = this.changeId, generation = this.generation, revision = this.revision;
    let succeeded = false;
    this.running = Promise.resolve().then(() => this.options.save(owner, ids, revision)).then(savedRevision => {
      if (generation !== this.generation) return;
      this.revision = Math.max(this.revision, validRevision(savedRevision)); succeeded = true;
      if (this.changeId === changeId) { this.dirty = false; this.clear(owner, changeId); }
    }).catch((error: unknown) => {
      if (generation !== this.generation) return;
      const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
      if (code === 'wishlistConflict' || code === 'staleAccount' || code === 'unauthorized') this.options.onConflict();
      // Keep the outbox for the next successful refresh/reconnection.
    }).finally(() => {
      if (generation !== this.generation) return;
      this.running = null;
      if (succeeded && this.dirty) this.pump();
    });
  }
  async whenIdle(): Promise<void> {
    while (this.running) await this.running;
  }
}
