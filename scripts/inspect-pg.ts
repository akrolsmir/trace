import { Client } from "pg";

const client = new Client({
  host: process.env.SUPABASE_PG_HOST,
  port: 5432,
  database: "postgres",
  user: process.env.SUPABASE_PG_USER,
  password: process.env.SUPABASE_PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Connected.\n");

  // Get all tables in the public and app schemas
  const { rows: tables } = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema IN ('public', 'app')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name
  `);

  console.log(`Found ${tables.length} tables:\n`);

  for (const { table_schema, table_name } of tables) {
    const fullName = `"${table_schema}"."${table_name}"`;
    console.log(`\n${"=".repeat(60)}`);
    console.log(`TABLE: ${fullName}`);
    console.log("=".repeat(60));

    // Column info
    const { rows: cols } = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [table_schema, table_name]);

    console.log("\nColumns:");
    for (const c of cols) {
      const nullable = c.is_nullable === "YES" ? "NULL" : "NOT NULL";
      const def = c.column_default ? ` DEFAULT ${c.column_default}` : "";
      console.log(`  ${c.column_name.padEnd(30)} ${c.data_type.padEnd(20)} ${nullable}${def}`);
    }

    // Sample rows
    const { rows: sample } = await client.query(`SELECT * FROM ${fullName} LIMIT 5`);
    console.log(`\nSample rows (${sample.length}):`);
    for (const row of sample) {
      console.log(JSON.stringify(row, null, 2));
    }
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
