/** A single product in the dummyjson-shaped seed. */
export interface SeedProduct {
	id: number;
	title: string;
	description: string;
	category: string;
	price: number;
	rating: number;
	stock: number;
	brand: string;
}

/** A single user in the dummyjson-shaped seed. */
export interface SeedUser {
	id: number;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	age: number;
	role: string;
}

/** A single post in the dummyjson-shaped seed. */
export interface SeedPost {
	id: number;
	title: string;
	body: string;
	tags: string[];
	reactions: number;
	userId: number;
}

/** A single quote in the dummyjson-shaped seed. */
export interface SeedQuote {
	id: number;
	quote: string;
	author: string;
}

/** Container for the Bun adapter seed data (dummyjson-compatible shapes). */
export interface DummyJsonSeed {
	products: SeedProduct[];
	users: SeedUser[];
	posts: SeedPost[];
	quotes: SeedQuote[];
}

/**
 * Offline seed data shaped after https://dummyjson.com responses.
 * Useful for tests, demos and local development without hitting the network.
 */
export const dummyJsonSeed: DummyJsonSeed = {
	products: [
		{
			id: 1,
			title: "Essence Mascara Lash Princess",
			description:
				"The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects.",
			category: "beauty",
			price: 9.99,
			rating: 4.94,
			stock: 5,
			brand: "Essence",
		},
		{
			id: 2,
			title: "iPhone X",
			description: "SIM-Free, Model A19211 6.5-inch Super Retina HD display with OLED technology.",
			category: "smartphones",
			price: 899,
			rating: 4.44,
			stock: 34,
			brand: "Apple",
		},
		{
			id: 3,
			title: "Samsung Universe 9",
			description: "Samsung's new variant which goes beyond Galaxy to the Universe.",
			category: "smartphones",
			price: 1249,
			rating: 4.09,
			stock: 36,
			brand: "Samsung",
		},
	],
	users: [
		{
			id: 1,
			firstName: "Terry",
			lastName: "Medhurst",
			username: "atuny0",
			email: "atuny0@sohu.com",
			age: 50,
			role: "admin",
		},
		{
			id: 2,
			firstName: "Sheldon",
			lastName: "Quigley",
			username: "hbingley1",
			email: "hbingley1@plala.or.jp",
			age: 28,
			role: "moderator",
		},
	],
	posts: [
		{
			id: 1,
			title: "His mother had always taught him",
			body: "His mother had always taught him not to ever think of himself as better than others...",
			tags: ["history", "american", "crime"],
			reactions: 2,
			userId: 121,
		},
		{
			id: 2,
			title: "He was an expert but not in a discipline",
			body: "He was an expert but not in a discipline that anyone could fully appreciate...",
			tags: ["french", "fiction", "english"],
			reactions: 2,
			userId: 69,
		},
	],
	quotes: [
		{
			id: 1,
			quote: "Life isn't about getting and having, it's about giving and being.",
			author: "Kevin Kruse",
		},
		{
			id: 2,
			quote: "Whatever the mind of man can conceive and believe, it can achieve.",
			author: "Napoleon Hill",
		},
	],
};

/**
 * Returns the Bun adapter seed data.
 *
 * @returns A deep-frozen copy-safe reference to {@link dummyJsonSeed}.
 *
 * @example
 * ```ts
 * import { useGetDummyJsonSeed } from "katanakit-js/adapters/bun";
 *
 * const seed = useGetDummyJsonSeed();
 * seed.products; // [{ id: 1, title: "Essence Mascara Lash Princess", ... }]
 * ```
 */
export function useGetDummyJsonSeed(): DummyJsonSeed {
	return dummyJsonSeed;
}
