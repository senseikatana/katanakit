import type { Temporal } from "@js-temporal/polyfill";
import type {
	WatchCallback as VueWatchCallback,
	WatchOptions as VueWatchOptions,
	WatchSource as VueWatchSource,
	WatchStopHandle as VueWatchStopHandle,
} from "vue";

/* -------------------------------------------------------------------------- */
/* Logging                                                                    */
/* -------------------------------------------------------------------------- */

/** Native console methods used as log levels. */
export type LogLevel = "log" | "warn" | "error";

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
	{ data: T; error: null; ok: true } | { data: null; error: AstroServiceError; ok: false };

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
	{ data: T; error: null; ok: true } | { data: null; error: AiError; ok: false };

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
/* Access control (roles & capabilities)                                       */
/* -------------------------------------------------------------------------- */

/**
 * Built-in roles, ordered from most to least privileged.
 *
 * - `owner` — the site owner; the only role that can manage roles and perform
 *   system-level operations. There should be exactly one owner.
 * - `admin` — day-to-day administration: manage members and moderate anything.
 * - `editor` — publish and manage any content.
 * - `author` — create and manage only their own content.
 * - `member` — registered account; can use the assistant and read content.
 * - `guest` — anonymous default; read-only, never persisted.
 */
export type AccessRole = "owner" | "admin" | "editor" | "author" | "member" | "guest";

/**
 * Namespaced capabilities derived from the project domain.
 * Format: `<domain>:<action>[:<scope>]`.
 */
export type AccessCapability =
	| "content:create"
	| "content:publish"
	| "content:edit:own"
	| "content:edit:any"
	| "content:delete:own"
	| "content:delete:any"
	| "conversations:use"
	| "conversations:moderate"
	| "members:manage"
	| "roles:assign"
	| "system:admin";

/** A role definition: slug, human label and the capabilities it grants. */
export interface AccessRoleDefinition {
	slug: AccessRole;
	label: string;
	capabilities: AccessCapability[];
}

/**
 * Structural subject for access checks. Decoupled from the persistence layer:
 * any object with an id and a role list can be checked (e.g. a Prisma
 * `Account` row, a JWT payload, or a test fixture).
 */
export interface AccessSubject {
	id: string | number;
	roles: AccessRole[];
}

/** Contract of the access-control facade. Pure, no I/O. */
export interface IAccessService {
	useCan(subject: AccessSubject, capability: AccessCapability): boolean;
	useHasRole(subject: AccessSubject, role: AccessRole): boolean;
	useCapabilitiesFor(role: AccessRole): AccessCapability[];
	useRegisterRole(definition: AccessRoleDefinition): void;
	useRoles(): AccessRoleDefinition[];
}

/* -------------------------------------------------------------------------- */
/* Watch (generic reactive watcher — native Vue props)                         */
/* -------------------------------------------------------------------------- */

/**
 * Watch source taken from the native Vue `watch` (`ref`, reactive object,
 * getter function or array of those).
 */
export type WatchSource<T = unknown> = VueWatchSource<T>;

/**
 * Watch callback taken from the native Vue `watch`. Any internal function
 * is accepted: sync or async, with `(newValue, oldValue)` args or with no
 * args at all (e.g. `() => checkValidations()`).
 */
export type WatchCallback<V = unknown, OV = unknown> = VueWatchCallback<V, OV>;

/**
 * Watch options taken from the native Vue `watch`. `deep` defaults to
 * `true` in `useKatanaWatch`.
 */
export type WatchOptions = VueWatchOptions;

/** Stop function taken from the native Vue `watch`. */
export type WatchStopHandle = VueWatchStopHandle;

/* -------------------------------------------------------------------------- */
/* Validation (schema-agnostic)                                                */
/* -------------------------------------------------------------------------- */

/** A single field-level validation message keyed by field name. */
export type FieldErrors = Record<string, string>;

/** Minimal Zod-like issue shape (`error.issues` entries). */
export interface ValidationIssue {
	path: (string | number)[];
	message: string;
}

/** Minimal Zod-like success/failure result (`schema.safeParse`). */
export type ValidationParseResult<T> =
	{ success: true; data: T } | { success: false; error: { issues: ValidationIssue[] } };

/**
 * Schema-agnostic contract. Accepts Zod (`safeParse`), Valibot
 * (`safeParse`), Standard Schema (`~standard.validate`), Yup
 * (`validateSync`) or any object exposing one of those members.
 */
export interface ValidationSchema<T = unknown> {
	safeParse?: (data: unknown) => ValidationParseResult<T>;
	"~standard"?: {
		validate: (
			data: unknown,
		) => { issues?: ValidationIssue[] } | Promise<{ issues?: ValidationIssue[] }>;
	};
	validateSync?: (data: unknown) => unknown;
	validate?: (data: unknown) => unknown | Promise<unknown>;
}

/* -------------------------------------------------------------------------- */
/* Express                                                                     */
/* -------------------------------------------------------------------------- */

export type ProductType = {
	id: number;
	name: string;
	price: number;
};

/* -------------------------------------------------------------------------- */
/* Notion API                                                                 */
/* -------------------------------------------------------------------------- */

/** Configuration for the Notion API integration. */
export interface NotionConfig {
	/** Notion integration token (starts with "ntn_" or "secret_"). */
	token: string;
	/** API version header (default: "2022-06-28"). */
	apiVersion?: string;
	/** Custom base URL (default: "https://api.notion.com/v1"). */
	apiBaseUrl?: string;
}

/** Rich text object used in Notion blocks and properties. */
export interface NotionRichText {
	type: "text";
	text: { content: string; link?: { url: string } | null };
	annotations?: {
		bold?: boolean;
		italic?: boolean;
		strikethrough?: boolean;
		underline?: boolean;
		code?: boolean;
		color?: string;
	};
	plain_text?: string;
	href?: string | null;
}

/** A Notion page object. */
export interface NotionPage {
	object: "page";
	id: string;
	created_time: string;
	last_edited_time: string;
	created_by: { object: "user"; id: string };
	last_edited_by: { object: "user"; id: string };
	parent: NotionParent;
	archived: boolean;
	url: string;
	properties: Record<string, NotionProperty>;
	icon?: NotionIcon | null;
	cover?: NotionCover | null;
}

/** Parent reference for pages and databases. */
export type NotionParent =
	| { type: "database_id"; database_id: string }
	| { type: "page_id"; page_id: string }
	| { type: "workspace"; workspace: true };

/** Property value on a Notion page. */
export interface NotionProperty {
	id?: string;
	type: string;
	title?: NotionRichText[];
	rich_text?: NotionRichText[];
	number?: number;
	select?: { id: string; name: string; color?: string } | null;
	multi_select?: Array<{ id: string; name: string; color?: string }>;
	date?: { start: string; end?: string | null } | null;
	checkbox?: boolean;
	url?: string | null;
	email?: string | null;
	phone_number?: string | null;
	formula?: { type: string; string?: string; number?: number; boolean?: boolean };
	relation?: Array<{ id: string }>;
	rollup?: { type: string; number?: number };
	status?: { id: string; name: string; color?: string } | null;
	[key: string]: unknown;
}

/** Icon on a page or database (emoji or file). */
export type NotionIcon = { type: "emoji"; emoji: string } | { type: "file"; file: { url: string } };

/** Cover image on a page. */
export type NotionCover =
	{ type: "external"; external: { url: string } } | { type: "file"; file: { url: string } };

/** A Notion block object. */
export interface NotionBlock {
	object: "block";
	id: string;
	type: string;
	created_time?: string;
	last_edited_time?: string;
	has_children?: boolean;
	archived?: boolean;
	[key: string]: unknown;
}

/** Result of listing block children (paginated). */
export interface NotionBlockList {
	object: "list";
	results: NotionBlock[];
	has_more: boolean;
	next_cursor: string | null;
	type: "block";
	block: Record<string, unknown>;
}

/** A Notion database object. */
export interface NotionDatabase {
	object: "database";
	id: string;
	created_time: string;
	last_edited_time: string;
	title: NotionRichText[];
	description: NotionRichText[];
	parent: NotionParent;
	url: string;
	icon?: NotionIcon | null;
	cover?: NotionCover | null;
	properties: Record<string, NotionPropertySchema>;
	archived?: boolean;
}

/** Schema definition for a database property. */
export interface NotionPropertySchema {
	id?: string;
	name?: string;
	type: string;
	[key: string]: unknown;
}

/** Filter for querying a Notion database. */
export interface NotionFilter {
	and?: NotionFilter[];
	or?: NotionFilter[];
	property?: string;
	[key: string]: unknown;
}

/** Sort option for querying a Notion database. */
export interface NotionSort {
	property?: string;
	timestamp?: "created_time" | "last_edited_time";
	direction: "ascending" | "descending";
}

/** Query options for a Notion database. */
export interface NotionDatabaseQuery {
	filter?: NotionFilter;
	sorts?: NotionSort[];
	start_cursor?: string;
	page_size?: number;
}

/** Result of querying a Notion database (paginated). */
export interface NotionPageList {
	object: "list";
	results: NotionPage[];
	has_more: boolean;
	next_cursor: string | null;
	type: "page";
	page: Record<string, unknown>;
}

/** A Notion user object. */
export interface NotionUser {
	object: "user";
	id: string;
	type: "person" | "bot";
	name?: string;
	avatar_url?: string;
	person?: { email?: string };
	bot?: { owner: { type: string } };
}

/** Paginated list of Notion users. */
export interface NotionUserList {
	object: "list";
	results: NotionUser[];
	has_more: boolean;
	next_cursor: string | null;
}

/** Search query options for the Notion API. */
export interface NotionSearchQuery {
	query?: string;
	filter?: { value: "database" | "page"; property: "object" };
	sort?: { direction: "ascending" | "descending"; timestamp: "last_edited_time" };
	start_cursor?: string;
	page_size?: number;
}

/** Result of a Notion search (paginated). */
export interface NotionSearchResult {
	object: "list";
	results: Array<NotionPage | NotionDatabase>;
	has_more: boolean;
	next_cursor: string | null;
}

/** Contract of the Notion adapter facade. */
export interface INotionService {
	useInitNotion(config: NotionConfig): void;
	useNotionGetPage(pageId: string): Promise<FetchResult<NotionPage>>;
	useNotionCreatePage(
		parent: NotionParent,
		properties: Record<string, unknown>,
		children?: unknown[],
	): Promise<FetchResult<NotionPage>>;
	useNotionUpdatePage(
		pageId: string,
		properties: Record<string, unknown>,
	): Promise<FetchResult<NotionPage>>;
	useNotionArchivePage(pageId: string): Promise<FetchResult<NotionPage>>;
	useNotionGetBlock(blockId: string): Promise<FetchResult<NotionBlock>>;
	useNotionGetBlockChildren(
		blockId: string,
		options?: { start_cursor?: string; page_size?: number },
	): Promise<FetchResult<NotionBlockList>>;
	useNotionAppendBlocks(blockId: string, children: unknown[]): Promise<FetchResult<NotionBlock>>;
	useNotionUpdateBlock(
		blockId: string,
		content: Record<string, unknown>,
	): Promise<FetchResult<NotionBlock>>;
	useNotionDeleteBlock(blockId: string): Promise<FetchResult<NotionBlock>>;
	useNotionGetDatabase(databaseId: string): Promise<FetchResult<NotionDatabase>>;
	useNotionQueryDatabase(
		databaseId: string,
		query?: NotionDatabaseQuery,
	): Promise<FetchResult<NotionPageList>>;
	useNotionCreateDatabase(
		parent: NotionParent,
		title: NotionRichText[],
		properties: Record<string, NotionPropertySchema>,
	): Promise<FetchResult<NotionDatabase>>;
	useNotionUpdateDatabase(
		databaseId: string,
		title: NotionRichText[],
		properties?: Record<string, NotionPropertySchema>,
	): Promise<FetchResult<NotionDatabase>>;
	useNotionGetUser(userId: string): Promise<FetchResult<NotionUser>>;
	useNotionListUsers(options?: {
		start_cursor?: string;
		page_size?: number;
	}): Promise<FetchResult<NotionUserList>>;
	useNotionSearchContent(query: NotionSearchQuery): Promise<FetchResult<NotionSearchResult>>;
	useNotionListAllBlockChildren(blockId: string): Promise<FetchResult<NotionBlock[]>>;
	useNotionListAllDatabasePages(
		databaseId: string,
		filter?: NotionFilter,
		sorts?: NotionSort[],
	): Promise<FetchResult<NotionPage[]>>;
}

/* -------------------------------------------------------------------------- */
/* WordPress REST API                                                         */
/* -------------------------------------------------------------------------- */

/** Configuration for the WordPress REST API integration. */
export interface WordPressConfig {
	/** WordPress site base URL (e.g. "https://mysite.com"). */
	baseUrl: string;
	/** Authentication credentials (choose one method). */
	auth?: WordPressAuth;
	/** Custom API namespace (default: "wp/v2"). */
	apiNamespace?: string;
}

/** Authentication methods for WordPress. */
export type WordPressAuth =
	| { type: "application-passwords"; username: string; password: string }
	| { type: "jwt"; token: string }
	| { type: "basic"; username: string; password: string }
	| { type: "nonce"; nonce: string; cookie: string };

/** Base fields shared by all WordPress entities. */
export interface WpBaseEntity {
	id: number;
	date: string;
	date_gmt: string;
	modified: string;
	modified_gmt: string;
	slug: string;
	status: string;
	link: string;
}

/** A WordPress post. */
export interface WpPost extends WpBaseEntity {
	title: { rendered: string };
	content: { rendered: string; protected: boolean };
	excerpt: { rendered: string; protected: boolean };
	author: number;
	featured_media: number;
	comment_status: string;
	ping_status: string;
	sticky: boolean;
	template: string;
	format: string;
	categories: number[];
	tags: number[];
	meta: Record<string, unknown>;
	/** ACF (Advanced Custom Fields) data. Available when using ACF plugin. */
	acf?: WpAcfFields;
	/** Embedded resources (author, featured media, terms). Available when using `_embed`. */
	_embedded?: WpEmbedded;
}

/** Payload for creating a WordPress post. */
export interface WpPostCreate {
	title: string;
	content?: string;
	excerpt?: string;
	author?: number;
	featured_media?: number;
	comment_status?: "open" | "closed";
	ping_status?: "open" | "closed";
	sticky?: boolean;
	format?: string;
	categories?: number[];
	tags?: number[];
	meta?: Record<string, unknown>;
	status?: "publish" | "future" | "draft" | "pending" | "private";
	slug?: string;
	date?: string;
	template?: string;
}

/** Payload for updating a WordPress post. */
export type WpPostUpdate = Partial<WpPostCreate>;

/** A WordPress page. */
export interface WpPage extends WpBaseEntity {
	title: { rendered: string };
	content: { rendered: string; protected: boolean };
	excerpt: { rendered: string; protected: boolean };
	author: number;
	featured_media: number;
	parent: number;
	menu_order: number;
	comment_status: string;
	ping_status: string;
	template: string;
	meta: Record<string, unknown>;
	/** ACF (Advanced Custom Fields) data. Available when using ACF plugin. */
	acf?: WpAcfFields;
	/** Embedded resources (author, featured media). Available when using `_embed`. */
	_embedded?: WpEmbedded;
}

/** Payload for creating a WordPress page. */
export interface WpPageCreate {
	title: string;
	content?: string;
	excerpt?: string;
	author?: number;
	featured_media?: number;
	parent?: number;
	menu_order?: number;
	comment_status?: "open" | "closed";
	ping_status?: "open" | "closed";
	status?: "publish" | "future" | "draft" | "pending" | "private";
	slug?: string;
	date?: string;
	template?: string;
	meta?: Record<string, unknown>;
}

/** Payload for updating a WordPress page. */
export type WpPageUpdate = Partial<WpPageCreate>;

/** A WordPress media item (attachment). */
export interface WpMedia extends WpBaseEntity {
	title: { rendered: string };
	author: number;
	media_type: string;
	mime_type: string;
	media_details: {
		width?: number;
		height?: number;
		file?: string;
		/** File size in bytes. */
		filesize?: number;
		/** Image metadata from EXIF data. */
		image_meta?: {
			aperture?: string;
			credit?: string;
			camera?: string;
			caption?: string;
			created_timestamp?: string;
			copyright?: string;
			focal_length?: string;
			iso?: string;
			orientation?: string;
			shutter_speed?: string;
			title?: string;
			[key: string]: unknown;
		};
		sizes?: Record<
			string,
			{
				source_url: string;
				file: string;
				width: number;
				height: number;
				mime_type: string;
				filesize?: number;
			}
		>;
	};
	source_url: string;
	alt_text: string;
	caption: { rendered: string };
	description: { rendered: string };
	post: number | null;
	meta: Record<string, unknown>;
	/** ACF (Advanced Custom Fields) data. Available when using ACF plugin. */
	acf?: WpAcfFields;
	/** Embedded resources (author, post). Available when using `_embed`. */
	_embedded?: WpEmbedded;
}

/** Metadata for a media upload. */
export interface WpMediaMeta {
	title?: string;
	alt_text?: string;
	caption?: string;
	description?: string;
	post?: number;
	slug?: string;
}

/** Payload for updating a WordPress media item. */
export interface WpMediaUpdate extends Partial<WpMediaMeta> {
	status?: string;
}

/** A WordPress category. */
export interface WpCategory {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
	parent: number;
	meta: Record<string, unknown>;
}

/** Payload for creating a WordPress category. */
export interface WpCategoryCreate {
	name: string;
	description?: string;
	slug?: string;
	parent?: number;
	meta?: Record<string, unknown>;
}

/** Payload for updating a WordPress category. */
export type WpCategoryUpdate = Partial<WpCategoryCreate>;

/** A WordPress tag. */
export interface WpTag {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
	meta: Record<string, unknown>;
}

/** Payload for creating a WordPress tag. */
export interface WpTagCreate {
	name: string;
	description?: string;
	slug?: string;
	meta?: Record<string, unknown>;
}

/** Payload for updating a WordPress tag. */
export type WpTagUpdate = Partial<WpTagCreate>;

/** A WordPress comment. */
export interface WpComment {
	id: number;
	post: number;
	parent: number;
	author: number;
	author_name: string;
	author_email: string;
	author_url: string;
	date: string;
	date_gmt: string;
	content: { rendered: string };
	link: string;
	status: string;
	type: string;
	author_avatar_urls: Record<string, string>;
	meta: Record<string, unknown>;
}

/** Payload for creating a WordPress comment. */
export interface WpCommentCreate {
	post: number;
	parent?: number;
	content: string;
	author?: number;
	author_name?: string;
	author_email?: string;
	author_url?: string;
	status?: string;
	meta?: Record<string, unknown>;
}

/** Payload for updating a WordPress comment. */
export type WpCommentUpdate = Partial<WpCommentCreate>;

/** A WordPress user. */
export interface WpUser {
	id: number;
	username: string;
	name: string;
	first_name: string;
	last_name: string;
	email: string;
	url: string;
	description: string;
	link: string;
	locale: string;
	nickname: string;
	slug: string;
	roles: string[];
	avatar_urls: Record<string, string>;
	meta: Record<string, unknown>;
}

/** Payload for creating a WordPress user. */
export interface WpUserCreate {
	username: string;
	name?: string;
	first_name?: string;
	last_name?: string;
	email: string;
	url?: string;
	description?: string;
	locale?: string;
	nickname?: string;
	slug?: string;
	roles?: string[];
	password?: string;
	meta?: Record<string, unknown>;
}

/** Payload for updating a WordPress user. */
export type WpUserUpdate = Partial<WpUserCreate>;

/** Common query parameters for WordPress REST API list endpoints. */
export interface WpQueryParams {
	/** Current page (default: 1). */
	page?: number;
	/** Items per page (default: 10, max: 100). */
	per_page?: number;
	/** Search term. */
	search?: string;
	/** Sort order. */
	order?: "asc" | "desc";
	/** Order by field. */
	orderby?: string;
	/** Offset for pagination. */
	offset?: number;
	/** Include specific IDs. */
	include?: number[];
	/** Exclude specific IDs. */
	exclude?: number[];
	/** Filter by slug. */
	slug?: string;
	/** Filter by status. */
	status?: string | string[];
	/** Filter by author. */
	author?: number | number[];
	/** Filter by categories. */
	categories?: number | number[];
	/** Filter by tags. */
	tags?: number | number[];
	/**
	 * Limit response fields to reduce payload size.
	 * Use comma-separated field names: "id,title,link" or nested: "id,title.rendered,acf.custom_field".
	 * Reduces response size by 60-80% — essential for list views.
	 *
	 * @example
	 * ```ts
	 * useWpGetPosts({ _fields: "id,title,link,slug,date" });
	 * useWpGetPosts({ _fields: "id,title.rendered,acf.hero_image,acf.subtitle" }); // with ACF
	 * ```
	 */
	_fields?: string;
	/**
	 * Embed related resources in the response (author, featured media, terms, replies).
	 * Accepts `true` to embed all, or comma-separated resource names.
	 *
	 * @example
	 * ```ts
	 * useWpGetPosts({ _embed: true }); // embed all
	 * useWpGetPosts({ _embed: "author,wp:featuredmedia" }); // embed specific
	 * ```
	 */
	_embed?: boolean | string;
	/** Custom query params. */
	[key: string]: unknown;
}

/**
 * Container for ACF (Advanced Custom Fields) fields on a WordPress entity.
 *
 * ACF fields appear on posts, pages, media, taxonomies, users, and options.
 * Field names and types are defined by the site's ACF configuration.
 *
 * @example
 * ```ts
 * const post = await useWpGetPost(42, { _fields: "id,title,acf" });
 * if (post.ok && post.data.acf) {
 *   console.log(post.data.acf.hero_image);     // image field
 *   console.log(post.data.acf.subtitle);        // text field
 *   console.log(post.data.acf.gallery);         // gallery field (array)
 * }
 * ```
 */
export interface WpAcfFields {
	[key: string]: unknown;
}

/**
 * Embedded resources returned by WordPress when `_embed` is used.
 *
 * Contains related entities: author, featured media, terms, replies.
 * Access with `post._embedded?.["wp:featuredmedia"]?.[0]`.
 *
 * @example
 * ```ts
 * const result = await useWpGetPosts({ _embed: "author,wp:featuredmedia" });
 * if (result.ok) {
 *   for (const post of result.data) {
 *     const author = post._embedded?.author?.[0]?.name;
 *     const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
 *   }
 * }
 * ```
 */
export interface WpEmbedded {
	author?: Array<{
		id: number;
		name: string;
		url: string;
		description: string;
		link: string;
		slug: string;
		avatar_urls: Record<string, string>;
		acf?: WpAcfFields;
		[key: string]: unknown;
	}>;
	"wp:featuredmedia"?: WpMedia[];
	"wp:term"?: Array<
		Array<{
			id: number;
			name: string;
			slug: string;
			_taxonomy: string;
			link: string;
			count?: number;
			[key: string]: unknown;
		}>
	>;
	replies?: Array<
		Array<{
			id: number;
			parent: number;
			author: number;
			author_name: string;
			content: { rendered: string };
			date: string;
			[key: string]: unknown;
		}>
	>;
	[key: string]: unknown;
}

/** A batch operation for the WordPress REST API. */
export interface WpBatchOperation {
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	path: string;
	body?: Record<string, unknown>;
}

/** Result of a WordPress batch operation. */
export interface WpBatchResult {
	/** Responses for each operation in the batch. */
	responses: Array<{
		status: number;
		body: unknown;
		headers: Record<string, string>;
	}>;
}

/** Contract of the WordPress adapter facade. */
export interface IWordPressService {
	useInitWordPress(config: WordPressConfig): void;
	useWpGetPosts(options?: WpQueryParams): Promise<FetchResult<WpPost[]>>;
	useWpGetPost(id: number, options?: WpQueryParams): Promise<FetchResult<WpPost>>;
	useWpCreatePost(data: WpPostCreate): Promise<FetchResult<WpPost>>;
	useWpUpdatePost(id: number, data: WpPostUpdate): Promise<FetchResult<WpPost>>;
	useWpDeletePost(id: number, force?: boolean): Promise<FetchResult<WpPost>>;
	useWpGetPages(options?: WpQueryParams): Promise<FetchResult<WpPage[]>>;
	useWpGetPage(id: number, options?: WpQueryParams): Promise<FetchResult<WpPage>>;
	useWpCreatePage(data: WpPageCreate): Promise<FetchResult<WpPage>>;
	useWpUpdatePage(id: number, data: WpPageUpdate): Promise<FetchResult<WpPage>>;
	useWpDeletePage(id: number, force?: boolean): Promise<FetchResult<WpPage>>;
	useWpGetMedia(options?: WpQueryParams): Promise<FetchResult<WpMedia[]>>;
	useWpGetMediaItem(id: number): Promise<FetchResult<WpMedia>>;
	useWpUploadMedia(file: File | Blob | Buffer, meta?: WpMediaMeta): Promise<FetchResult<WpMedia>>;
	useWpUpdateMedia(id: number, data: WpMediaUpdate): Promise<FetchResult<WpMedia>>;
	useWpDeleteMedia(id: number, force?: boolean): Promise<FetchResult<WpMedia>>;
	useWpGetCategories(options?: WpQueryParams): Promise<FetchResult<WpCategory[]>>;
	useWpGetCategory(id: number): Promise<FetchResult<WpCategory>>;
	useWpCreateCategory(data: WpCategoryCreate): Promise<FetchResult<WpCategory>>;
	useWpUpdateCategory(id: number, data: WpCategoryUpdate): Promise<FetchResult<WpCategory>>;
	useWpDeleteCategory(id: number, force?: boolean): Promise<FetchResult<WpCategory>>;
	useWpGetTags(options?: WpQueryParams): Promise<FetchResult<WpTag[]>>;
	useWpGetTag(id: number): Promise<FetchResult<WpTag>>;
	useWpCreateTag(data: WpTagCreate): Promise<FetchResult<WpTag>>;
	useWpUpdateTag(id: number, data: WpTagUpdate): Promise<FetchResult<WpTag>>;
	useWpDeleteTag(id: number, force?: boolean): Promise<FetchResult<WpTag>>;
	useWpGetComments(options?: WpQueryParams): Promise<FetchResult<WpComment[]>>;
	useWpGetComment(id: number): Promise<FetchResult<WpComment>>;
	useWpCreateComment(data: WpCommentCreate): Promise<FetchResult<WpComment>>;
	useWpUpdateComment(id: number, data: WpCommentUpdate): Promise<FetchResult<WpComment>>;
	useWpDeleteComment(id: number, force?: boolean): Promise<FetchResult<WpComment>>;
	useWpGetUsers(options?: WpQueryParams): Promise<FetchResult<WpUser[]>>;
	useWpGetUser(id: number): Promise<FetchResult<WpUser>>;
	useWpGetCurrentUser(): Promise<FetchResult<WpUser>>;
	useWpCreateUser(data: WpUserCreate): Promise<FetchResult<WpUser>>;
	useWpUpdateUser(id: number, data: WpUserUpdate): Promise<FetchResult<WpUser>>;
	useWpDeleteUser(id: number, reassign?: number): Promise<FetchResult<WpUser>>;
	useWpGetCustomPosts(postType: string, options?: WpQueryParams): Promise<FetchResult<unknown[]>>;
	useWpGetCustomPost(
		postType: string,
		id: number,
		options?: WpQueryParams,
	): Promise<FetchResult<unknown>>;
	useWpCreateCustomPost(
		postType: string,
		data: Record<string, unknown>,
	): Promise<FetchResult<unknown>>;
	useWpUpdateCustomPost(
		postType: string,
		id: number,
		data: Record<string, unknown>,
	): Promise<FetchResult<unknown>>;
	useWpDeleteCustomPost(
		postType: string,
		id: number,
		force?: boolean,
	): Promise<FetchResult<unknown>>;
	useWpBatch(operations: WpBatchOperation[]): Promise<FetchResult<WpBatchResult>>;
	useWpListAllPosts(options?: WpQueryParams): Promise<FetchResult<WpPost[]>>;
	useWpSearchAllPosts(query: string, options?: WpQueryParams): Promise<FetchResult<WpPost[]>>;
	useWpFindPostBySlug(slug: string): Promise<FetchResult<WpPost | null>>;
}
