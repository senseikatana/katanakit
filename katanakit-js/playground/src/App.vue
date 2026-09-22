<script setup lang="ts">
import AppSidebar from "./components/AppSidebar.vue";
</script>

<template>
	<div class="app-layout">
		<AppSidebar />
		<main class="main-content">
			<header class="app-header">
				<h1 class="app-title">KatanaKit Playground</h1>
				<p class="app-subtitle">Test composables and adapters in real-time</p>
			</header>
			<div class="view-container">
				<RouterView />
			</div>
		</main>
	</div>
</template>

<style scoped>
.app-layout {
	display: flex;
	min-height: 100vh;
}

.main-content {
	flex: 1;
	margin-left: var(--sidebar-width);
	padding: 24px;
}

.app-header {
	margin-bottom: 32px;
	padding-bottom: 16px;
	border-bottom: 1px solid var(--color-border);
}

.app-title {
	font-size: 1.8em;
	font-weight: 700;
	margin-bottom: 4px;
}

.app-subtitle {
	color: var(--color-text-muted);
	font-size: 1em;
}

.view-container {
	max-width: 100%;
}
</style>
