import { env } from "@/data/env/server"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
	out: "./src/drizzle/migrations", // where migrations are going to be stored
	schema: "./src/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
	migrations: {
		schema: "public" // Set the db schema name to "public". By default is is set as "drizlle"
	}
})