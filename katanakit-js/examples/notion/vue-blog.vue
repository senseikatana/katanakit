---
/**
 * Vue 3 SFC + Notion — blog listing from a Notion database.
 *
 * This file goes in: src/views/BlogView.vue
 *
 * Setup:
 *   1. Create a Notion integration at https://www.notion.so/my-integrations
 *   2. Share your database with the integration
 *   3. Add VITE_NOTION_TOKEN and VITE_NOTION_DATABASE_ID to .env
 *
 * Uses useQuery from katanakit-js/adapters/vue for reactive state
 * with caching and stale-while-revalidate.
 */

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "katanakit-js/adapters/vue";
import {
  useInitNotion,
  useNotionListAllDatabasePages,
} from "katanakit-js/adapters/notion";
import type { NotionPage } from "katanakit-js/adapters/notion";

// Init once at module level
useInitNotion({ token: import.meta.env.VITE_NOTION_TOKEN });

// Reactive query — refetches when queryKey changes
const { data, isLoading, error, refetch } = useQuery<NotionPage[]>({
  queryKey: ["notion-blog"],
  queryFn: () =>
    useNotionListAllDatabasePages(
      import.meta.env.VITE_NOTION_DATABASE_ID,
      { property: "Status", select: { equals: "Published" } },
      [{ property: "Date", direction: "descending" }],
    ),
  staleTime: 60_000, // 1 minute
});

// Helper to extract title from Notion page properties
function getTitle(page: NotionPage): string {
  return (
    (page.properties.Name as any)?.title?.[0]?.plain_text ?? "Untitled"
  );
}

function getSlug(page: NotionPage): string {
  return (
    (page.properties.Slug as any)?.rich_text?.[0]?.plain_text ?? page.id
  );
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
    <p>Powered by Notion + KatanaKit</p>

    <button @click="refetch" :disabled="isLoading">
      {{ isLoading ? "Loading..." : "Refresh" }}
    </button>

    <div v-if="isLoading" class="loading">Loading posts...</div>

    <div v-else-if="error" class="error">
      <p>Error: {{ error.message }}</p>
      <button @click="refetch">Retry</button>
    </div>

    <ul v-else-if="data" class="post-list">
      <li v-for="page in data" :key="page.id" class="post-item">
        <router-link :to="`/blog/${getSlug(page)}`">
          <strong>{{ getTitle(page) }}</strong>
        </router-link>

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
