# 📦 workbox-mirror-precache-plugin
A workbox plugin that fetch precache files from various mirrors.

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/rwv/workbox-mirror-precache-plugin/build.yml)](https://github.com/rwv/workbox-mirror-precache-plugin/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/workbox-mirror-precache-plugin)](https://www.npmjs.com/package/workbox-mirror-precache-plugin)
![NPM](https://img.shields.io/npm/l/workbox-mirror-precache-plugin)

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
