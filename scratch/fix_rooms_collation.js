const mysql = require('mysql2/promise');

async function main() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: '', database: 'stayunikl_db'
    });

    // Check rooms table collation
    const [roomsCols] = await c.query(`
        SELECT COLUMN_NAME, COLLATION_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'stayunikl_db' AND TABLE_NAME = 'rooms'
        AND COLUMN_NAME = 'id'
    `);
    console.log('rooms.id collation:', roomsCols[0]?.COLLATION_NAME);

    // Fix rooms.id collation if needed
    if (roomsCols[0]?.COLLATION_NAME !== 'utf8mb4_general_ci') {
        // Drop any FKs referencing rooms first
        const [refs] = await c.query(`
            SELECT TABLE_NAME, CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = 'stayunikl_db'
            AND REFERENCED_TABLE_NAME = 'rooms'
            AND REFERENCED_COLUMN_NAME = 'id'
        `);
        console.log('FKs referencing rooms.id:', refs);
        for (const ref of refs) {
            await c.query(`ALTER TABLE \`${ref.TABLE_NAME}\` DROP FOREIGN KEY \`${ref.CONSTRAINT_NAME}\``);
            console.log(`Dropped FK ${ref.CONSTRAINT_NAME} from ${ref.TABLE_NAME}`);
        }

        // Fix rooms.id
        await c.query(`ALTER TABLE rooms MODIFY id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL`);
        console.log('Fixed rooms.id collation.');

        // Re-add FK from beds to rooms
        await c.query(`ALTER TABLE beds ADD CONSTRAINT beds_ibfk_1 FOREIGN KEY (room_id) REFERENCES rooms(id)`);
        console.log('Re-added beds_ibfk_1 FK.');
    } else {
        console.log('rooms.id already utf8mb4_general_ci — re-adding FK directly.');
        await c.query(`ALTER TABLE beds ADD CONSTRAINT beds_ibfk_1 FOREIGN KEY (room_id) REFERENCES rooms(id)`);
        console.log('Re-added beds_ibfk_1 FK.');
    }

    // Final verification
    const [verify] = await c.query(`
        SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'stayunikl_db' 
        AND TABLE_NAME IN ('beds','rooms','applications','users')
        AND COLUMN_NAME IN ('id','room_id','bed_id','student_id')
        ORDER BY TABLE_NAME, COLUMN_NAME
    `);
    console.log('\nFinal collation state:');
    console.table(verify);

    await c.end();
}

main().catch(console.error);
