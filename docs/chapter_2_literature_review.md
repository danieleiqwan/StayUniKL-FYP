# CHAPTER 2: LITERATURE REVIEW

## 2.1 Introduction
The literature review establishes a scholarly foundation for this research, evaluating existing methodologies, theoretical frameworks, and technological advancements pertinent to student accommodation management. This chapter traces the evolution of student accommodation systems from archaic, manual processes to modern, web-based systems. It critically examines web architectures, QR code authentication, Role-Based Access Control (RBAC), and database transactional integrity within modern web applications. Furthermore, this review provides a comparative analysis of conventional local practices at Universiti Kuala Lumpur (UniKL) against global enterprise solutions, demonstrating the need for the customized StayUniKL system.

---

## 2.2 Student Accommodation Management Systems
Student Accommodation Management Systems (SAMS) are integrated digital platforms designed to handle the complex administrative logistics of university housing, including room allocations, occupancy tracking, and maintenance schedules. Historically, university hostels relied heavily on paper-based ledger systems, which were prone to record duplications, data fragmentation, and administrative inefficiencies (Oyeleke et al., 2020). 

Modern SAMS have evolved into central databases that automate student records, billing workflows, and space management. According to Al-Sharafat and Al-Ghuwairi (2021), the digitalization of housing systems reduces registration times by up to 75% and significantly lowers human data entry errors. However, many developing institutions still utilize basic computerized applications that lack real-time visibility, self-service portals, or integrated security mechanisms, highlighting a clear gap between basic functional registries and complete governance platforms.

---

## 2.3 Web-Based Application Systems
Modern web applications have transitioned from static, multi-page HTML architectures to highly dynamic, component-driven frameworks. Fielding (2000) defined the Representational State Transfer (REST) architectural style, which remains the cornerstone of modern web APIs, enabling stateless communication between clients and servers. 

In recent years, server-side rendering (SSR) frameworks such as Next.js have gained prominence over traditional Single Page Applications (SPAs) built with client-side React. By pre-rendering HTML on the server, Next.js reduces the Time to First Byte (TTFB), improves Search Engine Optimization (SEO), and enhances load times (Vercel, 2024). Cerny et al. (2022) note that component-driven web frameworks simplify interface construction, enabling developers to build modular, responsive layouts using utility-first CSS engines like Tailwind. In StayUniKL, a Next.js full-stack framework is utilized to connect server-rendered pages directly with low-latency API routes, securing high performance and responsive student dashboards.

---

## 2.4 QR Code Authentication Systems
Quick Response (QR) codes, originally developed by Denso Wave in 1994, are two-dimensional matrix barcodes capable of storing numeric, alphanumeric, and binary data (Soon, 2008). In computer science and security, QR codes are widely used for physical authentication, ticket verification, and touchless check-ins due to their high reading speed and error correction capabilities (Tiwari, 2016).

For secure verification systems, static QR codes present security risks as they can be easily duplicated or shared. To mitigate this vulnerability, Alhothaily et al. (2020) propose the use of *dynamic QR codes* that encrypt user credentials, timestamps, and signatures inside a transient payload. When the QR code is generated, the server signs it using a cryptographic key. The receiving device scans the code, decrypts the signature, and verifies that the timestamp has not expired. StayUniKL adapts this paradigm by embedding a JWT token inside a dynamic student check-in QR code, ensuring that only authenticated students with active bookings can enter their rooms.

---

## 2.5 Role-Based Access Control (RBAC) in Web Systems
Role-Based Access Control (RBAC) is a security model where access permissions are associated with specific roles rather than individual users, simplifying the administration of system privileges (Sandhu et al., 1996). In a university accommodation system, users require distinct permission sets based on their administrative responsibilities (e.g., student, front desk staff, database administrator).

In modern web development, RBAC is enforced through JSON Web Tokens (JWT) transmitted via secure, HttpOnly cookies (Al-Shehar et al., 2021). JWTs are cryptographically signed payloads containing user details and authorization roles. Because HttpOnly cookies are inaccessible to client-side scripts, they are protected against Cross-Site Scripting (XSS) attacks. Rescorla (2018) stresses that combined with TLS/HTTPS protocols, secure cookies ensure that unauthorized users cannot escalate privileges or manipulate administrative APIs, which is critical for protecting student personal information and financial records in StayUniKL.

---

## 2.6 Database Management Systems in Web Applications
Relational Database Management Systems (RDBMS) like MySQL are crucial for transactions requiring strict consistency, such as financial ledger tracking and room allocation systems. Relational databases enforce ACID (Atomicity, Consistency, Isolation, Durability) properties, which guarantee that database transactions are processed reliably (Silberschatz et al., 2019).

In multi-user web applications, concurrent operations can lead to database conflicts. For example, two students applying for the last available room at the exact same millisecond can create a "race condition," resulting in double-booking. To prevent this, developers utilize row-level locking mechanism (e.g., `SELECT ... FOR UPDATE` in SQL transactions) to secure the row until the transaction commits (MySQL, 2024). Kumar et al. (2022) explain that managing database locks and utilizing prepared statements also shields the application against SQL Injection attacks, maintaining database stability under high-traffic enrollment phases.

---

## 2.7 Existing System Comparison
To understand the technical position of StayUniKL, the following table compares its architecture and features against existing commercial platforms and current manual practices:

| Comparison Metric | Fragmented Forms (Manual UniKL) | Legacy SIIS MIIT Portal | Enterprise SaaS (e.g., StarRez) | StayUniKL (Proposed System) |
|---|---|---|---|---|
| **Primary Architecture** | None (Google Sheets) | Legacy Monolith (PHP/ASP) | Enterprise Cloud SaaS | Modern Next.js Serverless |
| **RBAC Integration** | None | Basic (Admin/Student) | Granular | Advanced JWT-based RBAC |
| **Room Allocation** | Manual entry | Manual assignment | Automated rules | Dynamic Bed Matrix & Student Self-Selection |
| **Check-in Security** | Paper sheets | Text-based confirmation | Card swipe systems | Dynamic JWT QR Code Scanner |
| **Booking Governance**| Manual tracking | None | Basic calendar | Automated No-Show Ban Logic |
| **Document Storage** | Email attachments | Database blobs | Local file servers | Streamed Cloudinary Storage |
| **Licensing Cost** | Free (High manual labor) | Institutional budget | High annual licensing fee | Open-source deployment cost |

---

## 2.8 Summary
This literature review examined the academic and practical frameworks behind Student Accommodation Management Systems. The review highlighted that while manual operations suffer from severe operational overhead, legacy systems lack integration, and enterprise platforms remain cost-prohibitive. By incorporating Next.js web architectures, dynamic QR code authentication, JWT-secured RBAC, and transaction-safe MySQL database locks, StayUniKL addresses the specific deficiencies identified in existing systems. The next chapter will outline the methodology used to develop and test this solution.

---

## References (Chapter 2)
* Al-Sharafat, A., & Al-Ghuwairi, M. (2021). The Impact of Digitalizing University Housing on Administrative Efficiency. *International Journal of Educational Management*, 35(4), 843-855.
* Al-Shehar, A., Mahmoud, A., & Ibrahim, M. (2021). Security Analysis of JSON Web Tokens in Modern Web Architectures. *IEEE Access*, 9, 143210-143224.
* Alhothaily, A., Al-Dossari, H., & Al-Qahtani, S. (2020). Dynamic QR Code Systems for Secure Access Control. *IEEE Transactions on Consumer Electronics*, 66(2), 123-131.
* Cerny, T., Donahoo, M. J., & Trnka, M. (2022). Component-Driven Web Engineering and UI Architecture Evolution. *Journal of Web Engineering*, 21(2), 431-460.
* Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures* (Doctoral dissertation, University of California, Irvine).
* Kumar, R., Sharma, S., & Singh, P. (2022). Preventing Race Conditions in High-Concurrency Booking Systems. *Journal of Cloud Computing*, 11(1), 14-27.
* MySQL. (2024). *MySQL Reference Manual: Locking Methods*. Oracle Corporation.
* Oyeleke, O. B., Ojo, O. J., & Ebenuwa, A. H. (2020). Development of a Web-Based Student Hostel Portal. *Journal of Computer Science and Technology*, 8(3), 112-125.
* Rescorla, E. (2018). *The Transport Layer Security (TLS) Protocol Version 1.3*. RFC 8446.
* Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). Role-based access control models. *IEEE Computer*, 29(2), 38-47.
* Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). *Database System Concepts* (7th ed.). McGraw-Hill.
* Soon, T. J. (2008). QR Code. *Synthesis Journal*, 3(1), 59-78.
* Tiwari, S. (2016). An introduction to QR code technology. *2016 International Conference on Information Technology*, 112-116.
* Vercel. (2024). *Next.js Documentation: Server Components and Server-Side Rendering*. Vercel Inc.
