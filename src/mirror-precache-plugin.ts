import type {
  PrecacheEntry,
  WorkboxPlugin,
  HandlerWillStartCallback,
} from "./types";
import { PrecacheManager } from "./precache-manager";

export class MirrorPrecachePlugin implements WorkboxPlugin {
  private readonly precacheManager: PrecacheManager;
  private precachingPromise: Promise<void> | undefined;

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
    this.precacheManager = new PrecacheManager({
      entries,
      cacheName,
      prefixs,
      onlyVersionedPrefixs,
    });
  }

  async handlerWillStart({ event }: Parameters<HandlerWillStartCallback>[0]) {
    if (event.type === "install") {
      if (!this.precachingPromise) {
        this.precachingPromise = this.precacheManager.start();
      }
      await this.precachingPromise;
    }
  }
}
