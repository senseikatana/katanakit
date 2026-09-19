/**
 * API Manager — real-world usage patterns.
 *
 * Run:  npx tsx examples/api-manager/demo.ts
 *
 * This example uses JSONPlaceholder (https://jsonplaceholder.typicode.com),
 * a free fake REST API — no keys required.
 */

import {
	useInitApis,
	useGetApi,
	usePost,
	usePut,
	usePatch,
	useDelete,
	useBuildUrl,
	useFetch,
} from "../../src/core/services/http.service.js";

/* ------------------------------------------------------------------ */
/* 1. Register your APIs once at app entry                            */
/* ------------------------------------------------------------------ */

useInitApis({
	/**
	 * JSONPlaceholder — public fake REST API.
	 * `baseUri` is the root; `endpoints` are named routes with `:param` placeholders.
	 */
	jsonplaceholder: {
		baseUri: "https://jsonplaceholder.typicode.com",
		endpoints: {
			posts: "/posts",
			postById: "/posts/:id",
			postsByUser: "/posts",
			comments: "/comments",
		},
		// Query params applied automatically to specific endpoints.
		defaultQueryParams: {
			posts: { _limit: 10 },
		},
	},

	/**
	 * Your own backend — with auth token.
	 * Tokens are injected per-call via headers; the registry stays static.
	 */
	myBackend: {
		baseUri: "https://jsonplaceholder.typicode.com", // pretend it's yours
		endpoints: {
			users: "/users",
			userById: "/users/:id",
			createUser: "/users",
		},
	},
});

/* ------------------------------------------------------------------ */
/* 2. GET — list and read                                              */
/* ------------------------------------------------------------------ */

async function listPosts(): Promise<void> {
	console.log("\n--- GET /posts (limited to 5 via defaultQueryParams + override) ---");

	// defaultQueryParams gives us _limit=10, but we override to 5.
	const result = await useGetApi<{ id: number; title: string; userId: number }[]>(
		"jsonplaceholder",
		"posts",
		{ query: { _limit: 5 } },
	);

	if (result.ok) {
		for (const post of result.data) {
			console.log(`  #${post.id} — ${post.title}`);
		}
	} else {
		console.error("  Failed:", result.error.message, `(status ${result.error.status})`);
	}
}

async function getPostById(): Promise<void> {
	console.log("\n--- GET /posts/:id ---");

	const result = await useGetApi<{ id: number; title: string; body: string }>(
		"jsonplaceholder",
		"postById",
		{ params: { id: 1 } },
	);

	if (result.ok) {
		console.log(`  Title: ${result.data.title}`);
		console.log(`  Body:  ${result.data.body.slice(0, 80)}...`);
	} else {
		console.error("  Failed:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 3. POST — create                                                   */
/* ------------------------------------------------------------------ */

async function createPost(): Promise<void> {
	console.log("\n--- POST /posts ---");

	const result = await usePost<{ id: number }>(
		"jsonplaceholder",
		"posts",
		{
			title: "KatanaKit is great",
			body: "A framework-agnostic TypeScript toolkit.",
			userId: 1,
		},
	);

	if (result.ok) {
		console.log("  Created:", result.data);
	} else {
		console.error("  Failed:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 4. PUT — full update                                               */
/* ------------------------------------------------------------------ */

async function updatePost(): Promise<void> {
	console.log("\n--- PUT /posts/:id ---");

	const result = await usePut(
		"jsonplaceholder",
		"postById",
		{
			id: 1,
			title: "Updated title",
			body: "Updated body",
			userId: 1,
		},
		{ params: { id: 1 } },
	);

	if (result.ok) {
		console.log("  Updated:", result.data);
	} else {
		console.error("  Failed:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 5. PATCH — partial update                                          */
/* ------------------------------------------------------------------ */

async function patchPost(): Promise<void> {
	console.log("\n--- PATCH /posts/:id ---");

	const result = await usePatch(
		"jsonplaceholder",
		"postById",
		{ title: "Only title changed" },
		{ params: { id: 1 } },
	);

	if (result.ok) {
		console.log("  Patched:", result.data);
	} else {
		console.error("  Failed:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 6. DELETE                                                           */
/* ------------------------------------------------------------------ */

async function deletePost(): Promise<void> {
	console.log("\n--- DELETE /posts/:id ---");

	const result = await useDelete("jsonplaceholder", "postById", { params: { id: 1 } });

	if (result.ok) {
		console.log("  Deleted (status:", result.status, ")");
	} else {
		console.error("  Failed:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 7. Auth token injection — pass headers per call                    */
/* ------------------------------------------------------------------ */

async function fetchWithAuth(): Promise<void> {
	console.log("\n--- GET /users with Bearer token ---");

	const result = await useFetch<{ id: number; name: string }[]>(
		"myBackend",
		"users",
		{
			method: "GET",
			headers: {
				Authorization: "Bearer your-secret-token-here",
			},
		},
	);

	if (result.ok) {
		console.log(`  Got ${result.data.length} users`);
	} else {
		console.error("  Failed:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 8. useBuildUrl — inspect the URL before fetching                   */
/* ------------------------------------------------------------------ */

function showUrlBuilding(): void {
	console.log("\n--- useBuildUrl (no network call) ---");

	const url = useBuildUrl("jsonplaceholder", "postsByUser", {
		params: { id: 7 },
		query: { _limit: 3 },
	});

	console.log("  Built URL:", url);
}

/* ------------------------------------------------------------------ */
/* 9. Error handling — the safe result pattern                        */
/* ------------------------------------------------------------------ */

async function handleErrorCase(): Promise<void> {
	console.log("\n--- Error handling (404) ---");

	const result = await useGetApi("jsonplaceholder", "postById", {
		params: { id: 99999 },
	});

	if (result.ok) {
		console.log("  Found:", result.data);
	} else {
		// result.error is always structured — no try/catch needed.
		console.log("  ok:", result.ok);          // false
		console.log("  status:", result.error.status); // 404
		console.log("  message:", result.error.message);
		console.log("  url:", result.url);         // the URL that was called
	}
}

/* ------------------------------------------------------------------ */
/* Run all examples                                                   */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
	await listPosts();
	await getPostById();
	await createPost();
	await updatePost();
	await patchPost();
	await deletePost();
	await fetchWithAuth();
	showUrlBuilding();
	await handleErrorCase();

	console.log("\nDone.");
}

main();
