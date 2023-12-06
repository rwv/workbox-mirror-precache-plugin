# 📦 workbox-mirror-precache-plugin
A workbox plugin that fetch precache files from various mirrors.

## Usage

``` bash
npm install workbox-mirror-precache-plugin
```

``` ts
import { addPlugins } from "workbox-precaching";
import { cacheNames } from "workbox-core";
import { MirrorPrecachePlugin } from "workbox-mirror-precache-plugin";

const cacheName = cacheNames.precache;
const entries = self.__WB_MANIFEST;
const mirrors = [
  "https://cdn.example.com",
];

addPlugins([
  new MirrorPrecachePlugin({
    entries,
    cacheName,
    prefixs: [self.origin, ...mirrors],
  }),
]);
precacheAndRoute(entries);
```

## License

MIT
