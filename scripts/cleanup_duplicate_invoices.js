/**
 * cleanup_duplicate_invoices.js
 * 
 * Finds and removes duplicate "Hostel Fee" invoices in the invoices table.
 * For each application_id, keeps the OLDEST invoice (lowest created_at)
 * and deletes any newer duplicates.
 * 
 * Run with: node scripts/cleanup_duplicate_invoices.js
 * Use --dry-run flag to preview without deleting: node scripts/cleanup_duplicate_invoices.js --dry-run
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envVars = fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .reduce((acc, line) => {
        const [key, ...rest] = line.split('=');
        acc[key.trim()] = rest.join('=').trim();
        return acc;
    }, {});

const isDryRun = process.argv.includes('--dry-run');

async function main() {
    console.log('='.repeat(60));
    console.log('  StayUniKL — Duplicate Hostel Invoice Cleanup');
    console.log(`  Mode: ${isDryRun ? '🔍 DRY RUN (no changes will be made)' : '⚠️  LIVE (changes will be committed)'}`);
    console.log('='.repeat(60));

    const connection = await mysql.createConnection({
        host: envVars.DB_HOST || 'localhost',
        user: envVars.DB_USER || 'root',
        password: envVars.DB_PASSWORD || '',
        database: envVars.DB_NAME || 'stayunikl_db',
    });

    try {
        // Step 1: Find all application_ids that have more than one Hostel Fee invoice
        const [duplicateGroups] = await connection.query(`
            SELECT 
                application_id,
                COUNT(*) as invoice_count,
                MIN(created_at) as oldest_created_at
            FROM invoices
            WHERE type = 'Hostel Fee'
              AND application_id IS NOT NULL
            GROUP BY application_id
            HAVING COUNT(*) > 1
            ORDER BY application_id
        `);

        if (duplicateGroups.length === 0) {
            console.log('\n✅ No duplicate Hostel Fee invoices found. Your database is clean!\n');
            return;
        }

        console.log(`\n⚠️  Found ${duplicateGroups.length} application(s) with duplicate invoices:\n`);

        let totalToDelete = 0;

        for (const group of duplicateGroups) {
            const { application_id, invoice_count, oldest_created_at } = group;

            // Step 2: Get all invoices for this application, ordered oldest first
            const [invoices] = await connection.query(`
                SELECT id, amount, status, created_at
                FROM invoices
                WHERE application_id = ?
                  AND type = 'Hostel Fee'
                ORDER BY created_at ASC
            `, [application_id]);

            const [keep, ...toDelete] = invoices;

            console.log(`  Application: ${application_id}`);
            console.log(`    → Keeping : [${keep.id}] RM${keep.amount} | Status: ${keep.status} | Created: ${keep.created_at}`);
            
            for (const inv of toDelete) {
                console.log(`    → DELETING: [${inv.id}] RM${inv.amount} | Status: ${inv.status} | Created: ${inv.created_at}`);
                totalToDelete++;

                if (!isDryRun) {
                    await connection.query('DELETE FROM invoices WHERE id = ?', [inv.id]);
                }
            }
            console.log('');
        }

        if (isDryRun) {
            console.log(`🔍 DRY RUN complete. Would have deleted ${totalToDelete} duplicate invoice(s).`);
            console.log('   Run without --dry-run to apply changes.\n');
        } else {
            console.log(`✅ Done! Deleted ${totalToDelete} duplicate invoice(s) successfully.\n`);
        }

    } catch (err) {
        console.error('\n❌ Error during cleanup:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

main();
