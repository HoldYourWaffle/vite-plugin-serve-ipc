# vite-plugin-serve-ipc

[![vite-plugin-serve-ipc on NPM](https://img.shields.io/npm/v/:vite-plugin-serve-ipc)](https://www.npmjs.com/package/vite-plugin-serve-ipc)

Serve Vite's development or preview server over IPC.
Supports [Unix domain sockets](https://man.archlinux.org/man/unix.7.en) and [Windows named pipes](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipes).

The IPC server is a lightweight proxy that forwards connections to Vite's TCP server.
This avoids dealing with conflicting or dynamic ports when other local processes need to talk to your app.
It's essentially a more reliable alternative to [`strictPort`](https://vite.dev/config/server-options.html#server-strictport).

> [!WARNING]  
> This plugin is still in active development. It has not been thoroughly tested across a variety of configurations yet. Please file an issue if you encounter any shenanigans.

## Usage
Add `serveIPC` to your Vite config:

```js
import { defineConfig } from "vite";
import { serveIPC } from "vite-plugin-serve-ipc";

export default defineConfig({
    plugins: [
        serveIPC({ path: "test.sock" })
    ]
});
```

### Options
Detailed documentation can be found in [`types.d.ts`](./src/types.d.ts).

#### `path`
The path for the IPC proxy to listen on.

##### Basic path
```js
path: "test.sock"
```

The provided path will be resolved against the current working directory. On Windows `\\?\pipe\` will be prepended.

The example will listen at `$(pwd)/test.sock` on Unix-like platforms and `\\?\pipe\X:\current-working-directory\test.sock` on Windows.

##### Individual platform paths
```js
path: {
    unix: "test.sock",
    windows: "\\\\.\\pipe\\test"
}
```

If the provided `windows` name doesn't start with `\\.\pipe\` or `\\?\pipe\` then `\\?\pipe\` will be prepended.

##### Disabling IPC for a platform
```js
path: {
    unix: "test.sock",
    windows: null
}
```

#### `listenOptions`
Custom [`ListenOptions`](https://nodejs.org/api/net.html#serverlistenoptions-callback) to pass to the IPC proxy:

```js
listenOptions: {
    readableAll: true,
    writableAll: true,
    // etc.
}
```

The `path`, `host`, `port`, `reusePort` and `ipv6Only` options will be ignored.

## Changelog
See [releases](https://github.com/HoldYourWaffle/vite-plugin-serve-ipc/releases).
