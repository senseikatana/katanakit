import "dotenv/config";

import postgres from "@prisma/orm-postgres/runtime";

import type { Contract } from "./schema.d.js";
import contractJson from "./schema.json" with { type: "json" };

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error("[db] DATABASE_URL is not set. Copy .env.example to .env and configure it.");
}

export const db = postgres<Contract>({
	contractJson,
	url: DATABASE_URL,
});
