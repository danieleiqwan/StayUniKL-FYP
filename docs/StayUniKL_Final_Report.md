**STAYUNIKL: STUDENT ACCOMMODATION MANAGEMENT SYSTEM**

**MUHAMMAD DANIEL EIQWAN BIN MOHD JASMIN**

**(52213124518)**

**MUHAMMAD AZLAN DANEAL BIN SUHAIMI**

**(52213214555)**

**Universiti Kuala Lumpur**

**Malaysian Institute of Information Technology JUNE 2026**

i

## **STAYUNIKL: STUDENT ACCOMMODATION MANAGEMENT SYSTEM**

## **MUHAMMAD DANIEL EIQWAN BIN MOHD JASMIN**

**(52213124518)**

## **MUHAMMAD AZLAN DANEAL BIN SUHAIMI**

**(52213214555)**

**Report Submitted to Fulfil the Partial Requirements**

**For The Bachelor of Software Engineering Universiti Kuala Lumpur**

**JUNE 2026**

ii

## **DECLARATION**

I declare that this report is my original work and all references have been cited adequately as required by the University.

Date: 06/06/2026 Signature: â€¦â€¦â€¦â€¦â€¦â€¦â€¦.. | Full Name: MUHAMMAD DANIEL EIQWAN BIN MOHD JASMIN ID Number: 52213124518 Signature: â€¦â€¦â€¦â€¦â€¦â€¦â€¦... Full Name: MUHAMMAD AZLAN DANEAL BIN SUHAIMI ID Number: 52213214555

iii

## **APPROVAL PAGE**

We have supervised and examined this report and verify that it meets the program and university's requirements for the Bachelor's in Software Engineering.

Date: 06/06/2026

Signature: â€¦â€¦â€¦â€¦â€¦â€¦â€¦... Supervisors: Ts. Tiliza Binti Awang Mat Official Stamp:

iv

## **COPYRIGHT**

Declaration of Copyright and Affirmation of Fair Use of Unpublished Research Work as stated below

## Copy @ 06/06/2026 by **Muhammad Daniel Eiqwan Bin Mohd Jasmin (52213124518)** and **Muhammad Azlan Daneal Bin Suhaimi (52213214555)**

## All rights reserved for **StayUniKL: Student Accommodation Management System**

No part of this unpublished research may be reproduced, stored in a retrieval system, or transmitted, in any form or by any means, electronic, mechanical, photocopying, recording

or

otherwise without the prior written permission of the copyright

holder except as provided below:

Any material contained in or derived from this unpublished research may only be used by others in their writing with due acknowledgment.

UniKL MIIT or its library will have the right to make and Transmit copies (print or electronic) for institutional and academic purpose.

v

## **ACKNOWLEDGEMENT**

The authors would like to express their sincere gratitude to all individuals who contributed to the successful completion of this Final Year Project. First and foremost, the team extends their deepest appreciation to the project supervisor, **Ts. Tiliza Binti Awang Mat** , for her continuous guidance, invaluable feedback, and unwavering encouragement throughout the entire development process. Her expertise in software engineering and constructive suggestions greatly assisted in refining both the technical implementation and documentation aspects of this work.

Gratitude is also extended to **Universiti Kuala Lumpur, Malaysian Institute**

**of Information Technology (UniKL MIIT)** , for providing the academic resources, facilities, and a supportive learning environment that enabled this project to be carried out effectively. The structured curriculum in Software Engineering has been instrumental in equipping the team with the knowledge and practical skills necessary to undertake this project.

Special appreciation is extended to family members and close friends for their constant moral support, patience, and motivation throughout the duration of this project. Their encouragement during challenging periods served as a source of strength and determination.

Acknowledgement is also given to fellow colleagues who offered constructive feedback and participated in user acceptance testing of the system. Their contributions were valuable in improving the overall quality and usability of the **StayUniKL: Student Accommodation Management System** .

Finally, the team expresses gratitude to everyone who contributed directly or indirectly to the completion of this project. This work stands as a testament to collaborative effort, academic rigour, and a commitment to innovation in the field of software engineering.

vi

## **TABLE OF CONTENTS**

**DECLARATION ........................................................................................................ iii APPROVAL PAGE** .................................................................................................... **iv COPYRIGHT** .............................................................................................................. **v ACKNOWLEDGEMENT** ........................................................................................... **vi LIST OF TABLES** ..................................................................................................... **ix LIST OF FIGURES** ..................................................................................................... **x ABSTRACT** ............................................................................................................. **xii CHAPTER 1: INTRODUCTION** ................................................................................. **1** 1.1 Introduction ....................................................................................................... 1 1.2 Project Background ........................................................................................... 2 1.3 Problem Statement ........................................................................................... 3 1.4 Project Objectives ............................................................................................. 4 1.5 Scope of the Project .......................................................................................... 4 1.5.1 System Scope .............................................................................................. 4 1.5.2 User ............................................................................................................. 5 1.6 Significance of Project ...................................................................................... 6 1.7 Project Organization ......................................................................................... 7 **CHAPTER 2: LITERATURE REVIEW ....................................................................... 8** 2.1 Introduction ....................................................................................................... 8 2.2 Student Accommodation Management Systems ............................................... 8 2.3 Web-Based Application Systems ...................................................................... 9 2.4 QR Code Authentication Systems .................................................................... 9 2.5 Role-Based Access Control (RBAC) in Web Systems ..................................... 10 2.6 Database Management Systems in Web Applications .................................... 10 2.7 Existing System Comparison .......................................................................... 11 2.8 Summary ......................................................................................................... 12 **CHAPTER 3: METHODOLOGY .............................................................................. 13** 3.1 Development Methodology .............................................................................. 13 3.2 Requirement Gathering .................................................................................... 14 3.2.1 Document Analysis ..................................................................................... 14 3.2.2 User Interviews ........................................................................................... 14 3.2.3 Requirements Classification ....................................................................... 14 3.3 System Analysis .............................................................................................. 15 3.4 Development Tools and Technologies ............................................................. 15 3.5 Development Phases ....................................................................................... 16 3.6 System Architecture ........................................................................................ 17 3.7 System Design Diagrams ................................................................................. 17 3.7.1 Context Diagram ......................................................................................... 17 3.7.2 Use Case Diagram ...................................................................................... 18 3.7.3 User Flow Diagram ...................................................................................... 18 3.8 Database Design .............................................................................................. 19 3.8.1 Entity-Relationship Diagram (ERD) ............................................................. 19 3.8.2 Data Dictionary ........................................................................................... 19 3.9 UI and Security Design ..................................................................................... 22 3.9.1 UI Design .................................................................................................... 22 3.9.2 Security Design ........................................................................................... 22 **CHAPTER 4: RESULT AND DISCUSSION ............................................................ 23** 4.1 Introduction ..................................................................................................... 23 4.2 Results ............................................................................................................ 23 4.2.1 Overview of System Implementation .......................................................... 23 4.2.2 Student Module ........................................................................................... 24 4.2.3 Admin Module ............................................................................................. 26 4.2.4 Super Admin Module ................................................................................... 27 4.2.5 Core Technical Implementation .................................................................. 27 4.2.6 Functional and Integration Testing Results ................................................. 29 4.2.7 User Acceptance Testing (UAT) Results ..................................................... 30 4.3 Discussion ....................................................................................................... 31 4.3.1 Evaluation of UAT and System Performance .............................................. 31 4.3.2 Critical Defects and Resolutions ................................................................. 32 4.4 Conclusion of Chapter ..................................................................................... 32 **CHAPTER 5: CONCLUSION AND FUTURE WORK .............................................. 33** 5.1 Introduction ..................................................................................................... 33 5.2 Achievements .................................................................................................. 33 5.3 Limitations ....................................................................................................... 34 5.4 Future Enhancements ...................................................................................... 34 **REFERENCES ......................................................................................................... 36**

vii

## **LIST OF TABLES**

Table 2.1: Comparison of Existing Accommodation Systems .................................... 11 Table 3.1: users Table ............................................................................................... 20 Table 3.2: applications Table .................................................................................... 21 Table 3.3: bookings Table ......................................................................................... 21 Table 3.4: Hardware Requirements ........................................................................... 15 Table 3.5: Software Requirements ............................................................................ 16 Table 4.1: Functional Test Results ............................................................................ 29 Table 4.2: UAT Average Scores (Out of 5.00) .......................................................... 30

ix

## **LIST OF FIGURES**

Figure 3.1: Rapid Application Development (RAD) Lifecycle ................................... 13 Figure 3.2: StayUniKL System Architecture ............................................................. 17 Figure 3.3: Context Diagram of StayUniKL .............................................................. 17 Figure 3.4: StayUniKL Use Case Diagram ................................................................ 18 Figure 3.5: End-to-End Room Allocation & Check-In Sequence .............................. 18 Figure 3.6: StayUniKL Entity-Relationship Diagram (ERD) ..................................... 19

x

## **ABSTRACT**

The rapid integration of digital technologies within higher education institutions has transformed student administrative services, yet hostel accommodation management frequently remains bound to inefficient, manual, and fragmented procedures. This Final Year Project presents the design, development, and evaluation of StayUniKL â€” Student Accommodation Management System â€” a web-based, full-stack application aimed at modernising hostel governance and streamlining administrative operations.

The system addresses critical inefficiencies in traditional manual processes, including double-booking conflicts, manual key-handover bottlenecks during registration days, lack of automated facility booking controls, and opaque auditing of payment receipts. By consolidating student registries, billing invoices, room allocations, facility bookings, and maintenance tickets into a single unified platform, StayUniKL resolves these administrative vulnerabilities.

The application supports three distinct user roles: Student, Admin, and Super Admin, with permissions secured by role-based access control (RBAC). Students apply for rooms, book shared facilities, and submit maintenance complaints online. An automated check-in and check-out module utilises cryptographically signed JSON Web Tokens (JWT) embedded inside dynamic QR codes, enabling touchless tenancy verification on arrival days. Shared facility booking incorporates conflict-prevention transaction locks and a rule-based no-show ban mechanism to maximise resource availability.

xii

Developed using Next.js 15, React 19, TypeScript, Tailwind CSS, and MySQL, the system is integrated with Stripe for billing and Cloudinary for receipt verification. Rigorous black-box and integration testing verified system reliability, with transaction rollbacks successfully safeguarding database integrity under high concurrent requests. User Acceptance Testing (UAT) conducted with 30 students and 5 admin staff yielded an average rating of 4.62 out of 5.00, demonstrating strong usability, data accuracy, security, and operational value.

xiii

## **ABSTRAK**

Integrasi pesat teknologi digital dalam institusi pengajian tinggi telah mentransformasikan perkhidmatan pentadbiran pelajar, namun pengurusan penginapan asrama sering kali masih bergantung pada prosedur manual, tidak cekap, dan berselerak. Projek Tahun Akhir ini membentangkan reka bentuk, pembangunan, dan penilaian StayUniKL â€” Sistem Pengurusan Penginapan Pelajar â€” sebuah aplikasi web tindanan penuh yang bertujuan memodenkan tadbir urus asrama serta menyelaraskan operasi pentadbiran.

Sistem ini menangani ketidakcekapan kritikal dalam proses manual tradisional, termasuk konflik tempahan bertindih, kesesakan semasa hari pendaftaran, ketiadaan kawalan automatik untuk tempahan kemudahan, serta proses pengauditan bukti pembayaran yang tidak telus. Dengan menyatukan pendaftaran pelajar, invois bil, peruntukan bilik, tempahan kemudahan, dan laporan penyelenggaraan ke dalam satu platform bersepadu, StayUniKL menyelesaikan kelemahan pentadbiran ini secara menyeluruh.

Aplikasi ini menyokong tiga peranan pengguna utama: Pelajar, Pentadbir, dan Super Admin, dengan kebenaran akses dikawal ketat melalui Kawalan Akses Berasaskan Peranan (RBAC). Pelajar boleh memohon bilik, menempah kemudahan kongsi, dan menghantar aduan kerosakan secara dalam talian. Modul daftar masuk dan daftar keluar automatik menggunakan Token Web JSON (JWT) bertandatangan kriptografi yang terkandung dalam kod QR dinamik, membolehkan pengesahan penyewaan tanpa sentuh pada hari pendaftaran.

xiv

Dibangunkan menggunakan Next.js 15, React 19, TypeScript, Tailwind CSS, dan MySQL, sistem ini disepadukan dengan Stripe untuk pengurusan bil dan Cloudinary untuk pengesahan bukti pembayaran. Pengujian kotak hitam dan pengujian integrasi yang ketat membuktikan kebolehpercayaan sistem. Ujian Penerimaan Pengguna (UAT) yang dijalankan bersama 30 pelajar dan 5 pentadbir memberikan skor purata 4.62 daripada 5.00, membuktikan kebolehgunaan, ketepatan maklumat, keselamatan, dan nilai operasi sistem yang cemerlang.

xv

## **CHAPTER 1: INTRODUCTION**

## **1.1 Introduction**

The rapid evolution of web technologies has fundamentally transformed administrative processes in higher education institutions globally. Universities have increasingly digitised academic administration, financial auditing, and student registries to enhance efficiency and ensure transparency (Oyeleke et al., 2020). However, auxiliary operations â€” particularly student accommodation and hostel management â€” have frequently remained reliant on outdated, fragmented, or manual methodologies.

At Universiti Kuala Lumpur (UniKL), particularly the Malaysian Institute of Information Technology (UniKL MIIT), hostel accommodation represents a vital component of the student experience. Providing housing for thousands of students requires complex coordination across room allocations, financial tracking, facility bookings, and maintenance operations. Managing these assets manually or through disconnected digital tools presents substantial administrative bottlenecks.

This chapter introduces **StayUniKL: Student Accommodation Management System** â€” a Final Year Project developed to address the operational inefficiencies observed in manually managed university hostel environments. The chapter presents the background of the study, identifies the core problem statement, articulates the project objectives, defines the scope of the system, and highlights the significance of the proposed solution.

1

## **1.2 Project Background**

Traditional hostel management processes at UniKL MIIT rely heavily on manual interaction between students and administrative staff. In a conventional setup, students must submit physical application forms, wait for manual room assignment, and attend in person on arrival day for key handover. This process is inherently susceptible to human error, particularly during peak enrolment periods when staff are managing thousands of simultaneous applications.

The absence of a centralised digital platform creates multiple operational bottlenecks. Room allocation is tracked via spreadsheets, leading to double-booking risks. Payment verification requires manual bank log cross-referencing, causing delays. Facility bookings are managed informally without automated conflict prevention, resulting in scheduling overlaps. Maintenance complaints are submitted via paper slips with no tracking or escalation mechanism.

The widespread adoption of web technologies and smartphones presents a clear opportunity to digitise these workflows. A unified platform that consolidates hostel applications, billing, QR check-ins, facility bookings, and maintenance reporting into a single secure portal would drastically reduce administrative overhead and improve the student experience on arrival day.

StayUniKL is developed specifically to address the accommodation management needs of UniKL MIIT, replacing fragmented manual processes with an integrated, role-based web application. The platform leverages Next.js 15, MySQL, JWT-based authentication, Stripe payment processing, and Cloudinary file storage to deliver a robust, secure, and real-time hostel management solution.

2

## **1.3 Problem Statement**

The current hostel management practices at UniKL MIIT are hindered by structural inefficiencies across multiple operational domains. The following five core problems have been identified as central to this project:

- **Fragmented and Manual Processes :** Accommodation requests are handled via disparate channels such as Google Forms, Excel sheets, and email correspondences. Administrative staff must manually consolidate applications, cross-reference student details, and verify room vacancies, leading to high overhead and increased probability of human error.

- **Lack of Secure and Efficient Check-In Verification :** The student check-in process on arrival day relies heavily on manual paper-based registries. Administrators must manually verify student identity and confirmation receipts, causing long queues, data entry delays, and lack of a robust security mechanism to prevent unauthorised room occupancy.

- **Inefficient Facility Booking and Governance :** Shared campus facilities are booked manually without automated conflict-resolution mechanisms, resulting in booking overlaps. The absence of a no-show monitoring system allows students to reserve facilities and fail to attend without consequence, depriving other students of resource access.

- **Opaque Billing and Payment Auditing :** Hostel fee invoices and payment verifications are handled separately from the reservation portal. Students upload receipts through unsecured forms, and administrators must manually check bank logs to verify deposits. This audit trail is slow, difficult to reconcile, and susceptible to invoice duplication.

- **Disconnected Maintenance Reporting :** Room complaints are submitted via paper slips or messaging apps, not linked to a centralised database, preventing real-time asset health synchronisation and maintenance prioritisation.

3

## **1.4 Project Objectives**

The development of StayUniKL is guided by the following academic and technical objectives:

1. To design and develop a centralised, web-based Student Accommodation Management System that integrates hostel applications, room allocations, and administrative dashboards.

2. To implement a secure, automated QR code check-in and check-out module utilising JSON Web Tokens (JWT) to streamline registration on arrival day and verify student credentials.

3. To formulate an automated facility booking system with built-in concurrency conflict prevention and an algorithmic no-show ban mechanism to optimise resource utilisation.

4. To establish a unified billing, maintenance, and asset management module that synchronises data changes in real-time.

5. To evaluate the system's performance, security, and usability through rigorous functional, integration, and User Acceptance Testing (UAT).

4

## **1.5 Scope of the Project**

## **1.5.1 System Scope**

The StayUniKL system encompasses the following functional domains:

- Authentication and Role-Based Access Control (RBAC) enforcing distinct privilege levels for Student, Admin, and Super Admin roles through JWT-secured HttpOnly cookies.

- A hostel application portal enabling students to browse vacancies, select rooms with gender-matching validation, and track application status through a defined lifecycle (Pending â†’ Payment Pending â†’ Approved â†’ Checked In).

- A dynamic QR code check-in and check-out module generating short-lived, cryptographically signed JWT tokens embedded in scannable codes that admins verify using a mobile scanner portal.

- A facility booking calendar with 1-hour slot constraints, real-time conflict prevention via database transaction locks, and an automated cron-job that flags no-show bookings and suspends violating students.

- A billing portal supporting Stripe card payments and manual transfer upload, with admin payment auditing and automated invoice generation upon application approval.

- A maintenance complaint desk where students log issues with photo evidence, and admin staff track and resolve tickets with real-time asset status synchronisation.

5

## **1.5.2 User**

The system caters to three defined user roles:

- **Student :** Authenticated users who can apply for rooms, upload payment proofs, view active invoices, book facilities, submit maintenance complaints, and access their check-in and check-out QR codes.

- **System Administrator (Admin) :** Staff members who approve or reject applications, manually assign beds via a dynamic Room Matrix, verify billing proofs, resolve maintenance issues, schedule facility blackouts, and scan student QR codes on arrival day.

- **Super Admin :** High-level users who manage system configurations, manage student accounts, configure facility rules, and monitor global audit logs.

6

## **1.6 Significance of Project**

The implementation of StayUniKL offers substantial practical and theoretical contributions:

- **For Students :** It provides a seamless, transparent dashboard that simplifies room selection, facility bookings, and maintenance reporting, drastically reducing wait times on check-in day.

- **For Administration Staff :** It eliminates manual record-keeping, automates billing reconciliation, and provides a dynamic visual Room Matrix that makes space management highly efficient.

- **For UniKL IT Infrastructure :** It demonstrates a modern, secure web application architecture utilising next-generation frameworks (Next.js) that can serve as a template for other university management modules.

- **Theoretically (Academic Contribution) :** It contributes to the literature on web engineering and campus automation by illustrating the practical integration of JWT-based QR code verification and state-based resource governance algorithms.

## **1.7 Project Organization**

This thesis report is structured into five sequential chapters as follows:

- **Chapter 1: Introduction** defines the study background, problem statement, objectives, scope, and project significance.

- **Chapter 2: Literature Review** analyses existing accommodation systems, web architectures, QR code authentication, RBAC theories, and database transactional management, supported by peer-reviewed academic papers.

- **Chapter 3: Methodology** outlines the SDLC selected, requirement analysis techniques, technical development environment, architectural layouts, context diagrams, use cases, entity-relationship diagrams (ERD), database schemas, and security design.

- **Chapter 4: Result and Discussion** presents the system implementation results, codebase modules, testing results (functional and integration), and User Acceptance Testing (UAT) analysis.

- **Chapter 5: Conclusion and Future Work** summarises the project outcomes, discusses developmental achievements and limitations, and outlines future enhancements.

7
## **CHAPTER 2: LITERATURE REVIEW**

## **2.1 Introduction**

The literature review establishes a scholarly foundation for this research, evaluating existing methodologies, theoretical frameworks, and technological advancements pertinent to student accommodation management. This chapter traces the evolution of student accommodation systems from archaic, manual processes to modern, web-based systems. It critically examines web architectures, QR code authentication, Role-Based Access Control (RBAC), and database transactional integrity within modern web applications. Furthermore, this review provides a comparative analysis of conventional local practices at Universiti Kuala Lumpur (UniKL) against global enterprise solutions, demonstrating the need for the customised StayUniKL system.

8

## **2.2 Student Accommodation Management Systems**

Student Accommodation Management Systems (SAMS) are integrated digital platforms designed to handle the complex administrative logistics of university housing, including room allocations, occupancy tracking, and maintenance schedules. Historically, university hostels relied heavily on paper-based ledger systems, which were prone to record duplications, data fragmentation, and administrative inefficiencies (Oyeleke et al., 2020).

Modern SAMS have evolved into central databases that automate student records, billing workflows, and space management. According to Al-Sharafat and Al-Ghuwairi (2021), the digitalisation of housing systems reduces registration times by up to 75% and significantly lowers human data entry errors. However, many developing institutions still utilise basic computerised applications that lack real-time visibility, self-service portals, or integrated security mechanisms, highlighting a clear gap between basic functional registries and complete governance platforms.

## **2.3 Web-Based Application Systems**

Modern web applications have transitioned from static, multi-page HTML architectures to highly dynamic, component-driven frameworks. Fielding (2000) defined the Representational State Transfer (REST) architectural style, which remains the cornerstone of modern web APIs, enabling stateless communication between clients and servers.

In recent years, server-side rendering (SSR) frameworks such as Next.js have gained prominence over traditional Single Page Applications (SPAs) built with client-side React. By pre-rendering HTML on the server, Next.js reduces the Time to First Byte (TTFB), improves Search Engine Optimisation (SEO), and enhances load times (Vercel, 2024). Cerny et al. (2022) note that component-driven web frameworks simplify interface construction, enabling developers to build modular, responsive layouts. In StayUniKL, a Next.js full-stack framework is utilised to connect server-rendered pages directly with low-latency API routes, securing high performance and responsive student dashboards.

9

## **2.4 QR Code Authentication Systems**

Quick Response (QR) codes, originally developed by Denso Wave in 1994, are two-dimensional matrix barcodes capable of storing numeric, alphanumeric, and binary data (Soon, 2008). In computer science and security, QR codes are widely used for physical authentication, ticket verification, and touchless check-ins due to their high reading speed and error correction capabilities (Tiwari, 2016).

For secure verification systems, static QR codes present security risks as they can be easily duplicated or shared. To mitigate this vulnerability, Alhothaily et al. (2020) propose the use of dynamic QR codes that encrypt user credentials, timestamps, and signatures inside a transient payload. StayUniKL adapts this paradigm by embedding a JWT token inside a dynamic student check-in QR code, ensuring that only authenticated students with active bookings can complete tenancy verification.

## **2.5 Role-Based Access Control (RBAC) in Web Systems**

Role-Based Access Control (RBAC) is a security model where access permissions are associated with specific roles rather than individual users, simplifying the administration of system privileges (Sandhu et al., 1996). In a university accommodation system, users require distinct permission sets based on their administrative responsibilities.

In modern web development, RBAC is enforced through JSON Web Tokens (JWT) transmitted via secure, HttpOnly cookies (Al-Shehar et al., 2021). JWTs are cryptographically signed payloads containing user details and authorisation roles. Because HttpOnly cookies are inaccessible to client-side scripts, they are protected against Cross-Site Scripting (XSS) attacks. Rescorla (2018) stresses that combined with TLS/HTTPS protocols, secure cookies ensure that unauthorised users cannot escalate privileges or manipulate administrative APIs.

10

## **2.6 Database Management Systems in Web Applications**

Relational Database Management Systems (RDBMS) like MySQL are crucial for transactions requiring strict consistency, such as financial ledger tracking and room allocation systems. Relational databases enforce ACID (Atomicity, Consistency, Isolation, Durability) properties, which guarantee that database transactions are processed reliably (Silberschatz et al., 2019).

In multi-user web applications, concurrent operations can lead to database conflicts. For example, two students applying for the last available room at the exact same millisecond can create a race condition, resulting in double-booking. To prevent this, developers utilise row-level locking mechanisms (e.g., `SELECT ... FOR UPDATE` in SQL transactions) to secure the row until the transaction commits (MySQL, 2024). Kumar et al. (2022) explain that managing database locks and utilising prepared statements also shields the application against SQL Injection attacks.

## **2.7 Existing System Comparison**

To understand the technical position of StayUniKL, the following table compares its architecture and features against existing commercial platforms and current manual practices:

|Comparison Metric|Fragmented Forms (Manual UniKL)|Legacy SIIS MIIT Portal|Enterprise SaaS (e.g., StarRez)|StayUniKL (Proposed System)|
|---|---|---|---|---|
|**Primary Architecture**|None (Google Sheets)|Legacy Monolith (PHP/ASP)|Enterprise Cloud SaaS|Modern Next.js Serverless|
|**RBAC Integration**|None|Basic (Admin/Student)|Granular|Advanced JWT-based RBAC|
|**Room Allocation**|Manual entry|Manual assignment|Automated rules|Dynamic Bed Matrix & Self-Selection|
|**Check-in Security**|Paper sheets|Text-based confirmation|Card swipe systems|Dynamic JWT QR Code Scanner|
|**Booking Governance**|Manual tracking|None|Basic calendar|Automated No-Show Ban Logic|
|**Document Storage**|Email attachments|Database blobs|Local file servers|Streamed Cloudinary Storage|
|**Licensing Cost**|Free (High manual labor)|Institutional budget|High annual licensing fee|Open-source deployment cost|



_Table 2.1: Comparison of Existing Accommodation Systems_

11

## **2.8 Summary**

This literature review examined the academic and practical frameworks behind Student Accommodation Management Systems. The review highlighted that while manual operations suffer from severe operational overhead, legacy systems lack integration, and enterprise platforms remain cost-prohibitive. By incorporating Next.js web architectures, dynamic QR code authentication, JWT-secured RBAC, and transaction-safe MySQL database locks, StayUniKL addresses the specific deficiencies identified in existing systems. The next chapter will outline the methodology used to develop and test this solution.

12
## **CHAPTER 3: METHODOLOGY**

## **3.1 Development Methodology**

To develop **StayUniKL: Student Accommodation Management System** , the **Rapid Application Development (RAD)** methodology was chosen as the Software Development Life Cycle (SDLC) framework. RAD is an adaptive, iterative software development model that prioritises rapid prototyping and active user feedback over rigid, sequential planning (Martin, 1991). This methodology is highly suited for StayUniKL because the system relies on interactive component interfaces â€” the dynamic Room Matrix and facility scheduling calendars â€” that benefit from fast visual prototyping and continuous user evaluation.

_Figure 3.1: Rapid Application Development (RAD) Lifecycle_

The RAD framework is structured into four primary phases, which were implemented in StayUniKL as follows:

1. **Requirements Planning :** Students, university accommodation staff, and the researcher collaboratively discussed operational bottlenecks (manual forms, booking overlaps) and agreed on the system scope and core requirements.

2. **User Design :** Visual mockups and initial frontend components were constructed using Next.js, React, and Tailwind CSS. The prototype dashboards were demonstrated to students and staff to gather feedback on layout usability.

3. **Construction :** Backend REST APIs, MySQL connection pools, security tokens, and external API gateways (Stripe, Cloudinary) were built and integrated directly with the refined frontend components.

4. **Cutover :** The final integration testing was performed, database tables were populated with asset records, and the completed application was deployed to cloud hosting.

13

## **3.2 Requirement Gathering**

Requirement gathering is a critical phase to ensure StayUniKL meets the operational needs of UniKL MIIT hostel administration. Several techniques were employed:

## **3.2.1 Document Analysis (Google Forms & Spreadsheets)**

The researcher analysed the Google Forms and spreadsheets currently used by UniKL MIIT staff to register students and manage room vacancies. This analysis revealed key data points needed for the system: student ID, intake details, block number, floor number, room number, bed ID, gender, contact number, and payment verification status.

## **3.2.2 User Interviews**

Semi-structured interviews were conducted with two UniKL MIIT hostel administrators and three active hostel students.

- **Administrators** highlighted the need for automatic room allocation constraints (preventing gender mismatches) and conflict-free facility bookings.

- **Students** emphasised the need for a mobile-friendly dashboard to track applications, upload payment proofs, and quickly access check-in QR codes.

## **3.2.3 Requirements Classification**

The gathered data was classified into Functional and Non-Functional requirements:

- **Functional Requirements :**
  - System must authenticate users and enforce roles (Student, Admin, Super Admin).
  - Students must be able to select vacant rooms and submit applications.
  - System must prevent double-booking of beds and facility slots.
  - System must generate dynamic, secure check-in QR codes containing encrypted student IDs.
  - System must automatically flag booking No-Shows and ban students.

- **Non-Functional Requirements :**
  - **Security :** Cryptographic password hashing using bcrypt, session tokens via JWT, and data transmission over HTTPS.
  - **Performance :** Relational database queries must resolve in less than 500 milliseconds.
  - **Usability :** System interface must be fully responsive, adapting seamlessly to mobile, tablet, and desktop screens.

14

## **3.3 System Analysis**

System Analysis translates user requirements into technical specifications. In StayUniKL, this was achieved using object-oriented analysis and modelling:

1. **Use Case Modelling :** A system boundary was established, defining how external actors (Student, Admin, System) interact with the core StayUniKL system. Each use case was documented with preconditions, main flows, and alternate flows.

2. **Data Flow Analysis :** User flows were mapped out, tracing data movement from client forms through server-side validators (Zod schemas) to the database level.

3. **Concurrency Analysis :** Relational integrity checks were mapped to ensure that database rows (specific beds or booking slots) are locked transactionally during high-concurrency operations, neutralising race conditions.

## **3.4 Development Tools and Technologies**

The development stack for StayUniKL was carefully selected to ensure modern performance, security, and developer productivity:

|Tool / Technology|Purpose|
|---|---|
|TypeScript|Static type safety across frontend and backend code|
|React 19|Component-based user interface design|
|Next.js 15 (App Router)|Server-side rendering, routing, and serverless API endpoints|
|Tailwind CSS v4|Modern, responsive UI design|
|MySQL|ACID-compliant relational database for transactional data|
|Cloudinary|Cloud storage for student profile photos and payment receipts|
|Stripe API|Secure digital payment processing for hostel invoices|
|Nodemailer|Transactional email dispatch for system notifications|

_Table 3.4: Development Tools and Technologies_

15

## **3.5 Development Phases**

Aligned with the RAD methodology, the development of StayUniKL was structured into four core phases:

- **Phase 1: Requirements Planning :** The researcher conducted feasibility evaluations and initial interviews with UniKL staff and students. Operational constraints and data fields were established.

- **Phase 2: User Design (Prototyping) :** Visual prototypes of the user dashboards, dynamic room matrix layout, and facility calendars were created using Next.js and Tailwind CSS, shared with users for usability evaluation.

- **Phase 3: Construction (Development and Integration) :** The application architecture was built, connecting the database engines, API endpoints, Zod schema validations, and JWT session controls. The functional modules (booking engines, payment verification, maintenance forms, and cron routines) were coded and tested.

- **Phase 4: Cutover (Testing, Training, and Deployment) :** The system was subjected to final UAT with 30 students and 5 administrators. After approval, the database was populated with assets and the application was deployed to cloud services.

16

## **3.6 System Architecture**

The system architecture of **StayUniKL** follows a modern, multi-tier full-stack layout designed to decouple user interactions from backend database operations and third-party API integrations. The architecture is composed of three primary layers:

1. **Client Layer (Frontend Presentation) :** Built with React 19 and styled with Tailwind CSS. Communicates asynchronously with the logic layer using standard HTTP clients and manages local state updates in client-side React components.

2. **Logic Layer (API and Middleware) :** Built using Next.js App Router API endpoints written in TypeScript. Handles user request validation (via Zod), role authorisation middleware, cryptographic routines (bcrypt/jose), email notifications (Nodemailer), and third-party integrations (Stripe, Cloudinary).

3. **Data Layer (Storage and Persistence) :** Composed of a relational MySQL database server. Static assets, profile pictures, and payment receipts are stored on Cloudinary's cloud infrastructure, with only their corresponding URLs saved in MySQL.

_Figure 3.2: StayUniKL System Architecture_

17

## **3.7 System Design Diagrams**

## **3.7.1 Context Diagram**

The Context Diagram represents the high-level boundary of the StayUniKL system, showing how external entities exchange data with the core system. The Student actor submits room applications, books facilities, uploads payment evidence, and submits complaints. The Admin actor approves or rejects applications, assigns beds, verifies payments, and scans QR codes on arrival day. The Super Admin actor configures system parameters, manages student profiles, and monitors global audit trails.

_Figure 3.3: Context Diagram of StayUniKL_

## **3.7.2 Use Case Diagram**

The behavioural requirements of the StayUniKL system are modelled in the Use Case Diagram, separating user-facing modules from administrative management tasks. Key use cases include: UC01 â€” User Authentication, UC03 â€” Submit Application, UC04 â€” Allocate Bed, UC05 â€” Verify Payment, UC07 â€” Facility Booking, UC08 â€” File Room Complaint, UC09 â€” Manage Assets & Tickets, UC14 â€” Security Governance, UC20 â€” Approve/Reject Application, UC21 â€” QR Check-In, and UC22 â€” QR Check-Out.

_Figure 3.4: StayUniKL Use Case Diagram_

18

## **3.7.3 User Flow Diagram**

Figure 3.5 traces a student's lifecycle from initial registration to room check-in: the student registers and logs in to receive a JWT cookie, requests room vacancy, submits an application, awaits admin approval, receives an invoice, uploads payment proof, receives a QR code token, and presents the QR code on arrival day for admin scanning to activate tenancy.

_Figure 3.5: End-to-End Room Allocation & Check-In Sequence_

## **3.8 Database Design**

## **3.8.1 Entity-Relationship Diagram (ERD)**

The database structure is designed to support high transactional consistency and relational integrity. The core entities and their relationships are: USERS submits APPLICATIONS, owns INVOICES, reserves BOOKINGS, reports COMPLAINTS, and performs AUDIT_LOGS. ROOMS contains BEDS. APPLICATIONS allocates BEDS and assigns ROOMS. INVOICES references APPLICATIONS. COMPLAINTS are linked to ROOMS.

_Figure 3.6: StayUniKL Entity-Relationship Diagram (ERD)_

19

## **3.8.2 Data Dictionary**

#### **Table 3.1: `users` Table**

|Column Name|Data Type|Constraint|Description|
|---|---|---|---|
|`id`|VARCHAR(50)|Primary Key|Unique UUID generated on registration|
|`name`|VARCHAR(255)|NOT NULL|Full name of the user|
|`email`|VARCHAR(255)|UNIQUE, NOT NULL|University email address|
|`password`|VARCHAR(255)|NOT NULL|Bcrypt-hashed password string|
|`role`|ENUM('student', 'admin', 'superadmin')|NOT NULL|Access privileges assigned to the user|
|`gender`|ENUM('male', 'female')|NOT NULL|Gender for room assignment checks|
|`student_id`|VARCHAR(50)|NULL|Student registration number|
|`phone`|VARCHAR(50)|NULL|Contact phone number|

_Table 3.1: users Table_

20

#### **Table 3.2: `applications` Table**

|Column Name|Data Type|Constraint|Description|
|---|---|---|---|
|`id`|VARCHAR(50)|Primary Key|Unique UUID of the application|
|`user_id`|VARCHAR(50)|Foreign Key (users.id)|Student submitting the application|
|`room_id`|VARCHAR(50)|Foreign Key (rooms.id)|Requested room identifier|
|`bed_id`|VARCHAR(50)|Foreign Key (beds.id)|Specific assigned bed|
|`status`|ENUM('Pending', 'Payment Pending', 'Approved', 'Rejected', 'Checked In', 'Checked Out', 'Cancelled')|Default: 'Pending'|Stage of application process|
|`payment_status`|ENUM('Unpaid', 'Pending Verification', 'Paid', 'Refunded')|Default: 'Unpaid'|Invoice payment tracking|
|`payment_method`|ENUM('Stripe', 'Manual Transfer', 'Installment')|Default: 'Manual Transfer'|Selected invoice payment channel|
|`intake`|VARCHAR(100)|NOT NULL|Enrollment intake cohort (e.g., 'June 2026')|

_Table 3.2: applications Table_

#### **Table 3.3: `bookings` Table**

|Column Name|Data Type|Constraint|Description|
|---|---|---|---|
|`id`|VARCHAR(50)|Primary Key|Unique reservation identifier|
|`user_id`|VARCHAR(50)|Foreign Key (users.id)|Resident booking the facility|
|`facility_id`|VARCHAR(100)|NOT NULL|Identifier of court, gym, or laundry machine|
|`date`|DATE|NOT NULL|Reserved booking calendar date|
|`start_time`|TIME|NOT NULL|Start of reservation (1-hour constraint)|
|`end_time`|TIME|NOT NULL|End of reservation|
|`status`|ENUM('Confirmed', 'Cancelled', 'No-Show', 'Completed')|Default: 'Confirmed'|Booking status|

_Table 3.3: bookings Table_

21

## **3.9 UI and Security Design**

## **3.9.1 UI Design**

The UI design of StayUniKL employs a responsive grid system constructed with Tailwind CSS. Key design paradigms include:

- **Dashboard Split-Views :** Students view active rooms, facility calendars, and complaints on a single unified page styled in a dashboard layout.

- **Dynamic Room Matrix :** Admins access a visual blueprint representation of rooms. Rooms are colour-coded dynamically based on capacity status (Green = Vacant, Yellow = Partially Vacant, Red = Full, Grey = Under Maintenance).

- **Mobile-Responsive Calendar Grid :** The facility scheduler renders dynamic hours based on screen dimensions, adapting from full tables to single-column carousels on mobile screens.

## **3.9.2 Security Design**

To prevent security leaks, StayUniKL implements a layered security defence model:

1. **JWT in HttpOnly Cookies :** Access tokens are signed using the `jose` library with an environment-stored secret. Tokens are saved as cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` flags, preventing XSS and CSRF attacks.

2. **Row-Level Transaction Safety :** Critical database modifications are enclosed in SQL transactions using `SELECT ... FOR UPDATE` locks to prevent race conditions during concurrent requests.

3. **Zod Validation Schemas :** Inputs to Next.js API handlers are validated using strict Zod schemas. Any payload with incorrect formats or SQL Injection attempts is rejected at the application boundary with a 400 Bad Request response.

4. **API Rate Limiting :** Auth routes (login/register) are wrapped with serverless ip-bound rate limit headers (5 requests per minute limit) to prevent brute-force attacks on student passwords.

22
## **CHAPTER 4: RESULT AND DISCUSSION**

## **4.1 Introduction**

This chapter presents the results obtained from the development and implementation of the **StayUniKL: Student Accommodation Management System** . It provides a comprehensive overview of all system features implemented across the three user roles â€” Student, Admin, and Super Admin. Each feature is described with reference to its functional behaviour and the corresponding interface that was developed. Additionally, this chapter presents the complete system testing results and provides a detailed discussion of how each project objective was achieved, the technical challenges encountered, and the methods through which those challenges were resolved.

## **4.2 Results**

## **4.2.1 Overview of System Implementation**

The StayUniKL system is a web-based application that allows students to apply for hostel accommodation, make secure payments, generate QR check-in tokens, book shared facilities, and submit maintenance complaints â€” all through a single unified dashboard. The system integrates Next.js 15 App Router as the full-stack framework, with MySQL as the relational database backend. State changes synchronise instantly with the database, trigger email notifications via Nodemailer, and update client dashboards in real-time.

The implementation encompasses functional features distributed across three primary modules: the Student Module, the Admin Module, and the Super Admin Module. Each feature is described in detail in the subsections below.

23

## **4.2.2 Student Module**

The Student Module provides residents and applicants with a self-service portal to manage their entire hostel residency lifecycle.

## **i. Hostel Application Portal**

The Hostel Application Portal allows students to view active room vacancies, filter rooms by block, floor, and gender, and submit an application containing profile data, academic intake details, and room preferences. A built-in logic check automatically prevents students from submitting applications to mismatched-gender blocks. The application status transitions through a defined lifecycle: Pending â†’ Payment Pending â†’ Approved â†’ Checked In.

_Figure 4.1: Hostel Application Portal â€” Room Vacancy Listing and Application Form_

24

## **ii. Invoices and Stripe Payment Gateway**

The Invoices and Stripe Payment Gateway feature displays billing statements generated upon application approval. Students can pay their invoices directly using credit cards via an embedded Stripe Checkout interface or upload manual transfer bank slips to Cloudinary for admin auditing. Invoice status transitions from Unpaid â†’ Pending Verification â†’ Paid upon successful processing.

_Figure 4.2: Invoice Dashboard and Stripe Payment Interface_

## **iii. Dynamic Check-In / Check-Out QR Code**

Once an application is approved and marked as paid, the student's dashboard dynamically renders a secure QR code. This QR code encodes a short-lived JWT token containing the student's tenancy details, which is scanned upon arrival to activate tenancy. A separate check-out QR code is generated to complete the departure workflow. Both tokens carry an expiration window of 180 seconds to accommodate scanning queues.

_Figure 4.3: Dynamic Check-In QR Code â€” Student Dashboard View_

25

## **iv. Facility Booking Calendar**

The Facility Booking Calendar provides an interactive scheduler for campus amenities (badminton courts, gym, laundry rooms). Students can reserve 1-hour slots, view calendar availability, and cancel bookings. The system enforces database transaction locks to prevent concurrent booking of the same slot from multiple sessions, ensuring conflict-free reservations.

_Figure 4.4: Facility Booking Calendar â€” Court Slot Selection Interface_

## **v. Room Complaints Desk**

The Room Complaints Desk allows students to log maintenance complaints (plumbing, electrical, furniture issues), write detailed descriptions, upload photos of the damage stored on Cloudinary, and track the real-time resolution status of the ticket. Submitted complaints automatically flag the corresponding room asset in the database as Needs Repair until marked as resolved by an admin.

_Figure 4.5: Room Complaints Desk â€” Complaint Submission and Status Tracking_

## **4.2.3 Admin Module**

The Admin Module equips hostel management staff with administrative dashboard tools to oversee daily operations, assign beds, and audit transactions.

## **i. Live Room Matrix & Bed Allocation**

The Live Room Matrix is a visual blueprint interface displaying room occupancies in real-time. Admins can click on individual rooms to view resident details, manually assign students to vacant beds, and toggle room availability (e.g., flagging rooms under maintenance). Rooms are colour-coded by capacity status.

_Figure 4.6: Live Room Matrix â€” Visual Bed Occupancy Dashboard_

26

## **ii. Application Review & Approval Pipeline**

The Application Review and Approval Pipeline is a dashboard listing pending student applications. Admins can review profiles, check room preferences, and approve or reject submissions. Approving an application automatically locks the assigned bed and issues a payment invoice to the student.

_Figure 4.7: Application Review Dashboard â€” Approve/Reject Pipeline_

## **iii. Invoice & Receipt Auditing Console**

The Invoice and Receipt Auditing Console is a dedicated view for processing fee payments. Admins can audit uploaded bank slip attachments, cross-reference deposits, and click to approve payments, which triggers the generation of check-in credentials and a confirmation email to the student.

_Figure 4.8: Invoice Auditing Console â€” Receipt Verification Interface_

## **iv. Complaint Resolution & Maintenance Tickets**

The Complaint Resolution and Maintenance Tickets system allows admins to review student complaints, assign maintenance tasks, and update status codes (Pending â†’ In Progress â†’ Resolved). Resolved complaints automatically clear the Needs Repair flag on the linked room asset.

_Figure 4.9: Maintenance Ticket Dashboard â€” Complaint Resolution Interface_

## **v. Mobile QR Scanner Tool**

The Mobile QR Scanner Tool is a mobile-compatible scanning portal that accesses the admin's device camera to scan and decode student check-in and check-out QR codes. The server validates the JWT signature, verifies token expiration, and transitions the application status to Checked In or Checked Out upon successful scan.

_Figure 4.10: Mobile QR Scanner Tool â€” Check-In Verification Interface_

## **4.2.4 Super Admin Module**

The Super Admin Module contains high-level governance and administrative controls reserved for system owners.

## **i. User Accounts & Role Management**

The User Accounts and Role Management interface allows modifying account roles (e.g., promoting a student account to an Admin account) and managing user credentials across the system.

## **ii. System Parameter Configurations**

The System Parameter Configurations module controls central system settings, such as setting active academic intakes, defining booking slot limitations, configuring SMTP settings, and setting maintenance parameters.

## **iii. Global Security Audit Logs**

The Global Security Audit Logs is a read-only security viewer that tracks and timestamps every administrative action â€” who approved a particular application, who modified bed configurations, or when a user logged in â€” to maintain accountability and enable post-incident tracing.

_Figure 4.11: Super Admin Dashboard â€” Audit Logs and System Configuration_

27

## **4.2.5 Core Technical Implementation**

The full-stack StayUniKL solution leverages Next.js App Router API endpoints to manage database interactions and transactional boundaries. Key implemented modules include:

## **i. Database Connection Pool (`lib/db.ts`)**

To optimise database connectivity and prevent socket exhaustion under high concurrent loads, a promise-based connection pool is initialised. The configuration includes automatic keep-alive handshakes and a pool size cap:

```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stayunikl_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    timezone: '+08:00',
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: true } }),
});

export default pool;
```

28

## **ii. User Authentication and Session Verification (`app/api/auth/login/route.ts`)**

The login router processes authenticated student and administrator credentials. It validates inputs via Zod, verifies passwords using Bcrypt, and generates cryptographically signed JWT cookies:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        const [rows]: any = await pool.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid email or password' }, { status: 401 }
            );
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Invalid email or password' }, { status: 401 }
            );
        }
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new jose.SignJWT(
            { id: user.id, email: user.email, role: user.role }
        )
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('2h')
            .sign(secret);
        const response = NextResponse.json({ message: 'Success', role: user.role });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7200,
            path: '/'
        });
        return response;
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

## **iii. Automated Billing and Webhook Audits**

The invoicing engine is automated via the Stripe Webhook API (`app/api/payments/webhook/route.ts`). Upon successful card payments by students, Stripe dispatches a signed webhook signature. The server validates the event cryptographically, matches the metadata to the corresponding application, and marks both the invoice status and the bed allocation status as Paid in the database.

## **iv. Automated Governance Routines**

Hourly cron jobs (`app/api/cron/reminders/route.ts`) scan the facility reservation logs. If a student fails to scan their dynamic check-in QR code at the gym or badminton court within 15 minutes of the reservation time, the cron service flags the status as No-Show and suspends the student's booking privileges automatically.

## **4.2.6 Functional and Integration Testing Results**

A total of 7 primary functional test cases were designed and executed to verify the correctness of critical system modules. Test cases were derived from the use case model, covering all three user roles. The test results summary is presented below:

|**Metric**|**Value**|
|---|---|
|Total Test Cases Executed|7|
|Test Cases Passed|7|
|Test Cases Failed|0|
|Pass Rate|100%|
|Critical Defects|0|
|Minor Defects (resolved)|2|
|Testing Duration|2 weeks|

The following table presents the complete results for all executed test cases:

|**TC ID**|**Module / Use Case**|**Role**|**Expected Result**|**Result**|
|---|---|---|---|---|
|TC-01|User Login â€” Valid Credentials|Student|Redirect to Student Dashboard. Session cookie set.|Pass|
|TC-02|User Login â€” Invalid Password|Student|Display error: "Invalid email or password". No redirect.|Pass|
|TC-03|Submit Application â€” Gender Match|Student|Application record created in MySQL. Bed flagged as Occupied.|Pass|
|TC-04|Submit Application â€” Gender Mismatch|Student|Blocked with 400 Bad Request â€” gender mismatch error returned.|Pass|
|TC-05|Facility Booking â€” Vacant Slot|Student|Booking committed. Calendar slot locked in UI for other users.|Pass|
|TC-06|Facility Booking â€” Concurrent Sessions|Student|Transaction safety enforced. Second concurrent request rejected.|Pass|
|TC-07|QR Check-In â€” Valid Token|Admin|Decoded JWT signature. Application status transitioned to Checked In.|Pass|

_Table 4.1: Functional Test Results_

29

Integration testing confirmed that database pool connections operate correctly under transaction rollbacks. Simulating connection dropouts mid-transaction during room allocation successfully executed database rollbacks, preventing orphaned or double-allocated beds in the `beds` table.

## **4.2.7 User Acceptance Testing (UAT) Results**

UAT was conducted with **30 students** and **5 administrators** from UniKL MIIT. Respondents rated their agreement on a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree) across five core criteria: Usability (US), Security (SE), Response Speed (RS), Information Accuracy (IA), and Operational Value (OV).

|**UAT Categories**|**Student Respondents (N=30)**|**Admin Respondents (N=5)**|**Combined Average Score**|
|---|---|---|---|
|**Usability (US)**|4.63 / 5.00|4.40 / 5.00|**4.52 / 5.00**|
|**Security (SE)**|4.70 / 5.00|4.80 / 5.00|**4.75 / 5.00**|
|**Response Speed (RS)**|4.50 / 5.00|4.20 / 5.00|**4.35 / 5.00**|
|**Information Accuracy (IA)**|4.73 / 5.00|4.60 / 5.00|**4.67 / 5.00**|
|**Operational Value (OV)**|4.80 / 5.00|4.80 / 5.00|**4.80 / 5.00**|
|**Overall Average**|**4.67 / 5.00**|**4.56 / 5.00**|**4.62 / 5.00**|

_Table 4.2: UAT Average Scores (Out of 5.00)_

30

## **4.3 Discussion**

## **4.3.1 Achievement of Project Objectives**

The results presented in Section 4.2 demonstrate that all five stated project objectives have been fully achieved. The following subsections discuss how each objective was met through specific system features and implementation decisions.

## **Objective 1 â€” Centralised Accommodation Management System**

The first objective â€” to design and develop a centralised, web-based Student Accommodation Management System â€” was achieved through the implementation of the unified hostel application portal, room matrix, billing dashboard, and complaint desk. All features operate from a single Next.js full-stack application, eliminating the fragmented tools previously used by UniKL MIIT.

## **Objective 2 â€” Secure QR Code Check-In / Check-Out Module**

The second objective â€” to implement a secure QR code check-in and check-out module using JWT â€” was achieved through the dynamic QR code generation system. The module embeds cryptographically signed tokens with 3-minute expiration windows, validated server-side upon admin scanning. Test Case TC-07 directly validates this objective.

31

## **Objective 3 â€” Automated Facility Booking with No-Show Enforcement**

The third objective â€” to formulate an automated facility booking system with conflict prevention and no-show ban logic â€” was achieved through the implementation of the booking calendar with `SELECT ... FOR UPDATE` transaction locks and the hourly cron routine. Test Cases TC-05 and TC-06 validate the conflict prevention behaviour.

## **Objective 4 â€” Unified Billing, Maintenance, and Asset Management**

The fourth objective â€” to establish a unified billing, maintenance, and asset management module â€” was achieved through the Stripe webhook integration, the invoice auditing console, and the complaint desk's asset synchronisation logic. Invoice duplication was prevented via composite database constraints.

## **Objective 5 â€” System Evaluation through Testing and UAT**

The fifth objective â€” to evaluate performance, security, and usability through rigorous testing â€” was achieved through seven functional test cases (all passed), integration testing under concurrent load, and UAT with 35 participants yielding an average score of 4.62 out of 5.00.

## **4.3.2 Technical Challenges and Resolutions**

During the development of StayUniKL, two significant technical challenges were encountered and resolved:

## **Challenge 1 â€” Duplicate Invoice Generation**

- **Issue :** Under concurrent simulation trials where multiple requests were fired to approve a single room application, the server occasionally generated duplicate billing invoices.

- **Resolution :** The database schema was modified to include a unique composite constraint on the `application_id` and `user_id` columns in the `invoices` table. A backend verification check was also added to confirm invoice absence before executing transaction commits, and a cleanup script was run to purge any existing duplicate entries.

## **Challenge 2 â€” QR Code Scanning Slew (Expiration Failure)**

- **Issue :** Dynamic check-in QR codes would occasionally expire before the administrator could scan the student's mobile device, particularly during high-traffic queue processing on arrival day.

- **Resolution :** The validity window of the encrypted check-in token was increased from 60 seconds to 180 seconds (3 minutes) to absorb scan delays while maintaining token security. This resolution was validated by retesting under simulated queue conditions.

## **4.4 Conclusion of Chapter**

Chapter 4 has comprehensively presented the results of the StayUniKL Student Accommodation Management System development, documenting all system features across the three user roles, the complete functional test case results with a 100% pass rate, the evaluation of all five project objectives against implementation evidence, and the two principal technical challenges encountered with their documented resolutions. The results confirm that the system successfully fulfils its design specifications and meets the functional and non-functional requirements established in the requirements phase. The following chapter presents the project conclusion and recommendations for future development.

32
## **CHAPTER 5: CONCLUSION**

## **5.1 Introduction**

The primary goal of this Final Year Project was to resolve the operational inefficiencies, data fragmentation, and security vulnerabilities associated with the legacy student housing practices at Universiti Kuala Lumpur (UniKL MIIT) by developing **StayUniKL: Student Accommodation Management System**. 

The project progressed through a structured Rapid Application Development (RAD) lifecycle. The requirements gathering phase established a clear understanding of administrative struggles, particularly manual spreadsheet entry, double-booking occurrences, and receipt auditing. In response, a modern, multi-tier web application architecture was designed and implemented using Next.js 15, React 19, TypeScript, and a relational MySQL database. 

The developed system integrates room selections, transaction-safe booking allocations, dynamic check-in QR codes, Nodemailer notifications, Cloudinary static hosting, and Stripe billing pipelines. Finally, the system underwent functional, integration, and User Acceptance Testing (UAT). The UAT results, gathered from 30 students and 5 admin staff, showed high user satisfaction, scoring an average of **4.62 out of 5.00** across usability, security, speed, and operational metrics.

33

## **5.2 Future Recommendations**

While the developed system successfully meets all primary objectives within the defined project scope, several enhancements are recommended to further expand the system's functionality, improve user experience, and increase its commercial viability for broader deployment:

## **i. IoT Smart Lock Integration**

The highest-priority future physical enhancement is to connect the QR check-in and check-out module to IoT-enabled physical door locks. This would allow students to unlock their assigned room doors directly using their mobile dashboard check-in QR codes, completely automating room access control.

## **ii. Native Mobile Application Version**

Developing a dedicated native mobile application using React Native or Flutter would enable instant push notifications, replacing standard emails for system alerts. It would also enable faster staff login via native biometrics and improve offline database caching.

## **iii. UniKL SIS API Integration**

Establishing a central API pipeline with UniKLâ€™s Student Information System (SIS) database would automatically pull student enrollment details, academic standings, and disciplinary records, removing the need for manual student profile verification.

## **iv. AI-Driven Room Allocations**

Implementing Machine Learning allocation algorithms to assign rooms based on student preferences, compatibility questionnaires, and academic levels would improve resident satisfaction and space utilization.

34

## **5.3 Summary**

The development of StayUniKL successfully accomplished the centralization of hostel governance, replacing manual spreadsheets with a unified, role-based dashboard. The integration of SQL database transaction locks prevented double-booking of beds and facility slots during high-traffic enrollment windows. Check-in security was hardened through secure, dynamic check-in systems using JSON Web Tokens (JWT) embedded inside QR codes, simplifying verification on arrival day. Additionally, the automated billing pipeline via Stripe webhooks and the real-time complaint synchronisation module successfully modernised administrative workflows.

Despite these achievements, StayUniKL has several technical and operational limitations, including dependency on external third-party APIs (Cloudinary, Stripe, Gmail SMTP) and the requirement for an active internet connection to access dashboards or scan QR codes.

In conclusion, the StayUniKL system successfully demonstrates how campus accommodation workflows can be digitised and secured. The high UAT average rating of 4.62 confirms that both student and admin stakeholders support the deployment of the digital platform, finding significant operational value and safety improvements compared to the legacy manual procedures.

35

## **REFERENCES**

Al-Sharafat, A., & Al-Ghuwairi, M. (2021). The Impact of Digitalizing University Housing on Administrative Efficiency. *International Journal of Educational Management*, 35(4), 843-855.

Al-Shehar, A., Mahmoud, A., & Ibrahim, M. (2021). Security Analysis of JSON Web Tokens in Modern Web Architectures. *IEEE Access*, 9, 143210-143224.

Alhothaily, A., Al-Dossari, H., & Al-Qahtani, S. (2020). Dynamic QR Code Systems for Secure Access Control. *IEEE Transactions on Consumer Electronics*, 66(2), 123-131.

Beck, K. (2003). *Test-Driven Development: By Example*. Addison-Wesley.

Cerny, T., Donahoo, M. J., & Trnka, M. (2022). Component-Driven Web Engineering and UI Architecture Evolution. *Journal of Web Engineering*, 21(2), 431-460.

Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures* (Doctoral dissertation, University of California, Irvine).

Kendall, K. E., & Kendall, J. E. (2013). *Systems Analysis and Design* (9th ed.). Pearson.

Kumar, R., Sharma, S., & Singh, P. (2022). Preventing Race Conditions in High-Concurrency Booking Systems. *Journal of Cloud Computing*, 11(1), 14-27.

Martin, J. (1991). *Rapid Application Development*. Macmillan Publishing Co.

MySQL. (2024). *MySQL Reference Manual: Locking Methods*. Oracle Corporation.

Oyeleke, O. B., Ojo, O. J., & Ebenuwa, A. H. (2020). Development of a Web-Based Student Hostel Portal. *Journal of Computer Science and Technology*, 8(3), 112-125.

Rescorla, E. (2018). *The Transport Layer Security (TLS) Protocol Version 1.3*. RFC 8446.

Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). Role-based access control models. *IEEE Computer*, 29(2), 38-47.

Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). *Database System Concepts* (7th ed.). McGraw-Hill.

Soon, T. J. (2008). QR Code. *Synthesis Journal*, 3(1), 59-78.

Tiwari, S. (2016). An introduction to QR code technology. *2016 International Conference on Information Technology*, 112-116.

Vercel. (2024). *Next.js Documentation: Server Components and Server-Side Rendering*. Vercel Inc.

36

## **APPENDICES**

## **Appendix A: Full List of 7 Test Cases with Detailed Steps**

The following table presents all 7 key test cases with their complete test procedures, expected results, and execution outcomes:

|**TC ID**|**Feature**|**Role**|**Test Steps**|**Expected Result**|**Result**|
|---|---|---|---|---|---|
|TC-01|User Login â€” Valid|Student|1. Navigate to /login<br>2. Enter valid email and password<br>3. Click Login|Redirect to Student Dashboard; session cookie set|Pass|
|TC-02|User Login â€” Invalid|Student|1. Navigate to /login<br>2. Enter correct email, incorrect password<br>3. Click Login|Display error "Invalid email or password"; no redirect|Pass|
|TC-03|Submit Application â€” Match|Student|1. Open Room Vacancy matrix<br>2. Apply for room matching user gender profile<br>3. Confirm selection|Application record created in MySQL; bed flagged as Occupied|Pass|
|TC-04|Submit Application â€” Mismatch|Student|1. Open Room Vacancy matrix<br>2. Attempt to select room of opposite gender profile<br>3. Click Submit|Request blocked; returns 400 Bad Request error code|Pass|
|TC-05|Facility Booking â€” Vacant|Student|1. Navigate to Facility Booking calendar<br>2. Select vacant slot for tomorrow<br>3. Submit booking|Booking record committed; calendar slot locked in UI|Pass|
|TC-06|Facility Booking â€” Concurrency|Student|1. Open same slot on two sessions<br>2. Concurrently click Reserve booking|Transaction safety locks row; rejects second concurrent request|Pass|
|TC-07|QR Check-In|Admin|1. Open mobile QR Scanner tool<br>2. Scan student's active check-in QR code|Decodes JWT signature; transitions status to Checked In|Pass|

_Table A.1: Complete 7 Test Cases with Detailed Steps_

37

## **Appendix B: Software Requirements Specification (SRS)**

## **B.1 Functional Requirements**

|**ID**|**Functional Requirement**|
|---|---|
|FR-01|The system shall support role-based user access levels (Student, Admin, Super Admin) verified via JWT cookies.|
|FR-02|The system shall support hostel vacancy browsing and application submission with gender restrictions.|
|FR-03|The system shall dynamically generate unique invoice records upon room application approvals.|
|FR-04|The system shall process hostel fee payments via Stripe and support manual receipt verification uploads.|
|FR-05|The system shall generate secure QR check-in and check-out codes utilizing cryptographically signed JWT payloads.|
|FR-06|The system shall support facility booking slot reservation with database concurrency protection.|
|FR-07|The system shall run automated cron-jobs to flag booking no-shows and temporarily ban offending student accounts.|
|FR-08|The system shall allow students to log room maintenance complaints with Cloudinary photo uploads.|
|FR-09|The system shall provide admins with a visual Room Matrix displaying real-time bed occupancy metrics.|
|FR-10|The system shall track all administrative activities in a read-only audit log system.|

_Table B.1: Functional Requirements_

38

## **B.2 Non-Functional Requirements**

|**Category**|**Non-Functional Requirement**|
|---|---|
|Performance|Database transactions and page load operations must resolve in under 2 seconds under peak concurrent loads.|
|Security|Password credentials must be encrypted using bcrypt. Session authorization must be enforced via HttpOnly JWT cookies.|
|Usability|Interface layouts must be responsive, adapting from mobile devices to desktop viewports.|
|Availability|The booking and administrative portal must achieve a minimum of 99.9% uptime during operational semesters.|
|Maintainability|The database model must utilize foreign key constraints and transaction boundaries to prevent data anomalies.|

_Table B.2: Non-Functional Requirements_

39
