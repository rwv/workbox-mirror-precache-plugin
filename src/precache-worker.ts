import { createCacheKey } from "./utils/createCacheKey";
import type { PrecacheEntry } from "workbox-precaching";

export class PrecacheWorker {
  private readonly cache: Cache;
  private readonly prefix: string;
  private readonly onlyVersioned: boolean = false;

  constructor({
    cache,
    prefix,
    onlyVersioned,
  }: {
    cache: Cache;
    prefix: string;
    onlyVersioned?: boolean;
  }) {
    this.cache = cache;
    this.prefix = prefix;
    this.onlyVersioned = !!onlyVersioned;
  }

  async work(entry: PrecacheEntry | string, signal?: AbortSignal) {
    const isUnversionedURL = typeof entry !== "string" && entry.revision;
    if (isUnversionedURL && this.onlyVersioned) {
      console.error(
        `This entry is not versioned URL: ${JSON.stringify(
          entry
        )}, but this worker is only for versioned URL`
      );
      throw new Error(
        `This entry is not versioned URL: ${JSON.stringify(
          entry
        )}, but this worker is only for versioned URL`
      );
    }

    const { cacheKey } = createCacheKey(entry);
    // test cache match
    if (await this.cache.match(cacheKey)) {
      return;
    }

    const integrity = typeof entry === "string" ? undefined : entry.integrity;

    const url = createFetchURL(entry, this.prefix);

    // https://github.dev/GoogleChrome/workbox/blob/ee62b5b5b9ed321af457a2d962b2a34196a80263/packages/workbox-precaching/src/PrecacheController.ts#L146
    const cacheMode =
      typeof entry !== "string" && entry.revision ? "reload" : "default";

    const response = await fetch(url, {
      mode: "cors",
      integrity,
      cache: cacheMode,
      credentials: "same-origin",
      signal,
    });
    if (!response.ok) {
      throw new Error(
        `Request for ${url} returned a response with status ${response.status}`
      );
    }

    const blob = await response.blob();
    const newResponse = new Response(blob, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    if (await this.cache.match(cacheKey)) {
      return;
    }

    await this.cache.put(cacheKey, newResponse);
  }
}

function createFetchURL(entry: PrecacheEntry | string, prefix: string) {
  if (typeof entry === "string") {
    const urlObject = new URL(entry, prefix);
    return prefix + urlObject.pathname;
  }

  const { url } = entry;
  const urlObject = new URL(url, location.href);
  return prefix + urlObject.pathname;
}
