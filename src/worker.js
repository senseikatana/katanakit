export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		let path = url.pathname;

		// Remove the /packages/katanakit-js prefix if present
		if (path.startsWith('/packages/katanakit-js')) {
			path = path.substring('/packages/katanakit-js'.length) || '/';
		}
		// Also handle /katanakit-js prefix
		else if (path.startsWith('/katanakit-js')) {
			path = path.substring('/katanakit-js'.length) || '/';
		}

		// Try to serve the static asset
		const assetPath = path === '/' ? '/index.html' : path;
		const assetRequest = new Request(new URL(assetPath, url.origin), request);
		const response = await env.ASSETS.fetch(assetRequest);

		// If asset found, return it
		if (response.status !== 404) {
			return response;
		}

		// For SPA fallback, serve index.html
		if (!path.includes('.')) {
			const indexRequest = new Request(new URL('/index.html', url.origin), request);
			return env.ASSETS.fetch(indexRequest);
		}

		return response;
	},
};
