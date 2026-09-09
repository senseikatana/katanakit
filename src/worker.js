const BASE_PATH = "/katanakit-js/";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Redirigir root y paths vacíos al subpath correcto
		if (url.pathname === "/" || url.pathname === "") {
			return Response.redirect(`${url.origin}${BASE_PATH}`, 302);
		}

		// Servir assets estáticos para todos los demás requests
		return env.ASSETS.fetch(request);
	},
};
