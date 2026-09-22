/**
 * Vanilla (framework-free) query demo — pure TypeScript, no framework.
 *
 * Run it:  bun run examples/query/vanilla.ts
 *
 * Shows the whole loop you own with the vanilla adapter: subscribe → paint,
 * cache hits, invalidation, and a mutation. No DOM, no framework — just the
 * observer. Swap the fake `apiGetPokemon` for `useGetApi`/`useFetch` and the
 * pattern is identical.
 */
import { useMutation, useQuery, useQueryClient } from "@/adapters/vanilla";
import { useSafeQueryFn } from "@/core/services/query.service";
import type { FetchResult } from "@/types";

interface Pokemon {
	id: number;
	name: string;
}

let networkCalls = 0;

/** Fake API that returns a Safe Result, like `useGetApi` would. */
async function apiGetPokemon(id: number): Promise<FetchResult<Pokemon>> {
	networkCalls++;
	await new Promise((resolve) => setTimeout(resolve, 20));
	return {
		data: { id, name: `pokemon-${id}` },
		error: null,
		url: `/pokemon/${id}`,
		status: 200,
		ok: true,
	};
}

async function waitFor(predicate: () => boolean, timeoutMs = 1000): Promise<void> {
	const start = Date.now();
	while (!predicate()) {
		if (Date.now() - start > timeoutMs) throw new Error("waitFor timed out");
		await new Promise((resolve) => setTimeout(resolve, 5));
	}
}

const log = (...args: unknown[]): void => console.log("•", ...args);
const line = (label: string): void => console.log(`\n— ${label} —`);

const client = useQueryClient();

// ---------------------------------------------------------------------------
line("1. A query: pending → success (you own the render loop)");

const pokemon = useQuery<Pokemon>({
	queryKey: ["pokemon", 25],
	queryFn: useSafeQueryFn(() => apiGetPokemon(25)),
	staleTime: 5_000,
});

const unsubscribe = pokemon.subscribe(({ status, isFetching, data }) => {
	log(`render → status=${status} isFetching=${isFetching} name=${data?.name ?? "—"}`);
});

log(`immediate read → status=${pokemon.getCurrentResult().status}`);
await waitFor(() => pokemon.getCurrentResult().isSuccess);

// ---------------------------------------------------------------------------
line("2. The cache: same key, second observer → no network call");

networkCalls = 0;
const cached = useQuery<Pokemon>({
	queryKey: ["pokemon", 25],
	queryFn: useSafeQueryFn(() => apiGetPokemon(25)),
	staleTime: 5_000,
});
const unsubscribeCached = cached.subscribe(() => {});
await waitFor(() => cached.getCurrentResult().isSuccess);
log(`network calls for the second observer: ${networkCalls} (0 = cache hit)`);

// ---------------------------------------------------------------------------
line("3. Invalidate → TanStack refetches active observers automatically");

networkCalls = 0;
await client.invalidateQueries({ queryKey: ["pokemon"] });
await waitFor(() => networkCalls > 0);
log(`network calls after invalidateQueries: ${networkCalls}`);

// ---------------------------------------------------------------------------
line("4. A mutation");

const createPokemon = useMutation({
	mutationFn: async (name: string): Promise<Pokemon> => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		return { id: 999, name };
	},
});

const unsubscribeMutation = createPokemon.subscribe(({ status }) => {
	log(`mutation → status=${status}`);
});

const created = await createPokemon.mutate("pikachu");
log(`mutate resolved with: ${JSON.stringify(created)}`);

// ---------------------------------------------------------------------------
line("5. Teardown");
unsubscribe();
unsubscribeCached();
unsubscribeMutation();
pokemon.destroy();
cached.destroy();
log("observers destroyed — done.");
