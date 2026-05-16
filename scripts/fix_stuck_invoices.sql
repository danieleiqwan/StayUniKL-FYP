-- ============================================================
-- StayUniKL — Fix Invoices Stuck in Unpaid/Pending for Approved Applications
--
-- Run this ONCE in phpMyAdmin / MySQL Workbench / TablePlus
-- to retroactively mark invoices as Paid for any application
-- that is already in Approved, Checked in, or Checked out status.
-- ============================================================

-- STEP 1: PREVIEW — See which invoices will be updated
SELECT
    i.id AS invoice_id,
    i.application_id,
    i.amount,
    i.status AS current_invoice_status,
    a.status AS application_status,
    u.name AS student_name
FROM invoices i
INNER JOIN applications a ON i.application_id = a.id
INNER JOIN users u ON i.user_id = u.id
WHERE i.type = 'Hostel Fee'
  AND i.status IN ('Unpaid', 'Overdue')
  AND a.status IN ('Approved', 'Checked in', 'Checked out');

-- ============================================================
-- STEP 2: FIX — Mark stuck invoices as Paid
-- Only run after reviewing Step 1 output.
-- ============================================================
UPDATE invoices i
INNER JOIN applications a ON i.application_id = a.id
SET i.status = 'Paid'
WHERE i.type = 'Hostel Fee'
  AND i.status IN ('Unpaid', 'Overdue')
  AND a.status IN ('Approved', 'Checked in', 'Checked out');

-- STEP 3: VERIFY — Confirm no more stuck invoices remain
SELECT COUNT(*) AS stuck_invoices_remaining
FROM invoices i
INNER JOIN applications a ON i.application_id = a.id
WHERE i.type = 'Hostel Fee'
  AND i.status IN ('Unpaid', 'Overdue')
  AND a.status IN ('Approved', 'Checked in', 'Checked out');
-- Should return 0
