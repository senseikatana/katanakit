/**
 * Next.js (React) + Notion — dynamic blog post page.
 *
 * This file goes in: app/blog/[slug]/page.tsx (App Router)
 *
 * Fetches a page from Notion by slug, then renders its blocks.
 */

import {
	useInitNotion,
	useNotionListAllDatabasePages,
	useNotionListAllBlockChildren,
} from "katanakit-js/adapters/notion";

useInitNotion({ token: process.env.NOTION_TOKEN! });

// Generate static params for SSG
export async function generateStaticParams() {
	const posts = await useNotionListAllDatabasePages(
		process.env.NOTION_DATABASE_ID!,
	);

	if (!posts.ok) return [];

	return posts.data.map((page) => ({
		slug:
			(page.properties.Slug as any)?.rich_text?.[0]?.plain_text ?? page.id,
	}));
}

// Block renderer component
function NotionBlock({ block }: { block: any }) {
	const { type } = block;

	if (type === "paragraph") {
		const text =
			block.paragraph?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
		return <p>{text}</p>;
	}
	if (type === "heading_1") {
		const text =
			block.heading_1?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
		return <h2>{text}</h2>;
	}
	if (type === "heading_2") {
		const text =
			block.heading_2?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
		return <h3>{text}</h3>;
	}
	if (type === "heading_3") {
		const text =
			block.heading_3?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
		return <h4>{text}</h4>;
	}
	if (type === "bulleted_list_item") {
		const text =
			block.bulleted_list_item?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
		return <li>{text}</li>;
	}
	if (type === "code") {
		const text =
			block.code?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
		const lang = block.code?.language ?? "";
		return (
			<pre>
				<code className={`language-${lang}`}>{text}</code>
			</pre>
		);
	}
	if (type === "image") {
		const url = block.image?.external?.url ?? block.image?.file?.url ?? "";
		const caption =
			block.image?.caption?.map((t: any) => t.plain_text).join("") ?? "";
		return (
			<figure>
				<img src={url} alt={caption} />
				{caption && <figcaption>{caption}</figcaption>}
			</figure>
		);
	}
	if (type === "divider") {
		return <hr />;
	}

	return <p><em>[{type}]</em></p>;
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	// Find the page by slug
	const posts = await useNotionListAllDatabasePages(
		process.env.NOTION_DATABASE_ID!,
	);

	if (!posts.ok) {
		return <div>Error: {posts.error.message}</div>;
	}

	const page = posts.data.find((p) => {
		const pageSlug =
			(p.properties.Slug as any)?.rich_text?.[0]?.plain_text ?? p.id;
		return pageSlug === slug;
	});

	if (!page) {
		return <div>Post not found</div>;
	}

	const title =
		(page.properties.Name as any)?.title?.[0]?.plain_text ?? "Untitled";
	const date = (page.properties.Date as any)?.date?.start ?? "";

	// Fetch all blocks
	const blocks = await useNotionListAllBlockChildren(page.id);

	return (
		<main>
			<a href="/blog">&larr; Back to blog</a>

			<article>
				<h1>{title}</h1>
				{date && <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>}

				{blocks.ok ? (
					blocks.data.map((block) => (
						<NotionBlock key={block.id} block={block} />
					))
				) : (
					<p>Error loading content: {blocks.error.message}</p>
				)}
			</article>
		</main>
	);
}
