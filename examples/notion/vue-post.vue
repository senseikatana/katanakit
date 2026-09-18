---
/**
 * Vue 3 SFC + Notion — single blog post with block rendering.
 *
 * This file goes in: src/views/BlogPostView.vue
 *
 * Fetches a page from Notion by route param, then renders its blocks.
 */

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  useInitNotion,
  useNotionListAllDatabasePages,
  useNotionGetPage,
  useNotionListAllBlockChildren,
} from "katanakit-js/adapters/notion";
import type { NotionBlock, NotionPage } from "katanakit-js/adapters/notion";

// Init once
useInitNotion({ token: import.meta.env.VITE_NOTION_TOKEN });

const route = useRoute();
const slug = computed(() => route.params.slug as string);

// State
const page = ref<NotionPage | null>(null);
const blocks = ref<NotionBlock[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Fetch page and blocks on mount
onMounted(async () => {
  try {
    // Find page by slug
    const allPages = await useNotionListAllDatabasePages(
      import.meta.env.VITE_NOTION_DATABASE_ID,
    );

    if (!allPages.ok) {
      error.value = allPages.error.message;
      return;
    }

    const found = allPages.data.find((p) => {
      const pageSlug =
        (p.properties.Slug as any)?.rich_text?.[0]?.plain_text ?? p.id;
      return pageSlug === slug.value;
    });

    if (!found) {
      error.value = "Post not found";
      return;
    }

    page.value = found;

    // Fetch blocks
    const blocksResult = await useNotionListAllBlockChildren(found.id);
    if (blocksResult.ok) {
      blocks.value = blocksResult.data;
    } else {
      error.value = blocksResult.error.message;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
});

// Extract text from Notion rich text array
function extractText(richText: any[]): string {
  return richText?.map((t: any) => t.plain_text).join("") ?? "";
}

// Block type rendering
function isType(block: NotionBlock, type: string): boolean {
  return (block as any).type === type;
}

function getBlockText(block: NotionBlock, path: string): string {
  const b = block as any;
  return extractText(b[type(block)]?.[path] ?? b[type(block)]?.rich_text);
}

function type(block: NotionBlock): string {
  return (block as any).type;
}
</script>

<template>
  <article class="blog-post">
    <a href="/blog">&larr; Back to blog</a>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <template v-else-if="page">
      <h1>
        {{ (page.properties.Name as any)?.title?.[0]?.plain_text ?? "Untitled" }}
      </h1>

      <time
        v-if="(page.properties.Date as any)?.date?.start"
        :datetime="(page.properties.Date as any).date.start"
      >
        {{ new Date((page.properties.Date as any).date.start).toLocaleDateString() }}
      </time>

      <div class="content">
        <template v-for="block in blocks" :key="block.id">
          <!-- Paragraph -->
          <p v-if="isType(block, 'paragraph')">
            {{ extractText((block as any).paragraph?.rich_text) }}
          </p>

          <!-- Headings -->
          <h2 v-else-if="isType(block, 'heading_1')">
            {{ extractText((block as any).heading_1?.rich_text) }}
          </h2>
          <h3 v-else-if="isType(block, 'heading_2')">
            {{ extractText((block as any).heading_2?.rich_text) }}
          </h3>
          <h4 v-else-if="isType(block, 'heading_3')">
            {{ extractText((block as any).heading_3?.rich_text) }}
          </h4>

          <!-- List items -->
          <li v-else-if="isType(block, 'bulleted_list_item')">
            {{ extractText((block as any).bulleted_list_item?.rich_text) }}
          </li>

          <!-- Code -->
          <pre v-else-if="isType(block, 'code')"><code>{{ extractText((block as any).code?.rich_text) }}</code></pre>

          <!-- Image -->
          <figure v-else-if="isType(block, 'image')">
            <img
              :src="(block as any).image?.external?.url ?? (block as any).image?.file?.url"
              :alt="extractText((block as any).image?.caption ?? [])"
            />
            <figcaption v-if="(block asany).image?.caption?.length">
              {{ extractText((block as any).image.caption) }}
            </figcaption>
          </figure>

          <!-- Divider -->
          <hr v-else-if="isType(block, 'divider')" />

          <!-- Fallback -->
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

.content h2 {
  margin-top: 2rem;
}

.content figure {
  margin: 1.5rem 0;
}

.content img {
  max-width: 100%;
  border-radius: 0.5rem;
}

.content pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.content code {
  font-family: monospace;
}

.block-type {
  color: #999;
  font-style: italic;
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
