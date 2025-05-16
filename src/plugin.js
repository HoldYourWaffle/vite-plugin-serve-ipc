import { inspect, promisify } from "node:util"
import { resolveConfig } from "./config.js"
import { createProxy } from "./proxy.js"

/**
 * @import Net from "node:net"
 * @import { ServeIPCPluginOptions } from "./types.d.ts"
 * @import { Plugin, ViteDevServer, PreviewServer } from "vite"
 */

/**
 * Reference to the proxy server that persists across Vite server restarts.
 * This enables waiting for the old proxy to fully close before creating a new one.
 * @type {Net.Server}
 */
let proxy;

/**
 * @param config {ServeIPCPluginOptions}
 * @returns {Plugin}
 */
export function serveIPC(config) {
	const resolvedConfig = resolveConfig(config);

	/**
	 * @param viteServer {ViteDevServer|PreviewServer}
	 * @returns {void}
	 */
	function onViteConfigServer(viteServer) {
		if (!resolvedConfig) {
			return;
		}

		// Separate variable helps TS control flow analysis
		const viteHttpServer = viteServer.httpServer;
		if (!viteHttpServer) {
			// The Vitest VS Code extension uses middleware mode, so this can't fail with an error
			viteServer.config.logger.warn("vite-plugin-serve-ipc is incompatible with Vite's middleware mode. The enclosing server should expose itself over IPC instead.");
			return;
		}

		viteHttpServer.on('listening', async () => {
			const address = viteHttpServer.address();
			if (!address) {
				throw new Error("Vite's HTTP server somehow doesn't have an address during listening callback");
			} else if (typeof address === 'string') {
				throw new Error(`Vite's HTTP server is already listening on an IPC socket: ${address}. The future is now!`);
			}

			if (proxy) {
				// Make sure the previous proxy is fully closed to avoid race conditions
				try {
					await promisify(proxy.close).bind(proxy)();
				} catch (error) {
					if (/** @type {NodeJS.ErrnoException} */ (error).code !== "ERR_SERVER_NOT_RUNNING") {
						throw error;
					}
				}
			}

			proxy = createProxy({
				port: address.port,
				host: address.address,
				onError: (error) => {
					viteServer.config.logger.error("IPC proxy error:")
					viteServer.config.logger.error(inspect(error));
				}
			});

			proxy.listen(resolvedConfig.listenOptions, () => {
				viteServer.config.logger.info(`Exposed over IPC at: ${resolvedConfig.listenOptions.path}`);
			})
		})

		const processExitHandler = () => proxy.close();
		process.on('exit', processExitHandler);

		viteHttpServer.on('close', () => {
			proxy.close();
			process.removeListener('exit', processExitHandler);
		});
	}

	return {
		name: 'vite-plugin-serve-ipc',
		configureServer: onViteConfigServer,
		configurePreviewServer: onViteConfigServer
	}
}
