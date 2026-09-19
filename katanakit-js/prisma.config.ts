import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error("[prisma] DATABASE_URL is not set. Copy .env.example to .env and configure it.");
}

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/schema.prisma",
    db: {
      connection: DATABASE_URL,
    },
  }),
});
