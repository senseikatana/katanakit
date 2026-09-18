---
/**
 * Nuxt 3 + WordPress — single blog post with comments.
 *
 * This file goes in: pages/blog/[slug].vue
 *
 * Fetches a post from WordPress by slug and renders it with comments.
 */

<script setup lang="ts">
import {
  useInitWordPress,
  useWpFindPostBySlug,
  useWpGetComments,
} from "katanakit-js/adapters/wordpress";
import type { WpPost, WpComment } from "katanakit-js/adapters/wordpress";

const config = useRuntimeConfig();
const route = useRoute();
const slug = route.params.slug as string;

// Init WordPress
useInitWordPress({
  baseUrl: config.wpBaseUrl as string,
  auth: {
    type: "application-passwords",
    username: config.wpUsername as string,
    password: config.wpAppPassword as string,
  },
});

// Fetch post and comments with SSR
const { data: postData, status } = await useAsyncData(`wp-post-${slug}`, async () => {
  const postResult = await useWpFindPostBySlug(slug);

  if (!postResult.ok || !postResult.data) {
    return { post: null, comments: [], error: postResult.ok ? "Post not found" : postResult.error.message };
  }

  const commentsResult = await useWpGetComments({
    post: postResult.data.id,
    status: "approve",
  });

  return {
    post: postResult.data,
    comments: commentsResult.ok ? commentsResult.data : [],
    error: commentsResult.ok ? null : commentsResult.error.message,
  };
});
</script>

<template>
  <article class="blog-post">
    <NuxtLink to="/blog">&larr; Back to blog</NuxtLink>

    <div v-if="status === 'pending'" class="loading">Loading...</div>

    <div v-else-if="postData?.error" class="error">{{ postData.error }}</div>

    <template v-else-if="postData?.post">
      <h1 v-html="postData.post.title.rendered" />

      <div class="meta">
        <time :datetime="postData.post.date">
          {{ new Date(postData.post.date).toLocaleDateString() }}
        </time>
        <span v-if="(postData.post as any)._embedded?.author?.[0]?.name">
          by {{ (postData.post as any)._embedded.author[0].name }}
        </span>
      </div>

      <!-- Featured image -->
      <img
        v-if="(postData.post as any)._embedded?.['wp:featuredmedia']?.[0]?.source_url"
        :src="(postData.post as any)._embedded['wp:featuredmedia'][0].source_url"
        :alt="postData.post.title.rendered"
        width="800"
        class="featured-image"
      />

      <!-- Post content — WordPress returns rendered HTML -->
      <div class="content" v-html="postData.post.content.rendered" />

      <!-- Comments section -->
      <section v-if="postData.comments?.length" class="comments">
        <h2>Comments ({{ postData.comments.length }})</h2>
        <ul>
          <li v-for="comment in postData.comments" :key="comment.id" class="comment">
            <strong>{{ comment.author_name }}</strong>
            <time :datetime="comment.date">
              {{ new Date(comment.date).toLocaleDateString() }}
            </time>
            <div v-html="comment.content.rendered" />
          </li>
        </ul>
      </section>
    </template>
  </article>
</template>

<style scoped>
.blog-post { max-width: 800px; margin: 0 auto; padding: 2rem; }
.meta { display: flex; gap: 0.5rem; margin-top: 0.5rem; color: #666; }
.featured-image { width: 100%; border-radius: 0.5rem; margin: 1.5rem 0; }
.content { margin-top: 2rem; line-height: 1.7; }
.comments { margin-top: 3rem; padding-top: 1.5rem; border-top: 2px solid #eee; }
.comment { padding: 1rem 0; border-bottom: 1px solid #eee; }
.comment time { margin-left: 0.5rem; color: #999; font-size: 0.875rem; }
.loading, .error { padding: 2rem; text-align: center; }
.error { color: #c00; }
</style>
