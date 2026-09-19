// ============================================================
// DOM facade — standalone functions with SSR-safe guards.
// ============================================================

/**
 * Resolves a target to an Element, accepting either a string selector or an element reference.
 *
 * @param target - A CSS selector string or an Element instance.
 * @returns The resolved Element, or `null` if not found.
 */
function resolve<T extends Element = HTMLElement>(target: T | string): T | null {
	return typeof target === "string" ? useQuerySelector<T>(target) : target;
}

/**
 * Checks whether the code is running in a browser environment.
 *
 * @returns `true` if both `window` and `document` are defined.
 *
 * @example
 * ```ts
 * if (useIsBrowser()) {
 *   // safe to access DOM APIs
 * }
 * ```
 */
export const useIsBrowser = (): boolean =>
	typeof window !== "undefined" && typeof document !== "undefined";

/**
 * Returns the root `<html>` element, or `null` outside a browser.
 *
 * @returns The `document.documentElement` element.
 *
 * @example
 * ```ts
 * const root = useGetRoot();
 * root?.setAttribute("lang", "en");
 * ```
 */
export const useGetRoot = (): HTMLElement | null => {
	if (!useIsBrowser()) return null;
	return document.documentElement;
};

/**
 * Returns the `<body>` element, or `null` outside a browser.
 *
 * @returns The `document.body` element cast as `HTMLBodyElement`.
 *
 * @example
 * ```ts
 * const body = useGetBody();
 * body?.classList.add("loaded");
 * ```
 */
export const useGetBody = (): HTMLBodyElement | null => {
	if (!useIsBrowser()) return null;
	return document.body as HTMLBodyElement | null;
};

/**
 * Finds an element by its `id` attribute.
 *
 * @typeParam T - The expected HTMLElement subtype.
 * @param id - The element id (without `#`).
 * @returns The matching element, or `null`.
 *
 * @example
 * ```ts
 * const btn = useGetElementById<HTMLButtonElement>("submit-btn");
 * ```
 */
export const useGetElementById = <T extends HTMLElement = HTMLElement>(id: string): T | null => {
	if (!useIsBrowser()) return null;
	return document.getElementById(id) as T | null;
};

/**
 * Finds the first element matching a class name.
 *
 * @typeParam T - The expected HTMLElement subtype.
 * @param className - A class name, with or without a leading `.`.
 * @returns The matching element, or `null`.
 *
 * @example
 * ```ts
 * const card = useGetElementByClass(".card");
 * const card2 = useGetElementByClass("card"); // equivalent
 * ```
 */
export const useGetElementByClass = <T extends HTMLElement = HTMLElement>(
	className: string,
): T | null => {
	if (!useIsBrowser()) return null;
	const formattedSelector = className.startsWith(".") ? className : `.${className}`;
	return document.querySelector<T>(formattedSelector);
};

/**
 * Returns the first element matching a CSS selector.
 *
 * @typeParam E - The expected Element subtype.
 * @param selector - A CSS selector string.
 * @returns The matching element, or `null`.
 *
 * @example
 * ```ts
 * const el = useQuerySelector<HTMLElement>(".my-class");
 * ```
 */
export const useQuerySelector: {
	<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
	<E extends Element = HTMLElement>(selector: string): E | null;
} = <E extends Element = HTMLElement>(selector: string): E | null => {
	if (!useIsBrowser()) return null;
	return document.querySelector<E>(selector);
};

/**
 * Returns all elements matching a CSS selector.
 *
 * @typeParam E - The expected Element subtype.
 * @param selector - A CSS selector string.
 * @returns An array of matching elements.
 *
 * @example
 * ```ts
 * const items = useQuerySelectorAll<HTMLLIElement>("li.item");
 * items.forEach(el => console.log(el.textContent));
 * ```
 */
export const useQuerySelectorAll: {
	<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K][];
	<E extends Element = HTMLElement>(selector: string): E[];
} = <E extends Element = HTMLElement>(selector: string): E[] => {
	if (!useIsBrowser()) return [];
	return Array.from(document.querySelectorAll<E>(selector));
};

/**
 * Adds one or more CSS classes to the target element.
 *
 * @param target - A CSS selector string or an Element instance.
 * @param className - The class name to add.
 *
 * @example
 * ```ts
 * useAddClass("#header", "sticky");
 * useAddClass(myElement, "visible");
 * ```
 */
export const useAddClass = (target: Element | string, className: string): void => {
	resolve(target)?.classList.add(className);
};

/**
 * Removes CSS class(es) from the target element.
 *
 * @param target - A CSS selector string or an Element instance.
 * @param className - A single class name or an array of class names to remove.
 *
 * @example
 * ```ts
 * useRemoveClass("#header", "sticky");
 * useRemoveClass(myElement, ["visible", "active"]);
 * ```
 */
export const useRemoveClass = (target: Element | string, className: string | string[]): void => {
	const el = resolve(target);
	if (!el) return;
	if (Array.isArray(className)) {
		el.classList.remove(...className);
	} else {
		el.classList.remove(className);
	}
};

/**
 * Toggles a CSS class on the target element.
 *
 * @param target - A CSS selector string or an Element instance.
 * @param className - The class name to toggle.
 * @param force - If provided, forces the class on (`true`) or off (`false`).
 * @returns `true` if the class is now present, `false` if removed, or `undefined` if element not found.
 *
 * @example
 * ```ts
 * useToggleClass(".sidebar", "open");
 * useToggleClass(".sidebar", "hidden", false);
 * ```
 */
export const useToggleClass = (
	target: Element | string,
	className: string,
	force?: boolean,
): boolean | undefined => {
	return resolve(target)?.classList.toggle(className, force);
};

/**
 * Checks whether the target element has a given CSS class.
 *
 * @param target - A CSS selector string or an Element instance.
 * @param className - The class name to check.
 * @returns `true` if the class exists, `false` otherwise.
 *
 * @example
 * ```ts
 * if (useHasClass(".btn", "disabled")) {
 *   // button is disabled
 * }
 * ```
 */
export const useHasClass = (target: Element | string, className: string): boolean => {
	return resolve(target)?.classList.contains(className) ?? false;
};

/**
 * Gets the value of an attribute from the target element.
 *
 * @param target - A CSS selector string or an Element instance.
 * @param attr - The attribute name.
 * @returns The attribute value, or `null` if not present or element not found.
 *
 * @example
 * ```ts
 * const href = useGetAttribute("a.link", "href");
 * ```
 */
export const useGetAttribute = (target: Element | string, attr: string): string | null => {
	return resolve(target)?.getAttribute(attr) ?? null;
};

/**
 * Sets an attribute on the target element with XSS protection.
 * Blocks event-handler attributes (`on*`) and `javascript:` URLs.
 *
 * @param target - A CSS selector string or an Element instance.
 * @param attr - The attribute name.
 * @param value - The value to set.
 * @throws {Error} If the attribute is an event handler or contains a `javascript:` URL.
 *
 * @example
 * ```ts
 * useSetAttribute("img.hero", "src", "/photo.jpg");
 * useSetAttribute("a.link", "href", "https://example.com");
 * ```
 */
export const useSetAttribute = (target: Element | string, attr: string, value: string): void => {
	// Block event-handler attributes to prevent XSS.
	if (/^on/i.test(attr)) {
		throw new Error(`[DomService] Attribute "${attr}" is not allowed. Use useOn() for events.`);
	}

	const normalizedAttr = attr.toLowerCase();
	const urlLikeAttrs = new Set(["href", "src", "xlink:href", "action", "formaction"]);
	if (urlLikeAttrs.has(normalizedAttr) && /^\s*javascript:/i.test(value)) {
		throw new Error(`[DomService] javascript: URLs are not allowed in attribute "${attr}".`);
	}
	if (normalizedAttr === "srcdoc" && /(?:javascript:|<script\b)/i.test(value)) {
		throw new Error(`[DomService] Potentially unsafe srcdoc value is not allowed.`);
	}

	resolve(target)?.setAttribute(attr, value);
};

/**
 * Removes an attribute from the target element.
 *
 * @param target - A CSS selector string or an Element instance.
 * @param attr - The attribute name to remove.
 *
 * @example
 * ```ts
 * useRemoveAttribute("input", "disabled");
 * ```
 */
export const useRemoveAttribute = (target: Element | string, attr: string): void => {
	resolve(target)?.removeAttribute(attr);
};

/**
 * Gets a `data-*` attribute value from the target element.
 *
 * @param target - A CSS selector string or an HTMLElement instance.
 * @param key - The data key (without the `data-` prefix).
 * @returns The data attribute value, or `undefined`.
 *
 * @example
 * ```ts
 * const id = useGetDataAttribute("tr.row", "userId");
 * ```
 */
export const useGetDataAttribute = (
	target: HTMLElement | string,
	key: string,
): string | undefined => {
	return resolve<HTMLElement>(target)?.dataset[key];
};

/**
 * Sets a `data-*` attribute on the target element.
 *
 * @param target - A CSS selector string or an HTMLElement instance.
 * @param key - The data key (without the `data-` prefix).
 * @param value - The value to set.
 *
 * @example
 * ```ts
 * useSetDataAttribute("tr.row", "status", "active");
 * ```
 */
export const useSetDataAttribute = (
	target: HTMLElement | string,
	key: string,
	value: string,
): void => {
	const el = resolve<HTMLElement>(target);
	if (el) el.dataset[key] = value;
};

/**
 * Attaches an event listener to the target element and returns a cleanup function.
 *
 * @typeParam K - The event type key from `HTMLElementEventMap`.
 * @param target - An EventTarget instance or a CSS selector string.
 * @param event - The event name to listen for.
 * @param callback - The event handler.
 * @param options - Optional `addEventListener` options.
 * @returns A function that removes the listener, or `null` if not in a browser.
 *
 * @example
 * ```ts
 * const off = useOn("#btn", "click", (e) => console.log("clicked", e));
 * // later:
 * off?.();
 * ```
 */
export const useOn = <K extends keyof HTMLElementEventMap>(
	target: EventTarget | string,
	event: K,
	callback: (event: HTMLElementEventMap[K]) => void,
	options?: boolean | AddEventListenerOptions,
): (() => void) | null => {
	if (!useIsBrowser()) return null;
	const el = typeof target === "string" ? useQuerySelector(target) : target;
	if (!el) return null;

	const handler = callback as EventListener;
	el.addEventListener(event, handler, options);
	return () => el.removeEventListener(event, handler, options);
};

/**
 * Creates a new HTML element.
 *
 * @typeParam T - The tag name from `HTMLElementTagNameMap`.
 * @param tagName - The tag name to create.
 * @param options - Optional element creation options.
 * @returns The newly created element.
 * @throws {Error} If called outside a browser environment.
 *
 * @example
 * ```ts
 * const div = useCreateElement("div");
 * const input = useCreateElement("input", { is: "custom-input" });
 * ```
 */
export const useCreateElement = <T extends keyof HTMLElementTagNameMap>(
	tagName: T,
	options?: ElementCreationOptions,
): HTMLElementTagNameMap[T] => {
	if (!useIsBrowser()) {
		throw new Error("Cannot create elements in non-browser environment");
	}
	return document.createElement<T>(tagName, options);
};

/**
 * Sets `innerHTML` on the target element.
 *
 * **XSS risk:** this is an HTML injection sink. Never pass unsanitized
 * user input. Prefer {@link useSetText} for plain text, or sanitize with
 * a trusted library (e.g. DOMPurify) before calling this function.
 *
 * @param target - A CSS selector string or an Element instance.
 * @param html - The HTML string to set.
 *
 * @example
 * ```ts
 * // Safe — trusted static markup
 * useSetHtml("#banner", "<strong>Hello</strong>");
 *
 * // Unsafe — do NOT do this with user content
 * // useSetHtml("#out", userInput);
 * ```
 */
export const useSetHtml = (target: Element | string, html: string): void => {
	const el = resolve(target);
	if (el) el.innerHTML = html ?? "";
};

/**
 * Sets the `textContent` of the target element (safe for user input).
 *
 * @param target - A CSS selector string or an Element instance.
 * @param text - The plain text to set.
 *
 * @example
 * ```ts
 * useSetText("#greeting", "Hello, world!");
 * ```
 */
export const useSetText = (target: Element | string, text: string): void => {
	const el = resolve(target);
	if (el) el.textContent = text;
};

/**
 * Appends a child element to the target parent.
 *
 * @param target - A CSS selector string or an Element instance (the parent).
 * @param child - A CSS selector string or an Element instance (the child).
 *
 * @example
 * ```ts
 * const item = useCreateElement("li");
 * useSetText(item, "New item");
 * useAppend("ul.list", item);
 * ```
 */
export const useAppend = (target: Element | string, child: Element | string): void => {
	const parent = resolve(target);
	const childEl = resolve(child);
	if (parent && childEl) parent.appendChild(childEl);
};

/**
 * Removes the target element from the DOM.
 *
 * @param target - A CSS selector string or an Element instance.
 *
 * @example
 * ```ts
 * useRemove(".modal-overlay");
 * ```
 */
export const useRemove = (target: Element | string): void => {
	resolve(target)?.remove();
};
