# StayUniKL — Use Case Statements
**System:** StayUniKL Digital Hostel Management System
**Document:** Software Test Plan (STP) — Appendix C

---

## 1. UC-QR-01: Student QR Check-In

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-QR-01 |
| **Use Case Name** | Student QR Check-In |
| **Description** | Allows a student with an approved and paid application to check into their assigned room by scanning a digital QR code at the check-in hub. |
| **Primary Actor** | Student |
| **Include use cases** | - |
| **Pre-Condition** | Student has an active application with status `Approved` or `Payment Pending` (fully paid / first installment completed). A QR code has been generated. |
| **Post-Condition** | Application status is updated to `Checked in`, check-in timestamp is recorded, bed is marked occupied, and student is notified. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Student arrives at check-in hub.<br>**1.1** \| Student displays their personal check-in QR code via the mobile dashboard.<br>**1.2** \| Student scans the QR code at the check-in terminal scanner.<br>**1.3** \| System captures the code and sends validation request to `/api/applications/checkin`.<br>**1.4** \| System validates the QR code token, student ID, and payment status.<br>**1.5** \| System updates application status to `Checked in` and sets `check_in_date` to `NOW()`.<br>**1.6** \| System sets bed status in the database to `Occupied`. <br>**Post-Condition** \| Student check-in is complete and access is activated. |
| **Alternate Flow** | - **Manual Check-In:** If scanner fails, the Admin manually searches the student's ID in the Admin Panel and clicks "Mark Checked In". |
| **Robust Flow** | - **Invalid/Expired QR:** If code is invalid or payment is incomplete, system displays "Invalid QR or Unpaid Application" and denies check-in. |

---

## 2. UC-QR-02: Admin Processes Check-Out

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-QR-02 |
| **Use Case Name** | Admin Processes Check-Out |
| **Description** | Allows an administrator to check out a student who is vacating their room, updating their application status and freeing the bed. |
| **Primary Actor** | Admin |
| **Include use cases** | - |
| **Pre-Condition** | Student application status is `Checked in`. |
| **Post-Condition** | Application status is updated to `Checked out`, check-out timestamp is recorded, bed status is reset to `Available`, and bed/room references are cleared from the application. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Admin is on the Admin Dashboard page.<br>**2.1** \| Admin navigates to the list of checked-in students (or application list).<br>**2.2** \| Admin locates the student's active checked-in application.<br>**2.3** \| Admin clicks the "Check Out" button.<br>**2.4** \| System prompts Admin for confirmation.<br>**2.5** \| Admin confirms the action.<br>**2.6** \| System sends a PUT request to `/api/applications` with status `Checked out` and the application ID.<br>**2.7** \| System updates the application record, setting `check_out_date` to `NOW()`.<br>**2.8** \| System updates the bed status to `Available` and clears `bed_id` and `room_id` associated with the student application.<br>**Post-Condition** \| Student check-out is registered and room bed is freed. |
| **Alternate Flow** | - |
| **Robust Flow** | - **Wrong Status Checkout:** If Admin attempts to trigger checkout for an application that is not currently `Checked in`, the Check Out button is disabled in the UI. |

---

## 3. UC-FAC-01: Student Books Facility

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-FAC-01 |
| **Use Case Name** | Student Books Facility |
| **Description** | Allows a student to book a specific sport facility court slot (Badminton, Volleyball, Basketball, Football) for recreational purposes. |
| **Primary Actor** | Student |
| **Include use cases** | - |
| **Pre-Condition** | Student is authenticated. Selected slot is open and available. |
| **Post-Condition** | Booking request is logged in the system with status `Pending` review. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Student opens the Court Booking page.<br>**3.1** \| Student selects the desired sport facility (e.g., Badminton).<br>**3.2** \| Student selects the date and views available hourly slots.<br>**3.3** \| Student selects an available time slot and clicks "Book Now".<br>**3.4** \| System sends POST request to `/api/court`.<br>**3.5** \| System verifies slot is not taken, and creates a booking record with status `Pending`. <br>**Post-Condition** \| Booking is created and pending admin approval. |
| **Alternate Flow** | - |
| **Robust Flow** | - **Double Booking Prevention:** If another student books the same slot simultaneously, the transaction locks the slot, returning "This slot is no longer available" to the second student. |

---

## 4. UC-FAC-02: Admin Approves/Rejects Booking

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-FAC-02 |
| **Use Case Name** | Admin Approves/Rejects Booking |
| **Description** | Allows hostel administration staff to approve or reject pending facility bookings submitted by students. |
| **Primary Actor** | Admin / Superadmin |
| **Include use cases** | - |
| **Pre-Condition** | Booking exists with status `Pending`. |
| **Post-Condition** | Booking status updated to `Approved` or `Rejected`, and student is notified. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Admin is on the Facility Booking Admin panel.<br>**4.1** \| Admin reviews pending bookings list.<br>**4.2** \| Admin clicks "Approve" or "Reject" on a selected booking.<br>**4.3** \| If rejecting, Admin enters a rejection reason.<br>**4.4** \| System sends PUT request to `/api/facilities` or `/api/court` with status update.<br>**4.5** \| System updates booking status and emails/notifies the student.<br>**Post-Condition** \| Booking status is finalized. |
| **Alternate Flow** | - |
| **Robust Flow** | - **Conflict Handling:** If Admin attempts to approve a booking for a slot that has been manually blocked, system displays "Slot is blocked by administration." |

---

## 5. UC-FAC-03: Student Cancels Booking

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-FAC-03 |
| **Use Case Name** | Student Cancels Booking |
| **Description** | Allows a student to cancel a previously booked slot, releasing the facility slot back to the community pool. |
| **Primary Actor** | Student |
| **Include use cases** | - |
| **Pre-Condition** | Student booking is in `Pending` or `Approved` status. |
| **Post-Condition** | Booking status updated to `Cancelled` and slot is released. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Student opens booking history page.<br>**5.1** \| Student locates the booking and clicks "Cancel Booking".<br>**5.2** \| Student confirms the cancellation in the prompt modal.<br>**5.3** \| System issues DELETE or POST request to `/api/court` cancel endpoint.<br>**5.4** \| System changes status to `Cancelled` and releases the time slot.<br>**Post-Condition** \| Booking is cancelled and available for others. |
| **Alternate Flow** | - |
| **Robust Flow** | - **Late Cancellation Block:** If student attempts to cancel a booking that has already started or passed, the cancel option is disabled. |

---

## 6. UC-COMP-01: Student Submits Complaint

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-COMP-01 |
| **Use Case Name** | Student Submits Complaint |
| **Description** | Allows a student to submit a complaint/maintenance report regarding room assets or hostel facilities. |
| **Primary Actor** | Student |
| **Include use cases** | - |
| **Pre-Condition** | Student is authenticated. |
| **Post-Condition** | Complaint is created with status `Pending` and logged in the database. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Student navigates to the Complaints tab.<br>**6.1** \| Student clicks "New Complaint".<br>**6.2** \| Student fills in Title, Description, and selects the affected Asset (e.g., Fan, Light).<br>**6.3** \| Student uploads supporting images (optional).<br>**6.4** \| Student clicks "Submit Complaint".<br>**6.5** \| System sends POST request to `/api/complaints`. <br>**6.6** \| System saves complaint status as `Pending`. <br>**Post-Condition** \| Maintenance ticket is queued for admin review. |
| **Alternate Flow** | - |
| **Robust Flow** | - **Invalid Uploads:** If attached files exceed 5MB or are not valid images, the system displays "Invalid file format or size exceeds limit." |

---

## 7. UC-COMP-02: Admin Resolves Complaint

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-COMP-02 |
| **Use Case Name** | Admin Resolves Complaint |
| **Description** | Allows admin staff to update complaint status, assign maintenance technicians, and mark complaints as resolved. |
| **Primary Actor** | Admin |
| **Include use cases** | - |
| **Pre-Condition** | Complaint exists with status `Pending` or `In Progress`. |
| **Post-Condition** | Status updated to `Resolved` or `In Progress`. Student is notified. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Admin is logged in and navigates to Complaint Management.<br>**7.1** \| Admin reviews complaint list and selects a ticket.<br>**7.2** \| Admin updates status to `In Progress` and sets a scheduled technician appointment date.<br>**7.3** \| Once maintenance is done, Admin marks status as `Resolved`.<br>**7.4** \| System sends PUT request to `/api/complaints`. <br>**7.5** \| System logs status update and sends notification email to student.<br>**Post-Condition** \| Ticket is closed and marked resolved. |
| **Alternate Flow** | - |
| **Robust Flow** | - **Database Failure:** If database fails during status update, status remains unchanged and admin is shown "Failed to update ticket. Please try again." |

---

## 8. UC-FIN-01: Student Makes Payment

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-FIN-01 |
| **Use Case Name** | Student Makes Payment |
| **Description** | Allows a student to pay outstanding hostel invoices (either full semester fees or installment plans). |
| **Primary Actor** | Student |
| **Include use cases** | - |
| **Pre-Condition** | Outstanding invoice exists with status `Unpaid` or `Overdue`. |
| **Post-Condition** | Payment is processed, invoice status is set to `Paid`, and transaction log is generated. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Student opens the Financials dashboard page.<br>**8.1** \| Student reviews invoices and clicks "Pay Now" on an outstanding invoice.<br>**8.2** \| System initiates checkout session by posting to `/api/payments/create-checkout-session`.<br>**8.3** \| Student is redirected to the payment gateway (Stripe/mock interface).<br>**8.4** \| Student enters billing info and confirms payment.<br>**8.5** \| Gateway processes payment and redirects back with `Success` status.<br>**8.6** \| System updates invoice status to `Paid` and logs the transaction. <br>**Post-Condition** \| Invoice is marked paid, student receives invoice download link. |
| **Alternate Flow** | - **Installment Payment:** Student selects Installment Plan. System processes payment for current installment only, leaving remaining invoices unpaid. |
| **Robust Flow** | - **Failed Transaction:** If payment fails at gateway, student is returned to dashboard with message "Payment Failed. Please try again." |

---

## 9. UC-FIN-02: Admin Views Payment Records

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-FIN-02 |
| **Use Case Name** | Admin Views Payment Records |
| **Description** | Allows administrator staff to monitor financial invoices, payments, and verify installment status. |
| **Primary Actor** | Admin / Superadmin |
| **Include use cases** | - |
| **Pre-Condition** | Admin is logged in. |
| **Post-Condition** | Financial summary and transaction logs are displayed. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Admin navigates to the Finance Management tab.<br>**9.1** \| System fetches invoices via GET request to `/api/billing/invoices?all=true`.<br>**9.2** \| Admin filters payments by status (`Paid`, `Unpaid`, `Overdue`) or by specific student.<br>**9.3** \| Admin selects a record to view detailed transactional metadata.<br>**Post-Condition** \| Transaction details are presented to the admin. |
| **Alternate Flow** | - |
| **Robust Flow** | - |

---

## 10. UC-ROOM-01: Admin Views Room Status

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-ROOM-01 |
| **Use Case Name** | Admin Views Room Status |
| **Description** | Allows admins to view room occupancy, bed availability status, and filter room statuses by floor or student gender. |
| **Primary Actor** | Admin / Superadmin |
| **Include use cases** | - |
| **Pre-Condition** | Admin is logged in. |
| **Post-Condition** | Room layout dashboard is presented with real-time floor occupancy statistics. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Admin navigates to Room Management dashboard page.<br>**10.1** \| System calls GET request to `/api/rooms`.<br>**10.2** \| Admin selects specific floor number (e.g., Floor 3) or room gender filter (e.g., Female).<br>**10.3** \| System filters and displays rooms grid showing bed icons, color-coded by occupancy state (`Available`, `Occupied`, `Maintenance`).<br>**Post-Condition** \| Floor status is reviewed. |
| **Alternate Flow** | - |
| **Robust Flow** | - |

---

## 11. UC-ASSET-01: Admin Manages Assets

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-ASSET-01 |
| **Use Case Name** | Admin Manages Assets |
| **Description** | Allows admins to maintain the asset inventory by adding new assets, updating statuses, or removing asset items. |
| **Primary Actor** | Admin |
| **Include use cases** | - |
| **Pre-Condition** | Admin is logged in. |
| **Post-Condition** | Asset directory is updated in the database. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Admin navigates to Asset Management page.<br>**11.1** \| Admin clicks "Add Asset".<br>**11.2** \| Admin inputs Name, Type, Status, and Location (floor/room).<br>**11.3** \| Admin clicks "Save Asset".<br>**11.4** \| System triggers POST request to `/api/assets`. <br>**11.5** \| Database record is saved and inventory list refreshed.<br>**Post-Condition** \| Asset changes are saved and updated. |
| **Alternate Flow** | - **Edit/Delete:** Admin edits an existing asset or clicks "Delete", sending PUT or DELETE requests to the API. |
| **Robust Flow** | - **Validation Errors:** If required inputs are blank, system prevents submission and displays "All fields are required." |

---

## 12. UC-AUDIT-01: View Audit Logs

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-AUDIT-01 |
| **Use Case Name** | View Audit Logs |
| **Description** | Allows admins and superadmins to view historical logs of system operations performed by users. |
| **Primary Actor** | Admin, Superadmin |
| **Include use cases** | - |
| **Pre-Condition** | Admin or Superadmin is logged in. |
| **Post-Condition** | Audit logs list is displayed. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Admin navigates to the Audit Log section.<br>**12.1** \| System loads system events history list.<br>**12.2** \| Admin sets filters (by Actor email, Action Type, or Date Range).<br>**12.3** \| System issues GET request to `/api/admin/audit` with search parameters.<br>**12.4** \| System presents filtered list containing actor name, action description, and exact timestamp.<br>**Post-Condition** | Audit activity details are reviewed. |
| **Alternate Flow** | - |
| **Robust Flow** | - **Unauthorized Access Attempt:** If a student tries to hit `/api/admin/audit` directly, system responds with 403 Forbidden. |

---

## 13. UC-STAFF-01: Superadmin Manages Staff

| **Field** | **Description / Flow** |
|---|---|
| **Use Case ID** | UC-STAFF-01 |
| **Use Case Name** | Superadmin Manages Staff |
| **Description** | Allows the Superadmin to create, edit, activate, or deactivate Administrator staff accounts. |
| **Primary Actor** | Superadmin |
| **Include use cases** | - |
| **Pre-Condition** | Superadmin has an active session. |
| **Post-Condition** | Administrator accounts directory is updated. |
| **Main Flow** | **Step** \| **Action**<br>**Pre-Condition** \| Superadmin navigates to the Staff Management dashboard panel.<br>**13.1** \| Superadmin clicks "Create Staff".<br>**13.2** \| Superadmin inputs credentials (name, email, role, password).<br>**13.3** \| Superadmin clicks "Save Account".<br>**13.4** \| System executes POST request to `/api/admin/staff`. <br>**13.5** \| Staff profile is created and marked as active.<br>**Post-Condition** \| Staff account is created and ready for use. |
| **Alternate Flow** | - **Deactivate Staff:** Superadmin selects a staff member and toggles status to "Inactive", sending a PUT request to disable login access. |
| **Robust Flow** | - **Duplicate Email Check:** If Superadmin creates a staff profile with an email that is already registered, system returns "Email already exists." |

---

*End of Use Case Statements — StayUniKL STP Appendix C*
*All statements follow the official image template structure*
