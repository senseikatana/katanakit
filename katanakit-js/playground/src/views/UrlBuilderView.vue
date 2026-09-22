<script setup lang="ts">
import { ref, computed } from "vue";
import { useBuildUrl } from "katanakit-js";
import { usePlaygroundApis } from "../composables/usePlaygroundApis";

usePlaygroundApis();

const selectedApi = ref("pokeapi");
const selectedEndpoint = ref("pokemonById");
const paramsJson = ref('{"id": 25}');
const queryJson = ref("{}");

const presets = [
	{ api: "pokeapi", endpoint: "pokemonById", params: '{"id": 25}', query: "{}", label: "Pikachu" },
	{
		api: "pokeapi",
		endpoint: "pokemonList",
		params: "{}",
		query: '{"limit": 5, "offset": 0}',
		label: "Pokemon List",
	},
	{
		api: "jsonplaceholder",
		endpoint: "postById",
		params: '{"id": 1}',
		query: "{}",
		label: "First Post",
	},
	{ api: "jsonplaceholder", endpoint: "userList", params: "{}", query: "{}", label: "Users" },
];

const apis = [
	{
		name: "pokeapi",
		label: "PokeAPI",
		endpoints: [
			{ name: "pokemonById", label: "Pokemon by ID", paramKeys: ["id"] },
			{ name: "pokemonList", label: "Pokemon List", paramKeys: [] },
		],
	},
	{
		name: "jsonplaceholder",
		label: "JSONPlaceholder",
		endpoints: [
			{ name: "postById", label: "Post by ID", paramKeys: ["id"] },
			{ name: "userList", label: "User List", paramKeys: [] },
		],
	},
];

const currentEndpoints = computed(
	() => apis.find((a) => a.name === selectedApi.value)?.endpoints ?? [],
);

const builtUrl = computed(() => {
	try {
		const params = JSON.parse(paramsJson.value || "{}");
		const query = JSON.parse(queryJson.value || "{}");
		return useBuildUrl(selectedApi.value, selectedEndpoint.value, {
			params,
			query,
		});
	} catch (e) {
		return `Error: ${e instanceof Error ? e.message : "Invalid JSON"}`;
	}
});

function applyPreset(preset: (typeof presets)[number]) {
	selectedApi.value = preset.api;
	selectedEndpoint.value = preset.endpoint;
	paramsJson.value = preset.params;
	queryJson.value = preset.query;
}
</script>

<template>
	<div class="url-builder-view">
		<div class="section">
			<h3>Preset Examples</h3>
			<div class="presets">
				<button
					v-for="preset in presets"
					:key="preset.label"
					class="preset-btn"
					@click="applyPreset(preset)"
				>
					{{ preset.label }}
				</button>
			</div>
		</div>

		<div class="section">
			<h3>Configuration</h3>
			<div class="config-grid">
				<label>
					API
					<select v-model="selectedApi">
						<option v-for="api in apis" :key="api.name" :value="api.name">
							{{ api.label }}
						</option>
					</select>
				</label>
				<label>
					Endpoint
					<select v-model="selectedEndpoint">
						<option v-for="ep in currentEndpoints" :key="ep.name" :value="ep.name">
							{{ ep.label }}
						</option>
					</select>
				</label>
			</div>
			<div class="json-inputs">
				<label>
					Params (JSON)
					<textarea v-model="paramsJson" rows="3" placeholder='{"id": 25}'></textarea>
				</label>
				<label>
					Query (JSON)
					<textarea v-model="queryJson" rows="3" placeholder='{"limit": 10}'></textarea>
				</label>
			</div>
		</div>

		<div class="section">
			<h3>Result</h3>
			<div class="result-box">
				<code>{{ builtUrl }}</code>
			</div>
		</div>
	</div>
</template>

<style scoped>
.url-builder-view {
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

.presets {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.preset-btn {
	background-color: var(--color-bg-tertiary);
	border: 1px solid var(--color-border);
	padding: 6px 14px;
	font-size: 0.9em;
}

.preset-btn:hover {
	background-color: var(--color-border);
}

.config-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
	margin-bottom: 16px;
}

label {
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 0.9em;
	color: var(--color-text-muted);
}

select {
	background-color: var(--color-bg-secondary);
	color: var(--color-text);
	border: 1px solid var(--color-border);
	border-radius: 6px;
	padding: 8px 12px;
	font-size: 0.9em;
}

.json-inputs {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
}

textarea {
	font-family: "Fira Code", monospace;
	font-size: 0.85em;
	resize: vertical;
}

.result-box {
	background-color: var(--color-code-bg);
	border: 1px solid var(--color-border);
	border-radius: 8px;
	padding: 16px;
	overflow-x: auto;
}

.result-box code {
	color: var(--color-success);
	word-break: break-all;
}
</style>
