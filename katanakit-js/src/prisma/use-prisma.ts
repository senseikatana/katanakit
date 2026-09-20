/**
 * Framework-agnostic Prisma client singleton for KatanaKit.
 *
 * This module provides a lazy-initialized database client using Prisma Next
 * (`@prisma/orm-postgres`) that works in any Node.js environment.
 *
 * ## Installation
 *
 * ```bash
 * # Install Prisma ORM (Next)
 * npm install @prisma/orm-postgres
 *
 * # Install Prisma CLI (dev)
 * npm install -D prisma
 *
 * # Initialize and generate contract
 * npx prisma init
 * npx prisma contract emit
 *
 * # Apply schema to database
 * npx prisma db init
 * ```
 *
 * ## Environment
 *
 * Set `DATABASE_URL` in your `.env` file:
 *
 * ```env
 * DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
 * ```
 *
 * ## Usage
 *
 * ```ts
 * import { usePrismaClient } from "katanakit-js/prisma";
 *
 * // Get the singleton client
 * const db = usePrismaClient();
 *
 * // Query using Prisma Next API
 * const accounts = await db.orm.public.Account.findMany();
 * ```
 *
 * @module prisma/use-prisma
 */

import "dotenv/config";

import postgres from "@prisma/orm-postgres/runtime";

import type { Contract } from "./schema.d.js";
import contractJson from "./schema.json" with { type: "json" };

/** Module-level singleton instance. */
let client: ReturnType<typeof postgres<Contract>> | null = null;

/**
 * Get the Prisma Next database client singleton.
 * Creates the client on first call using the contract and DATABASE_URL.
 *
 * @param datasourceUrl - Optional database URL override (defaults to `process.env.DATABASE_URL`)
 * @returns Typed database client
 *
 * @example
 * ```ts
 * // Basic usage (reads DATABASE_URL from env)
 * const db = usePrismaClient();
 * const accounts = await db.orm.public.Account.findMany();

 * // With custom URL
 * const db = usePrismaClient("postgresql://localhost:5432/test");
 * const posts = await db.orm.public.Post.findMany();
 * ```
 */
export function usePrismaClient(datasourceUrl?: string): ReturnType<typeof postgres<Contract>> {
	if (!client) {
		const url = datasourceUrl ?? process.env.DATABASE_URL;
		if (!url) {
			throw new Error(
				"[usePrismaClient] DATABASE_URL is not set. Copy .env.example to .env and configure it.",
			);
		}
		client = postgres<Contract>({
			contractJson,
			url,
		});
	}

	return client;
}
