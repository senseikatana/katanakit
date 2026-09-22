<script setup lang="ts">
defineProps<{
	code: string;
	language?: string;
}>();
</script>

<template>
	<div class="code-block">
		<div class="code-header">
			<span class="code-language">{{ language || "typescript" }}</span>
		</div>
		<pre><code>{{ code }}</code></pre>
	</div>
</template>

<style scoped>
.code-block {
	background-color: var(--color-code-bg);
	border: 1px solid var(--color-border);
	border-radius: 8px;
	overflow: hidden;
}

.code-header {
	padding: 8px 16px;
	border-bottom: 1px solid var(--color-border);
	background-color: var(--color-bg-secondary);
}

.code-language {
	font-size: 0.8em;
	color: var(--color-text-muted);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

pre {
	margin: 0;
	border: none;
	border-radius: 0;
}

code {
	font-size: 0.85em;
	line-height: 1.6;
}
</style>
