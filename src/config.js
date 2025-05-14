import Path from "node:path";

/**
 * @import Net from "node:net"
 * @import { ServeIPCPluginOptions } from "./types.d.ts"
 */

/**
 * @typedef ResolvedIPCPluginOptions
 * @property {Net.ListenOptions} listenOptions
 */

/**
 * @param config {ServeIPCPluginOptions}
 * @param platform {string} Usually {@linkcode process.platform}, parameterized for tests.
 * @returns {ResolvedIPCPluginOptions|null} Resolved configuration, or `null` if the provided configuration implies that there should be no IPC proxy.
 */
export function resolveConfig(config, platform = process.platform) {
	/** @type {string} */
	let path;
	if (platform === 'win32') {
		if (typeof config.path === 'string') {
			path = '\\\\?\\pipe\\' + Path.resolve(config.path);
		} else if (config.path.windows == null) {
			return null;
		} else {
			path = config.path.windows;
			if (!path.startsWith('\\\\.\\pipe\\') && !path.startsWith('\\\\?\\pipe\\')) {
				path = '\\\\?\\pipe\\' + path;
			}
		}
	} else {
		// As of v24.0 the `node:net` docs state: "Unix domain sockets on other operating systems", so we assume Unix if not Windows
		
		if (typeof config.path === 'string') {
			path = Path.resolve(config.path);
		} else if (config.path.unix == null) {
			return null;
		} else {
			path = Path.resolve(config.path.unix);
		}
	}
	
	// Ignore options incompatible with IPC
	// TODO warn?
	/** @type Net.ListenOptions */
	const customListenOptions = { ...config.listenOptions };
	delete customListenOptions.path;
	delete customListenOptions.host;
	delete customListenOptions.port;
	delete customListenOptions.reusePort;
	delete customListenOptions.ipv6Only;

	return {
		listenOptions: {
			path,
			...customListenOptions
		}
	};
}
