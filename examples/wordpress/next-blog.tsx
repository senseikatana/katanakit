/**
 * Next.js (React) + WordPress — blog listing page.
 *
 * This file goes in: app/blog/page.tsx (App Router)
 *
 * Setup:
 *   1. Create an Application Password in WP Admin → Users → Your Profile
 *   2. Add WP_BASE_URL, WP_USERNAME, WP_APP_PASSWORD to .env.local
 */

import {
	useInitWordPress,
	useWpGetPosts,
	useWpGetCategories,
} from "katanakit-js/adapters/wordpress";

// Init once at module level
useInitWordPress({
	baseUrl: process.env.WP_BASE_URL!,
	auth: {
		type: "application-passwords",
		username: process.env.WP_USERNAME!,
		password: process.env.WP_APP_PASSWORD!,
	},
});

export default async function BlogPage() {
	// Fetch published posts with embedded data (featured image, author, terms)
	const posts = await useWpGetPosts({
		per_page: 10,
		status: "publish",
		orderby: "date",
		order: "desc",
		_embed: true,
	});

	// Fetch categories for sidebar/filter
	const categories = await useWpGetCategories({ per_page: 50 });

	if (!posts.ok) {
		return <div>Error: {posts.error.message}</div>;
	}

	return (
		<main>
			<h1>Blog — from WordPress</h1>
			<p>Powered by WordPress + KatanaKit</p>

			{/* Categories filter */}
			{categories.ok && categories.data.length > 0 && (
				<nav>
					<strong>Categories: </strong>
					{categories.data.map((cat) => (
						<a key={cat.id} href={`/blog/category/${cat.slug}`}>
							{cat.name}
						</a>
					))}
				</nav>
			)}

			{/* Post listing */}
			<ul>
				{posts.data.map((post) => {
					const featuredImage =
						(post as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
					const authorName =
						(post as any)._embedded?.author?.[0]?.name ?? "Unknown";
					const categoryNames =
						(post as any)._embedded?.["wp:term"]?.[0]?.map(
							(t: any) => t.name,
						) ?? [];

					return (
						<li key={post.id}>
							{featuredImage && (
								<img src={featuredImage} alt="" width={200} />
							)}
							<a href={`/blog/${post.slug}`}>
								<strong
									dangerouslySetInnerHTML={{
										__html: post.title.rendered,
									}}
								/>
							</a>
							<div>
								<time dateTime={post.date}>
									{new Date(post.date).toLocaleDateString()}
								</time>
								<span> by {authorName}</span>
								{categoryNames.length > 0 && (
									<span> in {categoryNames.join(", ")}</span>
								)}
							</div>
							<div
								dangerouslySetInnerHTML={{
									__html: post.excerpt.rendered,
								}}
							/>
						</li>
					);
				})}
			</ul>
		</main>
	);
}
