---
/**
 * Nuxt 3 + Notion — blog listing page with SSR.
 *
 * This file goes in: pages/blog/index.vue
 *
 * Uses useAsyncData for SSR/SSG support. The Notion adapter runs on the
 * server side, keeping the token secure.
 *
 * Setup:
 *   1. Create a Notion integration at https://www.notion.so/my-integrations
 *   2. Share your database with the integration
 *   3. Add NOTION_TOKEN and NOTION_DATABASE_ID to nuxt.config.ts runtimeConfig
 */

<script setup lang="ts">
import {
  useInitNotion,
  useNotionListAllDatabasePages,
} from "katanakit-js/adapters/notion";
import type { NotionPage } from "katanakit-js/adapters/notion";

const config = useRuntimeConfig();

// Init Notion on server side
useInitNotion({ token: config.notionToken as string });

// Fetch posts with SSR support
const { data: posts, status } = await useAsyncData("notion-blog", () =>
  useNotionListAllDatabasePages(
    config.notionDatabaseId as string,
    { property: "Status", select: { equals: "Published" } },
    [{ property: "Date", direction: "descending" }],
  ),
);

// Helpers
function getTitle(page: NotionPage): string {
  return (page.properties.Name as any)?.title?.[0]?.plain_text ?? "Untitled";
}

function getSlug(page: NotionPage): string {
  return (page.properties.Slug as any)?.rich_text?.[0]?.plain_text ?? page.id;
}

function getDate(page: NotionPage): string {
  return (page.properties.Date as any)?.date?.start ?? "";
}

function getStatus(page: NotionPage): string {
  return (page.properties.Status as any)?.select?.name ?? "";
}
</script>

<template>
  <div class="blog-listing">
    <h1>Blog</h1>
    <p>Powered by Notion + KatanaKit + Nuxt</p>

    <div v-if="status === 'pending'" class="loading">Loading posts...</div>

    <div v-else-if="!posts?.ok" class="error">
      <p>Error: {{ posts?.error?.message ?? "Unknown error" }}</p>
    </div>

    <ul v-else-if="posts.data?.length" class="post-list">
      <li v-for="page in posts.data" :key="page.id" class="post-item">
        <NuxtLink :to="`/blog/${getSlug(page)}`">
          <strong>{{ getTitle(page) }}</strong>
        </NuxtLink>

        <div class="meta">
          <time v-if="getDate(page)" :datetime="getDate(page)">
            {{ new Date(getDate(page)).toLocaleDateString() }}
          </time>
          <span v-if="getStatus(page)" class="badge">
            {{ getStatus(page) }}
          </span>
        </div>
      </li>
    </ul>

    <p v-else>No posts found.</p>
  </div>
</template>

<style scoped>
.blog-listing {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.post-list {
  list-style: none;
  padding: 0;
}

.post-item {
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.badge {
  background: #e0e0ff;
  color: #333;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
}

.error {
  color: #c00;
}
</style>
