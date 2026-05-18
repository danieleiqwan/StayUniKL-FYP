const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    await connection.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS evidence_url VARCHAR(255) NULL`);
    console.log("Column added successfully!");
    
    const [rows] = await connection.query(`SHOW COLUMNS FROM invoices LIKE 'evidence_url'`);
    console.log("Column exists:", rows.length > 0);
  } catch (err) {
    console.error("Error:", err);
  }
  await connection.end();
}
run();
