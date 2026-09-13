import { afterEach, describe, expect, it } from "vitest";
import {
	useCan,
	useCapabilitiesFor,
	useHasRole,
	useRegisterRole,
	useResetRoles,
	useRoles,
} from "@/core/services/access.service";
import type { AccessCapability, AccessSubject } from "@/types/index";

const author: AccessSubject = { id: 1, roles: ["author"] };
const editor: AccessSubject = { id: 2, roles: ["editor"] };
const member: AccessSubject = { id: 3, roles: ["member"] };
const guest: AccessSubject = { id: 4, roles: ["guest"] };
const owner: AccessSubject = { id: 5, roles: ["owner"] };

afterEach(() => {
	useResetRoles();
});

describe("AccessService", () => {
	describe("useCan", () => {
		it("lets authors manage only their own content", () => {
			expect(useCan(author, "content:create")).toBe(true);
			expect(useCan(author, "content:edit:own")).toBe(true);
			expect(useCan(author, "content:publish")).toBe(false);
			expect(useCan(author, "content:edit:any")).toBe(false);
		});

		it("lets higher roles inherit lower-role capabilities", () => {
			expect(useCan(editor, "content:create")).toBe(true);
			expect(useCan(editor, "conversations:use")).toBe(true);
			expect(useCan(owner, "content:publish")).toBe(true);
			expect(useCan(owner, "system:admin")).toBe(true);
		});

		it("denies members any content management", () => {
			expect(useCan(member, "content:create")).toBe(false);
			expect(useCan(member, "conversations:use")).toBe(true);
		});

		it("denies guests everything (read access is public by default)", () => {
			expect(useCan(guest, "content:create")).toBe(false);
			expect(useCan(guest, "conversations:use")).toBe(false);
		});

		it("denies subjects without roles", () => {
			expect(useCan({ id: 6, roles: [] }, "conversations:use")).toBe(false);
		});

		it("grants when any of several roles allows it", () => {
			const multi: AccessSubject = { id: 7, roles: ["member", "author"] };
			expect(useCan(multi, "content:create")).toBe(true);
			expect(useCan(multi, "content:publish")).toBe(false);
		});

		it("returns false for capabilities granted to no role", () => {
			const unknown = "content:translate" as AccessCapability;
			expect(useCan(owner, unknown)).toBe(false);
		});
	});

	describe("useHasRole", () => {
		it("checks exact membership without hierarchy", () => {
			expect(useHasRole(author, "author")).toBe(true);
			expect(useHasRole(owner, "admin")).toBe(false);
		});
	});

	describe("useCapabilitiesFor", () => {
		it("resolves inheritance across the hierarchy", () => {
			expect(useCapabilitiesFor("guest")).toEqual([]);
			expect(useCapabilitiesFor("member")).toEqual(["conversations:use"]);
			expect(useCapabilitiesFor("author")).toContain("conversations:use");
			expect(useCapabilitiesFor("owner")).toContain("content:create");
		});

		it("throws on unknown roles", () => {
			expect(() => useCapabilitiesFor("superuser" as never)).toThrow("Unknown access role");
		});
	});

	describe("useRegisterRole", () => {
		it("extends a built-in role with new capabilities", () => {
			useRegisterRole({
				slug: "member",
				label: "Member",
				capabilities: ["conversations:use", "content:create"],
			});

			expect(useCan(member, "content:create")).toBe(true);
			expect(useCan(author, "content:create")).toBe(true);
		});
	});

	describe("useRoles", () => {
		it("lists roles ordered from most to least privileged", () => {
			expect(useRoles().map((role) => role.slug)).toEqual([
				"owner",
				"admin",
				"editor",
				"author",
				"member",
				"guest",
			]);
		});
	});
});
