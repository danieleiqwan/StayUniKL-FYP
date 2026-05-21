# StayUniKL — Use Case Diagrams
**System:** StayUniKL Digital Hostel Management System
**Document:** Software Test Plan (STP) — Appendix B

---

## Figure 1: Authentication & Role-Based Access Control

```mermaid
flowchart LR
    A1["👤\nStudent"]
    A2["👤\nAdmin"]
    A3["👤\nSuperadmin"]

    subgraph SYS["StayUniKL System — Authentication & RBAC"]
        UC1(["Login"])
        UC2(["Logout"])
        UC3(["Register Account"])
        UC4(["Forgot Password"])
        UC5(["Reset Password"])
        UC6(["Access Student Dashboard"])
        UC7(["Access Admin Dashboard"])
        UC8(["Access Superadmin Panel"])
        UC9(["View Own Profile"])
        UC10(["Update Profile"])
    end

    A1 --> UC1
    A1 --> UC2
    A1 --> UC3
    A1 --> UC4
    A1 --> UC5
    A1 --> UC6
    A1 --> UC9
    A1 --> UC10

    A2 --> UC1
    A2 --> UC2
    A2 --> UC7
    A2 --> UC9

    A3 --> UC1
    A3 --> UC2
    A3 --> UC7
    A3 --> UC8
```

---

## Figure 2: Hostel Application Management

```mermaid
flowchart LR
    A1["👤\nStudent"]
    A2["👤\nAdmin"]

    subgraph SYS["StayUniKL System — Hostel Application Management"]
        UC1(["Submit Hostel Application"])
        UC2(["Select Room Type"])
        UC3(["Select Stay Duration"])
        UC4(["View Application Status"])
        UC5(["View All Applications"])
        UC6(["Filter Applications by Status"])
        UC7(["Approve Application"])
        UC8(["Reject/Cancel Application"])
        UC9(["Assign Bed to Student"])
        UC10(["Update Application Status"])
        UC11(["Send Notification to Student"])
    end

    A1 --> UC1
    UC1 --> UC2
    UC1 --> UC3
    A1 --> UC4

    A2 --> UC5
    A2 --> UC6
    A2 --> UC7
    A2 --> UC8
    A2 --> UC9
    UC7 --> UC10
    UC8 --> UC10
    UC9 --> UC10
    UC10 --> UC11
```

---

## Figure 3: Check-In / Check-Out Management

```mermaid
flowchart LR
    A1["👤\nStudent"]
    A2["👤\nAdmin"]

    subgraph SYS["StayUniKL System — Check-In / Check-Out Management"]
        UC1(["View Personal QR Code"])
        UC2(["Scan QR Code for Check-In"])
        UC3(["System Validates Check-In"])
        UC4(["Update Status to Checked In"])
        UC5(["Record Check-In Timestamp"])
        UC6(["Process Check-Out"])
        UC7(["Update Status to Checked Out"])
        UC8(["Record Check-Out Timestamp"])
        UC9(["View Check-In/Out Logs"])
    end

    A1 --> UC1
    A1 --> UC2
    A2 --> UC2
    UC2 --> UC3
    UC3 --> UC4
    UC4 --> UC5

    A2 --> UC6
    UC6 --> UC7
    UC7 --> UC8

    A2 --> UC9
```

---

## Figure 4: Facility Booking Management

```mermaid
flowchart LR
    A1["👤\nStudent"]
    A2["👤\nAdmin"]

    subgraph SYS["StayUniKL System — Facility Booking Management"]
        UC1(["Browse Available Facilities"])
        UC2(["Select Facility & Date"])
        UC3(["Select Time Slot"])
        UC4(["Submit Booking Request"])
        UC5(["View Booking History"])
        UC6(["Cancel Booking"])
        UC7(["View All Bookings"])
        UC8(["Approve Booking"])
        UC9(["Reject Booking"])
        UC10(["Mark Student Attendance"])
        UC11(["Configure Facility Settings"])
        UC12(["Block / Unblock Time Slots"])
        UC13(["Send Booking Notification"])
    end

    A1 --> UC1
    A1 --> UC2
    UC2 --> UC3
    UC3 --> UC4
    A1 --> UC5
    A1 --> UC6

    A2 --> UC7
    A2 --> UC8
    A2 --> UC9
    A2 --> UC10
    A2 --> UC11
    A2 --> UC12
    UC8 --> UC13
    UC9 --> UC13
```

---

## Figure 5: Complaint Management

```mermaid
flowchart LR
    A1["👤\nStudent"]
    A2["👤\nAdmin"]

    subgraph SYS["StayUniKL System — Complaint Management"]
        UC1(["Submit Complaint"])
        UC2(["Enter Title & Description"])
        UC3(["Attach Supporting Images"])
        UC4(["View Complaint History"])
        UC5(["Track Complaint Status"])
        UC6(["View All Complaints"])
        UC7(["Filter Complaints by Status"])
        UC8(["Update Complaint Status"])
        UC9(["Set In Progress"])
        UC10(["Mark as Resolved"])
        UC11(["Set Technician Appointment"])
        UC12(["Send Status Notification to Student"])
    end

    A1 --> UC1
    UC1 --> UC2
    UC1 --> UC3
    A1 --> UC4
    A1 --> UC5

    A2 --> UC6
    A2 --> UC7
    A2 --> UC8
    UC8 --> UC9
    UC8 --> UC10
    A2 --> UC11
    UC8 --> UC12
    UC11 --> UC12
```

---

## Figure 6: Finance & Invoice Management

```mermaid
flowchart LR
    A1["👤\nStudent"]
    A2["👤\nAdmin"]

    subgraph SYS["StayUniKL System — Finance & Invoice Management"]
        UC1(["View Outstanding Invoices"])
        UC2(["Select Payment Method"])
        UC3(["Confirm & Make Payment"])
        UC4(["View Payment History"])
        UC5(["Download Invoice / Receipt"])
        UC6(["View All Payment Records"])
        UC7(["Filter Payments by Status"])
        UC8(["Filter Payments by Date"])
        UC9(["View Financial Summary"])
        UC10(["Mark Payment as Verified"])
        UC11(["Send Payment Confirmation Notification"])
    end

    A1 --> UC1
    A1 --> UC2
    UC2 --> UC3
    UC3 --> UC11
    A1 --> UC4
    A1 --> UC5

    A2 --> UC6
    A2 --> UC7
    A2 --> UC8
    A2 --> UC9
    A2 --> UC10
```

---

## Figure 7: Room & Asset Management

```mermaid
flowchart LR
    A1["👤\nAdmin"]

    subgraph SYS["StayUniKL System — Room & Asset Management"]
        subgraph ROOM["Room Management"]
            UC1(["View All Rooms & Beds"])
            UC2(["Filter Rooms by Floor"])
            UC3(["Filter Rooms by Gender"])
            UC4(["View Bed Availability Status"])
            UC5(["Update Bed Status"])
            UC6(["Set Bed to Maintenance"])
        end

        subgraph ASSET["Asset Management"]
            UC7(["View Asset Inventory"])
            UC8(["Add New Asset"])
            UC9(["Edit Asset Details"])
            UC10(["Update Asset Status"])
            UC11(["Delete Asset Record"])
            UC12(["Filter Assets by Type or Location"])
        end
    end

    A1 --> UC1
    A1 --> UC2
    A1 --> UC3
    A1 --> UC4
    A1 --> UC5
    A1 --> UC6

    A1 --> UC7
    A1 --> UC8
    A1 --> UC9
    A1 --> UC10
    A1 --> UC11
    A1 --> UC12
```

---

## Figure 8: Admin Dashboard & Audit Log

```mermaid
flowchart LR
    A1["👤\nAdmin"]
    A2["👤\nSuperadmin"]

    subgraph SYS["StayUniKL System — Admin Dashboard & Audit Log"]
        subgraph DASH["Admin Dashboard"]
            UC1(["View Dashboard Summary"])
            UC2(["View Pending Applications Count"])
            UC3(["View Pending Complaints Count"])
            UC4(["View Pending Bookings Count"])
            UC5(["Send System Notification"])
        end

        subgraph AUDIT["Audit Log"]
            UC6(["View All Audit Log Entries"])
            UC7(["Filter Logs by Actor"])
            UC8(["Filter Logs by Action Type"])
            UC9(["Filter Logs by Date Range"])
        end

        subgraph STAFF["Staff Management (Superadmin)"]
            UC10(["View All Admin Accounts"])
            UC11(["Create New Admin Account"])
            UC12(["Edit Admin Account Details"])
            UC13(["Activate Admin Account"])
            UC14(["Deactivate Admin Account"])
        end
    end

    A1 --> UC1
    UC1 --> UC2
    UC1 --> UC3
    UC1 --> UC4
    A1 --> UC5
    A1 --> UC6
    A1 --> UC7
    A1 --> UC8
    A1 --> UC9

    A2 --> UC1
    A2 --> UC6
    A2 --> UC7
    A2 --> UC8
    A2 --> UC9
    A2 --> UC10
    A2 --> UC11
    A2 --> UC12
    A2 --> UC13
    A2 --> UC14
```

---

*End of Use Case Diagrams — StayUniKL STP Appendix B*
*Figures 1–8 correspond to Sections 4.1–4.8 of the Software Test Plan*
