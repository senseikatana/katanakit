import type { NextFunction, Request, RequestHandler, Response } from "express";

import { useCan } from "../../core/services/access.service.js";
import type { AccessCapability, AccessSubject } from "../../types/index.js";

/**
 * Builds an Express guard that requires an access capability.
 *
 * The project ships no auth provider, so the subject is resolved by the
 * caller (JWT, session, API key…). Return `null` from `resolveSubject` for
 * anonymous requests — they get a 401; authenticated but not allowed gets 403.
 *
 * Plugs into any router that accepts a `guard`, e.g. the assistant adapter:
 *
 * @example
 * ```ts
 * useStartAssistant(3000, "localhost", "/assistant", {
 *   guard: useRequireCapability("conversations:use", (request) => request.account ?? null),
 * });
 * ```
 */
export function useRequireCapability(
	capability: AccessCapability,
	resolveSubject: (request: Request) => AccessSubject | null,
): RequestHandler {
	return (request: Request, response: Response, next: NextFunction): void => {
		const subject = resolveSubject(request);

		if (!subject) {
			response.status(401).json({
				ok: false,
				data: null,
				error: { message: "Authentication required", status: 401 },
			});
			return;
		}

		if (!useCan(subject, capability)) {
			response.status(403).json({
				ok: false,
				data: null,
				error: { message: `Missing capability: ${capability}`, status: 403 },
			});
			return;
		}

		next();
	};
}
