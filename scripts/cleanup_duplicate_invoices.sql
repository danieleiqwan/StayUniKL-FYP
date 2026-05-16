-- ============================================================
-- StayUniKL — Duplicate Hostel Invoice Cleanup
-- Run this in phpMyAdmin / MySQL Workbench / TablePlus
-- ============================================================

-- STEP 1: PREVIEW — See which duplicates will be deleted
-- Run this first to review before committing to deletion.
SELECT
    i.id,
    i.application_id,
    i.user_id,
    i.amount,
    i.status,
    i.created_at,
    CASE
        WHEN i.created_at = min_created.oldest THEN 'KEEP (oldest)'
        ELSE 'DELETE (duplicate)'
    END AS action
FROM invoices i
INNER JOIN (
    SELECT
        application_id,
        MIN(created_at) AS oldest,
        COUNT(*) AS invoice_count
    FROM invoices
    WHERE type = 'Hostel Fee'
      AND application_id IS NOT NULL
    GROUP BY application_id
    HAVING COUNT(*) > 1
) AS min_created ON i.application_id = min_created.application_id
WHERE i.type = 'Hostel Fee'
ORDER BY i.application_id, i.created_at;


-- ============================================================
-- STEP 2: DELETE — Only run AFTER reviewing Step 1 output
-- Deletes all duplicate Hostel Fee invoices, keeping the oldest.
-- ============================================================
DELETE i
FROM invoices i
INNER JOIN (
    SELECT
        application_id,
        MIN(created_at) AS oldest_created_at
    FROM invoices
    WHERE type = 'Hostel Fee'
      AND application_id IS NOT NULL
    GROUP BY application_id
    HAVING COUNT(*) > 1
) AS dupes ON i.application_id = dupes.application_id
WHERE i.type = 'Hostel Fee'
  AND i.created_at > dupes.oldest_created_at;


-- STEP 3: VERIFY — Confirm no more duplicates remain
SELECT
    application_id,
    COUNT(*) AS invoice_count
FROM invoices
WHERE type = 'Hostel Fee'
  AND application_id IS NOT NULL
GROUP BY application_id
HAVING COUNT(*) > 1;
-- If this returns 0 rows, you're clean!
