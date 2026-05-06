-- ============================================================
-- Migration: Fix utf8mb4 collation mismatch across all tables
-- Root cause: beds, rooms, assets, maintenance_logs used
-- utf8mb4_unicode_ci while all other tables used
-- utf8mb4_general_ci, causing JOINs to fail silently,
-- which made the rooms API return 0 occupants,
-- so complaint-to-room-asset matching never triggered.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `assets`          CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE `beds`            CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE `maintenance_logs` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE `rooms`           CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify (run this SELECT after to confirm 0 rows):
-- SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME 
-- FROM information_schema.COLUMNS 
-- WHERE TABLE_SCHEMA = 'stayunikl_db'
-- AND COLLATION_NAME = 'utf8mb4_unicode_ci';
