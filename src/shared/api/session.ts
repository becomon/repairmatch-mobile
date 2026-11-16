/**
 * Features keep in-memory copies of server data (a request cache, photos waiting to upload).
 * They register a cleaner here so ending a session, by sign-out or by an unrecoverable 401,
 * never leaks one account's data into the next one.
 */
const cleaners = new Set<() => void>();

export function onSessionEnd(cleaner: () => void): void {
  cleaners.add(cleaner);
}

export function runSessionCleaners(): void {
  for (const clean of cleaners) clean();
}
