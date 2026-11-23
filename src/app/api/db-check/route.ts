import { Pool } from "pg";

export async function GET() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query("SELECT 1");
    return Response.json({ status: "ok" });
  } catch (error) {
    const poruka = error instanceof Error ? error.message : "nepoznata greška";
    return Response.json({ status: "greška", poruka }, { status: 500 });
  } finally {
    await pool.end();
  }
}
