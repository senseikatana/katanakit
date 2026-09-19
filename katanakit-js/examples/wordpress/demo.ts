/**
 * WordPress Adapter — real-world usage patterns.
 *
 * Run:  npx tsx examples/wordpress/demo.ts
 *
 * Set your WordPress credentials:
 *   export WP_BASE_URL="https://mysite.com"
 *   export WP_USERNAME="admin"
 *   export WP_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
 *
 * To create an Application Password:
 *   WP Admin → Users → Your Profile → Application Passwords
 */

import {
	useInitWordPress,
	useWpGetPosts,
	useWpGetPost,
	useWpCreatePost,
	useWpUpdatePost,
	useWpDeletePost,
	useWpGetPages,
	useWpGetPage,
	useWpCreatePage,
	useWpUpdatePage,
	useWpDeletePage,
	useWpGetMedia,
	useWpGetMediaItem,
	useWpUploadMedia,
	useWpUpdateMedia,
	useWpDeleteMedia,
	useWpGetCategories,
	useWpGetCategory,
	useWpCreateCategory,
	useWpUpdateCategory,
	useWpDeleteCategory,
	useWpGetTags,
	useWpGetTag,
	useWpCreateTag,
	useWpUpdateTag,
	useWpDeleteTag,
	useWpGetComments,
	useWpGetComment,
	useWpCreateComment,
	useWpUpdateComment,
	useWpDeleteComment,
	useWpGetUsers,
	useWpGetUser,
	useWpGetCurrentUser,
	useWpCreateUser,
	useWpUpdateUser,
	useWpDeleteUser,
	useWpGetCustomPosts,
	useWpGetCustomPost,
	useWpCreateCustomPost,
	useWpUpdateCustomPost,
	useWpDeleteCustomPost,
	useWpBatch,
	useWpListAllPosts,
	useWpSearchAllPosts,
	useWpFindPostBySlug,
} from "../../src/adapters/wordpress/index.js";

/* ------------------------------------------------------------------ */
/* 1. Init — register credentials once                                 */
/* ------------------------------------------------------------------ */

useInitWordPress({
	baseUrl: process.env.WP_BASE_URL ?? "https://mysite.com",
	auth: {
		type: "application-passwords",
		username: process.env.WP_USERNAME ?? "admin",
		password: process.env.WP_APP_PASSWORD ?? "",
	},
});

/* ------------------------------------------------------------------ */
/* 2. Posts — the most common operations                               */
/* ------------------------------------------------------------------ */

async function listPosts(): Promise<void> {
	console.log("\n--- List Posts (paginated) ---");

	const result = await useWpGetPosts({
		per_page: 5,
		status: "publish",
		orderby: "date",
		order: "desc",
		_embed: true, // include featured media, author, etc.
	});

	if (result.ok) {
		console.log(`  Found ${result.data.length} posts`);
		for (const post of result.data) {
			console.log(`  - [${post.id}] ${post.title.rendered}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getSinglePost(id: number): Promise<void> {
	console.log("\n--- Get Single Post ---");

	const result = await useWpGetPost(id, { _embed: true });

	if (result.ok) {
		console.log(`  Title: ${result.data.title.rendered}`);
		console.log(`  Status: ${result.data.status}`);
		console.log(`  Link: ${result.data.link}`);
		console.log(`  Date: ${result.data.date}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function findPostBySlug(slug: string): Promise<void> {
	console.log("\n--- Find Post by Slug ---");

	const result = await useWpFindPostBySlug(slug);

	if (result.ok && result.data) {
		console.log(`  Found: ${result.data.title.rendered}`);
		console.log(`  Link: ${result.data.link}`);
	} else if (result.ok) {
		console.log("  Not found");
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function listAllPosts(): Promise<void> {
	console.log("\n--- List ALL Posts (auto-pagination) ---");

	const result = await useWpListAllPosts({ status: "publish" });

	if (result.ok) {
		console.log(`  Total published posts: ${result.data.length}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function searchAllPosts(query: string): Promise<void> {
	console.log("\n--- Search All Posts ---");

	const result = await useWpSearchAllPosts(query);

	if (result.ok) {
		console.log(`  Found ${result.data.length} posts matching "${query}"`);
		for (const post of result.data) {
			console.log(`  - ${post.title.rendered}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 2b. _fields — minimal payloads for list views                      */
/* ------------------------------------------------------------------ */

async function listPostsMinimal(): Promise<void> {
	console.log("\n--- List Posts with _fields (minimal payload) ---");

	const result = await useWpGetPosts({
		per_page: 5,
		_fields: "id,title,link,slug,date",
	});

	if (result.ok) {
		console.log(`  Found ${result.data.length} posts (only id, title, link, slug, date)`);
		for (const post of result.data) {
			console.log(`  - [${post.id}] ${post.title.rendered} → ${post.link}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 2c. _embed — embedded resources (author, featured media, terms)     */
/* ------------------------------------------------------------------ */

async function listPostsWithEmbed(): Promise<void> {
	console.log("\n--- List Posts with _embed (author + featured media) ---");

	const result = await useWpGetPosts({
		per_page: 5,
		_embed: "author,wp:featuredmedia",
	});

	if (result.ok) {
		for (const post of result.data) {
			const author = post._embedded?.author?.[0]?.name ?? "Unknown";
			const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
			console.log(`  - [${post.id}] ${post.title.rendered} by ${author}`);
			if (image) console.log(`    Image: ${image}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 2d. ACF — Advanced Custom Fields access                            */
/* ------------------------------------------------------------------ */

async function listPostsWithAcf(): Promise<void> {
	console.log("\n--- List Posts with ACF fields ---");

	const result = await useWpGetPosts({
		per_page: 5,
		_fields: "id,title,acf",
	});

	if (result.ok) {
		for (const post of result.data) {
			console.log(`  - [${post.id}] ${post.title.rendered}`);
			if (post.acf) {
				// ACF fields are dynamic — access by field name
				console.log(`    ACF fields:`, JSON.stringify(post.acf, null, 2));
			}
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 2e. Media with sizes and ACF                                       */
/* ------------------------------------------------------------------ */

async function listMediaWithDetails(): Promise<void> {
	console.log("\n--- List Media with details (sizes, file, filesize) ---");

	const result = await useWpGetMedia({
		per_page: 3,
		media_type: "image",
		_fields: "id,title,source_url,media_details,acf",
	});

	if (result.ok) {
		for (const media of result.data) {
			console.log(`  - [${media.id}] ${media.title.rendered}`);
			console.log(`    URL: ${media.source_url}`);
			if (media.media_details?.width) {
				console.log(`    Dimensions: ${media.media_details.width}x${media.media_details.height}`);
			}
			if (media.media_details?.filesize) {
				console.log(`    File size: ${(media.media_details.filesize / 1024).toFixed(1)} KB`);
			}
			if (media.media_details?.sizes) {
				const sizeNames = Object.keys(media.media_details.sizes);
				console.log(`    Available sizes: ${sizeNames.join(", ")}`);
			}
			if (media.acf) {
				console.log(`    ACF:`, JSON.stringify(media.acf, null, 2));
			}
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 2f. Combined: _fields + _embed + ACF                               */
/* ------------------------------------------------------------------ */

async function listPostsFull(): Promise<void> {
	console.log("\n--- List Posts: _fields + _embed + ACF combined ---");

	const result = await useWpGetPosts({
		per_page: 3,
		_fields: "id,title,link,slug,date,acf",
		_embed: "author,wp:featuredmedia",
	});

	if (result.ok) {
		for (const post of result.data) {
			const author = post._embedded?.author?.[0]?.name ?? "Unknown";
			const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
			const thumbnail = post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.thumbnail?.source_url;

			console.log(`  - ${post.title.rendered} by ${author}`);
			console.log(`    Link: ${post.link}`);
			if (image) console.log(`    Featured image: ${image}`);
			if (thumbnail) console.log(`    Thumbnail: ${thumbnail}`);
			if (post.acf) console.log(`    ACF:`, JSON.stringify(post.acf));
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createPost(): Promise<void> {
	console.log("\n--- Create Post ---");

	const result = await useWpCreatePost({
		title: "My New Post from KatanaKit",
		content: "<p>This post was created using the WordPress adapter.</p><p>It supports <strong>HTML</strong> content.</p>",
		status: "draft",
		excerpt: "A demo post created with KatanaKit.",
	});

	if (result.ok) {
		console.log(`  Created post #${result.data.id}: ${result.data.title.rendered}`);
		console.log(`  Status: ${result.data.status}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function updatePost(id: number): Promise<void> {
	console.log("\n--- Update Post ---");

	const result = await useWpUpdatePost(id, {
		title: "Updated Title",
		content: "<p>Updated content.</p>",
		status: "publish",
	});

	if (result.ok) {
		console.log(`  Updated: ${result.data.title.rendered}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function deletePost(id: number): Promise<void> {
	console.log("\n--- Delete Post (move to trash) ---");

	const result = await useWpDeletePost(id, false);

	if (result.ok) {
		console.log(`  Deleted post #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 3. Pages — static content                                           */
/* ------------------------------------------------------------------ */

async function listPages(): Promise<void> {
	console.log("\n--- List Pages ---");

	const result = await useWpGetPages({ per_page: 10 });

	if (result.ok) {
		console.log(`  Found ${result.data.length} pages`);
		for (const page of result.data) {
			console.log(`  - [${page.id}] ${page.title.rendered}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getSinglePage(id: number): Promise<void> {
	console.log("\n--- Get Single Page ---");

	const result = await useWpGetPage(id);

	if (result.ok) {
		console.log(`  Title: ${result.data.title.rendered}`);
		console.log(`  Link: ${result.data.link}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createPage(): Promise<void> {
	console.log("\n--- Create Page ---");

	const result = await useWpCreatePage({
		title: "About Us",
		content: "<p>Welcome to our site! This page was created with KatanaKit.</p>",
		status: "publish",
	});

	if (result.ok) {
		console.log(`  Created page #${result.data.id}: ${result.data.title.rendered}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function updatePage(id: number): Promise<void> {
	console.log("\n--- Update Page ---");

	const result = await useWpUpdatePage(id, {
		title: "About Us — Updated",
		content: "<p>Updated content.</p>",
	});

	if (result.ok) {
		console.log(`  Updated: ${result.data.title.rendered}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function deletePage(id: number): Promise<void> {
	console.log("\n--- Delete Page ---");

	const result = await useWpDeletePage(id, false);

	if (result.ok) {
		console.log(`  Deleted page #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 4. Media — images, documents, uploads                               */
/* ------------------------------------------------------------------ */

async function listMedia(): Promise<void> {
	console.log("\n--- List Media ---");

	const result = await useWpGetMedia({ per_page: 5, media_type: "image" });

	if (result.ok) {
		console.log(`  Found ${result.data.length} media items`);
		for (const media of result.data) {
			console.log(`  - [${media.id}] ${media.title.rendered} — ${media.source_url}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getMediaItem(id: number): Promise<void> {
	console.log("\n--- Get Media Item ---");

	const result = await useWpGetMediaItem(id);

	if (result.ok) {
		console.log(`  Title: ${result.data.title.rendered}`);
		console.log(`  URL: ${result.data.source_url}`);
		console.log(`  Type: ${result.data.media_type}`);
		console.log(`  Size: ${result.data.media_details.width}x${result.data.media_details.height}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function uploadMedia(): Promise<void> {
	console.log("\n--- Upload Media ---");

	// In Node.js, read a file as Buffer
	// In browser, use: const file = document.querySelector("input[type=file]").files[0];
	const { readFileSync } = await import("node:fs");
	const { resolve } = await import("node:path");

	try {
		const filePath = resolve("examples/astro/demo.ts"); // use any file for demo
		const buffer = readFileSync(filePath);

		const result = await useWpUploadMedia(buffer, {
			title: "Uploaded via KatanaKit",
			alt_text: "Demo upload",
			caption: "This file was uploaded using the WordPress adapter",
		});

		if (result.ok) {
			console.log(`  Uploaded: ${result.data.source_url}`);
			console.log(`  ID: ${result.data.id}`);
		} else {
			console.error("  Error:", result.error.message);
		}
	} catch {
		console.log("  Skipped (file not found for demo)");
	}
}

async function updateMedia(id: number): Promise<void> {
	console.log("\n--- Update Media ---");

	const result = await useWpUpdateMedia(id, {
		alt_text: "Updated alt text",
		caption: "Updated caption",
	});

	if (result.ok) {
		console.log(`  Updated media #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function deleteMedia(id: number): Promise<void> {
	console.log("\n--- Delete Media ---");

	const result = await useWpDeleteMedia(id, true);

	if (result.ok) {
		console.log(`  Deleted media #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 5. Categories — taxonomy management                                 */
/* ------------------------------------------------------------------ */

async function listCategories(): Promise<void> {
	console.log("\n--- List Categories ---");

	const result = await useWpGetCategories({ per_page: 20 });

	if (result.ok) {
		console.log(`  Found ${result.data.length} categories`);
		for (const cat of result.data) {
			console.log(`  - [${cat.id}] ${cat.name} (${cat.count} posts)`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getCategory(id: number): Promise<void> {
	console.log("\n--- Get Category ---");

	const result = await useWpGetCategory(id);

	if (result.ok) {
		console.log(`  Name: ${result.data.name}`);
		console.log(`  Slug: ${result.data.slug}`);
		console.log(`  Posts: ${result.data.count}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createCategory(): Promise<void> {
	console.log("\n--- Create Category ---");

	const result = await useWpCreateCategory({
		name: "KatanaKit",
		slug: "katanakit",
		description: "Posts about KatanaKit",
	});

	if (result.ok) {
		console.log(`  Created: ${result.data.name} (#${result.data.id})`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function updateCategory(id: number): Promise<void> {
	console.log("\n--- Update Category ---");

	const result = await useWpUpdateCategory(id, {
		name: "KatanaKit — Updated",
		description: "Updated description",
	});

	if (result.ok) {
		console.log(`  Updated: ${result.data.name}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function deleteCategory(id: number): Promise<void> {
	console.log("\n--- Delete Category ---");

	const result = await useWpDeleteCategory(id, true);

	if (result.ok) {
		console.log(`  Deleted category #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 6. Tags — taxonomy management                                       */
/* ------------------------------------------------------------------ */

async function listTags(): Promise<void> {
	console.log("\n--- List Tags ---");

	const result = await useWpGetTags({ per_page: 20 });

	if (result.ok) {
		console.log(`  Found ${result.data.length} tags`);
		for (const tag of result.data) {
			console.log(`  - [${tag.id}] ${tag.name} (${tag.count} posts)`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createTag(): Promise<void> {
	console.log("\n--- Create Tag ---");

	const result = await useWpCreateTag({
		name: "typescript",
		slug: "typescript",
	});

	if (result.ok) {
		console.log(`  Created: ${result.data.name} (#${result.data.id})`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function updateTag(id: number): Promise<void> {
	console.log("\n--- Update Tag ---");

	const result = await useWpUpdateTag(id, { name: "TypeScript" });

	if (result.ok) {
		console.log(`  Updated: ${result.data.name}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function deleteTag(id: number): Promise<void> {
	console.log("\n--- Delete Tag ---");

	const result = await useWpDeleteTag(id, true);

	if (result.ok) {
		console.log(`  Deleted tag #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 7. Comments — moderation                                            */
/* ------------------------------------------------------------------ */

async function listComments(postId: number): Promise<void> {
	console.log("\n--- List Comments for Post ---");

	const result = await useWpGetComments({ post: postId, per_page: 10 });

	if (result.ok) {
		console.log(`  Found ${result.data.length} comments`);
		for (const comment of result.data) {
			console.log(`  - [${comment.id}] ${comment.author_name}: ${comment.content.rendered.slice(0, 50)}...`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createComment(postId: number): Promise<void> {
	console.log("\n--- Create Comment ---");

	const result = await useWpCreateComment({
		post: postId,
		content: "Great article! Thanks for sharing.",
		author_name: "KatanaKit User",
		author_email: "user@example.com",
	});

	if (result.ok) {
		console.log(`  Created comment #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function updateComment(id: number): Promise<void> {
	console.log("\n--- Update Comment ---");

	const result = await useWpUpdateComment(id, {
		content: "Updated comment content.",
	});

	if (result.ok) {
		console.log(`  Updated comment #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function deleteComment(id: number): Promise<void> {
	console.log("\n--- Delete Comment ---");

	const result = await useWpDeleteComment(id, true);

	if (result.ok) {
		console.log(`  Deleted comment #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 8. Users — user management                                          */
/* ------------------------------------------------------------------ */

async function listUsers(): Promise<void> {
	console.log("\n--- List Users ---");

	const result = await useWpGetUsers({ per_page: 10 });

	if (result.ok) {
		console.log(`  Found ${result.data.length} users`);
		for (const user of result.data) {
			console.log(`  - [${user.id}] ${user.name} (${user.roles.join(", ")})`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getCurrentUser(): Promise<void> {
	console.log("\n--- Get Current User ---");

	const result = await useWpGetCurrentUser();

	if (result.ok) {
		console.log(`  Name: ${result.data.name}`);
		console.log(`  Email: ${result.data.email}`);
		console.log(`  Roles: ${result.data.roles.join(", ")}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getUser(id: number): Promise<void> {
	console.log("\n--- Get User ---");

	const result = await useWpGetUser(id);

	if (result.ok) {
		console.log(`  Name: ${result.data.name}`);
		console.log(`  Email: ${result.data.email}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createUser(): Promise<void> {
	console.log("\n--- Create User ---");

	const result = await useWpCreateUser({
		username: "katanakit-demo",
		email: "demo@katanakit.com",
		name: "KatanaKit Demo",
		password: "secure-password-here",
		roles: ["editor"],
	});

	if (result.ok) {
		console.log(`  Created: ${result.data.name} (#${result.data.id})`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function updateUser(id: number): Promise<void> {
	console.log("\n--- Update User ---");

	const result = await useWpUpdateUser(id, {
		name: "Updated Name",
	});

	if (result.ok) {
		console.log(`  Updated: ${result.data.name}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function deleteUser(id: number): Promise<void> {
	console.log("\n--- Delete User ---");

	const result = await useWpDeleteUser(id, 1); // reassign content to user 1

	if (result.ok) {
		console.log(`  Deleted user #${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 9. Custom Post Types — generic CRUD                                 */
/* ------------------------------------------------------------------ */

async function listCustomPosts(postType: string): Promise<void> {
	console.log("\n--- List Custom Posts ---");

	const result = await useWpGetCustomPosts(postType, { per_page: 5 });

	if (result.ok) {
		console.log(`  Found ${result.data.length} ${postType} entries`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getCustomPost(postType: string, id: number): Promise<void> {
	console.log("\n--- Get Custom Post ---");

	const result = await useWpGetCustomPost(postType, id);

	if (result.ok) {
		console.log(`  Got ${postType} entry #${id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createCustomPost(postType: string): Promise<void> {
	console.log("\n--- Create Custom Post ---");

	const result = await useWpCreateCustomPost(postType, {
		title: "New Custom Entry",
		content: "<p>Custom post type content.</p>",
		status: "publish",
	});

	if (result.ok) {
		console.log(`  Created ${postType} entry`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function updateCustomPost(postType: string, id: number): Promise<void> {
	console.log("\n--- Update Custom Post ---");

	const result = await useWpUpdateCustomPost(postType, id, {
		title: "Updated Custom Entry",
	});

	if (result.ok) {
		console.log(`  Updated ${postType} entry #${id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function deleteCustomPost(postType: string, id: number): Promise<void> {
	console.log("\n--- Delete Custom Post ---");

	const result = await useWpDeleteCustomPost(postType, id, true);

	if (result.ok) {
		console.log(`  Deleted ${postType} entry #${id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 10. Batch — multiple requests in one call                           */
/* ------------------------------------------------------------------ */

async function batchOperations(): Promise<void> {
	console.log("\n--- Batch Operations ---");

	const result = await useWpBatch([
		{ method: "GET", path: "/wp/v2/posts?per_page=2" },
		{ method: "GET", path: "/wp/v2/pages?per_page=2" },
		{ method: "GET", path: "/wp/v2/categories?per_page=5" },
	]);

	if (result.ok) {
		console.log(`  Batch returned ${result.data.responses.length} responses`);
		for (const resp of result.data.responses) {
			console.log(`  - Status: ${resp.status}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* Run all examples                                                    */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
	// Posts (most common)
	await listPosts();
	await getSinglePost(1);
	await findPostBySlug("hello-world");
	await listAllPosts();
	await searchAllPosts("tutorial");
	// await createPost();      // uncomment to test
	// await updatePost(1);     // uncomment to test
	// await deletePost(1);     // uncomment to test

	// _fields, _embed, ACF — advanced features
	await listPostsMinimal();          // minimal payload with _fields
	await listPostsWithEmbed();        // embedded author + featured media
	await listPostsWithAcf();          // ACF fields access
	await listMediaWithDetails();      // media sizes, file, filesize
	await listPostsFull();             // combined _fields + _embed + ACF

	// Pages
	await listPages();
	await getSinglePage(2);
	// await createPage();      // uncomment to test
	// await updatePage(2);     // uncomment to test
	// await deletePage(2);     // uncomment to test

	// Media
	await listMedia();
	await getMediaItem(1);
	// await uploadMedia();     // uncomment to test
	// await updateMedia(1);    // uncomment to test
	// await deleteMedia(1);    // uncomment to test

	// Categories
	await listCategories();
	await getCategory(1);
	// await createCategory();  // uncomment to test
	// await updateCategory(1); // uncomment to test
	// await deleteCategory(1); // uncomment to test

	// Tags
	await listTags();
	// await createTag();       // uncomment to test
	// await updateTag(1);      // uncomment to test
	// await deleteTag(1);      // uncomment to test

	// Comments
	await listComments(1);
	// await createComment(1);  // uncomment to test
	// await updateComment(1);  // uncomment to test
	// await deleteComment(1);  // uncomment to test

	// Users
	await listUsers();
	await getCurrentUser();
	await getUser(1);
	// await createUser();      // uncomment to test
	// await updateUser(1);     // uncomment to test
	// await deleteUser(1);     // uncomment to test

	// Custom Post Types
	// await listCustomPosts("product");     // uncomment with your CPT slug
	// await getCustomPost("product", 1);
	// await createCustomPost("product");
	// await updateCustomPost("product", 1);
	// await deleteCustomPost("product", 1);

	// Batch
	await batchOperations();

	console.log("\nDone.");
}

main();
