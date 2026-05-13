# StayUniKL — Formal Test Case Plan
**FYP Quality Assurance & System Validation Documentation**

This document contains formal test cases for the StayUniKL Hostel Management System, following the standardized template provided for FYP documentation.

---

## Table of Contents
1. [TC-001: Student Authentication (Login)](#tc-001-student-authentication-login)
2. [TC-002: Hostel Application Submission](#tc-002-hostel-application-submission)
3. [TC-003: Room Allocation & QR Generation](#tc-003-room-allocation--qr-generation)
4. [TC-004: Facility Booking (Conflict Prevention)](#tc-004-facility-booking-conflict-prevention)
5. [TC-005: Maintenance Complaint & Analytics Sync](#tc-005-maintenance-complaint--analytics-sync)
6. [TC-006: Payment Proof Verification](#tc-006-payment-proof-verification)
7. [TC-007: QR Code Check-In Validation](#tc-007-qr-code-check-in-validation)
8. [TC-008: Student Profile Update](#tc-008-student-profile-update)
9. [TC-009: Forgot Password & Reset Flow](#tc-009-forgot-password--reset-flow)
10. [TC-010: Admin Student Management (Deactivation)](#tc-010-admin-student-management-deactivation)
11. [TC-011: Admin Report Generation](#tc-011-admin-report-generation)
12. [TC-012: Admin Announcement Posting](#tc-012-admin-announcement-posting)
13. [TC-013: Facility Maintenance Block](#tc-013-facility-maintenance-block)

---

### TC-001: Student Authentication (Login)

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing / Security Testing |
| **Test Design Technique:** | Equivalence Partitioning |
| **Risk Number:** | R-AUTH-01 |
| **Test Case Number:** | TC-001 |
| **Test Case Name:** | Student Login Authentication |
| **Requirement Traceability:** | FR-01: User Authentication System |
| **Test Case Description:** | Verify that a registered student can successfully log in with valid credentials and is blocked with invalid ones. |

**Item(s) to be tested:**
1. Login form inputs (Email, Password)
2. Session management (JWT/Cookies)
3. Error message display

**Pre-condition:**
*   Student account exists in the database.
*   Email has been verified.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Valid Email + Valid Password | Successful redirect to Student Dashboard; Cookie set. |
| Invalid Password | Error message showing attempts remaining; after 5 failures, account locks for 15 mins. |
| Non-existent Email | Error message: "Invalid credentials or user not found". |

**Test Procedure Steps:**
1. Navigate to the StayUniKL Login page.
2. Enter a registered email address.
3. Enter an INCORRECT password.
4. Click the "Login" button.
5. Verify the error message shows "X attempts remaining".
6. Repeat until 5 failures are reached.
7. Verify the error message changes to "Account locked for 15 minutes".
8. Try logging in with the CORRECT password immediately.
9. Verify access is still blocked during the lockout period.

**Post-condition:**
*   Successful login resets the attempt counter to 0.
*   Failed login increments the `login_attempts` column and sets `locked_until` after 5 failures.

---

### TC-002: Hostel Application Submission

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing |
| **Test Design Technique:** | Boundary Value Analysis |
| **Risk Number:** | R-APP-02 |
| **Test Case Number:** | TC-002 |
| **Test Case Name:** | Hostel Application Process |
| **Requirement Traceability:** | FR-02: Hostel Application Management |
| **Test Case Description:** | Ensure students can submit an application with required documents and are blocked if data is missing. |

**Item(s) to be tested:**
1. Application Form fields (IC, Programme, Room Type)
2. Document Upload (PDF/Image)
3. Submission Logic

**Pre-condition:**
*   Student is logged in.
*   Student does not have an active application/tenancy.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| All valid fields + < 5MB Document | Status updates to "Pending"; Confirmation message shown. |
| Empty required fields | Form prevents submission; Highlights missing fields. |
| File size > 5MB | Error message: "File exceeds 5MB limit". |

**Test Procedure Steps:**
1. Go to "Apply Room" section in Dashboard.
2. Fill in all personal and academic details.
3. Select a room preference.
4. Upload a valid PDF document.
5. Click "Submit Application".
6. Verify status changes to "Pending" in the "My Applications" tab.

**Post-condition:**
*   Application record is created in `applications` table.
*   Notification sent to Admin.

---

### TC-003: Room Allocation & QR Generation

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Integration Testing |
| **Test Design Technique:** | Use Case Testing |
| **Risk Number:** | R-ROOM-03 |
| **Test Case Number:** | TC-003 |
| **Test Case Name:** | Admin Room Allocation & QR Trigger |
| **Requirement Traceability:** | FR-03: Room Management & Allocation |
| **Test Case Description:** | Verify that Admin can assign a room to an approved applicant and trigger QR code generation. |

**Item(s) to be tested:**
1. Admin Allocation Panel
2. Room availability check
3. QR Token generation API

**Pre-condition:**
*   At least one student application is in "Approved" or "Payment Pending" status.
*   Vacant rooms are available.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Select Student + Select Vacant Room | Application status → "Waiting Check-In"; Room → "Occupied". |
| Select Occupied Room | Error message: "Room already occupied". |

**Test Procedure Steps:**
1. Log in as Admin.
2. Navigate to "Room Management".
3. Select an approved application from the list.
4. Choose an available room and bed.
5. Click "Confirm Allocation".
6. Verify that the student's dashboard now displays the "Check-In QR Code".

**Post-condition:**
*   Database `applications` table updated with `room_id`.
*   QR Code token generated and stored.

---

### TC-004: Facility Booking (Conflict Prevention)

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Concurrency Testing |
| **Test Design Technique:** | Decision Table Testing |
| **Risk Number:** | R-BOOK-04 |
| **Test Case Number:** | TC-004 |
| **Test Case Name:** | Double-Booking Prevention |
| **Requirement Traceability:** | FR-04: Facility Booking System |
| **Test Case Description:** | Ensure the system prevents two students from booking the same facility slot simultaneously. |

**Item(s) to be tested:**
1. Booking API validation
2. Real-time availability check
3. Database constraints

**Pre-condition:**
*   Facility (e.g., Badminton Court) is available.
*   Two student accounts are ready for testing.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Student A books Slot 1 | Booking confirmed. |
| Student B books same Slot 1 | Error message: "Slot already booked". |

**Test Procedure Steps:**
1. Login as Student A.
2. Navigate to "Facility Booking" -> "Court".
3. Select Date X and Time 09:00.
4. Confirm booking.
5. Login as Student B.
6. Attempt to book the same Date X and Time 09:00.
7. Verify the slot is either greyed out or returns an error on submission.

**Post-condition:**
*   Only one record exists for the same slot in `court_bookings`.

---

### TC-005: Maintenance Complaint & Analytics Sync

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | End-to-End Testing |
| **Test Design Technique:** | State Transition Testing |
| **Risk Number:** | R-MAINT-05 |
| **Test Case Number:** | TC-005 |
| **Test Case Name:** | Complaint Impact on Room Assets |
| **Requirement Traceability:** | FR-05: Maintenance & Analytics |
| **Test Case Description:** | Verify that submitting a maintenance complaint correctly updates the room's asset condition in the Admin Analytics. |

**Item(s) to be tested:**
1. Complaint Submission Form
2. Admin Analytics Dashboard
3. Database Collation Sync

**Pre-condition:**
*   Student is assigned to Room 304.
*   Room 304 asset status is currently "Good".

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Submit "Electrical" complaint for Room 304 | Admin Dashboard reflects "Needs Repair" for Room 304. |

**Test Procedure Steps:**
1. Login as Student in Room 304.
2. Submit a complaint: Category "Electrical", Description "Socket not working".
3. Log in as Admin.
4. Navigate to "Maintenance Analytics".
5. Check Room 304 status.
6. Verify the asset condition has automatically changed to "Needs Repair" or flagged.

**Post-condition:**
*   Complaint record linked to room record via student application.

---

### TC-006: Payment Proof Verification

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing |
| **Test Design Technique:** | Equivalence Partitioning |
| **Risk Number:** | R-PAY-06 |
| **Test Case Number:** | TC-006 |
| **Test Case Name:** | Payment Proof Verification |
| **Requirement Traceability:** | FR-06: Payment Management |
| **Test Case Description:** | Verify that Admin can review and approve/reject payment proofs uploaded by students. |

**Item(s) to be tested:**
1. Payment review interface
2. Status transition (Pending -> Success/Failed)
3. Receipt generation

**Pre-condition:**
*   Student has uploaded a payment proof.
*   Payment status is "Pending Verification".

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Admin clicks "Approve" | Status → "Success"; Student balance → 0. |
| Admin clicks "Reject" + Reason | Status → "Failed"; Student notified of reason. |

**Test Procedure Steps:**
1. Log in as Admin.
2. Navigate to "Payment Management".
3. Open the pending payment proof image.
4. Click "Approve".
5. Log in as Student.
6. Verify "Paid" status and download PDF receipt.

**Post-condition:**
*   `payments` table updated.
*   PDF Receipt stored/generated.

---

### TC-007: QR Code Check-In Validation

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Security / Functional Testing |
| **Test Design Technique:** | Error Guessing |
| **Risk Number:** | R-QR-07 |
| **Test Case Number:** | TC-007 |
| **Test Case Name:** | QR Check-In Workflow |
| **Requirement Traceability:** | FR-07: Automated Check-In System |
| **Test Case Description:** | Verify that scanning the student QR code correctly checks them into the hostel and updates tenancy. |

**Item(s) to be tested:**
1. Admin QR Scanner
2. Token validation (JWT expiry)
3. Tenancy record creation

**Pre-condition:**
*   Student has a "Waiting Check-In" status.
*   QR Code is visible on Student Dashboard.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Scan Valid QR Code | Redirection to Success page; Status → "Checked In". |
| Scan Expired/Invalid QR | Message: "Invalid or Expired QR Code". |

**Test Procedure Steps:**
1. Log in as Admin on a mobile device/scanner.
2. Open "QR Scanner".
3. Scan the QR code from the Student's phone.
4. Verify the system identifies the student correctly.
5. Click "Confirm Check-In".
6. Check Student Dashboard for "Checked In" status.

**Post-condition:**
*   `applications.status` updated to 'Checked in'.
*   Check-in timestamp recorded.

---

### TC-008: Student Profile Update

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing |
| **Test Design Technique:** | Equivalence Partitioning |
| **Risk Number:** | R-PROF-08 |
| **Test Case Number:** | TC-008 |
| **Test Case Name:** | Profile Contact Info Update |
| **Requirement Traceability:** | FR-08: Profile Management |
| **Test Case Description:** | Ensure students can update their phone number and emergency contact info. |

**Item(s) to be tested:**
1. Profile edit fields
2. Input validation (Phone format)
3. Database persistence

**Pre-condition:**
*   Student is logged in.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Valid Phone Number | Success message; Profile displays new number. |
| Invalid Phone (letters) | Error message: "Invalid phone format". |

**Test Procedure Steps:**
1. Navigate to "Profile" -> "Edit Profile".
2. Change the Phone Number field.
3. Click "Save Changes".
4. Refresh the page and verify the change persists.

**Post-condition:**
*   `users` table updated with new contact info.

---

### TC-009: Forgot Password & Reset Flow

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Security Testing |
| **Test Design Technique:** | State Transition Testing |
| **Risk Number:** | R-SEC-09 |
| **Test Case Number:** | TC-009 |
| **Test Case Name:** | Password Reset Workflow |
| **Requirement Traceability:** | FR-01.1: Account Recovery |
| **Test Case Description:** | Verify the end-to-end flow of resetting a password via email token. |

**Item(s) to be tested:**
1. Reset request API
2. Token expiry logic
3. Password hashing on update

**Pre-condition:**
*   Student has a valid registered email.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Enter registered email | Email sent with reset link (simulated/actual). |
| Valid token + New Password | Password updated; Old password no longer works. |
| Expired/Invalid Token | Error: "Reset link has expired". |

**Test Procedure Steps:**
1. On Login page, click "Forgot Password".
2. Enter registered email and submit.
3. Click the link in the received email (or use the generated URL).
4. Enter a new password meeting policy.
5. Click "Reset Password".
6. Attempt to login with the NEW password.

**Post-condition:**
*   User record updated with new hashed password.
*   Reset token invalidated.

---

### TC-010: Admin Student Management (Deactivation)

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing |
| **Test Design Technique:** | Boundary Value Analysis |
| **Risk Number:** | R-ADM-10 |
| **Test Case Number:** | TC-010 |
| **Test Case Name:** | Student Account Deactivation |
| **Requirement Traceability:** | FR-09: User Management |
| **Test Case Description:** | Verify that Admin can deactivate a student account to block system access. |

**Item(s) to be tested:**
1. Student List interface
2. Deactivate toggle/button
3. Login block logic

**Pre-condition:**
*   Admin is logged in.
*   Student account is currently "Active".

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Admin clicks "Deactivate" | Account status → "Inactive"; Student cannot log in. |

**Test Procedure Steps:**
1. Navigate to Admin "Student Management".
2. Search for a specific student.
3. Click "Deactivate Account" and confirm.
4. Try logging in as that student.
5. Verify login is blocked with "Account deactivated" message.

**Post-condition:**
*   Student's `active` flag set to 0 in database.

---

### TC-011: Admin Report Generation

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing |
| **Test Design Technique:** | Use Case Testing |
| **Risk Number:** | R-REP-11 |
| **Test Case Number:** | TC-011 |
| **Test Case Name:** | Revenue & Occupancy Reporting |
| **Requirement Traceability:** | FR-10: Reporting & Analytics |
| **Test Case Description:** | Verify that Admin can generate and export system reports in PDF/CSV format. |

**Item(s) to be tested:**
1. Report Filters (Date range)
2. Data accuracy (Sums/Counts)
3. Export functionality

**Pre-condition:**
*   System contains existing booking and payment data.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Click "Export PDF" | File download begins; Data matches dashboard stats. |

**Test Procedure Steps:**
1. Navigate to Admin "Reports".
2. Select "Occupancy Report".
3. Click "Generate Report".
4. Verify the stats displayed.
5. Click "Export PDF".
6. Open the downloaded file and verify formatting.

**Post-condition:**
*   Correct report generated without system crash.

---

### TC-012: Admin Announcement Posting

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing |
| **Test Design Technique:** | Decision Table Testing |
| **Risk Number:** | R-ANN-12 |
| **Test Case Number:** | TC-012 |
| **Test Case Name:** | Global Announcement Broadcast |
| **Requirement Traceability:** | FR-11: Communication System |
| **Test Case Description:** | Verify that Admin can post announcements that appear on all student dashboards. |

**Item(s) to be tested:**
1. Announcement Editor
2. Visibility logic
3. Priority flags

**Pre-condition:**
*   Admin is logged in.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Submit Announcement | Visible on Student Dashboard; Notification sent (if enabled). |

**Test Procedure Steps:**
1. Navigate to Admin "Announcements".
2. Click "Create New".
3. Enter Title: "Water Maintenance", Content: "Scheduled for Friday".
4. Set Priority: "High".
5. Click "Post".
6. Login as any student and check the Dashboard feed.

**Post-condition:**
*   Announcement record created in `announcements` table.

---

### TC-013: Facility Maintenance Block

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing |
| **Test Design Technique:** | Boundary Value Analysis |
| **Risk Number:** | R-MAINT-13 |
| **Test Case Number:** | TC-013 |
| **Test Case Name:** | Admin Facility Slot Blocking |
| **Requirement Traceability:** | FR-04.1: Facility Maintenance |
| **Test Case Description:** | Ensure Admin can block specific slots for maintenance, making them unavailable to students. |

**Item(s) to be tested:**
1. Admin Facility Calendar
2. Slot blocking logic
3. Frontend "Unavailable" state

**Pre-condition:**
*   Admin is logged in.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Block Slot (14:00-15:00) | Slot becomes grey/disabled for all students. |

**Test Procedure Steps:**
1. Navigate to Admin "Facility Management".
2. Select "Badminton Court".
3. Click on a specific time slot on the calendar.
4. Select "Set as Maintenance".
5. Save changes.
6. Login as a student and attempt to book that slot.

**Post-condition:**
*   `court_settings.blockedSlots` updated.

---

### TC-014: Facility Booking Race Condition

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Concurrency / Stress Testing |
| **Test Design Technique:** | Race Condition Analysis |
| **Risk Number:** | R-CONC-14 |
| **Test Case Number:** | TC-014 |
| **Test Case Name:** | Facility Booking Race Condition Prevention |
| **Requirement Traceability:** | FR-10: Booking Conflict Prevention |
| **Test Case Description:** | Verify that the `SELECT ... FOR UPDATE` row-level lock prevents two users from booking the same court slot if their requests arrive simultaneously. |

**Item(s) to be tested:**
1. Database Transaction isolation level
2. Row-level locking logic in `app/api/court/route.ts`
3. API response for the "losing" request

**Pre-condition:**
*   A specific court slot (e.g., Badminton Court 1, 14:00) is available.
*   Two student accounts are authenticated.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Simultaneous POST requests for the same slot | Request A: Status 200 (Success); Request B: Status 409 (Conflict) or 400. |

**Test Procedure Steps:**
1. Prepare two API client requests (or two browser tabs) for the same court, date, and time.
2. Trigger both requests at the exact same millisecond (using an automated script or multi-click).
3. Inspect the database `court_bookings` table.
4. Verify that only ONE record was created.
5. Verify the second user received a "Slot already taken" message rather than a generic server error.

**Post-condition:**
*   System integrity maintained; no duplicate bookings for the same unique slot ID.

---

### TC-015: Timezone-Consistent QR Validation

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Integrity / Localization Testing |
| **Test Design Technique:** | Boundary Value Analysis |
| **Risk Number:** | R-TIME-15 |
| **Test Case Number:** | TC-015 |
| **Test Case Name:** | MYT Timezone Validation for QR Scanning |
| **Requirement Traceability:** | FR-11: Automated Check-In System |
| **Test Case Description:** | Ensure that the 15-minute check-in window is strictly calculated based on `Asia/Kuala_Lumpur` time, regardless of server location (UTC). |

**Item(s) to be tested:**
1. `getKLDate()` utility function
2. Admin scanning API time-window logic
3. JWT expiry timestamp

**Pre-condition:**
*   Student has an approved booking at 10:00 AM MYT.
*   Current time is 09:50 AM MYT.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Scan at 09:50 AM (Window: 09:45-10:15) | Success: "Check-In Successful". |
| Scan at 09:40 AM (Outside window) | Error: "Check-in only available 15m before start". |

**Test Procedure Steps:**
1. Verify the server system time is set to UTC (e.g., on Vercel).
2. Use the `getKLDate()` helper to generate the current time in Malaysia.
3. Attempt to scan a student's QR code within the 15-minute buffer.
4. Verify the check-in is accepted.
5. Wait until 16 minutes past the start time and scan again.
6. Verify the check-in is rejected with a "Time window closed" message.

**Post-condition:**
*   Attendance is marked accurately in the local Malaysian timezone.

---

### TC-016: Bed Allocation Concurrency

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Concurrency Testing |
| **Test Design Technique:** | Transactional Testing |
| **Risk Number:** | R-CONC-16 |
| **Test Case Number:** | TC-016 |
| **Test Case Name:** | Bed Allocation Row-Locking |
| **Requirement Traceability:** | FR-06: Room Allocation System |
| **Test Case Description:** | Verify that two administrators cannot assign the same bed to different students at the same time. |

**Item(s) to be tested:**
1. Transactional integrity in `app/api/applications/route.ts`
2. Row-level locks on the `beds` table.

**Pre-condition:**
*   Bed #101 is vacant.
*   Two Admin accounts are logged in.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Admins A & B click "Assign" for Bed #101 | Admin A: Success; Admin B: "Bed is no longer available". |

**Test Procedure Steps:**
1. Admin A and Admin B both open the allocation panel for two different students.
2. Both select the same Room and Bed.
3. Both click "Confirm Allocation" simultaneously.
4. Verify that the database transaction for Admin B waits for Admin A to finish, then detects the bed is no longer vacant.
5. Verify Admin B is redirected with a "Selection Conflict" error.

**Post-condition:**
*   No double-occupancy records in the `applications` or `tenancy` tables.

---

### TC-017: Role-Based Access Control (RBAC)

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Security Testing |
| **Test Design Technique:** | Error Guessing |
| **Risk Number:** | R-SEC-17 |
| **Test Case Number:** | TC-017 |
| **Test Case Name:** | Role-Based Access Control (RBAC) |
| **Requirement Traceability:** | FR-02: User Authorization |
| **Test Case Description:** | Verify that students cannot access Admin/Superadmin routes or APIs. |

**Item(s) to be tested:**
1. Middleware route protection
2. JWT role-claim validation
3. Frontend redirect logic

**Pre-condition:**
*   User is logged in as a Student.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Access `/admin/dashboard` | Redirect to `/dashboard` or 403 Page. |
| POST to `/api/admin/reports` | Response: 403 Forbidden. |

**Test Procedure Steps:**
1. Log in as a Student.
2. Manually type `http://localhost:3000/admin` in the browser address bar.
3. Verify the system blocks access.
4. Use an API tool (like Postman) to send a request to an admin endpoint using the student's JWT token.
5. Verify the server rejects the request with a 403 status code.

**Post-condition:**
*   No unauthorized access recorded in audit logs.

---

### TC-018: Automated PDF Receipt Verification

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Functional Testing |
| **Test Design Technique:** | Equivalence Partitioning |
| **Risk Number:** | R-PAY-18 |
| **Test Case Number:** | TC-018 |
| **Test Case Name:** | Automated PDF Receipt Verification |
| **Requirement Traceability:** | FR-07: Financial Management |
| **Test Case Description:** | Ensure that the system generates a correct and readable PDF receipt after payment verification. |

**Item(s) to be tested:**
1. PDF Generation engine
2. Data mapping (Student Name, ID, Amount)
3. Timezone accuracy in receipt date

**Pre-condition:**
*   Admin has just approved a student's payment.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Click "Download Receipt" | PDF file downloads; Content is accurate. |

**Test Procedure Steps:**
1. Log in as a Student whose payment was approved.
2. Navigate to "Payments" or "Applications".
3. Click the "Download Receipt" button.
4. Open the PDF and check for:
   - Correct University logo/header.
   - Accurate Student ID and Application ID.
   - Payment Date matching the approval time in MYT.

**Post-condition:**
*   Receipt file is generated on-the-fly without errors.

---

### TC-019: Dashboard Analytics Accuracy

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Data Integrity Testing |
| **Test Design Technique:** | Use Case Testing |
| **Risk Number:** | R-DATA-19 |
| **Test Case Number:** | TC-019 |
| **Test Case Name:** | Admin Dashboard Analytics Accuracy |
| **Requirement Traceability:** | FR-14: Administrative Dashboard |
| **Test Case Description:** | Verify that stats on the dashboard update correctly when data changes. |

**Item(s) to be tested:**
1. Aggregate SQL queries for stats
2. Real-time state update in React/Next.js

**Pre-condition:**
*   Current "Total Applications" on Admin Dashboard is X.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| Student submits new application | "Total Applications" becomes X + 1. |

**Test Procedure Steps:**
1. Log in as Admin and note the current "Pending" count.
2. In a separate browser, submit a new hostel application as a Student.
3. Refresh the Admin dashboard.
4. Verify the "Pending" count has increased by exactly one.

**Post-condition:**
*   Dashboard accurately reflects the database count.

---

### TC-020: API Rate Limiting & Security

| Field | Description |
| :--- | :--- |
| **Tested By:** | [Name/Role] |
| **Test Type:** | Security / Performance Testing |
| **Test Design Technique:** | Boundary Value Analysis |
| **Risk Number:** | R-SEC-20 |
| **Test Case Number:** | TC-020 |
| **Test Case Name:** | API Rate Limiting & Security |
| **Requirement Traceability:** | FR-20: Security Governance |
| **Test Case Description:** | Ensure the system protects against brute-force attacks and excessive API calls. |

**Item(s) to be tested:**
1. Rate-limiting middleware
2. IP-based blocking logic

**Pre-condition:**
*   System is running in a production-like environment.

**Specifications:**
| Input | Expected Output/Result |
| :--- | :--- |
| > 50 requests/minute to `/api/auth/login` | Response: 429 Too Many Requests. |

**Test Procedure Steps:**
1. Use an automated script to send rapid requests to the login endpoint.
2. Observe the HTTP response codes.
3. Verify that after the defined limit, the server starts returning `429` status.
4. Wait for the cooldown period (e.g., 1 minute) and verify access is restored.

**Post-condition:**
*   Server remains stable during high-frequency requests.

---

*Generated for StayUniKL FYP | QA Document*

