<script setup lang="ts">
import { ref, watch } from "vue";
import { useRequest } from "katanakit-js/adapters/vue";
import { usePlaygroundApis } from "../composables/usePlaygroundApis";
import JsonViewer from "../components/JsonViewer.vue";

const pokemonId = ref(25);

usePlaygroundApis();

const { data, error, loading, refetch } = useRequest<{
	name: string;
	id: number;
	height: number;
	weight: number;
	sprites: { front_default: string };
}>("pokeapi", "pokemonById", { params: { id: pokemonId } });

watch(pokemonId, () => {
	refetch();
});
</script>

<template>
	<div class="fetch-view">
		<div class="section">
			<h3>Controls</h3>
			<div class="controls">
				<label>
					Pokemon ID
					<input v-model.number="pokemonId" type="number" min="1" max="1025" placeholder="25" />
				</label>
				<button @click="refetch" :disabled="loading">
					<span v-if="loading" class="loading-spinner"></span>
					{{ loading ? "Loading..." : "Refetch" }}
				</button>
			</div>
		</div>

		<div class="section">
			<h3>State</h3>
			<div class="state-panel">
				<div class="state-item">
					<span class="state-label">Status:</span>
					<span
						class="status-badge"
						:class="{
							success: data && !error,
							error: error,
							loading: loading,
						}"
					>
						{{ loading ? "loading" : error ? "error" : "success" }}
					</span>
				</div>
				<div class="state-item">
					<span class="state-label">Data:</span>
					<span class="state-value">{{ data ? data.name : "null" }}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3>Response</h3>
			<JsonViewer :data="data" :error="error?.message" />
		</div>
	</div>
</template>

<style scoped>
.fetch-view {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.section h3 {
	font-size: 1em;
	font-weight: 600;
	margin-bottom: 12px;
	color: var(--color-text-muted);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.controls {
	display: flex;
	gap: 16px;
	align-items: flex-end;
}

.controls label {
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 0.9em;
	color: var(--color-text-muted);
}

.controls input {
	width: 120px;
}

.state-panel {
	background-color: var(--color-bg-secondary);
	border: 1px solid var(--color-border);
	border-radius: 8px;
	padding: 16px;
	display: flex;
	gap: 24px;
}

.state-item {
	display: flex;
	align-items: center;
	gap: 8px;
}

.state-label {
	color: var(--color-text-muted);
	font-size: 0.9em;
}

.state-value {
	font-weight: 500;
}
</style>
