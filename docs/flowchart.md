# StayUniKL — Complete User Flowchart
**System Analyst & UX Architect View | FYP Documentation**

---

> [!NOTE]
> This document is split into **7 sub-diagrams** for clarity. Each covers a major functional domain of the StayUniKL hostel management system. All diagrams use Mermaid.js flowchart syntax (`LR` = Left-to-Right, `TD` = Top-Down).

---

## 1. Authentication Flow (Login, Register, Forgot Password)

Covers all three entry points for both Student and Admin roles, including validation, token expiry, and unauthorized access guards.

```mermaid
flowchart TD
    A([🚀 START]) --> B[/Landing Page/]
    B --> C{User Action}

    C -->|Register| D[Student Registration Form\nName · Email · IC · Phone · Password]
    C -->|Login| E[Login Form\nEmail + Password]
    C -->|Admin Login| F[Admin Login Form\nEmail + Password]

    %% ── REGISTRATION BRANCH ──
    D --> D1{Validate Inputs}
    D1 -->|Invalid fields| D2[/Show field-level\nerror messages/]
    D2 --> D
    D1 -->|Valid| D3{Email already\nexists?}
    D3 -->|Yes| D4[/Show: Email already\nregistered/]
    D4 --> D
    D3 -->|No| D5[Hash password\nCreate student record]
    D5 --> D6[Send verification\nemail]
    D6 --> D7{Student clicks\nverification link?}
    D7 -->|Link expired\n> 24 hrs| D8[/Show: Link expired.\nResend?/]
    D8 -->|Resend| D6
    D7 -->|Valid link| D9[Mark email verified\nActivate account]
    D9 --> E

    %% ── STUDENT LOGIN BRANCH ──
    E --> E1{Validate inputs\nnot empty}
    E1 -->|Empty| E2[/Show: Required fields/]
    E2 --> E
    E1 -->|Filled| E3{Credentials\nvalid?}
    E3 -->|Invalid| E4[Increment failed\nattempt counter]
    E4 --> E5{Attempts ≥ 5?}
    E5 -->|Yes| E6[/Lock account\n15 min cooldown/]
    E6 --> E7([⏳ Wait / Contact Admin])
    E5 -->|No| E8[/Show: Invalid email\nor password/]
    E8 --> E
    E3 -->|Valid| E9{Email verified?}
    E9 -->|No| E10[/Show: Verify your\nemail first/]
    E10 --> E
    E9 -->|Yes| E11[Generate JWT session\nSet HttpOnly cookie]
    E11 --> E12{Role check}
    E12 -->|Admin role| E13[/Redirect → Admin Dashboard/]
    E12 -->|Student role| E14[/Redirect → Student Dashboard/]

    %% ── ADMIN LOGIN BRANCH ──
    F --> F1{Credentials valid?}
    F1 -->|No| F2[/Invalid credentials/]
    F2 --> F
    F1 -->|Yes| F3{Is Admin role?}
    F3 -->|No| F4[/Unauthorized Access\n403/]
    F3 -->|Yes| E13

    %% ── FORGOT PASSWORD ──
    C -->|Forgot Password| G[Enter registered\nemail]
    G --> G1{Email exists\nin system?}
    G1 -->|No| G2[/Show: If email exists,\nyou'll receive a link/]
    G1 -->|Yes| G3[Generate reset token\nExpires in 1 hr]
    G3 --> G4[Send reset\nemail]
    G4 --> G5{User clicks\nreset link}
    G5 -->|Expired token| G6[/Token expired.\nRequest again?/]
    G6 -->|Yes| G
    G5 -->|Valid token| G7[Enter new password\n+ confirm password]
    G7 --> G8{Passwords match\n& meet policy?}
    G8 -->|No| G9[/Show policy errors/]
    G9 --> G7
    G8 -->|Yes| G10[Hash & update password\nInvalidate old token]
    G10 --> G11[/Success: Password reset.\nLogin now/]
    G11 --> E
```

---

## 2. Student — Hostel Application Flow

Covers the full application lifecycle from eligibility check through admin approval/rejection and room allocation trigger.

```mermaid
flowchart TD
    A([Student Dashboard]) --> B{Active tenancy\nexists?}
    B -->|Yes| C[/Show current room\ndetails. Cannot re-apply./]
    B -->|No| D{Pending application\nexists?}
    D -->|Yes| E[/Show: Application under\nreview. Please wait./]
    D -->|No| F[Application Form\nIC · Programme · Year · Semester\nRoom Preference · Special Needs]

    F --> G{All required\nfields filled?}
    G -->|No| H[/Highlight missing fields/]
    H --> F
    G -->|Yes| I{Upload required\ndocuments?}
    I -->|Missing docs| J[/Error: Missing\nrequired documents/]
    J --> F
    I -->|Docs uploaded| K{File format &\nsize valid?\nPDF ≤ 5 MB}
    K -->|Invalid| L[/Show: Invalid file.\nRe-upload/]
    L --> F
    K -->|Valid| M[Submit Application\nStatus → Pending]

    M --> N[/Confirmation email\nsent to student/]
    N --> O[(Application stored\nin Database)]
    O --> P[Admin receives\nnotification]

    P --> Q{Admin reviews\napplication}
    Q -->|Reject| R[Admin adds\nrejection reason]
    R --> R1[Status → Rejected]
    R1 --> R2[/Email notification\nsent to student/]
    R2 --> R3[/Student sees\nRejection + Reason/]
    R3 --> R4{Student wants\nto re-apply?}
    R4 -->|Yes| F
    R4 -->|No| Z([END])

    Q -->|Approve| S[Status → Approved]
    S --> S1[/Email notification\nsent to student/]
    S1 --> S2[Trigger Room\nAllocation Process]
    S2 --> T([→ See Flow 3: Room Allocation])
```

---

## 3. Room Allocation & Check-In Flow

Covers admin room assignment, QR code generation, and student check-in.

```mermaid
flowchart TD
    A([Approved Application]) --> B[Admin opens\nRoom Allocation Panel]
    B --> C[View approved\napplications list]
    C --> D[Select student\napplication]

    D --> E{Available rooms\nfor preference?}
    E -->|No available rooms| F[/Mark student on\nWaiting List/]
    F --> G[/Notify student:\nno room available yet/]
    G --> H{Room becomes\navailable?}
    H -->|No| I([Student waits])
    H -->|Yes| E

    E -->|Available| J[Admin selects\nroom number]
    J --> K{Room currently\noccupied?}
    K -->|Yes| L[/Show: Room occupied.\nSelect another./]
    L --> J
    K -->|No| M[Assign room to student\nUpdate room status → Occupied]

    M --> N[Generate unique\nQR Code for check-in]
    N --> O[/Send QR Code\nto student email/]
    O --> P[Status → Waiting Check-In]

    P --> Q{Student arrives\nat hostel}
    Q --> R[Admin scans\nQR Code]
    R --> S{QR Code\nvalid?}
    S -->|Invalid / Tampered| T[/Show: Invalid QR\nCode. Verify manually./]
    T --> U[Manual verification\nby admin]
    U --> V{Identity\nconfirmed?}
    V -->|No| W[/Deny check-in/]
    V -->|Yes| X
    S -->|Valid| X[Update status → Checked In\nRecord check-in timestamp]

    X --> Y[Create active\nTenancy record]
    Y --> Z[/Student Dashboard\nupdates: Room assigned/]
    Z --> AA([Student now has\nactive tenancy])
```

---

## 4. Facility Booking Flow (Court, Gym, Laundry)

Covers all three facility types with shared booking logic, double-booking prevention, and cancellation.

```mermaid
flowchart TD
    A([Student Dashboard]) --> B{Active tenancy?}
    B -->|No tenancy| C[/Access denied.\nOnly residents\ncan book facilities./]
    B -->|Has tenancy| D[/Facility Booking Page/]

    D --> E{Select Facility}
    E -->|Badminton Court| F[Court Booking Form\nDate · Time Slot · Duration]
    E -->|Gym| G[Gym Booking Form\nDate · Session Time]
    E -->|Laundry| H[Laundry Booking Form\nDate · Machine No · Time Slot]

    %% Shared validation path
    F & G & H --> I[Select preferred\ndate and time]
    I --> J{Is selected date\nin the past?}
    J -->|Yes| K[/Cannot book past dates/]
    K --> I
    J -->|No| L{Slot available?}
    L -->|Slot taken| M[/Show: Slot already booked.\nChoose another time./]
    M --> I
    L -->|Maintenance block| N[/Slot under\nmaintenance. Unavailable./]
    N --> I
    L -->|Available| O{User has existing\nbooking same day?}
    O -->|Yes - Court only\n1 booking/day limit| P[/Limit reached.\nOnly 1 court booking/day/]
    P --> I
    O -->|No conflict| Q[Review booking\nsummary]

    Q --> R{Confirm\nbooking?}
    R -->|Cancel| D
    R -->|Confirm| S[Create booking record\nStatus → Confirmed]
    S --> T[/Confirmation shown\non dashboard/]
    T --> U[/Send email\nreminder/]

    U --> V{Booking time\narrives}
    V --> W{Student shows up?}
    W -->|No-show| X[Mark as No-Show\nLog incident]
    W -->|Shows up| Y[Use facility]
    Y --> Z[Booking auto-closes\nafter duration ends]

    %% Cancellation
    T --> CA{Student wants\nto cancel?}
    CA -->|Yes| CB{Cancellation >\n2 hrs before?}
    CB -->|Too late < 2 hrs| CC[/Cannot cancel.\nContact admin./]
    CB -->|Within window| CD[Cancel booking\nSlot released]
    CD --> CE[/Cancellation confirmed/]

    Z & CE --> ZZ([END])
```

---

## 5. Complaint Submission & Resolution Flow

Covers submission, admin triage, status updates, and resolution feedback loop.

```mermaid
flowchart TD
    A([Student Dashboard]) --> B{Active tenancy?}
    B -->|No| C[/Only active residents\ncan submit complaints/]
    B -->|Yes| D[Complaint Submission Form\nCategory · Description · Attachment]

    D --> E{Category selected?}
    E -->|No| F[/Please select a category\ne.g. Plumbing · Electrical · Cleanliness/]
    F --> D
    E -->|Yes| G{Description\n≥ 20 characters?}
    G -->|Too short| H[/Provide more detail/]
    H --> D
    G -->|Valid| I{Attach image?\nOptional ≤ 5 MB}
    I -->|File too large| J[/File exceeds 5 MB/]
    J --> D
    I -->|OK / Skipped| K[Submit Complaint\nStatus → Open]

    K --> L[/Ticket ID generated\nConfirmation to student/]
    L --> M[Admin receives\ncomplaint notification]

    M --> N{Admin reviews\ncomplaint}
    N -->|Spam / Duplicate| O[Mark as Closed\nReason: Duplicate/Spam]
    O --> O1[/Notify student:\nTicket closed with reason/]

    N -->|Legitimate| P[Assign to\nmaintenance staff]
    P --> Q[Status → In Progress]
    Q --> Q1[/Notify student:\nTicket In Progress/]

    Q1 --> R{Issue resolved?}
    R -->|No - needs more time| S[Admin updates\nprogress note]
    S --> R
    R -->|Resolved| T[Mark Status → Resolved]
    T --> T1[/Notify student:\nIssue resolved/]

    T1 --> U{Student confirms\nresolution?}
    U -->|Not satisfied| V[Student reopens\ncomplaint with feedback]
    V --> N
    U -->|Satisfied| W[Close ticket\nLog resolution time]
    W --> X([END])
```

---

## 6. Payment Flow

Covers payment submission, verification, failed payment handling, and receipt generation.

```mermaid
flowchart TD
    A([Student Dashboard]) --> B{Payment due?}
    B -->|No pending payment| C[/No outstanding\nbalance. All settled./]
    B -->|Has outstanding| D[/Payment Page\nOutstanding Balance Shown/]

    D --> E[Select payment\nmethod\nOnline Transfer · Card · eWallet]
    E --> F[Upload payment\nproof / Enter ref no.]

    F --> G{Proof uploaded\nor ref provided?}
    G -->|No| H[/Please provide\npayment proof/]
    H --> F
    G -->|Yes| I{File format valid?\nJPG · PNG · PDF ≤ 5 MB}
    I -->|Invalid| J[/Invalid file type\nor size/]
    J --> F
    I -->|Valid| K[Submit for\nadmin verification]
    K --> L[Status → Pending Verification]
    L --> L1[/Confirmation sent\nto student/]

    L1 --> M{Admin verifies\npayment}
    M -->|Invalid / Insufficient| N[Admin rejects\nwith reason]
    N --> N1[/Notify student:\nPayment rejected + reason/]
    N1 --> O{Student retries?}
    O -->|Yes| F
    O -->|No| P([Student contacts admin])

    M -->|Valid & Amount correct| Q[Mark as Paid\nUpdate balance]
    Q --> R[Generate PDF Receipt]
    R --> S[/Send receipt\nto student email/]
    S --> T[/Dashboard shows\nPaid status + Receipt link/]

    %% Overdue handling
    B --> U{Payment overdue\n> 30 days?}
    U -->|Yes| V[/Flag account:\nOverdue. Facility access\nmay be restricted./]
    V --> D

    T --> Z([END])
```

---

## 7. Admin Management Flows (Overview)

High-level admin control panel flows covering all management domains.

```mermaid
flowchart TD
    A([Admin Dashboard]) --> B{Select Module}

    B -->|Applications| C[View all applications\nFilter: Pending · Approved · Rejected]
    C --> C1{Action}
    C1 -->|Review| C2[Open application\ndetail view]
    C2 --> C3{Decision}
    C3 -->|Approve| C4[→ Room Allocation\nSee Flow 3]
    C3 -->|Reject| C5[Enter rejection reason\nNotify student]

    B -->|Room Management| D[View room inventory\nOccupied · Vacant · Maintenance]
    D --> D1{Action}
    D1 -->|Set Maintenance| D2[Block room\nAdd duration note]
    D1 -->|View Occupant| D3[Show student details\ncheck-in date]
    D1 -->|Force checkout| D4{Confirm action?}
    D4 -->|Yes| D5[Release room\nEnd tenancy\nNotify student]

    B -->|Facility Management| E[Manage facilities\nCourt · Gym · Laundry]
    E --> E1{Action}
    E1 -->|Block for maintenance| E2[Select date/time range\nMark as unavailable]
    E1 -->|View bookings| E3[List all bookings\nFilter by date/facility]
    E1 -->|Cancel booking| E4[Cancel & notify student]

    B -->|Complaints| F[View all tickets\nOpen · In Progress · Resolved]
    F --> F1[Assign staff\nUpdate status\nAdd notes]

    B -->|Payments| G[View payment\nsubmissions]
    G --> G1{Verify payment}
    G1 -->|Approve| G2[Mark paid\nGenerate receipt]
    G1 -->|Reject| G3[Enter reason\nNotify student]

    B -->|Students| H[View all students\nSearch · Filter by status]
    H --> H1{Action}
    H1 -->|View profile| H2[Full student details]
    H1 -->|Deactivate account| H3{Confirm?}
    H3 -->|Yes| H4[Disable login\nNotify student]

    B -->|Reports| I[Generate reports\nOccupancy · Revenue · Complaints]
    I --> I1[Export PDF / CSV]
    I1 --> Z([END])
```

---

## 8. Profile & Settings Management Flow

```mermaid
flowchart TD
    A([Student / Admin Dashboard]) --> B[Navigate to\nProfile / Settings]

    B --> C{Section}

    C -->|View Profile| D[Display read-only info\nName · IC · Email · Room · Status]

    C -->|Change Password| E[Enter current password\n+ new password\n+ confirm new]
    E --> E1{Current password\ncorrect?}
    E1 -->|No| E2[/Wrong current password/]
    E2 --> E
    E1 -->|Yes| E3{New password meets\npolicy? ≥ 8 chars\nUppercase · Symbol}
    E3 -->|No| E4[/Show policy requirements/]
    E4 --> E
    E3 -->|Yes| E5{New ≠ Current?}
    E5 -->|Same| E6[/New password must differ\nfrom current/]
    E6 --> E
    E5 -->|Different| E7[Update password\nInvalidate existing sessions]
    E7 --> E8[/Password updated.\nPlease re-login./]

    C -->|Notification Settings| F[Toggle email\nnotification preferences\nBookings · Payments · Complaints]
    F --> F1[Save preferences\nUpdate in DB]
    F1 --> F2[/Settings saved/]

    C -->|Update Contact Info| G[Edit phone number\nor emergency contact]
    G --> G1{Valid format?}
    G1 -->|No| G2[/Invalid phone format/]
    G2 --> G
    G1 -->|Yes| G3[Save changes]
    G3 --> G4[/Contact info updated/]

    E8 & F2 & G4 --> Z([END])
```

---

## System-Level Edge Cases Summary

| Edge Case | Trigger | System Response |
|---|---|---|
| **Invalid Login** | Wrong email/password | Show generic error (no info leakage) |
| **Account Lockout** | 5 failed login attempts | Lock 15 min, email notification |
| **Expired Reset Token** | >1 hr after email sent | Prompt to request new link |
| **Unverified Email** | Login before verification | Block login, resend verification option |
| **Unauthorized Access** | Student hits admin route | 403 Forbidden, redirect to dashboard |
| **Double Booking** | Same slot already taken | Real-time conflict check before confirm |
| **Booking 1/day Limit** | Court: >1 booking/day | Block, show limit message |
| **Past Date Booking** | Selecting past date | Disabled/rejected at form level |
| **Failed Payment** | Admin rejects proof | Student notified, can resubmit |
| **Overdue Payment** | >30 days outstanding | Account flagged, facility access restricted |
| **Invalid QR Check-in** | Tampered/wrong QR | Manual verification flow triggered |
| **Expired Tenancy** | After semester ends | Facility booking locked |
| **Large File Upload** | >5 MB file | Rejected at upload, clear error shown |
| **Re-application While Pending** | Existing pending app | Block form, show status |
| **Session Expiry** | JWT expires mid-session | Auto-logout, redirect to login |

---

## 9. Checkout / Tenancy Termination Flow

Covers the move-out process, room inspection, asset return, and final account settlement.

```mermaid
flowchart TD
    A([Student / Admin]) --> B{Trigger Checkout}
    B -->|Student Initiated| C[Submit Checkout Request\nPreferred Date · Reason]
    B -->|Admin Forced\nEnd of Sem / Expulsion| D[Admin Issues\nCheckout Notice]

    C & D --> E[Admin Schedules\nRoom Inspection]
    E --> F[/Notify Student of\nInspection Date/]

    F --> G{Inspection Day}
    G --> H[Admin/Staff Inspects Room\nWalls · Furniture · Lights · Cleanliness]
    
    H --> I{Damages Found?}
    I -->|Yes| J[Record Damages\nTake Photos]
    J --> K[Generate Damage Fine\nAdd to Student Balance]
    K --> L[Student Pays Fine\n(See Flow 6)]
    L --> M
    
    I -->|No| M[Student Returns Assets\nKeys · Access Card · Inventory]
    
    M --> N{Assets Returned?}
    N -->|No| O[Charge Asset\nReplacement Fee]
    O --> L
    N -->|Yes| P[Final Account Review\nCheck all balances = 0]
    
    P --> Q{Balance Clear?}
    Q -->|No| R[/Show Outstanding:\nCannot Close Tenancy/]
    R --> L
    Q -->|Yes| S[Admin Final Approval]
    
    S --> T[Update System Status]
    T --> T1[Room Status → Vacant]
    T --> T2[Tenancy → Closed]
    T --> T3[Student Account → Inactive Tenant]
    
    T3 --> U[/Generate Checkout\nConfirmation PDF/]
    U --> V[/Email Confirmation\nsent to student/]
    
    V --> W([🚀 END OF TENANCY])
```

---

*Generated for StayUniKL FYP | System Analyst & UX Architect View*
*Covers: Authentication · Application · Room Allocation · Facility Booking · Complaints · Payments · Admin · Profile · Checkout*
