/** Production must use durable hosting unless explicitly running the local demo. */
export function localDemo() {
  return process.env.NODE_ENV !== 'production' || process.env.DEMO_LOCAL === 'true';
}
