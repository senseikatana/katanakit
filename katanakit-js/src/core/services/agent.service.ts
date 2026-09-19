import type {
	AgentResult,
	AgentRunOptions,
	AgentStep,
	AiChatOptions,
	AiMessage,
	AiProviderConfig,
	AiResult,
	AiTool,
	AiToolCall,
} from "../../types/index.js";

/** Default endpoint for Alibaba Cloud Model Studio (DashScope) compatible mode. */
export const KITT_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

/** Default model for the Kitt assistant preset. */
export const KITT_DEFAULT_MODEL = "qwen3.8-max";

/** Default system prompt injected when the agent is configured without one. */
export const KITT_SYSTEM_PROMPT =
	"You are Kitt, a helpful assistant. Answer clearly and concisely.";

/** Reusable preset (base URL + model) for the Kitt assistant. */
export const kittPreset: Pick<AiProviderConfig, "baseUrl" | "model"> = {
	baseUrl: KITT_BASE_URL,
	model: KITT_DEFAULT_MODEL,
};

/** Module-level provider registry. */
let provider: AiProviderConfig | null = null;

/** Tag that identifies AI HTTP failures without relying on class identity. */
const AI_HTTP_ERROR_TAG = "AiHttpError" as const;

/** Shape of the tagged error raised on non-2xx completions responses. */
interface AiHttpError extends Error {
	tag: typeof AI_HTTP_ERROR_TAG;
	status: number;
	details?: unknown;
}

/** Creates a tagged Error preserving the HTTP status and response details. */
function createAiHttpError(message: string, status: number, details?: unknown): AiHttpError {
	const error = new Error(message) as AiHttpError;
	error.name = AI_HTTP_ERROR_TAG;
	error.tag = AI_HTTP_ERROR_TAG;
	error.status = status;
	error.details = details;
	return error;
}

/** Type guard that replaces `instanceof` (robust across module copies/realm). */
function isAiHttpError(error: unknown): error is AiHttpError {
	return error instanceof Error && (error as AiHttpError).tag === AI_HTTP_ERROR_TAG;
}

/** Reads the API key from the environment when `process` is available. */
function readEnvKey(): string | undefined {
	if (typeof process !== "undefined" && process.env) {
		return process.env.DASHSCOPE_API_KEY;
	}
	return undefined;
}

/** Retrieves the configured provider or throws. */
function getProvider(): AiProviderConfig {
	if (!provider) {
		throw new Error("[AiAgent] No provider configured. Call useInitAgent() first.");
	}
	return provider;
}

/** Coerces an unknown error into a message string. */
function toMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/** Extracts an HTTP status from an error, defaulting to `0`. */
function toStatus(error: unknown): number {
	return isAiHttpError(error) ? error.status : 0;
}

/** Converts a tool into the OpenAI-compatible wire shape. */
function toWireTool(tool: AiTool): Record<string, unknown> {
	return {
		type: "function",
		function: {
			name: tool.name,
			description: tool.description,
			parameters: tool.parameters,
		},
	};
}

/** Executes a tool call emitted by the model, resolving the tool by name. */
async function executeToolCall(tools: AiTool[], call: AiToolCall): Promise<unknown> {
	const tool = tools.find((item) => item.name === call.function?.name);
	if (!tool) {
		return { error: `Unknown tool "${call.function?.name}".` };
	}

	let input: unknown;
	try {
		input = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
	} catch {
		input = call.function?.arguments;
	}

	try {
		return await tool.execute(input);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		return { error: `Tool "${tool.name}" failed: ${message}` };
	}
}

/** Shape of a `/chat/completions` response. */
interface ChatCompletionResponse {
	choices?: Array<{
		message?: { content?: string | null; tool_calls?: AiToolCall[] };
		finish_reason?: string | null;
	}>;
	error?: { message?: string };
}

/** Request options shared by chat and agent calls. */
interface RequestOptions {
	temperature?: number;
	maxTokens?: number;
	topP?: number;
	signal?: AbortSignal;
	tools?: AiTool[];
}

/** Removes a single trailing slash to build the chat completions URL. */
function buildCompletionsUrl(baseUrl: string): string {
	const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
	return `${base}/chat/completions`;
}

/**
 * Internal: performs a raw `chat/completions` request against the provider.
 * Throws {@link AiHttpError} on non-2xx responses.
 */
async function requestCompletion(
	config: AiProviderConfig,
	messages: AiMessage[],
	options: RequestOptions,
): Promise<ChatCompletionResponse> {
	const body: Record<string, unknown> = {
		model: config.model,
		messages,
	};

	if (options.temperature !== undefined) body.temperature = options.temperature;
	if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
	if (options.topP !== undefined) body.top_p = options.topP;

	if (options.tools && options.tools.length > 0) {
		body.tools = options.tools.map(toWireTool);
		body.tool_choice = "auto";
	}

	const response = await fetch(buildCompletionsUrl(config.baseUrl), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${config.apiKey}`,
		},
		body: JSON.stringify(body),
		signal: options.signal,
	});

	const text = await response.text();
	const parsed: ChatCompletionResponse = text ? (JSON.parse(text) as ChatCompletionResponse) : {};

	if (!response.ok) {
		throw createAiHttpError(
			parsed.error?.message ?? response.statusText ?? "Unsuccessful response",
			response.status,
			parsed,
		);
	}

	return parsed;
}

/** Prepends a system message unless the conversation already defines one. */
function ensureSystem(messages: AiMessage[], fallback: string): AiMessage[] {
	if (messages.some((message) => message.role === "system")) {
		return messages;
	}
	return [{ role: "system", content: fallback }, ...messages];
}

/**
 * Registers the AI provider for the Kitt assistant.
 *
 * `apiKey` falls back to `process.env.DASHSCOPE_API_KEY`; `baseUrl`, `model`
 * and `systemPrompt` fall back to the {@link kittPreset} defaults.
 *
 * @param config - Partial provider configuration.
 *
 * @example
 * ```ts
 * import { useInitAgent } from "katanakit-js";
 *
 * useInitAgent({
 *   apiKey: process.env.DASHSCOPE_API_KEY,
 *   model: "qwen3.8-max",
 * });
 * ```
 */
export function useInitAgent(config: Partial<AiProviderConfig> = {}): void {
	const apiKey = config.apiKey ?? readEnvKey() ?? "";
	if (!apiKey) {
		throw new Error("[AiAgent] Missing apiKey. Pass it to useInitAgent() or set DASHSCOPE_API_KEY.");
	}

	const baseUrl = config.baseUrl ?? KITT_BASE_URL;
	if (!baseUrl.startsWith("https://")) {
		throw new Error("[AiAgent] baseUrl must use https:// so the API key is not sent in cleartext.");
	}

	provider = {
		baseUrl,
		model: config.model ?? KITT_DEFAULT_MODEL,
		systemPrompt: config.systemPrompt ?? KITT_SYSTEM_PROMPT,
		apiKey,
	};
}

/**
 * Sends a single chat completion and returns the assistant text as a Safe Result.
 *
 * Use this for review / questioning (single-shot). For autonomous multi-step
 * work with tools, use {@link useRunAgent}.
 *
 * @param messages - Conversation messages (a system prompt is prepended if absent).
 * @param options - Optional completion options.
 * @returns A {@link AiResult} with the assistant text.
 *
 * @example
 * ```ts
 * import { useChat } from "katanakit-js";
 *
 * const result = await useChat([
 *   { role: "user", content: "Summarize the benefits of solar energy in three bullet points." },
 * ]);
 * if (result.ok) console.log(result.data);
 * ```
 */
export async function useChat(
	messages: AiMessage[],
	options: AiChatOptions = {},
): Promise<AiResult<string>> {
	try {
		const config = getProvider();
		const { signal, temperature, maxTokens, topP, systemPrompt } = options;
		const withSystem = ensureSystem(
			messages,
			systemPrompt ?? config.systemPrompt ?? KITT_SYSTEM_PROMPT,
		);
		const response = await requestCompletion(config, withSystem, {
			signal,
			temperature,
			maxTokens,
			topP,
		});
		const content = response.choices?.[0]?.message?.content ?? "";
		return { data: content, error: null, ok: true };
	} catch (error: unknown) {
		return {
			data: null,
			error: { message: `[AiAgent] ${toMessage(error)}`, status: toStatus(error) },
			ok: false,
		};
	}
}

/**
 * Runs the tool-calling agent loop against a goal until it emits a final
 * answer or exhausts `maxSteps`.
 *
 * @param goal - The natural-language objective.
 * @param options - Tools, step budget and completion options.
 * @returns An {@link AgentResult} with the final message and executed steps.
 *
 * @example
 * ```ts
 * import { useRunAgent } from "katanakit-js";
 *
 * const result = await useRunAgent("Fix the type errors reported by tsc", {
 *   tools: [
 *     {
 *       name: "runCommand",
 *       description: "Runs a shell command and returns its output",
 *       parameters: { type: "object", properties: { command: { type: "string" } } },
 *       execute: (input) => shell.run(input.command),
 *     },
 *   ],
 *   maxSteps: 12,
 * });
 * ```
 */
export async function useRunAgent(
	goal: string,
	options: AgentRunOptions = {},
): Promise<AgentResult> {
	try {
		const config = getProvider();
		const {
			tools = [],
			maxSteps = 10,
			signal,
			temperature,
			maxTokens,
			topP,
			systemPrompt,
			history = [],
		} = options;

		const prior = history.filter((message) => message.role !== "system");
		const messages: AiMessage[] = [
			{ role: "system", content: systemPrompt ?? config.systemPrompt ?? KITT_SYSTEM_PROMPT },
			...prior,
			{ role: "user", content: goal },
		];

		const steps: AgentStep[] = [];

		for (let step = 0; step < maxSteps; step++) {
			const response = await requestCompletion(config, messages, {
				signal,
				temperature,
				maxTokens,
				topP,
				tools,
			});

			const choice = response.choices?.[0];
			const toolCalls = choice?.message?.tool_calls ?? [];

			if (toolCalls.length > 0) {
				messages.push({
					role: "assistant",
					content: choice?.message?.content ?? null,
					tool_calls: toolCalls,
				});

				const toolResults: unknown[] = [];
				for (const call of toolCalls) {
					const result = await executeToolCall(tools, call);
					toolResults.push(result);
					messages.push({
						role: "tool",
						tool_call_id: call.id,
						content: typeof result === "string" ? result : JSON.stringify(result),
					});
				}

				steps.push({ toolCalls, toolResults });
				continue;
			}

			const finalMessage = choice?.message?.content ?? "";
			return { data: { finalMessage, steps }, error: null, ok: true };
		}

		return {
			data: null,
			error: {
				message: `[AiAgent] Max steps (${maxSteps}) reached without a final answer.`,
				status: 0,
			},
			ok: false,
		};
	} catch (error: unknown) {
		return {
			data: null,
			error: { message: `[AiAgent] ${toMessage(error)}`, status: toStatus(error) },
			ok: false,
		};
	}
}
