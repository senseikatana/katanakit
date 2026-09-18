---
/**
 * Nuxt 3 + WordPress — blog listing page with SSR.
 *
 * This file goes in: pages/blog/index.vue
 *
 * Uses useAsyncData for SSR/SSG support.
 *
 * Setup:
 *   1. Create an Application Password in WP Admin → Users → Your Profile
 *   2. Add wpBaseUrl, wpUsername, wpAppPassword to nuxt.config.ts runtimeConfig
 */

<script setup lang="ts">
import {
  useInitWordPress,
  useWpGetPosts,
  useWpGetCategories,
} from "katanakit-js/adapters/wordpress";
import type { WpPost, WpCategory } from "katanakit-js/adapters/wordpress";

const config = useRuntimeConfig();

// Init WordPress on server side
useInitWordPress({
  baseUrl: config.wpBaseUrl as string,
  auth: {
    type: "application-passwords",
    username: config.wpUsername as string,
    password: config.wpAppPassword as string,
  },
});

// Fetch posts with SSR
const { data: postsResult, status } = await useAsyncData("wp-blog", () =>
  useWpGetPosts({
    per_page: 10,
    status: "publish",
    orderby: "date",
    order: "desc",
    _embed: true,
  }),
);

// Fetch categories
const { data: categoriesResult } = await useAsyncData("wp-categories", () =>
  useWpGetCategories({ per_page: 50 }),
);
</script>

<template>
  <div class="blog-listing">
    <h1>Blog</h1>
    <p>Powered by WordPress + KatanaKit + Nuxt</p>

    <div v-if="status === 'pending'" class="loading">Loading posts...</div>

    <div v-else-if="!postsResult?.ok" class="error">
      <p>Error: {{ postsResult?.error?.message ?? "Unknown error" }}</p>
    </div>

    <!-- Categories -->
    <nav v-if="categoriesResult?.ok && categoriesResult.data?.length" class="categories">
      <strong>Categories:</strong>
      <NuxtLink
        v-for="cat in categoriesResult.data"
        :key="cat.id"
        :to="`/blog/category/${cat.slug}`"
      >
        {{ cat.name }}
      </NuxtLink>
    </nav>

    <ul v-else-if="postsResult?.data?.length" class="post-list">
      <li v-for="post in postsResult.data" :key="post.id" class="post-item">
        <img
          v-if="(post as any)._embedded?.['wp:featuredmedia']?.[0]?.source_url"
          :src="(post as any)._embedded['wp:featuredmedia'][0].source_url"
          alt=""
          width="200"
        />

        <div class="post-content">
          <NuxtLink :to="`/blog/${post.slug}`">
            <strong v-html="post.title.rendered" />
          </NuxtLink>

          <div class="meta">
            <time :datetime="post.date">
              {{ new Date(post.date).toLocaleDateString() }}
            </time>
            <span v-if="(post as any)._embedded?.author?.[0]?.name">
              by {{ (post as any)._embedded.author[0].name }}
            </span>
          </div>

          <div v-html="post.excerpt.rendered" />
        </div>
      </li>
    </ul>

    <p v-else>No posts found.</p>
  </div>
</template>

<style scoped>
.blog-listing { max-width: 800px; margin: 0 auto; padding: 2rem; }
.categories { margin: 1rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.categories a { padding: 0.25rem 0.75rem; background: #f0f0f0; border-radius: 1rem; text-decoration: none; font-size: 0.875rem; }
.post-list { list-style: none; padding: 0; }
.post-item { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #eee; }
.post-item img { border-radius: 0.5rem; object-fit: cover; }
.post-content { flex: 1; }
.meta { display: flex; gap: 0.5rem; margin-top: 0.25rem; color: #666; font-size: 0.875rem; }
.loading, .error { padding: 2rem; text-align: center; }
.error { color: #c00; }
</style>
