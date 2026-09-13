import type {
	AccessCapability,
	AccessRole,
	AccessRoleDefinition,
	AccessSubject,
} from "../../types/index.js";

/**
 * Role ranks: lower number = more privileged. Higher-privilege roles inherit
 * the capabilities of every role below them (e.g. `admin` can do everything
 * `editor` can).
 */
const ROLE_RANK: Record<AccessRole, number> = {
	owner: 0,
	admin: 1,
	editor: 2,
	author: 3,
	member: 4,
	guest: 5,
};

/**
 * Default role registry: each role lists only the capabilities it adds on top
 * of the roles below it. `guest` adds none — read access is public by default.
 */
const DEFAULT_ROLES: AccessRoleDefinition[] = [
	{ slug: "owner", label: "Owner", capabilities: ["roles:assign", "system:admin"] },
	{ slug: "admin", label: "Admin", capabilities: ["members:manage"] },
	{
		slug: "editor",
		label: "Editor",
		capabilities: [
			"content:publish",
			"content:edit:any",
			"content:delete:any",
			"conversations:moderate",
		],
	},
	{
		slug: "author",
		label: "Author",
		capabilities: ["content:create", "content:edit:own", "content:delete:own"],
	},
	{ slug: "member", label: "Member", capabilities: ["conversations:use"] },
	{ slug: "guest", label: "Guest", capabilities: [] },
];

/** Active registry, keyed by role slug. Starts as the default set. */
const registry = new Map<AccessRole, AccessRoleDefinition>(
	DEFAULT_ROLES.map((role) => [role.slug, role]),
);

function useDefinitionFor(role: AccessRole): AccessRoleDefinition {
	const definition = registry.get(role);
	if (!definition) {
		throw new Error(`Unknown access role: ${role}`);
	}
	return definition;
}

/**
 * Effective capabilities of a role: its own plus every less-privileged role's.
 *
 * @example
 * ```ts
 * useCapabilitiesFor("author"); // content:create, content:edit:own, …, conversations:use
 * useCapabilitiesFor("guest");  // []
 * ```
 */
export function useCapabilitiesFor(role: AccessRole): AccessCapability[] {
	const rank = ROLE_RANK[useDefinitionFor(role).slug];
	const capabilities = new Set<AccessCapability>();

	for (const definition of registry.values()) {
		if (ROLE_RANK[definition.slug] >= rank) {
			for (const capability of definition.capabilities) {
				capabilities.add(capability);
			}
		}
	}
	return [...capabilities];
}

/**
 * Registers (or replaces) a role definition. Use it to extend a built-in
 * role's capabilities, e.g. grant `content:create` to `member`.
 */
export function useRegisterRole(definition: AccessRoleDefinition): void {
	registry.set(definition.slug, definition);
}

/** Restores the built-in role registry (mainly for tests). */
export function useResetRoles(): void {
	registry.clear();
	for (const role of DEFAULT_ROLES) {
		registry.set(role.slug, role);
	}
}

/** Lists every registered role definition. */
export function useRoles(): AccessRoleDefinition[] {
	return [...registry.values()].sort((a, b) => ROLE_RANK[a.slug] - ROLE_RANK[b.slug]);
}

/** Exact role membership — no hierarchy involved. */
export function useHasRole(subject: AccessSubject, role: AccessRole): boolean {
	return subject.roles.includes(role);
}

/**
 * Whether the subject may perform a capability. Any of the subject's roles
 * granting the capability (directly or by inheritance) is enough.
 *
 * @example
 * ```ts
 * useCan({ id: 1, roles: ["author"] }, "content:publish"); // false
 * useCan({ id: 1, roles: ["author"] }, "content:create");  // true
 * useCan({ id: 2, roles: ["editor"] }, "content:create");  // true (inherits author)
 * useCan({ id: 3, roles: [] }, "conversations:use");       // false
 * ```
 */
export function useCan(subject: AccessSubject, capability: AccessCapability): boolean {
	return subject.roles.some((role) => useCapabilitiesFor(role).includes(capability));
}
