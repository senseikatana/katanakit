---
/**
 * Vue 3 SFC + WordPress — single blog post with comments.
 *
 * This file goes in: src/views/BlogPostView.vue
 *
 * Fetches a post from WordPress by slug and renders it with comments.
 */

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import {
  useInitWordPress,
  useWpFindPostBySlug,
  useWpGetComments,
} from "katanakit-js/adapters/wordpress";
import type { WpPost, WpComment } from "katanakit-js/adapters/wordpress";

// Init once
useInitWordPress({
  baseUrl: import.meta.env.VITE_WP_BASE_URL,
  auth: {
    type: "application-passwords",
    username: import.meta.env.VITE_WP_USERNAME,
    password: import.meta.env.VITE_WP_APP_PASSWORD,
  },
});

const route = useRoute();
const slug = computed(() => route.params.slug as string);

// State
const post = ref<WpPost | null>(null);
const comments = ref<WpComment[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Fetch post and comments when slug changes
async function fetchPost(newSlug: string) {
  loading.value = true;
  error.value = null;

  try {
    const result = await useWpFindPostBySlug(newSlug);

    if (!result.ok) {
      error.value = result.error.message;
      return;
    }

    if (!result.data) {
      error.value = "Post not found";
      return;
    }

    post.value = result.data;

    // Fetch comments
    const commentsResult = await useWpGetComments({
      post: result.data.id,
      status: "approve",
    });

    if (commentsResult.ok) {
      comments.value = commentsResult.data;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

// Initial fetch
fetchPost(slug.value);

// Refetch when slug changes
watch(slug, (newSlug) => {
  if (newSlug) fetchPost(newSlug);
});
</script>

<template>
  <article class="blog-post">
    <a href="/blog">&larr; Back to blog</a>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <template v-else-if="post">
      <h1 v-html="post.title.rendered" />

      <div class="meta">
        <time :datetime="post.date">
          {{ new Date(post.date).toLocaleDateString() }}
        </time>
        <span v-if="(post as any)._embedded?.author?.[0]?.name">
          by {{ (post as any)._embedded.author[0].name }}
        </span>
      </div>

      <!-- Featured image -->
      <img
        v-if="(post as any)._embedded?.['wp:featuredmedia']?.[0]?.source_url"
        :src="(post as any)._embedded['wp:featuredmedia'][0].source_url"
        :alt="post.title.rendered"
        width="800"
        class="featured-image"
      />

      <!-- Post content — WordPress returns rendered HTML -->
      <div class="content" v-html="post.content.rendered" />

      <!-- Comments section -->
      <section v-if="comments.length" class="comments">
        <h2>Comments ({{ comments.length }})</h2>
        <ul>
          <li v-for="comment in comments" :key="comment.id" class="comment">
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
.blog-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #666;
}

.featured-image {
  width: 100%;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

.content {
  margin-top: 2rem;
  line-height: 1.7;
}

.comments {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 2px solid #eee;
}

.comment {
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.comment time {
  margin-left: 0.5rem;
  color: #999;
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
