import Net from 'node:net'

/**
 * @typedef IPCProxyOptions
 * @property {number} port
 * @property {string} host
 * @property {(error: Error) => void} onError
 */

/**
 * Note: the caller is responsible for calling {@link Net.Server.listen} on the returned server.
 * 
 * @see {@linkcode Net.connect}
 * 
 * @param {IPCProxyOptions} options
 * @returns {Net.Server}
 */
export function createProxy(options) {
	const server = Net.createServer(sockIPC => {
		const sockTCP = Net.connect(options.port, options.host);

		sockIPC.on('error', options.onError);
		sockTCP.on('error', options.onError);

		sockIPC.pipe(sockTCP);
		sockTCP.pipe(sockIPC);
	});

	server.on('error', options.onError)

	return server;
}
