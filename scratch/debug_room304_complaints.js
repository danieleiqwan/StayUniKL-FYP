const mysql = require('mysql2/promise');

async function main() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: '', database: 'stayunikl_db'
    });

    console.log('\n=== 1. All complaints for eiqwan (student_id: 021019-03-0975) ===');
    const [eiqwanComplaints] = await c.query(
        'SELECT id, student_id, title, asset, status FROM complaints WHERE student_id = ?',
        ['021019-03-0975']
    );
    console.table(eiqwanComplaints);

    console.log('\n=== 2. Room 304 occupants via beds->applications->users ===');
    const [occupants] = await c.query(
        `SELECT b.id AS bed_id, a.student_id, u.id AS user_internal_id, u.name
         FROM beds b
         JOIN applications a ON b.id = a.bed_id
         JOIN users u ON a.student_id = u.id
         WHERE b.room_id = '304'
         AND a.status IN ('Approved', 'Checked in', 'Payment Pending')`
    );
    console.table(occupants);

    // Build residentIds exactly as the modal does (comma-separated occupantIds)
    const residentIds = occupants.map(o => o.user_internal_id).join(',');
    console.log('\n=== 3. residentIds string sent to API ===');
    console.log(residentIds);

    console.log('\n=== 4. API GET /api/complaints simulation ===');
    console.log('API filters complaints WHERE student_id IN (residentIds) OR title/description contains "304"');

    // Simulate what the API does with residentIds
    if (residentIds) {
        const ids = residentIds.split(',').map(id => id.trim()).filter(Boolean);
        const placeholders = ids.map(() => '?').join(',');
        const [apiResult] = await c.query(
            `SELECT id, student_id, title, asset, status FROM complaints 
             WHERE student_id IN (${placeholders}) AND status IN ('Pending', 'In Progress')`,
            ids
        );
        console.log('Complaints found by residentIds match:');
        console.table(apiResult);
    } else {
        console.log('WARNING: residentIds is EMPTY — modal has no occupantIds to filter by!');
    }

    console.log('\n=== 5. Fallback: complaints mentioning "304" in title/description ===');
    const [fallback] = await c.query(
        `SELECT id, student_id, title, description, asset, status FROM complaints 
         WHERE (title LIKE '%304%' OR description LIKE '%304%') AND status IN ('Pending', 'In Progress')`
    );
    console.table(fallback);

    await c.end();
}

main().catch(console.error);
