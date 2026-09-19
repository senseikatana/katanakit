import type { ICryptoStrategy, IUuidStrategy } from "../../types/index.js";

/**
 * Lazy Node.js `crypto` strategy for PBKDF2 hashing.
 *
 * Implemented as a plain object satisfying {@link ICryptoStrategy}.
 * Uses dynamic `import("node:crypto")` so it works in both CJS and pure ESM
 * environments without a top-level `require`.
 *
 * **NOTE:** this is a one-way hash, not encryption. Do not rely on the fixed
 * default salt for real password hashing; prefer scrypt/argon2id instead.
 */
export const LazyNodeCryptoStrategy: ICryptoStrategy = {
	/**
	 * Derives a PBKDF2-SHA512 hash asynchronously (non-blocking).
	 *
	 * @param plainText - The text to hash.
	 * @param salt - Optional hex salt. When omitted a random 16-byte salt is generated.
	 * @returns `"salt:hashHex"` — the salt and the 128-char hex digest joined by a colon.
	 *
	 * @example
	 * ```ts
	 * import { LazyNodeCryptoStrategy } from "katanakit-js";
	 *
	 * const digest = await LazyNodeCryptoStrategy.useHash("secret");
	 * // => "<32-char salt>:<128-char hex>"
	 * ```
	 */
	async useHash(plainText: string, salt?: string): Promise<string> {
		const cryptoModule = await import("node:crypto");
		// Supports both CJS and pure ESM environments.
		const cryptoInstance = cryptoModule.default ?? cryptoModule;

		const actualSalt = salt ?? cryptoInstance.randomBytes(16).toString("hex");

		const hash = await new Promise<string>((resolve, reject) => {
			cryptoInstance.pbkdf2(plainText, actualSalt, 100000, 64, "sha512", (err, derived) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(derived.toString("hex"));
			});
		});

		return `${actualSalt}:${hash}`;
	},

	/**
	 * @deprecated Use {@link LazyNodeCryptoStrategy.useHash} — this is PBKDF2 hashing, not encryption.
	 */
	async useEncrypt(plainText: string, salt?: string): Promise<string> {
		return LazyNodeCryptoStrategy.useHash(plainText, salt);
	},
};

/**
 * Native UUID strategy using `globalThis.crypto.randomUUID`, with a fallback.
 *
 * Implemented as a plain object satisfying {@link IUuidStrategy}.
 */
export const NativeUuidStrategy: IUuidStrategy = {
	/**
	 * Generates a v4 UUID string.
	 *
	 * @returns A RFC 4122 v4 UUID string.
	 *
	 * @example
	 * ```ts
	 * import { NativeUuidStrategy } from "katanakit-js";
	 *
	 * const id = NativeUuidStrategy.useGenerate();
	 * // => "3b241101-e2bb-4d7a-8615-..."
	 * ```
	 */
	useGenerate(): string {
		if (
			typeof globalThis.crypto !== "undefined" &&
			typeof globalThis.crypto.randomUUID === "function"
		) {
			return globalThis.crypto.randomUUID();
		}
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	},
};

/** Module-level auto-incrementing numeric id counter. */
let counter = 0;

/**
 * Returns the next auto-incrementing numeric id.
 *
 * @returns A monotonically increasing integer starting from `1`.
 *
 * @example
 * ```ts
 * import { useNumericId } from "katanakit-js";
 *
 * useNumericId(); // 1
 * useNumericId(); // 2
 * ```
 */
export function useNumericId(): number {
	return ++counter;
}

/**
 * Generates a RFC 4122 v4 UUID string.
 *
 * @returns A UUID string.
 *
 * @example
 * ```ts
 * import { useUuid } from "katanakit-js";
 *
 * const id = useUuid();
 * // => "3b241101-e2bb-4d7a-8615-..."
 * ```
 */
export function useUuid(): string {
	return NativeUuidStrategy.useGenerate();
}

/**
 * Converts a text string into a URL-friendly slug.
 *
 * @param text - The text to slugify. Must not be empty.
 * @returns A lower-case, hyphen-separated slug with diacritics removed.
 * @throws {Error} If `text` is empty or falsy.
 *
 * @example
 * ```ts
 * import { useSlugify } from "katanakit-js";
 *
 * useSlugify("Hello World!");      // "hello-world"
 * useSlugify("  Café au Lait  ");  // "cafe-au-lait"
 * ```
 */
export function useSlugify(text: string): string {
	if (!text) throw new Error("Text is required for slugify");

	return text
		.toString()
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

/**
 * Returns a cryptographically strong 6-digit numeric token (100000–999999).
 *
 * @returns A random 6-digit integer.
 *
 * @example
 * ```ts
 * import { useToken } from "katanakit-js";
 *
 * const code = useToken(); // e.g. 482916
 * ```
 */
export function useToken(): number {
	if (typeof globalThis.crypto?.getRandomValues === "function") {
		const buffer = new Uint32Array(1);
		globalThis.crypto.getRandomValues(buffer);
		return 100000 + (buffer[0] % 900000);
	}
	return Math.floor(100000 + Math.random() * 900000);
}

/**
 * Derives a PBKDF2-SHA512 hash of `plainText`.
 * Returns `"salt:hashHex"`. Prefer a unique salt per secret.
 *
 * @param plainText - The text to hash.
 * @param salt - Optional hex salt. When omitted a random 16-byte salt is generated.
 * @returns `"salt:hashHex"` — the salt and the 128-char hex digest joined by a colon.
 *
 * @example
 * ```ts
 * import { useHash } from "katanakit-js";
 *
 * const digest = await useHash("secret", "optional-salt");
 * // => "optional-salt:<128 hex chars>"
 * ```
 */
export async function useHash(plainText: string, salt?: string): Promise<string> {
	return LazyNodeCryptoStrategy.useHash(plainText, salt);
}

/**
 * @deprecated Use {@link useHash} — this is PBKDF2 hashing, not encryption.
 *
 * @param plainText - The text to hash.
 * @param salt - Optional hex salt.
 * @returns `"salt:hashHex"`.
 *
 * @example
 * ```ts
 * import { useHash } from "katanakit-js";
 * const digest = await useHash("secret");
 * ```
 */
export async function useEncrypt(plainText: string, salt?: string): Promise<string> {
	return LazyNodeCryptoStrategy.useHash(plainText, salt);
}

/**
 * Alias for {@link useHash}.
 *
 * @param plainText - The text to hash.
 * @param salt - Optional hex salt. When omitted a random 16-byte salt is generated.
 * @returns `"salt:hashHex"`.
 *
 * @example
 * ```ts
 * import { usePbkdf2Hash } from "katanakit-js";
 *
 * const digest = await usePbkdf2Hash("secret");
 * // => "<32-char salt>:<128-char hex>"
 * ```
 */
export async function usePbkdf2Hash(plainText: string, salt?: string): Promise<string> {
	return LazyNodeCryptoStrategy.useHash(plainText, salt);
}
