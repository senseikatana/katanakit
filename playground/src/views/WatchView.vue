<script setup lang="ts">
import { ref } from "vue";
import { useWatch } from "katanakit-js/adapters/vue";

const source = ref("Hello");
const log = ref<string[]>([]);

function addLog(message: string) {
  const time = new Date().toLocaleTimeString();
  log.value.unshift(`[${time}] ${message}`);
  if (log.value.length > 20) {
    log.value.pop();
  }
}

useWatch(
  source,
  (newVal, oldVal) => {
    addLog(`Value changed: "${oldVal}" → "${newVal}"`);
  },
  { deep: true },
);

const nested = ref({ user: { name: "KatanaKit", count: 0 } });

useWatch(
  nested,
  (newVal, oldVal) => {
    addLog(`Nested changed: ${JSON.stringify(oldVal)} → ${JSON.stringify(newVal)}`);
  },
  { deep: true },
);

function incrementCount() {
  nested.value.user.count++;
}

function toggleName() {
  nested.value.user.name =
    nested.value.user.name === "KatanaKit" ? "Playground" : "KatanaKit";
}

function clearLog() {
  log.value = [];
}
</script>

<template>
  <div class="watch-view">
    <div class="section">
      <h3>Simple Ref Watcher</h3>
      <div class="controls">
        <label>
          String Value
          <input v-model="source" type="text" placeholder="Type something..." />
        </label>
      </div>
      <p class="hint">
        The watcher fires every time you type (deep watch).
      </p>
    </div>

    <div class="section">
      <h3>Nested Object Watcher</h3>
      <div class="controls">
        <button @click="incrementCount">
          Count: {{ nested.user.count }}
        </button>
        <button @click="toggleName">Toggle Name</button>
      </div>
      <p class="hint">
        Deep watch detects changes in nested properties.
      </p>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>Watch Log</h3>
        <button @click="clearLog" class="small">Clear</button>
      </div>
      <div class="log-panel">
        <div v-if="log.length === 0" class="log-empty">
          No changes yet. Modify the inputs above.
        </div>
        <div v-for="(entry, i) in log" :key="i" class="log-entry">
          {{ entry }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.watch-view {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.hint {
  margin-top: 8px;
  font-size: 0.85em;
  color: var(--color-text-muted);
  font-style: italic;
}

button.small {
  padding: 4px 10px;
  font-size: 0.8em;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
}

.log-panel {
  background-color: var(--color-code-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  font-family: "Fira Code", monospace;
  font-size: 0.85em;
}

.log-empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.log-entry {
  padding: 4px 0;
  border-bottom: 1px solid var(--color-border);
}

.log-entry:last-child {
  border-bottom: none;
}
</style>
