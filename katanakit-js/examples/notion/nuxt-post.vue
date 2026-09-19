---
/**
 * Nuxt 3 + Notion — single blog post with block rendering.
 *
 * This file goes in: pages/blog/[slug].vue
 *
 * Fetches a page from Notion by slug, then renders its blocks.
 */

<script setup lang="ts">
import {
  useInitNotion,
  useNotionListAllDatabasePages,
  useNotionListAllBlockChildren,
} from "katanakit-js/adapters/notion";
import type { NotionBlock, NotionPage } from "katanakit-js/adapters/notion";

const config = useRuntimeConfig();
const route = useRoute();
const slug = route.params.slug as string;

// Init Notion
useInitNotion({ token: config.notionToken as string });

// Find the page by slug
const { data: pageData, status } = await useAsyncData(`notion-post-${slug}`, async () => {
  const allPages = await useNotionListAllDatabasePages(
    config.notionDatabaseId as string,
  );

  if (!allPages.ok) return { page: null, blocks: [], error: allPages.error.message };

  const page = allPages.data.find((p) => {
    const pageSlug = (p.properties.Slug as any)?.rich_text?.[0]?.plain_text ?? p.id;
    return pageSlug === slug;
  });

  if (!page) return { page: null, blocks: [], error: "Post not found" };

  const blocksResult = await useNotionListAllBlockChildren(page.id);

  return {
    page,
    blocks: blocksResult.ok ? blocksResult.data : [],
    error: blocksResult.ok ? null : blocksResult.error.message,
  };
});

// Helpers
function extractText(richText: any[]): string {
  return richText?.map((t: any) => t.plain_text).join("") ?? "";
}
</script>

<template>
  <article class="blog-post">
    <NuxtLink to="/blog">&larr; Back to blog</NuxtLink>

    <div v-if="status === 'pending'" class="loading">Loading...</div>

    <div v-else-if="pageData?.error" class="error">{{ pageData.error }}</div>

    <template v-else-if="pageData?.page">
      <h1>
        {{ (pageData.page.properties.Name as any)?.title?.[0]?.plain_text ?? "Untitled" }}
      </h1>

      <time
        v-if="(pageData.page.properties.Date as any)?.date?.start"
        :datetime="(pageData.page.properties.Date as any).date.start"
      >
        {{ new Date((pageData.page.properties.Date as any).date.start).toLocaleDateString() }}
      </time>

      <div class="content">
        <template v-for="block in pageData.blocks" :key="block.id">
          <p v-if="(block as any).type === 'paragraph'">
            {{ extractText((block as any).paragraph?.rich_text) }}
          </p>
          <h2 v-else-if="(block asany).type === 'heading_1'">
            {{ extractText((block as any).heading_1?.rich_text) }}
          </h2>
          <h3 v-else-if="(block as any).type === 'heading_2'">
            {{ extractText((block as any).heading_2?.rich_text) }}
          </h3>
          <h4 v-else-if="(block as any).type === 'heading_3'">
            {{ extractText((block as any).heading_3?.rich_text) }}
          </h4>
          <li v-else-if="(block as any).type === 'bulleted_list_item'">
            {{ extractText((block as any).bulleted_list_item?.rich_text) }}
          </li>
          <pre v-else-if="(block as any).type === 'code'"><code>{{ extractText((block as any).code?.rich_text) }}</code></pre>
          <figure v-else-if="(block as any).type === 'image'">
            <img
              :src="(block as any).image?.external?.url ?? (block as any).image?.file?.url"
              :alt="extractText((block as any).image?.caption ?? [])"
            />
          </figure>
          <hr v-else-if="(block as any).type === 'divider'" />
          <p v-else class="block-type">[{{ (block as any).type }}]</p>
        </template>
      </div>
    </template>
  </article>
</template>

<style scoped>
.blog-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.content {
  margin-top: 2rem;
  line-height: 1.7;
}

.content h2 { margin-top: 2rem; }
.content figure { margin: 1.5rem 0; }
.content img { max-width: 100%; border-radius: 0.5rem; }
.content pre { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
.content code { font-family: monospace; }
.block-type { color: #999; font-style: italic; }
.loading, .error { padding: 2rem; text-align: center; }
.error { color: #c00; }
</style>
