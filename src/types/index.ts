import type { Temporal } from "@js-temporal/polyfill";

/* -------------------------------------------------------------------------- */
/* Logging                                                                    */
/* -------------------------------------------------------------------------- */

export type LogLevel = "log" | "info" | "warn" | "error" | "debug";

/** Strategy contract: defines the output using type-safe levels. */
export interface LogStrategy {
	useOutput(level: LogLevel, message: string, data?: unknown): void;
}

/* -------------------------------------------------------------------------- */
/* DOM / Observers                                                            */
/* -------------------------------------------------------------------------- */

/** Target can be either an HTMLElement reference or a CSS selector string. */
export type ObserverTarget = HTMLElement | string;

/** Callback invoked when an observed element enters the viewport. */
export type ObserverCallback = (entry: IntersectionObserverEntry) => void;

/** Configuration for a registered IntersectionObserver. */
export interface ObserverConfig {
	callback: ObserverCallback;
	options: IntersectionObserverInit;
	autoUnobserve: boolean;
}

/** Internal registry entry storing an observer instance and its tracked targets. */
export interface ObserverEntry {
	config: ObserverConfig;
	observer: IntersectionObserver | null;
	targets: Set<HTMLElement>;
}

/** Internal registry entry for lazy loading configurations. */
export interface LazyLoaderEntry {
	selector: string;
	observerKey: string;
}

/** Contract of the DOM facade. */
export interface IDomService {
	useIsBrowser(): boolean;
	useGetRoot(): HTMLElement | null;
	useGetBody(): HTMLBodyElement | null;
	useGetElementById<T extends HTMLElement = HTMLElement>(id: string): T | null;
	useGetElementByClass<T extends HTMLElement = HTMLElement>(className: string): T | null;
	useQuerySelector<K extends keyof HTMLElementTagNameMap>(
		selector: K,
	): HTMLElementTagNameMap[K] | null;
	useQuerySelector<E extends Element = HTMLElement>(selector: string): E | null;
	useQuerySelectorAll<K extends keyof HTMLElementTagNameMap>(
		selector: K,
	): HTMLElementTagNameMap[K][];
	useQuerySelectorAll<E extends Element = HTMLElement>(selector: string): E[];
	useAddClass(target: Element | string, className: string): void;
	useRemoveClass(target: Element | string, className: string | string[]): void;
	useToggleClass(target: Element | string, className: string, force?: boolean): boolean | undefined;
	useHasClass(target: Element | string, className: string): boolean;
	useGetAttribute(target: Element | string, attr: string): string | null;
	useSetAttribute(target: Element | string, attr: string, value: string): void;
	useRemoveAttribute(target: Element | string, attr: string): void;
	useGetDataAttribute(target: HTMLElement | string, key: string): string | undefined;
	useSetDataAttribute(target: HTMLElement | string, key: string, value: string): void;
	useOn<K extends keyof HTMLElementEventMap>(
		target: EventTarget | string,
		event: K,
		callback: (event: HTMLElementEventMap[K]) => void,
		options?: boolean | AddEventListenerOptions,
	): (() => void) | null;
	useCreateElement<T extends keyof HTMLElementTagNameMap>(
		tagName: T,
		options?: ElementCreationOptions,
	): HTMLElementTagNameMap[T];
	useSetHtml(target: Element | string, html: string): void;
	useSetText(target: Element | string, text: string): void;
	useAppend(target: Element | string, child: Element | string): void;
	useRemove(target: Element | string): void;
}

/* -------------------------------------------------------------------------- */
/* Sensors                                                                    */
/* -------------------------------------------------------------------------- */

/** Represents a geographic position with latitude, longitude and accuracy. */
export interface GeoPosition {
	lat: number;
	lng: number;
	accuracy: number;
}

/** Type for the experimental Battery API. */
export interface BatteryManager extends EventTarget {
	charging: boolean;
	chargingTime: number;
	dischargingTime: number;
	level: number;
}

/* -------------------------------------------------------------------------- */
/* Workers                                                                    */
/* -------------------------------------------------------------------------- */

export type WorkerFunc<TInput = unknown, TOutput = unknown> = (
	data: TInput,
) => TOutput | Promise<TOutput>;

export interface WorkerPoolEntry<TInput = unknown, TOutput = unknown> {
	worker: Worker;
	workerUrl: string;
	func: WorkerFunc<TInput, TOutput>;
	pending: Map<string, { reject: (reason: Error) => void; cleanup: () => void }>;
}

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

export type StorageTarget = "localStorage" | "sessionStorage";

/** Strategy contract: homogeneous storage without `any`. */
export interface StorageStrategy {
	useGetItem<T = unknown>(key: string): T | null;
	useSetItem(key: string, value: unknown): void;
	useRemoveItem(key: string): void;
	useClear(): void;
}

/* -------------------------------------------------------------------------- */
/* Locale / Currency                                                          */
/* -------------------------------------------------------------------------- */

export type Locale = "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "zh";

export type Currency =
	| "EUR"
	| "USD"
	| "GBP"
	| "JPY"
	| "CAD"
	| "MXN"
	| "CHF"
	| "AUD"
	| "BRL"
	| "CNY"
	| "ARS"
	| "COP"
	| "CLP";

export interface CurrencyFormatOptions {
	amount: number;
	currency?: Currency;
	/**
	 * Tax rate: percentage when `> 1` (e.g. `21` → 21%), or decimal fraction
	 * when in `(0, 1]` (e.g. `0.21` → 21%). Prefer a fraction for rates ≤ 1%.
	 */
	taxes?: number;
	locale?: Locale;
}

export interface NumberFormatOptions {
	locale?: Locale;
	digits?: number;
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

export type TemporalInput =
	| string
	| number
	| Date
	| Temporal.PlainDate
	| Temporal.PlainDateTime
	| Temporal.ZonedDateTime
	| Temporal.Instant;

export interface AppDateFormatOptions {
	year?: "numeric" | "2-digit";
	month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
	day?: "numeric" | "2-digit";
}

/** Backwards-compatible alias for {@link AppDateFormatOptions}. */
export type DateFormatOptions = AppDateFormatOptions;

/** Contract of the dates facade. */
export interface DatesServiceTypes {
	useDiff(start: string | Temporal.PlainDate, end: string | Temporal.PlainDate): string;
	useFormat(dateInput: TemporalInput, locale?: Locale, options?: Intl.DateTimeFormatOptions): string;
	useNow(): string;
	useNowDateTime(): string;
	useAddDays(date: string | Temporal.PlainDate, days: number): string;
	useSubtractDays(date: string | Temporal.PlainDate, days: number): string;
	useIsEqual(date1: string | Temporal.PlainDate, date2: string | Temporal.PlainDate): boolean;
	useIsBefore(date1: string | Temporal.PlainDate, date2: string | Temporal.PlainDate): boolean;
	useIsAfter(date1: string | Temporal.PlainDate, date2: string | Temporal.PlainDate): boolean;
	useFirstDayOfMonth(date?: string | Temporal.PlainDate): string;
	useLastDayOfMonth(date?: string | Temporal.PlainDate): string;
}

/* -------------------------------------------------------------------------- */
/* HTTP / Fetch                                                               */
/* -------------------------------------------------------------------------- */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export type PathParams = Record<string, string | number>;

export interface UrlOptions {
	params?: PathParams;
	query?: QueryParams;
	ignoreDefaultQuery?: boolean;
}

export interface ApiEntry {
	baseUri: string | URL;
	endpoints: Record<string, string>;
	defaultQueryParams?: Record<string, QueryParams>;
}

export type ApisConfig = Record<string, ApiEntry>;

/** Options passed when executing a fetch request. */
export interface FetchOptions extends RequestInit {
	urlOptions?: UrlOptions;
}

/** Structure of the safe error returned on non-2xx or network failures. */
export interface ApiError {
	message: string;
	status: number;
	details?: unknown;
}

/**
 * Safe result, discriminated union (Astro Actions style) without throwing.
 * The `ok` flag narrows the union between the success and error branches.
 */
export type FetchResult<T = unknown> =
	| {
			data: T;
			error: null;
			url: string;
			status: number;
			ok: true;
	  }
	| {
			data: null;
			error: ApiError;
			url: string;
			status: number;
			ok: false;
	  };

/** Contract of the fetch facade. */
export interface IFetchApiManager {
	useInit(apis: ApisConfig): void;
	useInitApis(apis: ApisConfig): void;
	useGetApis(): ApisConfig;
	useGetApisConfig(): ApisConfig;
	useBuildUrl(apiName: string, endpointName: string, options?: UrlOptions): string;
	useBuildApiUrl(apiName: string, endpointName: string, options?: UrlOptions): string;
	useFetch<T = unknown>(
		apiName: string,
		endpointName: string,
		options?: FetchOptions,
	): Promise<FetchResult<T>>;
	useFetchApi<T = unknown>(
		apiName: string,
		endpointName: string,
		options?: FetchOptions,
	): Promise<FetchResult<T>>;
	useGet<T = unknown>(
		apiName: string,
		endpointName: string,
		urlOptions?: UrlOptions,
	): Promise<FetchResult<T>>;
	useGetApi<T = unknown>(
		apiName: string,
		endpointName: string,
		urlOptions?: UrlOptions,
	): Promise<FetchResult<T>>;
	usePost<T = unknown>(
		apiName: string,
		endpointName: string,
		body?: unknown,
		urlOptions?: UrlOptions,
	): Promise<FetchResult<T>>;
	usePut<T = unknown>(
		apiName: string,
		endpointName: string,
		body?: unknown,
		urlOptions?: UrlOptions,
	): Promise<FetchResult<T>>;
	usePatch<T = unknown>(
		apiName: string,
		endpointName: string,
		body?: unknown,
		urlOptions?: UrlOptions,
	): Promise<FetchResult<T>>;
	useDelete<T = unknown>(
		apiName: string,
		endpointName: string,
		urlOptions?: UrlOptions,
	): Promise<FetchResult<T>>;
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

/** Serialized error shape. */
export interface ISerializedError {
	message: string;
	code: number;
}

/** Contract of the error factory. */
// export interface IErrorFactory {
// 	useBadRequest(message?: string): AppError;
// 	useUnauthorized(message?: string): AppError;
// 	useForbidden(message?: string): AppError;
// 	useNotFound(message?: string): AppError;
// 	useInternal(message?: string): AppError;
// 	useCustom(message: string, code: number): AppError;
// }

/* -------------------------------------------------------------------------- */
/* Formatter / Converter                                                      */
/* -------------------------------------------------------------------------- */

/** Contract of the formatter facade. */
export interface IFormatterService {
	useCapitalize(text: string, locale?: Locale): string;
	useFormatCurrency(options: CurrencyFormatOptions): string;
	useFormatNumber(value: number, locale?: Locale, digits?: number): string;
	useJsonParse<T = unknown>(json: string): T;
	useJsonStringify(data: unknown): string;
	useLowerCase(text: string, locale?: Locale): string;
	useUpperCase(text: string, locale?: Locale): string;
}

/** Contract of the unit converter facade. */
export interface IConverterService {
	useToCelsius(fahrenheit: number, locale?: Locale, digits?: number): string;
	useToFahrenheit(celsius: number, locale?: Locale, digits?: number): string;
	useToKilometers(miles: number, locale?: Locale, digits?: number): string;
	useToMiles(km: number, locale?: Locale, digits?: number): string;
	useToInches(cm: number, locale?: Locale, digits?: number): string;
	useToCm(inches: number, locale?: Locale, digits?: number): string;
	useToKilos(pounds: number, locale?: Locale, digits?: number): string;
	useToPounds(kilos: number, locale?: Locale, digits?: number): string;
}

/* -------------------------------------------------------------------------- */
/* Generator                                                                  */
/* -------------------------------------------------------------------------- */

/** Contract for a crypto strategy. */
export interface ICryptoStrategy {
	useHash(plainText: string, salt?: string): Promise<string>;
	/** @deprecated Use {@link useHash}. */
	useEncrypt(plainText: string, salt?: string): Promise<string>;
}

/** Contract for a UUID strategy. */
export interface IUuidStrategy {
	useGenerate(): string;
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

/** Options for number formatting in geometry calculations. */
export interface GeometryFormatOptions {
	locale?: string;
	digits?: number;
	unit?: string;
}

/* -------------------------------------------------------------------------- */
/* Reactive                                                                   */
/* -------------------------------------------------------------------------- */

export type SignalListener<T> = (newValue: T, oldValue: T) => void;

export interface Subscribable<T> {
	useSubscribe: (listener: SignalListener<T>) => () => void;
}

export interface SignalGetter<T> extends Subscribable<T> {
	(): T;
}

export type SignalSetter<T> = (newValue: T | ((prev: T) => T)) => void;

export interface ToggleSignalSetter {
	useSet: (value: boolean) => void;
	useToggle: () => void;
}

/** Contract of the reactive facade. */
export interface IReactiveService {
	useCreateSignal<T>(initialValue: T): [SignalGetter<T>, SignalSetter<T>];
	useCreateEffect(callback: () => void | (() => void), signals: Subscribable<unknown>[]): () => void;
	useCreateMemo<T>(computation: () => T, signals: Subscribable<unknown>[]): SignalGetter<T>;
	useCreateToggle(initialValue?: boolean): [SignalGetter<boolean>, ToggleSignalSetter];
	useCreateStorageSignal<T>(
		key: string,
		fallbackValue: T,
		target?: StorageTarget,
	): [SignalGetter<T>, SignalSetter<T>];
	useCreateDebouncedSignal<T>(
		initialValue: T,
		delayMs?: number,
	): [SignalGetter<T>, SignalSetter<T> & { useCancel: () => void }];
	useCreateBatch(): (callback: () => void) => void;
}

/* -------------------------------------------------------------------------- */
/* Timing                                                                     */
/* -------------------------------------------------------------------------- */

/** Control object returned by timeout operations. */
export interface TimeoutControl<T> {
	promise: Promise<T>;
	cancel: () => void;
}

/** Control object returned by interval operations. */
export interface IntervalControl {
	pause: () => void;
	resume: () => void;
	stop: () => void;
	isRunning: () => boolean;
}

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

/** Contract of the data utilities. */
export interface IDataUtils {
	useUnique<T>(array: T[]): T[];
	useChunk<T>(array: T[], size: number): T[][];
	useGroupBy<T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]>;
	useIsObject(item: unknown): item is Record<string, unknown>;
	useDeepClone<T>(value: T): T;
	useDeepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T;
	usePick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
	useOmit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
}

/** Contract of the system utilities. */
export interface ISystemUtils {
	useSleep(ms: number): Promise<void>;
	useRetry<T>(fn: () => Promise<T>, retries?: number, delayMs?: number): Promise<T>;
	useCopyToClipboard(text: string): Promise<boolean>;
	useGetUrlParams(urlString: string): Record<string, string>;
	useRound(value: string | number, decimals?: number): number;
	useAverage(numbers: number[]): number;
}

/** Contract of the app utilities facade. */
export interface IAppUtils {
	readonly data: IDataUtils;
	readonly system: ISystemUtils;
}

/* -------------------------------------------------------------------------- */
/* Viewport                                                                   */
/* -------------------------------------------------------------------------- */

/** Represents viewport dimensions. */
export interface ViewportSize {
	width: number;
	height: number;
}

/** Represents scroll position. */
export interface ScrollPosition {
	x: number;
	y: number;
}

/** Options for scrolling operations. */
export interface ScrollOptions {
	behavior?: ScrollBehavior;
	block?: ScrollLogicalPosition;
	inline?: ScrollLogicalPosition;
}

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/* -------------------------------------------------------------------------- */

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeOptions {
	defaultMode?: ThemeMode;
	storageKey?: string;
	attribute?: string;
	target?: HTMLElement;
	onChange?: (mode: ThemeMode, resolved: "light" | "dark") => void;
}

/** Contract of the theme facade. */
export interface IThemeService {
	useInitTheme(options?: ThemeOptions): void;
	useSetThemeMode(mode: ThemeMode): void;
	useGetThemeMode(): ThemeMode;
	useGetResolved(): "light" | "dark";
	usePrefersColorScheme(): boolean;
	useToggleTheme(): void;
	useResetTheme(): void;
	useDestroyTheme(): void;
}

/* -------------------------------------------------------------------------- */
/* Astro                                                                      */
/* -------------------------------------------------------------------------- */

/** Minimal shape of an Astro content collection entry. */
export interface CollectionEntryLike<TData = unknown> {
	id: string;
	slug?: string;
	data?: TData;
	[key: string]: unknown;
}

export interface PathsOptions<T, TParam extends string = string, TProps = T> {
	param?: TParam;
	valueFrom?: (item: T) => string | number;
	propsFrom?: (item: T) => TProps;
	paramsFrom?: (item: T) => Record<string, string>;
}

export interface AstroPath<TParam extends string = string, TProps = unknown> {
	params: Record<TParam, string | undefined>;
	props: TProps;
}

export interface PaginationProps<T> {
	items: T[];
	currentPage: number;
	totalPages: number;
}

export interface AstroServiceError {
	message: string;
	collectionName?: string;
	details?: unknown;
}

/** Safe Result (discriminated union without throwing). */
export type AstroServiceResult<T> =
	| { data: T; error: null; ok: true }
	| { data: null; error: AstroServiceError; ok: false };

/** Contract of the Astro facade. */
export interface IAstroService {
	usePathsFrom<T, TParam extends string = "slug", TProps = T>(
		items: T[],
		options?: PathsOptions<T, TParam, TProps>,
	): AstroPath<TParam, TProps>[];
	useGetStaticPaths<
		TData = unknown,
		TParam extends string = "slug",
		TProps = CollectionEntryLike<TData>,
	>(
		getCollectionFn: (collection: string) => Promise<CollectionEntryLike<TData>[]>,
		collectionName: string,
		options?: PathsOptions<CollectionEntryLike<TData>, TParam, TProps>,
	): Promise<AstroServiceResult<AstroPath<TParam, TProps>[]>>;
	useFindEntry<T>(items: T[], value: string, keyFrom?: (item: T) => string | number): T | null;
	useGeneratePagination<T, TParam extends string = "page">(
		items: T[],
		pageSize?: number,
		param?: TParam,
	): AstroPath<TParam, PaginationProps<T>>[];
	usePathsFromValues<TParam extends string = "slug">(
		values: (string | number)[],
		param?: TParam,
	): AstroPath<TParam, string | number>[];
	useExtractUniqueValues<T, V>(items: T[], keyFrom: (item: T) => V | V[]): V[];
}

/* -------------------------------------------------------------------------- */
/* RSS                                                                        */
/* -------------------------------------------------------------------------- */

/** A single item in an RSS feed. */
export interface RssItem {
	/** Title of the item. */
	title: string;
	/** Publication date (Date object or ISO string). */
	pubDate: Date | string;
	/** URL of the item (relative to site, e.g. "/blog/my-post/"). */
	link: string;
	/** Optional description or excerpt. */
	description?: string;
	/** Optional full content (HTML allowed). */
	content?: string;
	/** Optional categories/tags. */
	categories?: string[];
	/** Optional author name. */
	author?: string;
	/** Optional custom data (e.g. enclosure for podcasts). */
	customData?: string;
}

/** Configuration for generating an RSS feed. */
export interface RssConfig {
	/** Title of the feed (e.g. "My Blog"). */
	title: string;
	/** Description of the feed. */
	description: string;
	/** Base URL of the site (e.g. "https://example.com"). */
	site: string;
	/** Feed items. */
	items: RssItem[];
	/** Output path (default: "/rss.xml"). */
	xmlPath?: string;
	/** Language code (default: "en"). */
	language?: string;
	/** Custom XML to inject into the `<channel>` element. */
	customData?: string;
	/** XSL stylesheet URL for browser rendering (optional). */
	xslUrl?: string;
	/** Whether to include the `<lastBuildDate>` (default: true). */
	lastBuildDate?: boolean;
	/** Trailing slash behavior for item links (default: true). */
	trailingSlash?: boolean;
}

/** Result of an RSS generation attempt. */
export type RssResult =
	| { data: string; error: null; ok: true }
	| { data: null; error: { message: string; details?: unknown }; ok: false };

/** Contract of the RSS facade. */
export interface IRssService {
	/** Generates the RSS XML string from a config. */
	useGenerateRss(config: RssConfig): RssResult;
	/** Generates an HTML `<link>` tag for the RSS feed. */
	useRssLinkTag(config: Pick<RssConfig, "title" | "xmlPath">): string;
	/** Generates an Astro GET endpoint handler for the RSS feed. */
	useCreateRssEndpoint(
		config: Omit<RssConfig, "items"> & { items: RssItem[] | (() => RssItem[] | Promise<RssItem[]>) },
	): (context: { site?: URL | string }) => Promise<Response>;
	/** Convenience: creates an RSS endpoint from a SiteConfig. */
	useCreateRssEndpointFromConfig(
		siteConfig: import("../config/site.config.js").SiteConfig,
		items: RssItem[] | (() => RssItem[] | Promise<RssItem[]>),
	): (context: { site?: URL | string }) => Promise<Response>;
}

/* -------------------------------------------------------------------------- */
/* AI / Agent                                                                  */
/* -------------------------------------------------------------------------- */

/** Role of a chat message in the OpenAI-compatible protocol. */
export type AiRole = "system" | "user" | "assistant" | "tool";

/** Function invocation requested by the model when using tools. */
export interface AiFunctionCall {
	name: string;
	arguments: string;
}

/** A single tool call emitted by the model (OpenAI-compatible wire shape). */
export interface AiToolCall {
	id: string;
	type: "function";
	function: AiFunctionCall;
}

/**
 * A chat message. `tool_calls` and `tool_call_id` use snake_case on purpose:
 * they mirror the OpenAI-compatible protocol so messages pass through unchanged.
 */
export interface AiMessage {
	role: AiRole;
	content: string | null;
	tool_calls?: AiToolCall[];
	tool_call_id?: string;
	name?: string;
}

/** Provider configuration for an OpenAI-compatible chat/agent endpoint. */
export interface AiProviderConfig {
	apiKey: string;
	baseUrl: string;
	model: string;
	/** Default system prompt. Falls back to {@link KITT_SYSTEM_PROMPT}. */
	systemPrompt?: string;
}

/** Options for a single chat completion. */
export interface AiChatOptions {
	temperature?: number;
	maxTokens?: number;
	topP?: number;
	signal?: AbortSignal;
	/** Overrides the provider `systemPrompt` for this request. */
	systemPrompt?: string;
}

/** Safe error returned on non-2xx or network failures. */
export interface AiError {
	message: string;
	status: number;
	details?: unknown;
}

/** Safe result (discriminated union) without throwing. */
export type AiResult<T = string> =
	| { data: T; error: null; ok: true }
	| { data: null; error: AiError; ok: false };

/**
 * A tool the agent can invoke. `parameters` is a JSON Schema object
 * describing the expected input.
 */
export interface AiTool {
	name: string;
	description: string;
	parameters: Record<string, unknown>;
	execute(input: unknown): unknown | Promise<unknown>;
}

/** One round of tool execution inside the agent loop. */
export interface AgentStep {
	toolCalls: AiToolCall[];
	toolResults: unknown[];
}

/** Payload returned by a successful {@link useRunAgent} call. */
export interface AgentData {
	finalMessage: string;
	steps: AgentStep[];
}

/** Safe result of an agent run. */
export type AgentResult = AiResult<AgentData>;

/** Options for running the tool-calling agent loop. */
export interface AgentRunOptions extends AiChatOptions {
	tools?: AiTool[];
	maxSteps?: number;
	/** Prior conversation (system messages are ignored; a system prompt is prepended). */
	history?: AiMessage[];
}

/** Contract of the AI/agent facade. */
export interface IAiService {
	useInitAgent(config: Partial<AiProviderConfig>): void;
	useChat(messages: AiMessage[], options?: AiChatOptions): Promise<AiResult<string>>;
	useRunAgent(goal: string, options?: AgentRunOptions): Promise<AgentResult>;
}

/** Persistence contract for assistant conversations. */
export interface ConversationStore {
	useCreate(channel?: string): Promise<string>;
	useExists(sessionId: string): Promise<boolean>;
	useAppend(sessionId: string, message: AiMessage): Promise<void>;
	useGetHistory(sessionId: string): Promise<AiMessage[]>;
	useReset(sessionId: string): Promise<void>;
}

/** Configuration for the assistant facade. */
export interface AssistantInitConfig extends Partial<AiProviderConfig> {
	store?: ConversationStore;
	tools?: AiTool[];
	maxSteps?: number;
}

/** Options for a single assistant reply. */
export interface AssistantReplyOptions extends AiChatOptions {
	tools?: AiTool[];
	maxSteps?: number;
}

/** Payload returned by a successful assistant reply. */
export interface AssistantReply {
	reply: string;
	sessionId: string;
}

/** Safe result of an assistant reply. */
export type AssistantResult = AiResult<AssistantReply>;

/** Contract of the assistant facade. */
export interface IAssistantService {
	useInitAssistant(config?: AssistantInitConfig): void;
	useReply(
		sessionId: string | undefined,
		text: string,
		options?: AssistantReplyOptions,
	): Promise<AssistantResult>;
	useCreateSession(channel?: string): Promise<string>;
	useSessionExists(sessionId: string): Promise<boolean>;
	useGetHistory(sessionId: string): Promise<AiMessage[]>;
	useResetSession(sessionId: string): Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* Express                                                                     */
/* -------------------------------------------------------------------------- */

export type ProductType = {
	id: number;
	name: string;
	price: number;
};
