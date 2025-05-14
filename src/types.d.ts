import Net from "node:net";
import { Plugin } from "vite";

/**
 * Serve Vite's development or preview server over IPC.
 * Supports Unix domain sockets and Windows named pipes.
 * 
 * @see {@linkcode ServeIPCPluginOptions}
 */
export function serveIPC(config: ServeIPCPluginOptions): Plugin;

export interface ServeIPCPluginOptions {
	/**
	 * The path for the IPC proxy to listen on.
	 * Can be a `string` or an object with individual {@link PlatformPaths|platform paths}.
	 * 
	 * If a `string` is provided:
	 * 1. The path will be resolved against the current working directory.
	 * 2. On Windows `\\?\pipe\` will be prepended.
	 * 
	 * @see {@linkcode PlatformPaths}
	 * @see {@link https://nodejs.org/api/net.html#identifying-paths-for-ipc-connections|`node:net` - Identifying paths for IPC connections}
	 */
	path: string | PlatformPaths;

	/**
	 * Custom {@linkcode Net.ListenOptions|ListenOptions} to pass to the IPC proxy.
	 * The `path`, `host`, `port`, `reusePort` and `ipv6Only` options will be ignored.
	 * 
	 * @see {@linkcode Net.ListenOptions|ListenOptions}
	 */
	listenOptions?: Omit<Net.ListenOptions, 'path' | 'host' | 'port' | 'reusePort' | 'ipv6Only'>;
}

export interface PlatformPaths {
	/**
	 * Path to use on Unix-like systems for the {@link https://man.archlinux.org/man/unix.7.en|Unix domain socket}.
	 * 
	 * Relative paths will be resolved against the current working directory.
	 * 
	 * If `null` then the IPC proxy will not be started on Unix-like systems.
	 * 
	 * @see {@link https://nodejs.org/api/net.html#identifying-paths-for-ipc-connections|`node:net` - Identifying paths for IPC connections}
	 * @see {@link https://man.archlinux.org/man/unix.7.en|unix(7) - sockets for local interprocess communication}
	 */
	unix: string | null;

	/**
	 * Name to use on Windows systems for the {@link https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipes|named pipe}.
	 * 
	 * If the provided name doesn't start with `\\.\pipe\` or `\\?\pipe\` then `\\?\pipe\` will be prepended.
	 * Note that in that case there will **not** be any further processing (e.g. resolving `..` sequences) of the pipe name by the OS.
	 * 
	 * If `null` then the IPC proxy will not be started on Windows systems.
	 * 
	 * @see {@link https://nodejs.org/api/net.html#identifying-paths-for-ipc-connections|`node:net` - Identifying paths for IPC connections}
	 * @see {@link https://learn.microsoft.com/en-us/windows/win32/ipc/pipe-names|Microsoft Win32 apps - Pipe names}
	 */
	windows: string | null;
}
