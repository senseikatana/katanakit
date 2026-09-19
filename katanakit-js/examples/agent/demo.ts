/**
 * Example: Kitt, the AI assistant, reviewing and correcting code.
 *
 * Run with a DashScope-compatible API key:
 *   DASHSCOPE_API_KEY=... tsx examples/agent/demo.ts
 */
import { realpath } from "node:fs/promises";
import { resolve, sep } from "node:path";

import { useChat, useInitAgent, useRunAgent } from "@/core/services/agent.service";

// Register Kitt once. apiKey falls back to DASHSCOPE_API_KEY from the env.
useInitAgent({
	model: "qwen3.8-max",
});

// Confine file reads to the current working directory (never the whole FS).
const root = process.cwd();
async function resolveConfined(requested: string): Promise<string | null> {
	const candidate = resolve(root, requested);
	if (candidate !== root && !candidate.startsWith(root + sep)) {
		return null;
	}
	return realpath(candidate).catch(() => null);
}

// 1) Assistant: single-shot review.
const review = await useChat([
	{ role: "user", content: "Summarize the benefits of solar energy in three bullet points." },
]);
if (review.ok) {
	console.log(review.data);
} else {
	console.error(review.error.message);
}

// 2) Agent: autonomous tool-calling loop.
const fixed = await useRunAgent("Read src/index.ts and tell me what it exports.", {
	// Wire tools to your own runtime (fs, shell, etc.).
	tools: [
		{
			name: "readFile",
			description: "Returns the contents of a file inside the current working directory",
			parameters: {
				type: "object",
				properties: { path: { type: "string" } },
				required: ["path"],
			},
			execute: async (input) => {
				const { readFile } = await import("node:fs/promises");
				const path = (input as { path: string }).path;
				const resolved = await resolveConfined(path);
				if (!resolved) {
					return { error: "Path is outside the working directory." };
				}
				return readFile(resolved, "utf8");
			},
		},
	],
	maxSteps: 6,
});

if (fixed.ok) {
	console.log(fixed.data.finalMessage);
	console.log(`Executed ${fixed.data.steps.length} tool step(s).`);
} else {
	console.error(fixed.error.message);
}
