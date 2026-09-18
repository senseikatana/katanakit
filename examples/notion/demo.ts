/**
 * Notion Adapter — real-world usage patterns.
 *
 * Run:  npx tsx examples/notion/demo.ts
 *
 * Set your Notion integration token:
 *   export NOTION_TOKEN="ntn_xxx..."
 *
 * Get a token at https://www.notion.so/my-integrations
 * Share your database/page with the integration first.
 */

import {
	useInitNotion,
	useNotionGetPage,
	useNotionCreatePage,
	useNotionUpdatePage,
	useNotionArchivePage,
	useNotionGetBlockChildren,
	useNotionListAllBlockChildren,
	useNotionAppendBlocks,
	useNotionGetDatabase,
	useNotionQueryDatabase,
	useNotionListAllDatabasePages,
	useNotionCreateDatabase,
	useNotionUpdateDatabase,
	useNotionGetUser,
	useNotionListUsers,
	useNotionSearchContent,
} from "../../src/adapters/notion/index.js";

/* ------------------------------------------------------------------ */
/* 1. Init — register your token once                                  */
/* ------------------------------------------------------------------ */

useInitNotion({
	token: process.env.NOTION_TOKEN ?? "",
	// apiVersion: "2022-06-28",  // optional, this is the default
});

/* ------------------------------------------------------------------ */
/* 2. Databases — the most common use case                             */
/* ------------------------------------------------------------------ */

async function queryDatabase(databaseId: string): Promise<void> {
	console.log("\n--- Query Database (single page) ---");

	const result = await useNotionQueryDatabase(databaseId, {
		filter: {
			property: "Status",
			select: { equals: "Published" },
		},
		sorts: [{ property: "Date", direction: "descending" }],
		page_size: 5,
	});

	if (result.ok) {
		console.log(`  Found ${result.data.results.length} pages (has_more: ${result.data.has_more})`);
		for (const page of result.data.results) {
			console.log(`  - ${(page.properties.Name as { title?: Array<{ plain_text?: string }> })?.title?.[0]?.plain_text ?? "Untitled"}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function listAllDatabasePages(databaseId: string): Promise<void> {
	console.log("\n--- List ALL Database Pages (auto-pagination) ---");

	const result = await useNotionListAllDatabasePages(databaseId);

	if (result.ok) {
		console.log(`  Total pages: ${result.data.length}`);
		for (const page of result.data.slice(0, 5)) {
			console.log(`  - ${page.id}`);
		}
		if (result.data.length > 5) console.log(`  ... and ${result.data.length - 5} more`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getDatabaseSchema(databaseId: string): Promise<void> {
	console.log("\n--- Get Database Schema ---");

	const result = await useNotionGetDatabase(databaseId);

	if (result.ok) {
		console.log("  Properties:");
		for (const [name, prop] of Object.entries(result.data.properties)) {
			console.log(`    ${name}: ${(prop as { type: string }).type}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createDatabase(parentPageId: string): Promise<void> {
	console.log("\n--- Create Database ---");

	const result = await useNotionCreateDatabase(
		{ type: "page_id", page_id: parentPageId },
		[{ type: "text", text: { content: "My Tasks" } }],
		{
			Name: { title: {} },
			Status: {
				select: {
					options: [
						{ name: "To Do", color: "red" },
						{ name: "In Progress", color: "yellow" },
						{ name: "Done", color: "green" },
					],
				},
			},
			Priority: {
				select: {
					options: [
						{ name: "Low", color: "blue" },
						{ name: "High", color: "red" },
					],
				},
			},
			DueDate: { date: {} },
		},
	);

	if (result.ok) {
		console.log(`  Created database: ${result.data.id}`);
		console.log(`  URL: ${result.data.url}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 3. Pages — CRUD operations                                          */
/* ------------------------------------------------------------------ */

async function getPage(pageId: string): Promise<void> {
	console.log("\n--- Get Page ---");

	const result = await useNotionGetPage(pageId);

	if (result.ok) {
		console.log(`  Page ID: ${result.data.id}`);
		console.log(`  URL: ${result.data.url}`);
		console.log(`  Archived: ${result.data.archived}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function createPageInDatabase(databaseId: string): Promise<void> {
	console.log("\n--- Create Page in Database ---");

	const result = await useNotionCreatePage(
		{ type: "database_id", database_id: databaseId },
		{
			Name: {
				title: [{ type: "text", text: { content: "New Task" } }],
			},
			Status: {
				select: { name: "To Do" },
			},
		},
		[
			{
				type: "paragraph",
				paragraph: {
					rich_text: [{ type: "text", text: { content: "Task description here." } }],
				},
			},
		],
	);

	if (result.ok) {
		console.log(`  Created page: ${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function updatePageProperties(pageId: string): Promise<void> {
	console.log("\n--- Update Page Properties ---");

	const result = await useNotionUpdatePage(pageId, {
		Status: { select: { name: "Done" } },
	});

	if (result.ok) {
		console.log(`  Updated page: ${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function archivePage(pageId: string): Promise<void> {
	console.log("\n--- Archive Page ---");

	const result = await useNotionArchivePage(pageId);

	if (result.ok) {
		console.log(`  Archived page: ${result.data.id}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 4. Blocks — page content                                            */
/* ------------------------------------------------------------------ */

async function getPageBlocks(pageId: string): Promise<void> {
	console.log("\n--- Get Page Blocks (first page) ---");

	const result = await useNotionGetBlockChildren(pageId);

	if (result.ok) {
		console.log(`  Blocks: ${result.data.results.length} (has_more: ${result.data.has_more})`);
		for (const block of result.data.results) {
			console.log(`  - ${(block as { type: string }).type}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getAllPageBlocks(pageId: string): Promise<void> {
	console.log("\n--- Get ALL Page Blocks (auto-pagination) ---");

	const result = await useNotionListAllBlockChildren(pageId);

	if (result.ok) {
		console.log(`  Total blocks: ${result.data.length}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function appendBlocksToPage(pageId: string): Promise<void> {
	console.log("\n--- Append Blocks to Page ---");

	const result = await useNotionAppendBlocks(pageId, [
		{
			type: "heading_2",
			heading_2: {
				rich_text: [{ type: "text", text: { content: "New Section" } }],
			},
		},
		{
			type: "bulleted_list_item",
			bulleted_list_item: {
				rich_text: [{ type: "text", text: { content: "First item" } }],
			},
		},
		{
			type: "bulleted_list_item",
			bulleted_list_item: {
				rich_text: [{ type: "text", text: { content: "Second item" } }],
			},
		},
		{
			type: "code",
			code: {
				rich_text: [{ type: "text", text: { content: 'console.log("Hello from Notion!");' } }],
				language: "javascript",
			},
		},
	]);

	if (result.ok) {
		console.log("  Appended blocks successfully");
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 5. Users — workspace members                                        */
/* ------------------------------------------------------------------ */

async function listWorkspaceUsers(): Promise<void> {
	console.log("\n--- List Workspace Users ---");

	const result = await useNotionListUsers();

	if (result.ok) {
		console.log(`  Users: ${result.data.results.length}`);
		for (const user of result.data.results) {
			console.log(`  - ${user.name ?? "Unknown"} (${user.type})`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function getUser(userId: string): Promise<void> {
	console.log("\n--- Get User ---");

	const result = await useNotionGetUser(userId);

	if (result.ok) {
		console.log(`  Name: ${result.data.name}`);
		console.log(`  Type: ${result.data.type}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* 6. Search — find content by keyword                                 */
/* ------------------------------------------------------------------ */

async function searchContent(query: string): Promise<void> {
	console.log("\n--- Search Content ---");

	const result = await useNotionSearchContent({ query });

	if (result.ok) {
		console.log(`  Results: ${result.data.results.length} (has_more: ${result.data.has_more})`);
		for (const item of result.data.results) {
			console.log(`  - ${(item as { object: string }).object}: ${(item as { id: string }).id}`);
		}
	} else {
		console.error("  Error:", result.error.message);
	}
}

async function searchDatabasesOnly(query: string): Promise<void> {
	console.log("\n--- Search Databases Only ---");

	const result = await useNotionSearchContent({
		query,
		filter: { value: "database", property: "object" },
	});

	if (result.ok) {
		console.log(`  Databases found: ${result.data.results.length}`);
	} else {
		console.error("  Error:", result.error.message);
	}
}

/* ------------------------------------------------------------------ */
/* Run all examples                                                    */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
	// Replace these with your actual IDs
	const DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "your-database-id";
	const PAGE_ID = process.env.NOTION_PAGE_ID ?? "your-page-id";
	const USER_ID = process.env.NOTION_USER_ID ?? "your-user-id";

	// Databases (most common)
	await queryDatabase(DATABASE_ID);
	await listAllDatabasePages(DATABASE_ID);
	await getDatabaseSchema(DATABASE_ID);

	// Pages
	await getPage(PAGE_ID);
	await createPageInDatabase(DATABASE_ID);
	await updatePageProperties(PAGE_ID);

	// Blocks
	await getPageBlocks(PAGE_ID);
	await getAllPageBlocks(PAGE_ID);
	await appendBlocksToPage(PAGE_ID);

	// Users
	await listWorkspaceUsers();
	await getUser(USER_ID);

	// Search
	await searchContent("meeting");
	await searchDatabasesOnly("tasks");

	// Create + Archive (destructive — uncomment if needed)
	// await createDatabase(PAGE_ID);
	// await archivePage(PAGE_ID);

	console.log("\nDone.");
}

main();
