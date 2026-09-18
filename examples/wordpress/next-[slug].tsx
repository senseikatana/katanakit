/**
 * Next.js (React) + WordPress — dynamic single post page.
 *
 * This file goes in: app/blog/[slug]/page.tsx (App Router)
 *
 * Fetches a post from WordPress by slug and renders it with comments.
 */

import {
	useInitWordPress,
	useWpListAllPosts,
	useWpFindPostBySlug,
	useWpGetComments,
} from "katanakit-js/adapters/wordpress";

useInitWordPress({
	baseUrl: process.env.WP_BASE_URL!,
	auth: {
		type: "application-passwords",
		username: process.env.WP_USERNAME!,
		password: process.env.WP_APP_PASSWORD!,
	},
});

// Generate static params for SSG
export async function generateStaticParams() {
	const posts = await useWpListAllPosts({ status: "publish" });

	if (!posts.ok) return [];

	return posts.data.map((post) => ({
		slug: post.slug,
	}));
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	// Find the post by slug
	const post = await useWpFindPostBySlug(slug);

	if (!post.ok || !post.data) {
		return <div>Post not found</div>;
	}

	// Fetch comments for this post
	const comments = await useWpGetComments({
		post: post.data.id,
		status: "approve",
	});

	const featuredImage =
		(post.data as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
	const authorName =
		(post.data as any)._embedded?.author?.[0]?.name ?? "Unknown";

	return (
		<main>
			<a href="/blog">&larr; Back to blog</a>

			<article>
				<h1
					dangerouslySetInnerHTML={{
						__html: post.data.title.rendered,
					}}
				/>

				<div>
					<time dateTime={post.data.date}>
						{new Date(post.data.date).toLocaleDateString()}
					</time>
					<span> by {authorName}</span>
				</div>

				{featuredImage && (
					<img
						src={featuredImage}
						alt={post.data.title.rendered}
						width={800}
					/>
				)}

				{/* Post content — WordPress returns rendered HTML */}
				<div
					dangerouslySetInnerHTML={{
						__html: post.data.content.rendered,
					}}
				/>
			</article>

			{/* Comments section */}
			{comments.ok && comments.data.length > 0 && (
				<section>
					<h2>Comments ({comments.data.length})</h2>
					<ul>
						{comments.data.map((comment) => (
							<li key={comment.id}>
								<strong>{comment.author_name}</strong>
								<time dateTime={comment.date}>
									{" "}
									{new Date(comment.date).toLocaleDateString()}
								</time>
								<div
									dangerouslySetInnerHTML={{
										__html: comment.content.rendered,
									}}
								/>
							</li>
						))}
					</ul>
				</section>
			)}
		</main>
	);
}
