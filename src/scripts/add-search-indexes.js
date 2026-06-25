import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

const statements = [
  `CREATE EXTENSION IF NOT EXISTS pg_trgm;`,
  `CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);`,
  `CREATE INDEX IF NOT EXISTS idx_manufacturers_name_trgm ON manufacturers USING gin (name gin_trgm_ops);`,
];

async function main() {
  for (const sql of statements) {
    await pool.query(sql);
    console.log("✓", sql.split("\n")[0]);
  }
  await pool.end();
  console.log("Gotovo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
