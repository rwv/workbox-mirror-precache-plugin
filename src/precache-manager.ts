import type { PrecacheEntry } from "workbox-precaching";
import { PrecacheWorker } from "./precache-worker";

export class PrecacheManager {
  private readonly cacheName: string;
  private readonly entries: Set<PrecacheEntry | string>;
  private readonly successEntries: Set<PrecacheEntry | string> = new Set();

  private readonly prefixs: string[];
  private readonly onlyVersionedPrefixs: string[];

  private readonly controllers: Map<PrecacheEntry | string, AbortController> =
    new Map();
  private readonly entriesCountMap: Map<PrecacheEntry | string, number> =
    new Map();

  constructor({
    entries,
    cacheName,
    prefixs,
    onlyVersionedPrefixs,
  }: {
    entries: Array<PrecacheEntry | string>;
    cacheName: string;
    prefixs: string[];
    onlyVersionedPrefixs?: string[];
  }) {
    this.cacheName = cacheName;
    this.entries = new Set(entries);
    this.prefixs = prefixs;
    this.onlyVersionedPrefixs = onlyVersionedPrefixs ?? [];
    for (const entry of this.entries) {
      this.controllers.set(entry, new AbortController());
      this.entriesCountMap.set(entry, 0);
    }
  }

  async start() {
    try {
      const cache = await caches.open(this.cacheName);
      const unversialWorkers = this.prefixs.map((prefix) => {
        return new PrecacheWorker({ cache, prefix });
      });
      const onlyVersionedWorkers = this.onlyVersionedPrefixs.map((prefix) => {
        return new PrecacheWorker({ cache, prefix, onlyVersioned: true });
      });
      const workers = [...unversialWorkers, ...onlyVersionedWorkers];
      await Promise.all(workers.map((worker) => this.assignWork(worker)));
    } catch (error) {
      console.error(error);
    }
  }

  private finishEntry(entry: PrecacheEntry | string) {
    this.successEntries.add(entry);
    try {
      const controller = this.controllers.get(entry);
      controller?.abort();
    } catch (error) {
      console.error(error);
    }
  }

  private async assignWork(worker: PrecacheWorker) {
    const workerTriedEntries = new Set<PrecacheEntry | string>();

    while (this.successEntries.size !== this.entries.size) {
      // get remaining entries which are not tried by worker
      const remainingEntries = new Set(
        [...this.entries].filter((entry) => {
          return (
            !this.successEntries.has(entry) && !workerTriedEntries.has(entry)
          );
        })
      );

      if (remainingEntries.size === 0) {
        return;
      }

      // get a entry from remainingEntries which has the least count
      let minCount = Number.MAX_SAFE_INTEGER;
      let minCountEntry: PrecacheEntry | string | undefined;
      for (const entry of remainingEntries) {
        const count = this.entriesCountMap.get(entry);
        if (count !== undefined && count < minCount) {
          minCount = count;
          minCountEntry = entry;
        }
      }
      if (minCountEntry === undefined) {
        return;
      }

      // add count
      const currentCount = this.entriesCountMap.get(minCountEntry);
      if (currentCount !== undefined) {
        this.entriesCountMap.set(minCountEntry, currentCount + 1);
      }

      // add to workerTriedEntries
      workerTriedEntries.add(minCountEntry);

      const controller = this.controllers.get(minCountEntry);
      const signal = controller?.signal;
      try {
        await worker.work(minCountEntry, signal);
        this.finishEntry(minCountEntry);
        continue;
      } catch (error) {
        // failed
        continue;
      }
    }
  }
}
