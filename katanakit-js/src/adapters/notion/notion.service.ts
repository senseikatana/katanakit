import type {
	FetchResult,
	NotionBlock,
	NotionBlockList,
	NotionConfig,
	NotionDatabase,
	NotionDatabaseQuery,
	NotionFilter,
	NotionPage,
	NotionPageList,
	NotionParent,
	NotionPropertySchema,
	NotionRichText,
	NotionSearchQuery,
	NotionSearchResult,
	NotionSort,
	NotionUser,
	NotionUserList,
} from "../../types/index.js";

/** Default Notion API base URL. */
const NOTION_API_BASE = "https://api.notion.com/v1";

/** Default Notion API version. */
const NOTION_API_VERSION = "2022-06-28";

/** Module-level Notion configuration. */
let config: NotionConfig | null = null;

/**
 * Retrieves the registered Notion config or throws.
 * @internal
 */
function getConfig(): NotionConfig {
	if (!config) {
		throw new Error("[Notion] Not configured. Call useInitNotion() first.");
	}
	return config;
}

/**
 * Internal helper to make authenticated requests to the Notion API.
 * Handles Authorization header, Notion-Version, and JSON serialization.
 * @internal
 */
async function notionFetch<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<FetchResult<T>> {
	const { token, apiVersion, apiBaseUrl } = getConfig();
	const base = apiBaseUrl ?? NOTION_API_BASE;
	const version = apiVersion ?? NOTION_API_VERSION;
	const url = `${base}${endpoint}`;

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${token}`,
				"Notion-Version": version,
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorBody = await response.text().catch(() => null);
			return {
				data: null,
				error: {
					message: `Notion API Error: ${response.statusText}`,
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

/* -------------------------------------------------------------------------- */
/* Initialization                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Registers the Notion API configuration. Call this once before any other
 * Notion function.
 *
 * @param cfg - Integration token (starts with "ntn_" or "secret_"), optional
 *   API version and base URL.
 *
 * @example
 * ```ts
 * import { useInitNotion } from "katanakit-js/adapters/notion";
 *
 * useInitNotion({ token: process.env.NOTION_TOKEN });
 * ```
 */
export function useInitNotion(cfg: NotionConfig): void {
	config = { ...cfg };
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a single Notion page by its ID.
 *
 * Use when you need the full page object including all its properties
 * (title, status, dates, relations, etc.).
 *
 * @param pageId - The page UUID.
 * @returns The page object with all its properties.
 *
 * @example
 * ```ts
 * const result = await useNotionGetPage("page-id");
 * if (result.ok) console.log(result.data.properties);
 * ```
 */
export async function useNotionGetPage(pageId: string): Promise<FetchResult<NotionPage>> {
	return notionFetch<NotionPage>(`/pages/${pageId}`);
}

/**
 * Creates a new Notion page inside a database or as a child of another page.
 *
 * Use to add new entries to a database (tasks, notes, CRM records) or to
 * create nested page structures.
 *
 * @param parent - Where to create the page: `{ type: "database_id", database_id }`
 *   for database entries, or `{ type: "page_id", page_id }` for child pages.
 * @param properties - Page properties matching the parent database schema.
 * @param children - Optional block children to populate the page content.
 * @returns The created page.
 *
 * @example
 * ```ts
 * // Add a task to a database
 * const result = await useNotionCreatePage(
 *   { type: "database_id", database_id: "db-id" },
 *   { Name: { title: [{ type: "text", text: { content: "My Task" } }] } },
 * );
 *
 * // Create a child page with content
 * const result = await useNotionCreatePage(
 *   { type: "page_id", page_id: "parent-id" },
 *   { title: { title: [{ type: "text", text: { content: "Child Page" } }] } },
 *   [{ type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "Hello!" } }] } }],
 * );
 * ```
 */
export async function useNotionCreatePage(
	parent: NotionParent,
	properties: Record<string, unknown>,
	children?: unknown[],
): Promise<FetchResult<NotionPage>> {
	return notionFetch<NotionPage>("/pages", {
		method: "POST",
		body: JSON.stringify({ parent, properties, children }),
	});
}

/**
 * Updates properties of an existing Notion page.
 *
 * Use to change a page's status, dates, relations, or any other property
 * without touching the page content (blocks).
 *
 * @param pageId - The page UUID to update.
 * @param properties - Properties to update (only changed properties).
 * @returns The updated page.
 *
 * @example
 * ```ts
 * // Mark a task as done
 * await useNotionUpdatePage("page-id", {
 *   Status: { select: { name: "Done" } },
 * });
 *
 * // Update multiple properties
 * await useNotionUpdatePage("page-id", {
 *   Priority: { select: { name: "High" } },
 *   DueDate: { date: { start: "2025-12-31" } },
 * });
 * ```
 */
export async function useNotionUpdatePage(
	pageId: string,
	properties: Record<string, unknown>,
): Promise<FetchResult<NotionPage>> {
	return notionFetch<NotionPage>(`/pages/${pageId}`, {
		method: "PATCH",
		body: JSON.stringify({ properties }),
	});
}

/**
 * Archives (soft-deletes) a Notion page. The page becomes hidden but
 * can be restored from Notion's trash.
 *
 * @param pageId - The page UUID to archive.
 * @returns The archived page.
 *
 * @example
 * ```ts
 * await useNotionArchivePage("page-id");
 * ```
 */
export async function useNotionArchivePage(pageId: string): Promise<FetchResult<NotionPage>> {
	return notionFetch<NotionPage>(`/pages/${pageId}`, {
		method: "PATCH",
		body: JSON.stringify({ archived: true }),
	});
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a single Notion block by its ID.
 *
 * A block is any content element: paragraph, heading, list item, image,
 * table, callout, etc. Use to inspect a specific block's type and content.
 *
 * @param blockId - The block UUID.
 * @returns The block object with its type-specific content.
 *
 * @example
 * ```ts
 * const result = await useNotionGetBlock("block-id");
 * if (result.ok) console.log(result.data.type); // "paragraph", "heading_1", etc.
 * ```
 */
export async function useNotionGetBlock(blockId: string): Promise<FetchResult<NotionBlock>> {
	return notionFetch<NotionBlock>(`/blocks/${blockId}`);
}

/**
 * Retrieves the direct children blocks of a block (single page).
 *
 * Use for manual pagination when you need fine-grained control over
 * cursor-based pagination. For most cases, prefer
 * {@link useNotionListAllBlockChildren} which handles pagination automatically.
 *
 * @param blockId - The parent block ID (usually a page ID).
 * @param options - Pagination: `start_cursor` for next page, `page_size` (max 100).
 * @returns Paginated list of child blocks with `has_more` and `next_cursor`.
 *
 * @example
 * ```ts
 * const result = await useNotionGetBlockChildren("page-id");
 * if (result.ok) {
 *   console.log(result.data.results); // First page of blocks
 *   if (result.data.has_more) {
 *     // Fetch next page with result.data.next_cursor
 *   }
 * }
 * ```
 */
export async function useNotionGetBlockChildren(
	blockId: string,
	options?: { start_cursor?: string; page_size?: number },
): Promise<FetchResult<NotionBlockList>> {
	const params = new URLSearchParams();
	if (options?.start_cursor) params.set("start_cursor", options.start_cursor);
	if (options?.page_size) params.set("page_size", String(options.page_size));
	const qs = params.toString();
	return notionFetch<NotionBlockList>(`/blocks/${blockId}/children${qs ? `?${qs}` : ""}`);
}

/**
 * Appends new child blocks to a parent block.
 *
 * Use to add content to a page: paragraphs, headings, lists, toggles,
 * code blocks, etc. Blocks are appended at the end.
 *
 * @param blockId - The parent block ID (usually a page ID).
 * @param children - Array of block objects to append.
 * @returns The parent block.
 *
 * @example
 * ```ts
 * await useNotionAppendBlocks("page-id", [
 *   {
 *     type: "heading_2",
 *     heading_2: { rich_text: [{ type: "text", text: { content: "Section Title" } }] },
 *   },
 *   {
 *     type: "paragraph",
 *     paragraph: { rich_text: [{ type: "text", text: { content: "Body text here." } }] },
 *   },
 * ]);
 * ```
 */
export async function useNotionAppendBlocks(
	blockId: string,
	children: unknown[],
): Promise<FetchResult<NotionBlock>> {
	return notionFetch<NotionBlock>(`/blocks/${blockId}/children`, {
		method: "PATCH",
		body: JSON.stringify({ children }),
	});
}

/**
 * Updates the content of an existing block.
 *
 * Use to modify text, toggle content, code blocks, etc. without
 * deleting and recreating the block.
 *
 * @param blockId - The block UUID to update.
 * @param content - The new content for the block type (e.g. `{ paragraph: { rich_text: [...] } }`).
 * @returns The updated block.
 *
 * @example
 * ```ts
 * await useNotionUpdateBlock("block-id", {
 *   paragraph: { rich_text: [{ type: "text", text: { content: "Updated text" } }] },
 * });
 * ```
 */
export async function useNotionUpdateBlock(
	blockId: string,
	content: Record<string, unknown>,
): Promise<FetchResult<NotionBlock>> {
	return notionFetch<NotionBlock>(`/blocks/${blockId}`, {
		method: "PATCH",
		body: JSON.stringify(content),
	});
}

/**
 * Deletes (archives) a Notion block. The block is soft-deleted and
 * can be restored.
 *
 * @param blockId - The block UUID to delete.
 * @returns The deleted block.
 *
 * @example
 * ```ts
 * await useNotionDeleteBlock("block-id");
 * ```
 */
export async function useNotionDeleteBlock(blockId: string): Promise<FetchResult<NotionBlock>> {
	return notionFetch<NotionBlock>(`/blocks/${blockId}`, {
		method: "DELETE",
	});
}

/* -------------------------------------------------------------------------- */
/* Databases                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a Notion database schema by its ID.
 *
 * Use to inspect the database structure: property names, types, and
 * configuration (select options, formula definitions, etc.).
 *
 * @param databaseId - The database UUID.
 * @returns The database object with its full property schema.
 *
 * @example
 * ```ts
 * const result = await useNotionGetDatabase("db-id");
 * if (result.ok) {
 *   // See all available properties
 *   Object.entries(result.data.properties).forEach(([name, prop]) => {
 *     console.log(`${name}: ${prop.type}`);
 *   });
 * }
 * ```
 */
export async function useNotionGetDatabase(
	databaseId: string,
): Promise<FetchResult<NotionDatabase>> {
	return notionFetch<NotionDatabase>(`/databases/${databaseId}`);
}

/**
 * Queries a Notion database with filters and sorts (single page).
 *
 * Use for manual pagination or when you only need the first page of
 * results. For most cases, prefer {@link useNotionListAllDatabasePages}
 * which handles pagination automatically.
 *
 * @param databaseId - The database UUID to query.
 * @param query - Filter, sort, and pagination options.
 * @returns Paginated list of pages matching the query.
 *
 * @example
 * ```ts
 * // Get first page of all entries
 * const all = await useNotionQueryDatabase("db-id");
 *
 * // With filter and sort
 * const filtered = await useNotionQueryDatabase("db-id", {
 *   filter: { property: "Status", select: { equals: "Done" } },
 *   sorts: [{ property: "Date", direction: "descending" }],
 *   page_size: 10,
 * });
 * ```
 */
export async function useNotionQueryDatabase(
	databaseId: string,
	query?: NotionDatabaseQuery,
): Promise<FetchResult<NotionPageList>> {
	return notionFetch<NotionPageList>(`/databases/${databaseId}/query`, {
		method: "POST",
		body: JSON.stringify(query ?? {}),
	});
}

/**
 * Creates a new Notion database inside a page.
 *
 * Use to programmatically create structured databases with custom
 * property schemas (select options, formulas, relations, etc.).
 *
 * @param parent - The parent page (`{ type: "page_id", page_id }`).
 * @param title - Database title as rich text array.
 * @param properties - Property schema definitions (Name, Status, Date, etc.).
 * @returns The created database.
 *
 * @example
 * ```ts
 * await useNotionCreateDatabase(
 *   { type: "page_id", page_id: "parent-id" },
 *   [{ type: "text", text: { content: "My Tasks" } }],
 *   {
 *     Name: { title: {} },
 *     Status: { select: { options: [{ name: "To Do" }, { name: "Done" }] } },
 *     Priority: { select: { options: [{ name: "Low" }, { name: "High" }] } },
 *   },
 * );
 * ```
 */
export async function useNotionCreateDatabase(
	parent: NotionParent,
	title: NotionRichText[],
	properties: Record<string, NotionPropertySchema>,
): Promise<FetchResult<NotionDatabase>> {
	return notionFetch<NotionDatabase>("/databases", {
		method: "POST",
		body: JSON.stringify({ parent, title, properties }),
	});
}

/**
 * Updates a Notion database title and/or property schemas.
 *
 * Use to rename a database or add/modify property definitions.
 *
 * @param databaseId - The database UUID to update.
 * @param title - New title as rich text array.
 * @param properties - Optional property schema updates to merge.
 * @returns The updated database.
 *
 * @example
 * ```ts
 * await useNotionUpdateDatabase("db-id", [
 *   { type: "text", text: { content: "Renamed Database" } },
 * ]);
 * ```
 */
export async function useNotionUpdateDatabase(
	databaseId: string,
	title: NotionRichText[],
	properties?: Record<string, NotionPropertySchema>,
): Promise<FetchResult<NotionDatabase>> {
	const body: Record<string, unknown> = { title };
	if (properties) body.properties = properties;
	return notionFetch<NotionDatabase>(`/databases/${databaseId}`, {
		method: "PATCH",
		body: JSON.stringify(body),
	});
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves a Notion workspace member or bot by their user ID.
 *
 * Use to get display name, avatar, or email of the person who created
 * or last edited a page.
 *
 * @param userId - The user UUID (from page.created_by.id or page.last_edited_by.id).
 * @returns The user object.
 *
 * @example
 * ```ts
 * const result = await useNotionGetUser("user-id");
 * if (result.ok) console.log(result.data.name);
 * ```
 */
export async function useNotionGetUser(userId: string): Promise<FetchResult<NotionUser>> {
	return notionFetch<NotionUser>(`/users/${userId}`);
}

/**
 * Lists all users (members + bots) in the workspace (paginated).
 *
 * Use to enumerate workspace members for assignment, mention, or
 * permission checks.
 *
 * @param options - Pagination: `start_cursor`, `page_size` (max 100).
 * @returns Paginated list of users.
 *
 * @example
 * ```ts
 * const result = await useNotionListUsers();
 * if (result.ok) result.data.results.forEach(u => console.log(u.name));
 * ```
 */
export async function useNotionListUsers(options?: {
	start_cursor?: string;
	page_size?: number;
}): Promise<FetchResult<NotionUserList>> {
	const params = new URLSearchParams();
	if (options?.start_cursor) params.set("start_cursor", options.start_cursor);
	if (options?.page_size) params.set("page_size", String(options.page_size));
	const qs = params.toString();
	return notionFetch<NotionUserList>(`/users${qs ? `?${qs}` : ""}`);
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Searches across all pages and databases the integration has access to.
 *
 * Use to find content by keyword when you don't have the page/database ID.
 * Supports filtering by object type (page or database) and sorting by
 * last edit time.
 *
 * @param query - Search options: text query, object type filter, sort direction.
 * @returns Paginated search results (mixed pages and databases).
 *
 * @example
 * ```ts
 * // Search everything for a keyword
 * const result = await useNotionSearchContent({ query: "meeting notes" });
 *
 * // Search only databases
 * const dbs = await useNotionSearchContent({
 *   query: "tasks",
 *   filter: { value: "database", property: "object" },
 * });
 *
 * // Search only pages, sorted by recent
 * const pages = await useNotionSearchContent({
 *   filter: { value: "page", property: "object" },
 *   sort: { direction: "descending", timestamp: "last_edited_time" },
 * });
 * ```
 */
export async function useNotionSearchContent(
	query: NotionSearchQuery,
): Promise<FetchResult<NotionSearchResult>> {
	return notionFetch<NotionSearchResult>("/search", {
		method: "POST",
		body: JSON.stringify(query),
	});
}

/* -------------------------------------------------------------------------- */
/* Pagination Helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Fetches ALL child blocks of a block, automatically handling cursor pagination.
 *
 * Use when you need the complete content of a page without worrying about
 * pagination cursors. Loops through all pages until `has_more` is false.
 *
 * @param blockId - The parent block ID (usually a page ID).
 * @returns All child blocks as a flat array.
 *
 * @example
 * ```ts
 * const result = await useNotionListAllBlockChildren("page-id");
 * if (result.ok) {
 *   console.log(`Total blocks: ${result.data.length}`);
 *   result.data.forEach(block => console.log(block.type));
 * }
 * ```
 */
export async function useNotionListAllBlockChildren(
	blockId: string,
): Promise<FetchResult<NotionBlock[]>> {
	const allBlocks: NotionBlock[] = [];
	let cursor: string | undefined;

	do {
		const result = await useNotionGetBlockChildren(blockId, {
			start_cursor: cursor,
			page_size: 100,
		});

		if (!result.ok) return result;

		allBlocks.push(...result.data.results);
		cursor = result.data.has_more ? (result.data.next_cursor ?? undefined) : undefined;
	} while (cursor);

	return {
		data: allBlocks,
		error: null,
		url: "",
		status: 200,
		ok: true,
	};
}

/**
 * Fetches ALL pages in a database, automatically handling cursor pagination.
 *
 * Use when you need every entry from a database without worrying about
 * pagination. Supports optional filters and sorts. Loops through all
 * pages until `has_more` is false.
 *
 * @param databaseId - The database UUID.
 * @param filter - Optional filter to apply (same syntax as Notion API).
 * @param sorts - Optional sort options.
 * @returns All pages matching the filter as a flat array.
 *
 * @example
 * ```ts
 * // Get ALL pages in a database
 * const result = await useNotionListAllDatabasePages("db-id");
 * if (result.ok) console.log(`Total entries: ${result.data.length}`);
 *
 * // Get only published pages, sorted by date
 * const published = await useNotionListAllDatabasePages(
 *   "db-id",
 *   { property: "Status", select: { equals: "Published" } },
 *   [{ property: "Date", direction: "descending" }],
 * );
 * ```
 */
export async function useNotionListAllDatabasePages(
	databaseId: string,
	filter?: NotionFilter,
	sorts?: NotionSort[],
): Promise<FetchResult<NotionPage[]>> {
	const allPages: NotionPage[] = [];
	let cursor: string | undefined;

	do {
		const result = await useNotionQueryDatabase(databaseId, {
			filter,
			sorts,
			start_cursor: cursor,
			page_size: 100,
		});

		if (!result.ok) return result;

		allPages.push(...result.data.results);
		cursor = result.data.has_more ? (result.data.next_cursor ?? undefined) : undefined;
	} while (cursor);

	return {
		data: allPages,
		error: null,
		url: "",
		status: 200,
		ok: true,
	};
}
