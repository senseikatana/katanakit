import type {
	AstroPath,
	AstroServiceResult,
	CollectionEntryLike,
	PaginationProps,
	PathsOptions,
} from "../../types/index.js";

/**
 * Convert a collection into Astro-compatible static paths.
 *
 * @param items - Collection items to convert
 * @param options - Configuration for param name, value extraction and props
 * @returns Array of Astro paths with params and props
 *
 * @example
 * ```ts
 * // In Astro's getStaticPaths()
 * const posts = await getCollection("blog");
 * const paths = useAstroPathsFrom(posts, {
 *   param: "slug",
 *   valueFrom: (post) => post.slug,
 *   propsFrom: (post) => ({ title: post.data.title }),
 * });
 * // [{ params: { slug: "hello-world" }, props: { title: "Hello World" } }]
 * ```
 */
export function useAstroPathsFrom<T, TParam extends string = "slug", TProps = T>(
	items: T[],
	options: PathsOptions<T, TParam, TProps> = {},
): AstroPath<TParam, TProps>[] {
	const {
		param = "slug" as TParam,
		valueFrom = (item: T) => {
			const record = item as { slug?: string; id?: string } | null | undefined;
			return record?.slug ?? record?.id ?? "";
		},
		propsFrom = (item: T) => item as unknown as TProps,
		paramsFrom,
	} = options;

	return items.map((item) => ({
		params: (paramsFrom ? paramsFrom(item) : { [param]: String(valueFrom(item)) }) as Record<
			TParam,
			string | undefined
		>,
		props: propsFrom(item),
	}));
}

/**
 * Fetch a collection and transform it into safe Astro paths.
 * Returns a result object instead of throwing on error.
 *
 * @param getCollectionFn - Astro's getCollection function
 * @param collectionName - Name of the collection to fetch
 * @param options - Path generation options
 * @returns Safe result with data or error
 *
 * @example
 * ```ts
 * export async function getStaticPaths() {
 *   const result = await useAstroGetStaticPaths(getCollection, "blog");
 *   if (result.ok) return result.data;
 *   TODO: traer el useLogger('error', result.error)
 *   console.error(result.error);
 *   return [];
 * }
 * ```
 */
export async function useAstroGetStaticPaths<
	TData = unknown,
	TParam extends string = "slug",
	TProps = CollectionEntryLike<TData>,
>(
	getCollectionFn: (collection: string) => Promise<CollectionEntryLike<TData>[]>,
	collectionName: string,
	options: PathsOptions<CollectionEntryLike<TData>, TParam, TProps> = {},
): Promise<AstroServiceResult<AstroPath<TParam, TProps>[]>> {
	try {
		const entries = await getCollectionFn(collectionName);
		return { data: useAstroPathsFrom(entries, options), error: null, ok: true };
	} catch (error: unknown) {
		return {
			data: null,
			error: {
				message: `Error generating routes for collection "${collectionName}"`,
				collectionName,
				details: error instanceof Error ? error.message : String(error),
			},
			ok: false,
		};
	}
}

/**
 * Find a collection entry by slug or custom key.
 *
 * @param items - Collection items to search
 * @param value - Value to match (slug, id, etc.)
 * @param keyFrom - Optional function to extract the key from an item
 * @returns Matched item or null
 *
 * @example
 * ```ts
 * const posts = await getCollection("blog");
 * const post = useAstroFindEntry(posts, "hello-world");
 * if (post) console.log(post.data.title);
 * ```
 */
export function useAstroFindEntry<T>(
	items: T[],
	value: string,
	keyFrom?: (item: T) => string | number,
): T | null {
	const getKey =
		keyFrom ??
		((item: T) => {
			const record = item as { slug?: string; id?: string } | null | undefined;
			return record?.slug ?? record?.id ?? "";
		});
	return items.find((item) => String(getKey(item)) === value) ?? null;
}

/**
 * Generate paginated Astro paths from a list of items.
 *
 * @param items - Items to paginate
 * @param pageSize - Number of items per page
 * @param param - URL param name for page number
 * @returns Array of Astro paths with pagination props
 *
 * @example
 * ```ts
 * const posts = await getCollection("blog");
 * const pages = useAstroGeneratePagination(posts, 10);
 * // [{ params: { page: undefined }, props: { items: [...], currentPage: 1, totalPages: 3 } },
 * //  { params: { page: "2" }, props: { items: [...], currentPage: 2, totalPages: 3 } }, ...]
 * ```
 */
export function useAstroGeneratePagination<T, TParam extends string = "page">(
	items: T[],
	pageSize = 10,
	param: TParam = "page" as TParam,
): AstroPath<TParam, PaginationProps<T>>[] {
	const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
	return Array.from({ length: totalPages }, (_, i) => {
		const currentPage = i + 1;
		return {
			params: { [param]: currentPage === 1 ? undefined : String(currentPage) } as Record<
				TParam,
				string | undefined
			>,
			props: { items: items.slice(i * pageSize, (i + 1) * pageSize), currentPage, totalPages },
		};
	});
}

/**
 * Convert simple values into Astro paths.
 *
 * @param values - Array of string or number values
 * @param param - URL param name
 * @returns Array of Astro paths
 *
 * @example
 * ```ts
 * const categories = ["tech", "design", "business"];
 * const paths = useAstroPathsFromValues(categories, "category");
 * // [{ params: { category: "tech" }, props: "tech" }, ...]
 * ```
 */
export function useAstroPathsFromValues<TParam extends string = "slug">(
	values: (string | number)[],
	param: TParam = "slug" as TParam,
): AstroPath<TParam, string | number>[] {
	return values.map((value) => ({
		params: { [param]: String(value) } as Record<TParam, string | undefined>,
		props: value,
	}));
}

/**
 * Extract unique values from a collection, supporting single values or arrays.
 *
 * @param items - Collection items
 * @param keyFrom - Function to extract value(s) from each item
 * @returns Array of unique values
 *
 * @example
 * ```ts
 * const posts = [{ tags: ["ts", "react"] }, { tags: ["ts", "vue"] }];
 * const tags = useAstroExtractUniqueValues(posts, (p) => p.tags);
 * // ["ts", "react", "vue"]
 * ```
 */
export function useAstroExtractUniqueValues<T, V>(items: T[], keyFrom: (item: T) => V | V[]): V[] {
	return [...new Set(items.flatMap(keyFrom))];
}
