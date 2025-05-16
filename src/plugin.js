import { inspect } from "node:util"
import { resolveConfig } from "./config.js"
import { createProxy } from "./proxy.js"

/**
 * @import Net from "node:net"
 * @import { ServeIPCPluginOptions } from "./types.d.ts"
 * @import { Plugin, ViteDevServer, PreviewServer } from "vite"
 */

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
	function setupIPCProxy(viteServer) {
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

		/** @type {Net.Server} */
		let proxy;

		viteHttpServer.on('listening', () => {
			const address = viteHttpServer.address();
			if (!address) {
				throw new Error("Vite's HTTP server somehow doesn't have an address during listening callback");
			} else if (typeof address === 'string') {
				throw new Error(`Vite's HTTP server is already listening on an IPC socket: ${address}. The future is now!`);
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
		configureServer: setupIPCProxy,
		configurePreviewServer: setupIPCProxy
	}
}
