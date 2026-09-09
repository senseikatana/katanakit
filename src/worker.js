export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		let path = url.pathname;

		// Remove the /katanakit-js prefix
		if (path.startsWith("/katanakit-js/")) {
			path = path.substring("/katanakit-js/".length);
		} else if (path === "/katanakit-js") {
			path = "";
		}

		// Default to index.html
		if (path === "" || path === "/") {
			path = "index.html";
		}

		// Try to fetch the asset
		const assetUrl = new URL(`/${path}`, url.origin);
		const response = await env.ASSETS.fetch(new Request(assetUrl, request));

		if (response.status === 200) {
			return response;
		}

		// Fallback to index.html for SPA routing
		const indexUrl = new URL("/index.html", url.origin);
		return env.ASSETS.fetch(new Request(indexUrl, request));
	},
};
