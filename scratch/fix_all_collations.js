const mysql = require('mysql2/promise');

async function main() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: '', database: 'stayunikl_db'
    });

    console.log('Checking ALL tables for collation mismatches...');
    const [allCols] = await c.query(`
        SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'stayunikl_db'
        AND COLLATION_NAME = 'utf8mb4_unicode_ci'
        ORDER BY TABLE_NAME, COLUMN_NAME
    `);
    console.log(`Found ${allCols.length} columns still on utf8mb4_unicode_ci:`);
    console.table(allCols);

    // Get unique table names that still need fixing
    const tables = [...new Set(allCols.map(r => r.TABLE_NAME))];
    console.log('Tables needing full charset conversion:', tables);

    for (const table of tables) {
        console.log(`\nFixing table: ${table}`);
        
        // Drop all FKs on this table first
        const [fks] = await c.query(`
            SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = 'stayunikl_db' AND TABLE_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        `, [table]);
        
        for (const fk of fks) {
            await c.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
            console.log(`  Dropped FK: ${fk.CONSTRAINT_NAME}`);
        }

        // Drop FKs from OTHER tables referencing this table
        const [refs] = await c.query(`
            SELECT TABLE_NAME, CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = 'stayunikl_db' AND REFERENCED_TABLE_NAME = ?
        `, [table]);

        for (const ref of refs) {
            try {
                await c.query(`ALTER TABLE \`${ref.TABLE_NAME}\` DROP FOREIGN KEY \`${ref.CONSTRAINT_NAME}\``);
                console.log(`  Dropped FK ${ref.CONSTRAINT_NAME} from ${ref.TABLE_NAME}`);
            } catch(e) { /* already dropped */ }
        }

        // Convert the table
        await c.query(`ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
        console.log(`  Converted ${table} to utf8mb4_general_ci`);
    }

    // Final check
    const [remaining] = await c.query(`
        SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'stayunikl_db'
        AND COLLATION_NAME = 'utf8mb4_unicode_ci'
    `);
    
    if (remaining.length === 0) {
        console.log('\n✅ All columns are now utf8mb4_general_ci!');
    } else {
        console.log(`\n⚠️  ${remaining.length} columns still need fixing:`);
        console.table(remaining);
    }

    // Test the critical JOIN
    console.log('\nFinal JOIN test (Room 304 occupants):');
    const [test] = await c.query(`
        SELECT b.id AS bed_id, a.student_id, u.name
        FROM beds b
        JOIN applications a ON b.id = a.bed_id
        JOIN users u ON a.student_id = u.id
        WHERE b.room_id = '304'
        AND a.status IN ('Approved', 'Checked in', 'Payment Pending')
    `);
    console.table(test);

    await c.end();
}

main().catch(console.error);
