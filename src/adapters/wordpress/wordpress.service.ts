import type {
	FetchResult,
	WordPressConfig,
	WpBatchOperation,
	WpBatchResult,
	WpCategory,
	WpCategoryCreate,
	WpCategoryUpdate,
	WpComment,
	WpCommentCreate,
	WpCommentUpdate,
	WpMedia,
	WpMediaMeta,
	WpMediaUpdate,
	WpPage,
	WpPageCreate,
	WpPageUpdate,
	WpPost,
	WpPostCreate,
	WpPostUpdate,
	WpQueryParams,
	WpTag,
	WpTagCreate,
	WpTagUpdate,
	WpUser,
	WpUserCreate,
	WpUserUpdate,
} from "../../types/index.js";

/** Default WordPress REST API namespace. */
const WP_API_NAMESPACE = "wp/v2";

/** Module-level WordPress configuration. */
let config: WordPressConfig | null = null;

/**
 * Retrieves the registered WordPress config or throws.
 * @internal
 */
function getConfig(): WordPressConfig {
	if (!config) {
		throw new Error("[WordPress] Not configured. Call useInitWordPress() first.");
	}
	return config;
}

/**
 * Builds the base API URL from config.
 * @internal
 */
function getApiBase(): string {
	const { baseUrl, apiNamespace } = getConfig();
	const ns = apiNamespace ?? WP_API_NAMESPACE;
	const cleanBase = baseUrl.replace(/\/+$/, "");
	return `${cleanBase}/wp-json/${ns}`;
}

/**
 * Builds authentication headers from config.
 * @internal
 */
function getAuthHeaders(): Record<string, string> {
	const { auth } = getConfig();
	if (!auth) return {};

	switch (auth.type) {
		case "application-passwords":
		case "basic": {
			const credentials = btoa(`${auth.username}:${auth.password}`);
			return { Authorization: `Basic ${credentials}` };
		}
		case "jwt":
			return { Authorization: `Bearer ${auth.token}` };
		case "nonce":
			return { "X-WP-Nonce": auth.nonce };
		default:
			return {};
	}
}

/**
 * Converts query params to URL search params.
 * @internal
 */
function buildQueryParams(options?: WpQueryParams): string {
	if (!options) return "";

	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(options)) {
		if (value === undefined || value === null) continue;

		if (key === "_embed") {
			if (value) params.set("_embed", "");
			continue;
		}

		if (Array.isArray(value)) {
			params.set(key, value.join(","));
		} else {
			params.set(key, String(value));
		}
	}

	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

/**
 * Internal helper to make requests to the WordPress REST API.
 * @internal
 */
async function wpFetch<T>(endpoint: string, options: RequestInit = {}): Promise<FetchResult<T>> {
	const url = `${getApiBase()}${endpoint}`;

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...getAuthHeaders(),
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorBody = await response.text().catch(() => null);
			return {
				data: null,
				error: {
					message: `WordPress API Error: ${response.statusText}`,
					status: response.status,
					details: errorBody,
				},
				url,
				status: response.status,
				ok: false,
			};
		}

		if (response.status === 204) {
			return {
				data: null as T,
				error: null,
				url,
				status: 204,
				ok: true,
			};
		}

		const data = (await response.json()) as T;
		return { data, error: null, url, status: response.status, ok: true };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return {
			data: null,
			error: { message: `Network Error: ${message}`, status: 0 },
			url,
			status: 0,
			ok: false,
		};
	}
}

/**
 * Internal helper for multipart file uploads.
 * @internal
 */
async function wpUpload<T>(
	endpoint: string,
	file: File | Blob | Buffer,
	meta?: Record<string, unknown>,
): Promise<FetchResult<T>> {
	const url = `${getApiBase()}${endpoint}`;

	try {
		const formData = new FormData();

		// Add the file
		if (typeof Buffer !== "undefined" && file instanceof Buffer) {
			const blob = new Blob([new Uint8Array(file)]);
			formData.append("file", blob, "upload");
		} else {
			formData.append("file", file as Blob, (file as File).name ?? "upload");
		}

		// Add metadata
		if (meta) {
			for (const [key, value] of Object.entries(meta)) {
				if (value !== undefined && value !== null) {
					formData.append(key, String(value));
				}
			}
		}

		const response = await fetch(url, {
			method: "POST",
			headers: {
				...getAuthHeaders(),
				// Don't set Content-Type — browser sets multipart boundary
			},
			body: formData,
		});

		if (!response.ok) {
			const errorBody = await response.text().catch(() => null);
			return {
				data: null,
				error: {
					message: `WordPress Upload Error: ${response.statusText}`,
					status: response.status,
					details: errorBody,
				},
				url,
				status: response.status,
				ok: false,
			};
		}

		const data = (await response.json()) as T;
		return { data, error: null, url, status: response.status, ok: true };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return {
			data: null,
			error: { message: `Upload Error: ${message}`, status: 0 },
			url,
			status: 0,
			ok: false,
		};
	}
}

/* -------------------------------------------------------------------------- */
/* Initialization                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Registers the WordPress REST API configuration. Call this once before
 * any other WordPress function.
 *
 * Supports multiple auth methods: Application Passwords (recommended for
 * plugins), JWT tokens, Basic Auth, and nonce-based auth for themes.
 *
 * @param cfg - Site URL, authentication method, and optional API namespace.
 *
 * @example
 * ```ts
 * import { useInitWordPress } from "katanakit-js/adapters/wordpress";
 *
 * // With Application Passwords (recommended)
 * useInitWordPress({
 *   baseUrl: "https://mysite.com",
 *   auth: { type: "application-passwords", username: "admin", password: "xxxx xxxx xxxx" },
 * });
 *
 * // With JWT
 * useInitWordPress({
 *   baseUrl: "https://mysite.com",
 *   auth: { type: "jwt", token: "eyJhbGci..." },
 * });
 * ```
 */
export function useInitWordPress(cfg: WordPressConfig): void {
	config = { ...cfg };
}

/* -------------------------------------------------------------------------- */
/* Posts                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a list of WordPress posts with optional filtering and pagination.
 *
 * Use to display blog listings, search posts, or filter by category/tag/status.
 * Returns a single page of results (default 10 per page).
 *
 * @param options - Query params: `per_page`, `page`, `search`, `categories`,
 *   `tags`, `status`, `orderby`, `order`, `_embed`, etc.
 * @returns Array of posts.
 *
 * @example
 * ```ts
 * // Get latest 5 published posts
 * const result = await useWpGetPosts({ per_page: 5, status: "publish" });
 *
 * // Search posts by keyword
 * const result = await useWpGetPosts({ search: "tutorial" });
 *
 * // Get posts from category 3, sorted by title
 * const result = await useWpGetPosts({ categories: 3, orderby: "title", order: "asc" });
 * ```
 */
export async function useWpGetPosts(options?: WpQueryParams): Promise<FetchResult<WpPost[]>> {
	return wpFetch<WpPost[]>(`/posts${buildQueryParams(options)}`);
}

/**
 * Retrieves a single WordPress post by ID.
 *
 * @param id - The post ID.
 * @param options - Optional query params (e.g. _embed for featured media).
 * @returns The post object.
 *
 * @example
 * ```ts
 * const result = await useWpGetPost(42, { _embed: true });
 * if (result.ok) console.log(result.data.title.rendered);
 * ```
 */
export async function useWpGetPost(
	id: number,
	options?: WpQueryParams,
): Promise<FetchResult<WpPost>> {
	return wpFetch<WpPost>(`/posts/${id}${buildQueryParams(options)}`);
}

/**
 * Creates a new WordPress post.
 *
 * Use to publish blog entries, create drafts, or schedule future posts.
 * The post will be assigned to the authenticated user by default.
 *
 * @param data - Post data: `title`, `content` (HTML), `status` (publish/draft/pending),
 *   `categories`, `tags`, `featured_media`, `excerpt`, `slug`, `date`, etc.
 * @returns The created post.
 *
 * @example
 * ```ts
 * // Publish immediately
 * const result = await useWpCreatePost({
 *   title: "My New Post",
 *   content: "<p>Hello World!</p>",
 *   status: "publish",
 *   categories: [1, 3],
 * });
 *
 * // Create as draft
 * await useWpCreatePost({ title: "Draft Post", content: "...", status: "draft" });
 * ```
 */
export async function useWpCreatePost(data: WpPostCreate): Promise<FetchResult<WpPost>> {
	return wpFetch<WpPost>("/posts", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Updates an existing WordPress post.
 *
 * @param id - The post ID to update.
 * @param data - Fields to update.
 * @returns The updated post.
 *
 * @example
 * ```ts
 * await useWpUpdatePost(42, { title: "Updated Title" });
 * ```
 */
export async function useWpUpdatePost(
	id: number,
	data: WpPostUpdate,
): Promise<FetchResult<WpPost>> {
	return wpFetch<WpPost>(`/posts/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Deletes a WordPress post.
 *
 * @param id - The post ID to delete.
 * @param force - If true, permanently deletes. If false, moves to trash.
 * @returns The deleted post.
 *
 * @example
 * ```ts
 * await useWpDeletePost(42); // Move to trash
 * await useWpDeletePost(42, true); // Permanently delete
 * ```
 */
export async function useWpDeletePost(id: number, force = false): Promise<FetchResult<WpPost>> {
	return wpFetch<WpPost>(`/posts/${id}?force=${force}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a list of WordPress pages.
 *
 * @param options - Query params for filtering, sorting, and pagination.
 * @returns Array of pages.
 *
 * @example
 * ```ts
 * const result = await useWpGetPages({ per_page: 20 });
 * ```
 */
export async function useWpGetPages(options?: WpQueryParams): Promise<FetchResult<WpPage[]>> {
	return wpFetch<WpPage[]>(`/pages${buildQueryParams(options)}`);
}

/**
 * Retrieves a single WordPress page by ID.
 *
 * @param id - The page ID.
 * @param options - Optional query params.
 * @returns The page object.
 *
 * @example
 * ```ts
 * const result = await useWpGetPage(10);
 * if (result.ok) console.log(result.data.title.rendered);
 * ```
 */
export async function useWpGetPage(
	id: number,
	options?: WpQueryParams,
): Promise<FetchResult<WpPage>> {
	return wpFetch<WpPage>(`/pages/${id}${buildQueryParams(options)}`);
}

/**
 * Creates a new WordPress page.
 *
 * @param data - Page data (title, content, parent, etc.).
 * @returns The created page.
 *
 * @example
 * ```ts
 * await useWpCreatePage({
 *   title: "About Us",
 *   content: "<p>Welcome to our site!</p>",
 *   status: "publish",
 * });
 * ```
 */
export async function useWpCreatePage(data: WpPageCreate): Promise<FetchResult<WpPage>> {
	return wpFetch<WpPage>("/pages", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Updates an existing WordPress page.
 *
 * @param id - The page ID to update.
 * @param data - Fields to update.
 * @returns The updated page.
 *
 * @example
 * ```ts
 * await useWpUpdatePage(10, { title: "Updated About" });
 * ```
 */
export async function useWpUpdatePage(
	id: number,
	data: WpPageUpdate,
): Promise<FetchResult<WpPage>> {
	return wpFetch<WpPage>(`/pages/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Deletes a WordPress page.
 *
 * @param id - The page ID to delete.
 * @param force - If true, permanently deletes. If false, moves to trash.
 * @returns The deleted page.
 *
 * @example
 * ```ts
 * await useWpDeletePage(10); // Move to trash
 * ```
 */
export async function useWpDeletePage(id: number, force = false): Promise<FetchResult<WpPage>> {
	return wpFetch<WpPage>(`/pages/${id}?force=${force}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a list of WordPress media items.
 *
 * @param options - Query params for filtering and pagination.
 * @returns Array of media items.
 *
 * @example
 * ```ts
 * const result = await useWpGetMedia({ per_page: 20 });
 * ```
 */
export async function useWpGetMedia(options?: WpQueryParams): Promise<FetchResult<WpMedia[]>> {
	return wpFetch<WpMedia[]>(`/media${buildQueryParams(options)}`);
}

/**
 * Retrieves a single WordPress media item by ID.
 *
 * @param id - The media item ID.
 * @returns The media object.
 *
 * @example
 * ```ts
 * const result = await useWpGetMediaItem(42);
 * if (result.ok) console.log(result.data.source_url);
 * ```
 */
export async function useWpGetMediaItem(id: number): Promise<FetchResult<WpMedia>> {
	return wpFetch<WpMedia>(`/media/${id}`);
}

/**
 * Uploads a file to the WordPress media library.
 *
 * Use to upload images, documents, or any file type supported by WordPress.
 * Returns the media item with its URL for use as featured media or in content.
 *
 * @param file - File (browser), Blob, or Buffer (Node.js) to upload.
 * @param meta - Optional metadata: `title`, `alt_text`, `caption`, `description`,
 *   `post` (attach to existing post), `slug`.
 * @returns The created media item with `source_url`.
 *
 * @example
 * ```ts
 * // From a file input (browser)
 * const file = document.querySelector("input[type=file]").files[0];
 * const result = await useWpUploadMedia(file, {
 *   title: "My Image",
 *   alt_text: "Description for accessibility",
 * });
 * if (result.ok) console.log(result.data.source_url); // URL to use in content
 *
 * // From a Buffer (Node.js)
 * const buffer = fs.readFileSync("photo.jpg");
 * await useWpUploadMedia(buffer, { title: "Photo" });
 * ```
 */
export async function useWpUploadMedia(
	file: File | Blob | Buffer,
	meta?: WpMediaMeta,
): Promise<FetchResult<WpMedia>> {
	return wpUpload<WpMedia>("/media", file, meta as Record<string, unknown>);
}

/**
 * Updates metadata of a WordPress media item.
 *
 * @param id - The media item ID.
 * @param data - Fields to update.
 * @returns The updated media item.
 *
 * @example
 * ```ts
 * await useWpUpdateMedia(42, { alt_text: "New alt text" });
 * ```
 */
export async function useWpUpdateMedia(
	id: number,
	data: WpMediaUpdate,
): Promise<FetchResult<WpMedia>> {
	return wpFetch<WpMedia>(`/media/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Deletes a WordPress media item.
 *
 * @param id - The media item ID.
 * @param force - If true, permanently deletes.
 * @returns The deleted media item.
 *
 * @example
 * ```ts
 * await useWpDeleteMedia(42, true);
 * ```
 */
export async function useWpDeleteMedia(id: number, force = false): Promise<FetchResult<WpMedia>> {
	return wpFetch<WpMedia>(`/media/${id}?force=${force}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a list of WordPress categories.
 *
 * @param options - Query params for filtering and pagination.
 * @returns Array of categories.
 *
 * @example
 * ```ts
 * const result = await useWpGetCategories({ per_page: 50 });
 * if (result.ok) result.data.forEach(c => console.log(c.name));
 * ```
 */
export async function useWpGetCategories(
	options?: WpQueryParams,
): Promise<FetchResult<WpCategory[]>> {
	return wpFetch<WpCategory[]>(`/categories${buildQueryParams(options)}`);
}

/**
 * Retrieves a single WordPress category by ID.
 *
 * @param id - The category ID.
 * @returns The category object.
 *
 * @example
 * ```ts
 * const result = await useWpGetCategory(5);
 * if (result.ok) console.log(result.data.name);
 * ```
 */
export async function useWpGetCategory(id: number): Promise<FetchResult<WpCategory>> {
	return wpFetch<WpCategory>(`/categories/${id}`);
}

/**
 * Creates a new WordPress category.
 *
 * @param data - Category data (name, slug, parent, etc.).
 * @returns The created category.
 *
 * @example
 * ```ts
 * await useWpCreateCategory({ name: "Technology", slug: "tech" });
 * ```
 */
export async function useWpCreateCategory(
	data: WpCategoryCreate,
): Promise<FetchResult<WpCategory>> {
	return wpFetch<WpCategory>("/categories", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Updates an existing WordPress category.
 *
 * @param id - The category ID to update.
 * @param data - Fields to update.
 * @returns The updated category.
 *
 * @example
 * ```ts
 * await useWpUpdateCategory(5, { name: "Tech News" });
 * ```
 */
export async function useWpUpdateCategory(
	id: number,
	data: WpCategoryUpdate,
): Promise<FetchResult<WpCategory>> {
	return wpFetch<WpCategory>(`/categories/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Deletes a WordPress category.
 *
 * @param id - The category ID to delete.
 * @param force - If true, permanently deletes.
 * @returns The deleted category.
 *
 * @example
 * ```ts
 * await useWpDeleteCategory(5);
 * ```
 */
export async function useWpDeleteCategory(
	id: number,
	force = false,
): Promise<FetchResult<WpCategory>> {
	return wpFetch<WpCategory>(`/categories/${id}?force=${force}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Tags                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a list of WordPress tags.
 *
 * @param options - Query params for filtering and pagination.
 * @returns Array of tags.
 *
 * @example
 * ```ts
 * const result = await useWpGetTags({ search: "javascript" });
 * ```
 */
export async function useWpGetTags(options?: WpQueryParams): Promise<FetchResult<WpTag[]>> {
	return wpFetch<WpTag[]>(`/tags${buildQueryParams(options)}`);
}

/**
 * Retrieves a single WordPress tag by ID.
 *
 * @param id - The tag ID.
 * @returns The tag object.
 *
 * @example
 * ```ts
 * const result = await useWpGetTag(12);
 * ```
 */
export async function useWpGetTag(id: number): Promise<FetchResult<WpTag>> {
	return wpFetch<WpTag>(`/tags/${id}`);
}

/**
 * Creates a new WordPress tag.
 *
 * @param data - Tag data (name, slug, etc.).
 * @returns The created tag.
 *
 * @example
 * ```ts
 * await useWpCreateTag({ name: "TypeScript", slug: "typescript" });
 * ```
 */
export async function useWpCreateTag(data: WpTagCreate): Promise<FetchResult<WpTag>> {
	return wpFetch<WpTag>("/tags", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Updates an existing WordPress tag.
 *
 * @param id - The tag ID to update.
 * @param data - Fields to update.
 * @returns The updated tag.
 *
 * @example
 * ```ts
 * await useWpUpdateTag(12, { name: "TS" });
 * ```
 */
export async function useWpUpdateTag(id: number, data: WpTagUpdate): Promise<FetchResult<WpTag>> {
	return wpFetch<WpTag>(`/tags/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Deletes a WordPress tag.
 *
 * @param id - The tag ID to delete.
 * @param force - If true, permanently deletes.
 * @returns The deleted tag.
 *
 * @example
 * ```ts
 * await useWpDeleteTag(12);
 * ```
 */
export async function useWpDeleteTag(id: number, force = false): Promise<FetchResult<WpTag>> {
	return wpFetch<WpTag>(`/tags/${id}?force=${force}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Comments                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a list of WordPress comments.
 *
 * @param options - Query params for filtering and pagination.
 * @returns Array of comments.
 *
 * @example
 * ```ts
 * // Get comments for a specific post
 * const result = await useWpGetComments({ post: 42 });
 * ```
 */
export async function useWpGetComments(options?: WpQueryParams): Promise<FetchResult<WpComment[]>> {
	return wpFetch<WpComment[]>(`/comments${buildQueryParams(options)}`);
}

/**
 * Retrieves a single WordPress comment by ID.
 *
 * @param id - The comment ID.
 * @returns The comment object.
 *
 * @example
 * ```ts
 * const result = await useWpGetComment(7);
 * ```
 */
export async function useWpGetComment(id: number): Promise<FetchResult<WpComment>> {
	return wpFetch<WpComment>(`/comments/${id}`);
}

/**
 * Creates a new WordPress comment.
 *
 * @param data - Comment data (post ID, content, author, etc.).
 * @returns The created comment.
 *
 * @example
 * ```ts
 * await useWpCreateComment({
 *   post: 42,
 *   content: "Great article!",
 *   author_name: "John",
 *   author_email: "john@example.com",
 * });
 * ```
 */
export async function useWpCreateComment(data: WpCommentCreate): Promise<FetchResult<WpComment>> {
	return wpFetch<WpComment>("/comments", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Updates an existing WordPress comment.
 *
 * @param id - The comment ID to update.
 * @param data - Fields to update.
 * @returns The updated comment.
 *
 * @example
 * ```ts
 * await useWpUpdateComment(7, { content: "Updated comment" });
 * ```
 */
export async function useWpUpdateComment(
	id: number,
	data: WpCommentUpdate,
): Promise<FetchResult<WpComment>> {
	return wpFetch<WpComment>(`/comments/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Deletes a WordPress comment.
 *
 * @param id - The comment ID to delete.
 * @param force - If true, permanently deletes.
 * @returns The deleted comment.
 *
 * @example
 * ```ts
 * await useWpDeleteComment(7);
 * ```
 */
export async function useWpDeleteComment(
	id: number,
	force = false,
): Promise<FetchResult<WpComment>> {
	return wpFetch<WpComment>(`/comments/${id}?force=${force}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a list of WordPress users.
 *
 * @param options - Query params for filtering and pagination.
 * @returns Array of users.
 *
 * @example
 * ```ts
 * const result = await useWpGetUsers({ roles: "editor" });
 * ```
 */
export async function useWpGetUsers(options?: WpQueryParams): Promise<FetchResult<WpUser[]>> {
	return wpFetch<WpUser[]>(`/users${buildQueryParams(options)}`);
}

/**
 * Retrieves a single WordPress user by ID.
 *
 * @param id - The user ID.
 * @returns The user object.
 *
 * @example
 * ```ts
 * const result = await useWpGetUser(1);
 * if (result.ok) console.log(result.data.name);
 * ```
 */
export async function useWpGetUser(id: number): Promise<FetchResult<WpUser>> {
	return wpFetch<WpUser>(`/users/${id}`);
}

/**
 * Retrieves the currently authenticated WordPress user.
 *
 * @returns The current user object.
 *
 * @example
 * ```ts
 * const result = await useWpGetCurrentUser();
 * if (result.ok) console.log(result.data.email);
 * ```
 */
export async function useWpGetCurrentUser(): Promise<FetchResult<WpUser>> {
	return wpFetch<WpUser>("/users/me");
}

/**
 * Creates a new WordPress user.
 *
 * @param data - User data (username, email, password, etc.).
 * @returns The created user.
 *
 * @example
 * ```ts
 * await useWpCreateUser({
 *   username: "johndoe",
 *   email: "john@example.com",
 *   password: "secure-password",
 *   roles: ["editor"],
 * });
 * ```
 */
export async function useWpCreateUser(data: WpUserCreate): Promise<FetchResult<WpUser>> {
	return wpFetch<WpUser>("/users", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Updates an existing WordPress user.
 *
 * @param id - The user ID to update.
 * @param data - Fields to update.
 * @returns The updated user.
 *
 * @example
 * ```ts
 * await useWpUpdateUser(2, { name: "John Smith" });
 * ```
 */
export async function useWpUpdateUser(
	id: number,
	data: WpUserUpdate,
): Promise<FetchResult<WpUser>> {
	return wpFetch<WpUser>(`/users/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Deletes a WordPress user.
 *
 * @param id - The user ID to delete.
 * @param reassign - User ID to reassign content to (required for non-admin).
 * @returns The deleted user.
 *
 * @example
 * ```ts
 * await useWpDeleteUser(2, 1); // Reassign content to user 1
 * ```
 */
export async function useWpDeleteUser(id: number, reassign?: number): Promise<FetchResult<WpUser>> {
	const qs = reassign ? `?reassign=${reassign}` : "";
	return wpFetch<WpUser>(`/users/${id}${qs}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Custom Post Types                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a list of custom post type entries.
 *
 * @param postType - The custom post type slug (e.g. "product", "portfolio").
 * @param options - Query params for filtering and pagination.
 * @returns Array of custom post entries.
 *
 * @example
 * ```ts
 * const result = await useWpGetCustomPosts("product", { per_page: 10 });
 * ```
 */
export async function useWpGetCustomPosts(
	postType: string,
	options?: WpQueryParams,
): Promise<FetchResult<unknown[]>> {
	return wpFetch<unknown[]>(`/${postType}${buildQueryParams(options)}`);
}

/**
 * Retrieves a single custom post type entry by ID.
 *
 * @param postType - The custom post type slug.
 * @param id - The entry ID.
 * @param options - Optional query params.
 * @returns The custom post entry.
 *
 * @example
 * ```ts
 * const result = await useWpGetCustomPost("product", 15);
 * ```
 */
export async function useWpGetCustomPost(
	postType: string,
	id: number,
	options?: WpQueryParams,
): Promise<FetchResult<unknown>> {
	return wpFetch<unknown>(`/${postType}/${id}${buildQueryParams(options)}`);
}

/**
 * Creates a new custom post type entry.
 *
 * @param postType - The custom post type slug.
 * @param data - Entry data.
 * @returns The created entry.
 *
 * @example
 * ```ts
 * await useWpCreateCustomPost("product", {
 *   title: "Widget",
 *   content: "<p>A great widget</p>",
 *   status: "publish",
 * });
 * ```
 */
export async function useWpCreateCustomPost(
	postType: string,
	data: Record<string, unknown>,
): Promise<FetchResult<unknown>> {
	return wpFetch<unknown>(`/${postType}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Updates a custom post type entry.
 *
 * @param postType - The custom post type slug.
 * @param id - The entry ID.
 * @param data - Fields to update.
 * @returns The updated entry.
 *
 * @example
 * ```ts
 * await useWpUpdateCustomPost("product", 15, { title: "Updated Widget" });
 * ```
 */
export async function useWpUpdateCustomPost(
	postType: string,
	id: number,
	data: Record<string, unknown>,
): Promise<FetchResult<unknown>> {
	return wpFetch<unknown>(`/${postType}/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * Deletes a custom post type entry.
 *
 * @param postType - The custom post type slug.
 * @param id - The entry ID.
 * @param force - If true, permanently deletes.
 * @returns The deleted entry.
 *
 * @example
 * ```ts
 * await useWpDeleteCustomPost("product", 15, true);
 * ```
 */
export async function useWpDeleteCustomPost(
	postType: string,
	id: number,
	force = false,
): Promise<FetchResult<unknown>> {
	return wpFetch<unknown>(`/${postType}/${id}?force=${force}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Batch Operations                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Executes multiple WordPress REST API requests in a single batch.
 *
 * @param operations - Array of batch operations to execute.
 * @returns Combined results from all operations.
 *
 * @example
 * ```ts
 * const result = await useWpBatch([
 *   { method: "GET", path: "/wp/v2/posts/1" },
 *   { method: "POST", path: "/wp/v2/posts", body: { title: "New Post" } },
 * ]);
 * if (result.ok) console.log(result.data.responses);
 * ```
 */
export async function useWpBatch(
	operations: WpBatchOperation[],
): Promise<FetchResult<WpBatchResult>> {
	return wpFetch<WpBatchResult>("/batch/v1", {
		method: "POST",
		body: JSON.stringify({ requests: operations }),
	});
}

/* -------------------------------------------------------------------------- */
/* Pagination Helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Fetches ALL posts matching the criteria, automatically handling pagination.
 *
 * Use when you need every post (e.g. for sitemap generation, RSS feeds,
 * or data exports) without managing page numbers. Loops until all pages
 * are fetched.
 *
 * @param options - Query params for filtering (`status`, `categories`, `tags`,
 *   `author`, `search`, `orderby`, `order`). Do NOT pass `page` or `per_page`.
 * @returns All posts as a flat array.
 *
 * @example
 * ```ts
 * // Get ALL published posts
 * const result = await useWpListAllPosts({ status: "publish" });
 * if (result.ok) console.log(`Total: ${result.data.length}`);
 *
 * // Get ALL posts from category 5
 * const cat5 = await useWpListAllPosts({ categories: 5 });
 * ```
 */
export async function useWpListAllPosts(options?: WpQueryParams): Promise<FetchResult<WpPost[]>> {
	const allPosts: WpPost[] = [];
	let page = 1;

	while (true) {
		const result = await useWpGetPosts({ ...options, page, per_page: 100 });
		if (!result.ok) return result;

		allPosts.push(...result.data);

		if (result.data.length < 100) break;
		page++;
	}

	return {
		data: allPosts,
		error: null,
		url: "",
		status: 200,
		ok: true,
	};
}

/**
 * Searches ALL posts by keyword, automatically handling pagination.
 *
 * Use to find posts by title or content when you need every match,
 * not just the first page. Combines `search` param with auto-pagination.
 *
 * @param query - Search term (searches title and content).
 * @param options - Additional filters (`status`, `categories`, etc.).
 * @returns All posts matching the search.
 *
 * @example
 * ```ts
 * const result = await useWpSearchAllPosts("tutorial");
 * if (result.ok) result.data.forEach(p => console.log(p.title.rendered));
 * ```
 */
export async function useWpSearchAllPosts(
	query: string,
	options?: WpQueryParams,
): Promise<FetchResult<WpPost[]>> {
	return useWpListAllPosts({ ...options, search: query });
}

/**
 * Finds a single post by its URL slug.
 *
 * Use for slug-based routing (e.g. `/blog/:slug` pages) where you need
 * to fetch a post by its human-readable URL identifier. Returns `null`
 * if no post matches the slug.
 *
 * @param slug - The post slug (e.g. "hello-world").
 * @returns The post or `null` if not found.
 *
 * @example
 * ```ts
 * // In an Astro/[slug].astro or similar dynamic route
 * const result = await useWpFindPostBySlug("hello-world");
 * if (result.ok && result.data) {
 *   console.log(result.data.title.rendered);
 * }
 * ```
 */
export async function useWpFindPostBySlug(slug: string): Promise<FetchResult<WpPost | null>> {
	const result = await useWpGetPosts({ slug, per_page: 1 });
	if (!result.ok) return result;

	return {
		data: result.data[0] ?? null,
		error: null,
		url: result.url,
		status: result.status,
		ok: true,
	};
}
