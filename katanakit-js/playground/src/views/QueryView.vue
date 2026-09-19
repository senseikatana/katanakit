<script setup lang="ts">
import { ref } from "vue";
import { useQuery } from "katanakit-js/adapters/vue";
import { useFetch, useInitApis, useQueryClient } from "katanakit-js";
import { usePlaygroundApis } from "../composables/usePlaygroundApis";
import JsonViewer from "../components/JsonViewer.vue";

const pokemonId = ref(25);
const qc = useQueryClient();

usePlaygroundApis();

const { data, error, isLoading, isSuccess, isError, isStale, status, refetch } =
  useQuery<{
    name: string;
    id: number;
    height: number;
    weight: number;
    sprites: { front_default: string };
  }>({
    queryKey: () => ["pokemon", pokemonId.value],
    queryFn: () =>
      useFetch("pokeapi", "pokemonById", { urlOptions: { params: { id: pokemonId.value } } }),
    staleTime: 30_000,
  });

function invalidateCache() {
  qc.invalidateQueries({ queryKey: ["pokemon"] });
}
</script>

<template>
  <div class="query-view">
    <div class="section">
      <h3>Controls</h3>
      <div class="controls">
        <label>
          Pokemon ID
          <input
            v-model.number="pokemonId"
            type="number"
            min="1"
            max="1025"
            placeholder="25"
          />
        </label>
        <button @click="refetch" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? "Fetching..." : "Refetch" }}
        </button>
        <button @click="invalidateCache" class="secondary">
          Invalidate Cache
        </button>
      </div>
    </div>

    <div class="section">
      <h3>Query State</h3>
      <div class="state-panel">
        <div class="state-item">
          <span class="state-label">Status:</span>
          <span
            class="status-badge"
            :class="{
              success: isSuccess,
              error: isError,
              loading: isLoading,
            }"
          >
            {{ status }}
          </span>
        </div>
        <div class="state-item">
          <span class="state-label">isLoading:</span>
          <span class="state-value">{{ isLoading }}</span>
        </div>
        <div class="state-item">
          <span class="state-label">isSuccess:</span>
          <span class="state-value">{{ isSuccess }}</span>
        </div>
        <div class="state-item">
          <span class="state-label">isError:</span>
          <span class="state-value">{{ isError }}</span>
        </div>
        <div class="state-item">
          <span class="state-label">isStale:</span>
          <span class="state-value">{{ isStale }}</span>
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
.query-view {
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
  gap: 12px;
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

button.secondary {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
}

button.secondary:hover {
  background-color: var(--color-border);
}

.state-panel {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
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
  font-family: "Fira Code", monospace;
  font-weight: 500;
}
</style>
