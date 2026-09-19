---
/**
 * Vue 3 SFC + WordPress — blog listing from WordPress REST API.
 *
 * This file goes in: src/views/BlogView.vue
 *
 * Setup:
 *   1. Create an Application Password in WP Admin → Users → Your Profile
 *   2. Add VITE_WP_BASE_URL, VITE_WP_USERNAME, VITE_WP_APP_PASSWORD to .env
 *
 * Uses useQuery from katanakit-js/adapters/vue for reactive state.
 */

<script setup lang="ts">
import { useQuery } from "katanakit-js/adapters/vue";
import {
  useInitWordPress,
  useWpGetPosts,
  useWpGetCategories,
} from "katanakit-js/adapters/wordpress";
import type { WpPost, WpCategory } from "katanakit-js/adapters/wordpress";

// Init once
useInitWordPress({
  baseUrl: import.meta.env.VITE_WP_BASE_URL,
  auth: {
    type: "application-passwords",
    username: import.meta.env.VITE_WP_USERNAME,
    password: import.meta.env.VITE_WP_APP_PASSWORD,
  },
});

// Fetch published posts
const { data: posts, isLoading: postsLoading, error: postsError, refetch } = useQuery<WpPost[]>({
  queryKey: ["wp-blog"],
  queryFn: () =>
    useWpGetPosts({
      per_page: 10,
      status: "publish",
      orderby: "date",
      order: "desc",
      _embed: true,
    }),
  staleTime: 60_000,
});

// Fetch categories
const { data: categories } = useQuery<WpCategory[]>({
  queryKey: ["wp-categories"],
  queryFn: () => useWpGetCategories({ per_page: 50 }),
  staleTime: 300_000, // 5 minutes — categories rarely change
});
</script>

<template>
  <div class="blog-listing">
    <h1>Blog</h1>
    <p>Powered by WordPress + KatanaKit</p>

    <button @click="refetch" :disabled="postsLoading">
      {{ postsLoading ? "Loading..." : "Refresh" }}
    </button>

    <!-- Categories filter -->
    <nav v-if="categories?.length" class="categories">
      <strong>Categories:</strong>
      <a v-for="cat in categories" :key="cat.id" :href="`/blog/category/${cat.slug}`">
        {{ cat.name }}
      </a>
    </nav>

    <div v-if="postsLoading" class="loading">Loading posts...</div>

    <div v-else-if="postsError" class="error">
      <p>Error: {{ postsError.message }}</p>
      <button @click="refetch">Retry</button>
    </div>

    <ul v-else-if="posts?.length" class="post-list">
      <li v-for="post in posts" :key="post.id" class="post-item">
        <img
          v-if="(post as any)._embedded?.['wp:featuredmedia']?.[0]?.source_url"
          :src="(post as any)._embedded['wp:featuredmedia'][0].source_url"
          alt=""
          width="200"
        />

        <div class="post-content">
          <router-link :to="`/blog/${post.slug}`">
            <strong v-html="post.title.rendered" />
          </router-link>

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
.blog-listing {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.categories {
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.categories a {
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  border-radius: 1rem;
  text-decoration: none;
  font-size: 0.875rem;
}

.post-list {
  list-style: none;
  padding: 0;
}

.post-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.post-item img {
  border-radius: 0.5rem;
  object-fit: cover;
}

.post-content {
  flex: 1;
}

.meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
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
