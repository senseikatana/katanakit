/**
 * Angular query demo — `katanakit-js/adapters/angular`.
 *
 * The result exposes one signal per field: `query.data()`, `query.isPending()`,
 * `query.isFetching()`, `query.error()`, `query.status()`.
 *
 * `useQuery` must be called inside an injection context (a field initializer or
 * the constructor) so it can auto-cleanup via `DestroyRef`. Requires Angular 16+.
 */
import { Component, input } from "@angular/core";

import {
	useMutation,
	useQuery,
	useQueryClient,
	useSafeQueryFn,
} from "katanakit-js/adapters/angular";
import { useGetApi, useInitApis, usePost } from "katanakit-js";

useInitApis({
	pokeapi: {
		baseUri: "https://pokeapi.co/api/v2",
		endpoints: { pokemonById: "/pokemon/:id/" },
	},
});

interface Pokemon {
	id: number;
	name: string;
}

@Component({
	selector: "app-pokemon-card",
	template: `
		@if (pokemon.isPending()) {
			<p>Loading…</p>
		} @else if (pokemon.isError()) {
			<p role="alert">{{ pokemon.error()?.message }}</p>
		} @else {
			<article>
				<h2>{{ pokemon.data()?.name }}</h2>
				@if (pokemon.isFetching()) {
					<small> refreshing…</small>
				}
				<button (click)="pokemon.refetch()">Refresh</button>
			</article>
		}

		<button [disabled]="create.isPending()" (click)="create.mutate('pikachu')">Create</button>
	`,
})
export class PokemonCardComponent {
	readonly id = input.required<number>();

	readonly pokemon = useQuery({
		queryKey: ["pokemon", this.id()],
		queryFn: useSafeQueryFn(() =>
			useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id: this.id() } }),
		),
		staleTime: 60_000,
	});

	private readonly qc = useQueryClient();
	readonly create = useMutation({
		mutationFn: (name: string) => usePost<Pokemon>("myApi", "createPokemon", { name }),
		onSuccess: () => this.qc.invalidateQueries({ queryKey: ["pokemon"] }),
	});
}
