# CHAPTER 1: INTRODUCTION

## 1.1 Background of Study
The rapid evolution of web technologies has fundamentally transformed administrative processes in higher education institutions globally. In recent years, universities have increasingly digitized academic administration, financial auditing, and student registries to enhance efficiency and ensure transparency (Oyeleke et al., 2020). However, auxiliary operations—particularly student accommodation and hostel management—have frequently remained reliant on outdated, fragmented, or manual methodologies. 

At Universiti Kuala Lumpur (UniKL), particularly the Malaysian Institute of Information Technology (UniKL MIIT), hostel accommodation represents a vital component of the student experience. Providing housing for thousands of students requires complex coordination across room allocations, financial tracking, facility bookings, and maintenance operations. Managing these assets manually or through disconnected digital tools (such as Google Forms or static databases) presents substantial administrative bottlenecks. 

This research introduces **StayUniKL: Student Accommodation Management System**, a web-based, full-stack application designed specifically to digitalize and automate hostel governance at UniKL. Developed using the Next.js App Router framework, StayUniKL integrates real-time database transactions, automated facility booking conflict prevention, and secure JSON Web Token (JWT)-based QR code authentication. By consolidating administrative workflows into a unified portal, StayUniKL aims to minimize manual intervention, eliminate double-booking concurrency conflicts, and enforce campus governance rules.

---

## 1.2 Problem Statement
The current hostel management practices at UniKL MIIT are hindered by structural inefficiencies across multiple operational domains:

1. **Fragmented and Manual Processes:** Accommodation requests are handled via disparate channels, such as Google Forms, Excel sheets, and email correspondences. This fragmentation requires administrative staff to manually consolidate applications, cross-reference student details, and verify room vacancies, leading to high administrative overhead and an increased probability of human error.
2. **Lack of Secure and Efficient Check-In Verification:** The student check-in process on arrival day relies heavily on manual paper-based registries. Administrators must manually verify student identity, confirmation receipts, and assign keys. This causes long queues, data entry delays, and lacks a robust security mechanism to prevent unauthorized room occupancy.
3. **Inefficient Facility Booking and Governance:** Shared campus facilities, such as badminton courts and study rooms, are booked manually or without automated conflict-resolution mechanisms. This lack of automation results in booking overlaps. Furthermore, the absence of a "no-show" monitoring system allows students to reserve facilities and fail to attend without consequence, depriving other students of resource access.
4. **Opaque Billing and Payment Auditing:** Hostel fee invoices and payment verifications are handled separately from the reservation portal. Students upload receipts through unsecured forms, and administrators must manually check bank logs to verify deposits. This manual audit trail is slow, difficult to reconcile, and susceptible to invoice duplication and fraud.
5. **Disconnected Maintenance Reporting:** Room complaints and facility damage reports are submitted via paper slips or basic messaging apps. Because reporting is not linked to a centralized database, maintenance staff cannot prioritize tasks, and room asset health analytics cannot be synchronized in real-time.

---

## 1.3 Project Objectives
To resolve these systemic inefficiencies, the development of StayUniKL is guided by the following academic and technical objectives:

1. **Objective 1:** To design and develop a centralized, web-based Student Accommodation Management System that integrates hostel applications, room allocations, and administrative dashboards.
2. **Objective 2:** To implement a secure, automated QR code check-in and check-out module utilizing JSON Web Tokens (JWT) to streamline registration on arrival day and verify student credentials.
3. **Objective 3:** To formulate an automated facility booking system with built-in concurrency conflict prevention and an algorithmic no-show ban mechanism to optimize resource utilization.
4. **Objective 4:** To establish a unified billing, maintenance, and asset management module that synchronizes data changes in real-time.
5. **Objective 5:** To evaluate the system’s performance, security, and usability through rigorous functional, integration, and User Acceptance Testing (UAT).

---

## 1.4 Project Scope
The scope of StayUniKL is bounded by its target users, core functionalities, and architectural constraints within the UniKL ecosystem:

### 1.4.1 Target Users (Roles)
* **Student:** Authenticated users who can apply for rooms, upload payment proofs, view active invoices, book facilities, submit maintenance complaints, and access their check-in QR codes.
* **System Administrator (Admin):** Staff members who approve/reject applications, manually assign beds via a dynamic Room Matrix, verify billing proofs, resolve maintenance issues, schedule facility blackouts, and generate reports.
* **Super Admin:** High-level users who manage system configurations, manage student accounts, configure facility rules, and monitor global audit logs.

### 1.4.2 Functional Scope
* **Authentication and Role-Based Access Control (RBAC):** Implementing secure JWT authentication stored in HttpOnly cookies to enforce role privileges (`Student`, `Admin`, `Super Admin`) and mitigate Session Hijacking.
* **Hostel Enrollment Lifecycle:** Automated form submission with gender-matching validation, transaction-safe database locks to prevent bed double-booking, and status flow transitions (Pending $\rightarrow$ Payment Pending $\rightarrow$ Approved $\rightarrow$ Checked In).
* **QR-Based Check-In/Check-Out:** Dynamic generation of secure QR codes containing encrypted student tenancy payloads, which admins scan using the built-in mobile scanner portal.
* **Facility Booking & Governance:** A real-time booking grid with a 1-hour slot reservation constraint and an automated cron-job execution that flags "No-Show" bookings and bans violating students.
* **Complaint and Asset Synchronization:** A reporting portal where room complaints automatically flag the corresponding asset in the room database as "Needs Repair" until marked as resolved.

### 1.4.3 Architectural Constraints
* Developed as a full-stack JavaScript application using Next.js, React, and TypeScript.
* MySQL is utilized as the primary relational database, and Cloudinary manages file uploads.
* External API integrations include Stripe for payment processing and Nodemailer for automated system email notifications.

---

## 1.5 Significance of Project
The implementation of StayUniKL offers substantial practical and theoretical contributions:

* **For Students:** It provides a seamless, transparent dashboard that simplifies room selection, facility bookings, and maintenance reporting, drastically reducing wait times on check-in day.
* **For Administration Staff:** It eliminates manual record-keeping, automates billing reconciliation, and provides a dynamic visual Room Matrix that makes space management highly efficient.
* **For UniKL IT Infrastructure:** It demonstrates a modern, secure web application architecture utilizing next-generation frameworks (Next.js) that can serve as a template for other university management modules.
* **Theoretically (Academic Contribution):** It contributes to the literature on web engineering and campus automation by illustrating the practical integration of JWT-based QR code verification and state-based resource governance algorithms (no-show bans).

---

## 1.6 Project Organization
This thesis report is structured into five sequential chapters as follows:

* **Chapter 1: Introduction** defines the study background, problem statement, objectives, scope, and project significance.
* **Chapter 2: Literature Review** analyzes existing accommodation systems, web architectures, QR code authentication, RBAC theories, and database transactional management, supported by peer-reviewed academic papers.
* **Chapter 3: Methodology** outlines the software development life cycle (SDLC) selected, requirement analysis techniques, technical development environment, architectural layouts, context diagrams, use cases, entity-relationship diagrams (ERD), database schemas, and security design.
* **Chapter 4: Result and Discussion** presents the system implementation results, codebase modules, testing results (functional and integration), and User Acceptance Testing (UAT) analysis.
* **Chapter 5: Conclusion and Future Work** summarizes the project outcomes, discusses developmental achievements and limitations, and outlines future enhancements.

---

## References (Chapter 1)
* Oyeleke, O. B., Ojo, O. J., & Ebenuwa, A. H. (2020). Development of a Web-Based Student Hostel Portal. *Journal of Computer Science and Technology*, 8(3), 112-125.
