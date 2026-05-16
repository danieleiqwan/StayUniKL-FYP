# CHAPTER 2: LITERATURE REVIEW

## 2.1 Introduction
The literature review serves as a scholarly foundation for this research, providing a critical evaluation of the existing methodologies, theoretical frameworks, and technological advancements pertinent to student accommodation management. This chapter traces the historical trajectory of hostel management—from archaic, labor-intensive manual record-keeping to the current paradigm of automated, cloud-centric architectures. By conducting a comparative analysis of the conventional practices currently utilized at Universiti Kuala Lumpur (UniKL) against contemporary industry standards, this review elucidates the systemic inefficiencies inherent in legacy systems. Ultimately, this chapter establishes the academic and operational justification for **StayUniKL**, emphasizing its role in revolutionizing hostel governance through automation, advanced security protocols, and centralized data management.

## 2.2 Overview of Student Accommodation Management Systems (SAMS)
A Student Accommodation Management System (SAMS) is defined as an integrated digital platform engineered to orchestrate the multifaceted logistics associated with university housing. Historically, these systems were characterized by limited functional scope, focusing predominantly on basic student registries and rudimentary inventory tracking. In contrast, modern SAMS have evolved into sophisticated, holistic ecosystems that manage the entire student residency lifecycle. These contemporary solutions facilitate administrative excellence by streamlining application workflows, ensuring financial transparency through digital audit trails, and enforcing rigorous facility governance. By transcending simple record-keeping, a modern SAMS serves as a strategic tool that optimizes resource utilization and enhances the overall quality of student life within the university environment.

## 2.3 The Imperative for Comprehensive Web-Based Architectures
The transition to a unified, web-based architecture is fundamentally essential for modern academic institutions seeking to maintain operational integrity. The necessity for such systems is predicated on several critical factors:
*   **2.3.1 Centralization and Data Integrity:** Centralizing disparate data points—ranging from student demographic profiles to complex maintenance histories—into a singular, secure relational database (such as MySQL) is paramount for ensuring data consistency. This architecture mitigates the risks of data fragmentation and redundancy often associated with manual spreadsheets and ad-hoc digital forms.
*   **2.3.2 Hardened Security and Cyber-Threat Mitigation:** Within the context of increasing cybersecurity threats, StayUniKL adopts a defense-in-depth strategy. By leveraging the security features of modern frameworks, the system implements robust JSON Web Token (JWT) authentication, granular role-based access control (RBAC), and sophisticated **API rate limiting**. These measures are designed to proactively defend against brute-force attacks and ensure that sensitive institutional data remains confidential and tamper-proof.
*   **2.3.3 Algorithmic Facility Governance and Fairness:** A hallmark of a comprehensive system is its ability to enforce equitable resource distribution. StayUniKL introduces automated **no-show banning mechanisms** that leverage system logic to identify and penalize students who fail to utilize reserved facilities. This algorithmic approach ensures that high-demand institutional resources, such as sports facilities, are utilized to their maximum capacity while discouraging irresponsible booking behaviors.
*   **2.3.4 Dynamic Scalability and Performance:** Utilizing web-based architectures ensures that the system can dynamically scale to accommodate significant spikes in user traffic, particularly during critical semester registration intervals, thereby maintaining high availability and responsive performance under load.

## 2.4 Critical Analysis of Existing Accommodation Management Approaches
Contemporary approaches to hostel management can be categorized by their technological maturity, each exhibiting specific limitations that necessitate a more integrated solution:
*   **2.4.1 Fragmented Manual Methodologies (Current UniKL Practice):** At UniKL, the hostel application process remains significantly fragmented. Initial residency is often secured through a simple "tickbox" during university enrollment, while subsequent semester renewals are managed via disconnected Google Forms. This decentralized approach lacks a dedicated management portal, resulting in opaque application tracking for students and an intensive manual data consolidation burden for administrative staff, which increases the probability of human error.
*   **2.4.2 Legacy Information Systems (e.g., SIIS MIIT):** Institutional systems such as SIIS MIIT represent an earlier era of software design. While functional as basic registries, they offer limited utility beyond displaying student names and static profile data. These systems lack the interactive capabilities required for modern hostel management, such as real-time floor plan visualization, integrated facility booking, and automated event-driven notifications.
*   **2.4.3 Enterprise Software-as-a-Service (SaaS) Solutions (e.g., StarRez, SpaceBasic):** High-end commercial platforms such as **StarRez** and **SpaceBasic** offer robust, feature-rich environments for large-scale housing operations. While these systems provide industry-standard reliability, they are often characterized by prohibitive licensing costs and a "one-size-fits-all" architecture. Such platforms frequently lack the granular flexibility required to integrate specialized institutional workflows, such as UniKL’s specific JWT-based QR check-in protocols or the highly customized facility no-show banning logic required for local campus governance.

## 2.5 Comparative Analysis of Accommodation Management Frameworks
The following table provides a comparative synthesis of the various management approaches, highlighting the technical and functional superiority of the proposed StayUniKL system:

| Feature | Fragmented Forms (Manual) | Legacy SIIS MIIT | Enterprise SaaS (e.g., StarRez) | StayUniKL (Proposed) |
| :--- | :---: | :---: | :---: | :---: |
| **Integrated Management Portal**| Non-existent | Minimal | Comprehensive | **Comprehensive** |
| **Real-time Resource Visibility** | No | No | Yes | **Yes** |
| **Automated Allocation Logic** | Manual | No | Yes | **Yes (Role-based)** |
| **Governance (No-Show Bans)** | No | No | Partial | **Integrated/Automated** |
| **QR-based Workflow Security** | No | No | Limited | **Native Integration** |
| **Security Architecture** | Negligible | Basic | High | **Advanced (JWT/Rate Limiting)** |

## 2.6 Theoretical Implementation of CRUD Operations in StayUniKL
The Create, Read, Update, and Delete (CRUD) paradigm serves as the fundamental operational framework for StayUniKL. By utilizing the **mysql2** driver for low-level database interaction, the system achieves high performance and precise control over data transactions across three primary functional modules, mapped to standard RESTful HTTP patterns.

### 2.6.1 Student Application Lifecycle
This module manages the critical process of student onboarding and room assignment through a structured data lifecycle.
*   **Create (POST):** Students initiate the lifecycle by generating a new application record (`UC_03`). The system captures room preferences and documentation (via Cloudinary), inserting a new record while simultaneously flagging the selected bed as "Occupied" to prevent race conditions.
*   **Read (GET):** The system provides real-time visibility. Students can "Read" their own application history, while Administrators perform bulk queries to manage the global queue, with data privacy enforced through student ID filtering.
*   **Update (PUT):** This operation manages status transitions. Administrators utilize this to "Approve" or "Reject" applications. Additionally, check-in and check-out actions update the tenancy record with valid timestamps (`check_in_date`, `check_out_date`).
*   **Delete (Logical Delete):** To maintain historical audit trails, physical deletion is avoided. Instead, a "Logical Delete" or "Cancellation" flag is used. This ensures that while a slot is released back into the inventory, the historical record remains for institutional accountability.

### 2.6.2 Maintenance and Complaint Management
This module ensures the physical integrity of the hostel through student-reported feedback loops.
*   **Create (POST):** Students generate new complaint entities by documenting issues and attaching photographic evidence. The system records the description, category, and timestamp of the report (`UC_08`).
*   **Read (GET):** Administrators utilize a centralized dashboard to prioritize active complaints, while students track the resolution status of their reported issues in real-time.
*   **Update (PUT):** This is critical for the resolution workflow. Administrators transition the status from 'Pending' to 'Resolved,' a trigger that also synchronizes with the Room Asset condition in the database to reflect the restored integrity of the unit (`UC_09`).

### 2.6.3 Facility Booking and Governance
This module manages shared resources through a high-concurrency transactional model.
*   **Create (POST):** Students reserve time-limited slots for facilities via the calendar interface (`UC_07`). The system validates availability before committing the record.
*   **Read (GET):** The system performs high-frequency Read operations to render the availability grid and display active bookings to both students and management.
*   **Update (PUT):** Update operations occur when Administrators block slots for maintenance or when the system triggers a "No-Show" status update due to a missed check-in window.

### 2.6.4 Database Transactional Integrity & Auditability
Beyond basic operations, StayUniKL ensures a hardened data environment through two key architectural principles:
1.  **Atomicity:** Complex operations—such as room allocation—are treated as atomic transactions. This ensures that creating an application and updating the bed status succeed or fail together, preventing data inconsistencies.
2.  **Audit Logging:** Every Create and Update action triggers a corresponding entry in a dedicated audit logs table (`lib/audit.ts`). This tracks the actor, the timestamp, and the specific action performed, significantly enhancing system security and administrative accountability.

## 2.7 Conclusion
In summary, the literature review underscores a profound disparity between the rudimentary, fragmented systems currently in place at UniKL and the sophisticated requirements of a modern academic environment. By synthesizing the strengths of modern web technologies with institutional-specific requirements, **StayUniKL** emerges as a necessary evolution. It effectively addresses the security vulnerabilities, operational bottlenecks, and governance challenges identified in existing legacy and manual approaches, thereby establishing a new benchmark for student accommodation management.
