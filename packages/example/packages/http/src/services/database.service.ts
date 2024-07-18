import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export class DatabaseService {
  #pool: Pool;
  db: NodePgDatabase;

  constructor(connectionString: string) {
    this.#pool = new Pool({
      connectionString,
    });

    this.db = drizzle(this.#pool);
  }
}
