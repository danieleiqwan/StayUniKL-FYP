const mysql = require('mysql2/promise');

async function main() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: '', database: 'stayunikl_db',
        multipleStatements: true
    });

    console.log('Step 1: Checking foreign keys on beds table...');
    const [fks] = await c.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = 'stayunikl_db' 
        AND TABLE_NAME = 'beds' 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `);
    console.table(fks);

    console.log('Step 2: Dropping foreign key constraints on beds...');
    for (const fk of fks) {
        await c.query(`ALTER TABLE beds DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        console.log(`  Dropped: ${fk.CONSTRAINT_NAME}`);
    }

    console.log('Step 3: Fixing collation on beds columns...');
    await c.query(`ALTER TABLE beds 
        MODIFY id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
        MODIFY room_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    console.log('  Collation fixed.');

    console.log('Step 4: Re-adding foreign key constraint...');
    try {
        await c.query(`ALTER TABLE beds ADD CONSTRAINT beds_ibfk_1 FOREIGN KEY (room_id) REFERENCES rooms(id)`);
        console.log('  FK re-added.');
    } catch(e) {
        console.log('  FK re-add skipped (rooms table may have different collation):', e.message);
    }

    console.log('\nVerification:');
    const [verify] = await c.query(`
        SELECT COLUMN_NAME, COLLATION_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'stayunikl_db' AND TABLE_NAME = 'beds'
        AND COLUMN_NAME IN ('id', 'room_id')
    `);
    console.table(verify);

    // Test the JOIN now works
    console.log('\nTest JOIN (should return Room 304 occupants):');
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
