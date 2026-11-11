import { db } from "../database/index.js";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Creating auth_states table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS auth_states (
                session_id VARCHAR(255) NOT NULL,
                key VARCHAR(255) NOT NULL,
                value TEXT NOT NULL,
                PRIMARY KEY (session_id, key)
            );
        `);
        console.log("Table auth_states created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
}

main();
