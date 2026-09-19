<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  data: unknown;
  error?: string | null;
}>();

const formattedJson = computed(() => {
  if (props.error) {
    return JSON.stringify({ error: props.error }, null, 2);
  }
  if (props.data === null || props.data === undefined) {
    return "null";
  }
  return JSON.stringify(props.data, null, 2);
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightJson(json: string): string {
  const safe = escapeHtml(json);
  return safe
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "json-number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "json-key";
          } else {
            cls = "json-string";
          }
        } else if (/true|false/.test(match)) {
          cls = "json-boolean";
        } else if (/null/.test(match)) {
          cls = "json-null";
        }
        return `<span class="${cls}">${match}</span>`;
      },
    )
    .replace(/\n/g, "<br>")
    .replace(/ /g, "&nbsp;");
}
</script>

<template>
  <div class="json-viewer">
    <pre><code v-html="highlightJson(formattedJson)"></code></pre>
  </div>
</template>
