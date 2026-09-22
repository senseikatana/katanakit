<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const demos = [
	{
		path: "/fetch",
		title: "useRequest",
		description: "Reactive HTTP fetch composable with auto-refetch",
		icon: "🌐",
	},
	{
		path: "/query",
		title: "useQuery",
		description: "TanStack-Query-style reactive query with caching",
		icon: "🔍",
	},
	{
		path: "/watch",
		title: "useWatch",
		description: "Generic deep watcher with auto-cleanup",
		icon: "👁️",
	},
	{
		path: "/url-builder",
		title: "useBuildUrl",
		description: "Programmatic URL builder for API endpoints",
		icon: "🔗",
	},
];
</script>

<template>
	<div class="home-view">
		<div class="intro">
			<h2>Welcome to KatanaKit Playground</h2>
			<p>
				Test every composable and adapter in real-time. Pick a demo from the sidebar or click a card
				below.
			</p>
		</div>
		<div class="demo-grid">
			<button v-for="demo in demos" :key="demo.path" class="demo-card" @click="router.push(demo.path)">
				<span class="demo-icon">{{ demo.icon }}</span>
				<h3 class="demo-title">{{ demo.title }}</h3>
				<p class="demo-description">{{ demo.description }}</p>
			</button>
		</div>
	</div>
</template>

<style scoped>
.home-view {
	max-width: 800px;
}

.intro {
	margin-bottom: 32px;
}

.intro h2 {
	font-size: 1.5em;
	margin-bottom: 8px;
}

.intro p {
	color: var(--color-text-muted);
}

.demo-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
}

.demo-card {
	background-color: var(--color-bg-secondary);
	border: 1px solid var(--color-border);
	border-radius: 12px;
	padding: 20px;
	text-align: left;
	cursor: pointer;
	transition: all 0.2s ease;
}

.demo-card:hover {
	border-color: var(--color-primary);
	transform: translateY(-2px);
}

.demo-icon {
	font-size: 2em;
	display: block;
	margin-bottom: 12px;
}

.demo-title {
	font-size: 1.1em;
	font-weight: 600;
	margin-bottom: 6px;
}

.demo-description {
	color: var(--color-text-muted);
	font-size: 0.9em;
	line-height: 1.5;
}
</style>
