import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRequireCapability } from "@/adapters/express/access.guard";
import { useRegisterRole, useResetRoles } from "@/core/services/access.service";
import type { AccessSubject } from "@/types/index";

function createResponse() {
	const response = {
		status: vi.fn(),
		json: vi.fn(),
	};
	response.status.mockReturnValue(response);
	return response as unknown as Response & {
		status: ReturnType<typeof vi.fn>;
		json: ReturnType<typeof vi.fn>;
	};
}

const request = {} as Request;
const next = vi.fn() as unknown as NextFunction;

afterEach(() => {
	useResetRoles();
	vi.clearAllMocks();
});

describe("useRequireCapability", () => {
	it("rejects anonymous requests with 401", () => {
		const response = createResponse();
		const guard = useRequireCapability("conversations:use", () => null);

		guard(request, response, next);

		expect(response.status).toHaveBeenCalledWith(401);
		expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
		expect(next).not.toHaveBeenCalled();
	});

	it("rejects authenticated subjects without the capability with 403", () => {
		const response = createResponse();
		const guard = useRequireCapability("content:publish", () => ({
			id: 1,
			roles: ["author"],
		}));

		guard(request, response, next);

		expect(response.status).toHaveBeenCalledWith(403);
		expect(next).not.toHaveBeenCalled();
	});

	it("allows subjects whose role grants the capability", () => {
		const response = createResponse();
		const guard = useRequireCapability("content:create", () => ({ id: 1, roles: ["author"] }));

		guard(request, response, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(response.status).not.toHaveBeenCalled();
	});

	it("inherits capabilities from lower-privileged roles", () => {
		const response = createResponse();
		const guard = useRequireCapability("content:create", () => ({ id: 1, roles: ["editor"] }));

		guard(request, response, next);

		expect(next).toHaveBeenCalledTimes(1);
	});

	it("fails closed when the subject carries an unknown role", () => {
		const response = createResponse();
		const guard = useRequireCapability("conversations:use", () => ({
			id: 1,
			roles: ["superuser"] as unknown as AccessSubject["roles"],
		}));

		guard(request, response, next);

		expect(response.status).toHaveBeenCalledWith(403);
		expect(next).not.toHaveBeenCalled();
	});

	it("fails closed when the subject is malformed", () => {
		const response = createResponse();
		const guard = useRequireCapability("conversations:use", () => ({ id: 1 }) as AccessSubject);

		guard(request, response, next);

		expect(response.status).toHaveBeenCalledWith(403);
		expect(next).not.toHaveBeenCalled();
	});

	it("reflects role registry updates", () => {
		useRegisterRole({
			slug: "member",
			label: "Member",
			capabilities: ["conversations:use", "content:create"],
		});
		const response = createResponse();
		const guard = useRequireCapability("content:create", () => ({ id: 2, roles: ["member"] }));

		guard(request, response, next);

		expect(next).toHaveBeenCalledTimes(1);
	});
});
