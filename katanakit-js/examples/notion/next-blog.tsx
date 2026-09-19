/**
 * Next.js (React) + Notion — blog listing from a Notion database.
 *
 * This file goes in: app/blog/page.tsx (App Router)
 *
 * Setup:
 *   1. Create a Notion integration at https://www.notion.so/my-integrations
 *   2. Share your database with the integration
 *   3. Add NOTION_TOKEN and NOTION_DATABASE_ID to .env.local
 */

import {
	useInitNotion,
	useNotionListAllDatabasePages,
} from "katanakit-js/adapters/notion";

// Init once at module level
useInitNotion({ token: process.env.NOTION_TOKEN! });

export default async function BlogPage() {
	// Fetch all published posts from Notion
	const posts = await useNotionListAllDatabasePages(
		process.env.NOTION_DATABASE_ID!,
		{ property: "Status", select: { equals: "Published" } },
		[{ property: "Date", direction: "descending" }],
	);

	if (!posts.ok) {
		return <div>Error: {posts.error.message}</div>;
	}

	return (
		<main>
			<h1>Blog — from Notion</h1>
			<p>Powered by Notion + KatanaKit</p>

			<ul>
				{posts.data.map((page) => {
					// Adjust property names to match your database schema
					const title =
						(page.properties.Name as any)?.title?.[0]?.plain_text ?? "Untitled";
					const status =
						(page.properties.Status as any)?.select?.name ?? "";
					const date =
						(page.properties.Date as any)?.date?.start ?? "";
					const slug =
						(page.properties.Slug as any)?.rich_text?.[0]?.plain_text ?? page.id;

					return (
						<li key={page.id}>
							<a href={`/blog/${slug}`}>
								<strong>{title}</strong>
							</a>
							{date && (
								<time dateTime={date}>
									{new Date(date).toLocaleDateString()}
								</time>
							)}
							{status && <span className="badge">{status}</span>}
						</li>
					);
				})}
			</ul>
		</main>
	);
}
