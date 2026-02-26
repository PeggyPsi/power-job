#!/usr/bin/env node
/**
 * Cross-platform Drizzle migration generator
 * Usage: see package.json
 */

import { execSync } from "child_process";

// Get the migration name from command-line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error("Error: Please provide a migration name.");
  console.error("Usage: npm run db:generate <migration_name>");
  process.exit(1);
}

// Generate timestamp: YYYYMMDDHHMMSS
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
  now.getDate()
)}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

// Build final migration name
const finalName = `${timestamp}_${migrationName}`;

console.log(`Generating migration: ${finalName}`);

// Run drizzle-kit generate
try {
  execSync(`npx drizzle-kit generate --name ${finalName}`, {
    stdio: "inherit",
  });
} catch (err) {
  console.error("Migration generation failed:", err.message);
  process.exit(1);
}
