<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const links = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/fetch", label: "useRequest", icon: "🌐" },
  { path: "/query", label: "useQuery", icon: "🔍" },
  { path: "/watch", label: "useWatch", icon: "👁️" },
  { path: "/url-builder", label: "useBuildUrl", icon: "🔗" },
];
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-logo">⚡</span>
      <span class="sidebar-brand">Playground</span>
    </div>
    <nav class="sidebar-nav">
      <RouterLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="nav-link"
        :class="{ active: route.path === link.path }"
      >
        <span class="nav-icon">{{ link.icon }}</span>
        <span class="nav-label">{{ link.label }}</span>
      </RouterLink>
    </nav>
    <div class="sidebar-footer">
      <a
        href="https://senseikatana.com/katanakit-js/docs/api"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link"
      >
        📚 API Reference
      </a>
      <a
        href="https://github.com/senseikatana/katanakit-js"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link"
      >
        💻 GitHub
      </a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-logo {
  font-size: 1.4em;
}

.sidebar-brand {
  font-weight: 600;
  font-size: 1.1em;
}

.sidebar-nav {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.nav-link:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text);
}

.nav-link.active {
  background-color: var(--color-primary);
  color: white;
}

.nav-icon {
  font-size: 1.1em;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--color-border);
}

.footer-link {
  display: block;
  padding: 8px 12px;
  color: var(--color-text-muted);
  font-size: 0.9em;
  border-radius: 6px;
}

.footer-link:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text);
}
</style>
