/**
 * Example: generate Astro `getStaticPaths` routes.
 *
 * Run with: `bun run examples/astro/demo.ts`
 */
import {
	useAstroExtractUniqueValues,
	useAstroFindEntry,
	useAstroGeneratePagination,
	useAstroGetStaticPaths,
	useAstroPathsFromValues,
} from "@/adapters/astro";
import type { CollectionEntryLike } from "@/types";

interface BlogPostData {
	title: string;
	tags: string[];
}

type BlogPostEntry = CollectionEntryLike<BlogPostData>;

const mockGetCollection = async (_name: string): Promise<BlogPostEntry[]> => [
	{ id: "1", slug: "hello-world", data: { title: "Hello World", tags: ["javascript", "astro"] } },
	{
		id: "2",
		slug: "typescript-guide",
		data: { title: "TypeScript Guide", tags: ["typescript", "astro"] },
	},
	{
		id: "3",
		slug: "singleton-pattern",
		data: { title: "Singleton Pattern", tags: ["architecture", "typescript"] },
	},
];

async function main(): Promise<void> {
	// 1. useAstroGetStaticPaths with Safe Result ({ data, error, ok }).
	const result = await useAstroGetStaticPaths(mockGetCollection, "blog", {
		param: "slug",
		valueFrom: (entry) => entry.slug ?? entry.id,
		propsFrom: (entry) => entry.data,
	});

	if (!result.ok) {
		console.error("Error generating routes:", result.error.message);
		return;
	}

	console.log("Generated Astro routes:", result.data);

	// 2. Load the collection for the synchronous utilities.
	const posts = await mockGetCollection("blog");

	// 3. useAstroFindEntry
	const singlePost = useAstroFindEntry(posts, "hello-world");
	console.log("Found post:", singlePost?.data?.title);

	// 4. useAstroGeneratePagination
	const paginated = useAstroGeneratePagination(posts, 2, "page");
	console.log("Generated pages:", paginated.length);

	// 5. useAstroExtractUniqueValues
	const uniqueTags = useAstroExtractUniqueValues(posts, (post) => post.data?.tags ?? []);
	console.log("Unique tags:", uniqueTags);

	// 6. useAstroPathsFromValues
	const tagRoutes = useAstroPathsFromValues(uniqueTags, "tag");
	console.log("Tag routes:", tagRoutes);
}

main();
