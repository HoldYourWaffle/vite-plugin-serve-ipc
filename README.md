# vite-plugin-serve-ipc
Serve Vite's development or preview server over IPC.
Supports [Unix domain sockets](https://man.archlinux.org/man/unix.7.en) and [Windows named pipes](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipes).

This avoids finnicking with port numbers in contexts where other processes need to communicate with your application.
In a way it's a more reliable alternative for [`strictPort`](https://vite.dev/config/server-options.html#server-strictport).

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
Detailed documentation can be found in [`types.d.ts`](./blob/main/src/types.d.ts).

#### `path`
The path for the IPC proxy to listen on.

Can be a `string`, which will be resolved against the current working directory.
On Windows `\\?\pipe\` will be prepended.

```js
path: "test.sock"
```

Or an object with separate platform paths:

```js
path: {
	unix: "test.sock",
	windows: "\\\\.\\pipe\\test"
}
```

It's also possible to disable the IPC proxy for a platform:

```js
path: {
	unix: "test.sock",
	windows: null
}
```

#### `listenOptions`

Custom [`ListenOptions`](https://nodejs.org/api/net.html#serverlistenoptions-callback) to pass to the IPC proxy.
The `path`, `host`, `port`, `reusePort` and `ipv6Only` options will be ignored.

```js
listenOptions: {
	readableAll: true,
	writableAll: true,
	// etc.
}
```
