# **Finalizing the Capstone Management System: A Comprehensive Architectural Blueprint for a Zero-Cost**

## **1\. Introduction: The Imperative for a Sustainable Research Infrastructure**

The digitization of academic research management represents a critical inflection point for higher education institutions. The traditional, analog workflows governing capstone projects—characterized by decentralized email submissions, physical document archiving, and fragmented communication channels—create significant administrative overhead and data integrity risks.1 For institutions like Bukidnon State University, specifically within the Information Technology Department, the transition to a centralized **Capstone Management System (CMS)** is not merely a convenience but a strategic necessity to ensure the continuity, quality, and originality of student research.1

However, the prevailing market solutions for research management and plagiarism detection, such as Turnitin or commercial Learning Management Systems (LMS), often impose prohibitive licensing costs that are unsustainable for individual departments or student-led initiatives. This report addresses a specific, rigorous engineering challenge: the design and deployment of a fully functional, professional-grade CMS using a **simple, free MERN stack**, integrated with a **lightweight, zero-cost plagiarism checker**.

This document serves as the definitive architectural blueprint for "Project Workspace." It navigates the stringent constraints of "forever free" cloud tiers—specifically utilizing **MongoDB Atlas M0**, **Render Web Services**, **Vercel**, and **Google APIs**—to deliver a solution that is robust, scalable within departmental limits, and academically rigorous. The analysis goes beyond high-level concepts to provide granular implementation details, mathematical models for similarity scoring within API quotas, and sophisticated deployment strategies to mitigate the limitations of ephemeral cloud infrastructure.

## **2\. Architectural Philosophy and The "Zero-Cost" Constraint**

Designing software with a constraint of zero financial cost requires a fundamental shift in architectural thinking. Unlike enterprise environments where resources can be scaled vertically (adding CPU/RAM) or horizontally (adding instances) for a fee, a zero-cost architecture must be **resource-efficient, ephemeral-tolerant, and quota-aware**.

### **2.1 The MERN Stack Selection Justification**

The selection of the MERN stack (MongoDB, Express.js, React, Node.js) is validated not just by its ubiquity but by its unique alignment with free-tier cloud ecosystems.

* **MongoDB (Database):** The document-oriented nature of MongoDB allows for flexible schema evolution, which is essential for capstone projects where metadata requirements may change between academic years (e.g., adding new fields for "Sustainable Development Goals" alignment). Crucially, MongoDB Atlas offers the most generous free tier (M0 Sandbox) that includes **Vector Search capabilities**, a feature absent in many SQL free tiers, which is the cornerstone of our internal plagiarism detection engine.2  
* **Express.js & Node.js (Backend):** The lightweight footprint of a Node.js runtime is critical. Free hosting tiers, such as Render’s "Free Web Service," strictly limit RAM to 512MB.4 A heavy Java (Spring Boot) or Python (Django) application might struggle with "Out of Memory" (OOM) errors during peak file upload operations. Node.js’s event-driven, non-blocking I/O model is ideal for handling concurrent file streams—uploading large PDFs to Google Drive—without blocking the event loop or consuming excessive memory threads.6  
* **React.js (Frontend):** Hosting the frontend separately on a specialized Content Delivery Network (CDN) like Vercel allows us to offload all static asset traffic. This separation means the backend server (on Render) only handles API logic, saving its limited CPU cycles for data processing rather than serving HTML/CSS/JS files.8

### **2.2 The "Ephemeral" Challenge and Mitigation**

A defining characteristic of free backend hosting (specifically Render) is the "spin-down" or "sleep" phenomenon. To conserve resources, the provider suspends the service after 15 minutes of inactivity. The subsequent request triggers a "cold start," causing a latency of 30-60 seconds.10

Strategic Implication:  
For a student submitting a proposal minutes before a deadline, a 60-second loading screen is unacceptable. Therefore, the architecture must include a Keep-Alive Mechanism.

* **External Pinging:** Utilizing a free uptime monitor (e.g., UptimeRobot or Cron-Job.org) to send a lightweight HTTP GET request to a dedicated health endpoint (/api/health) every 10-14 minutes.  
* **Traffic Simulation:** This artificial traffic prevents the idle timer from triggering, effectively keeping the "free" server in a "hot" state during operational hours, ensuring immediate responsiveness.10

## **3\. Detailed Component Architecture**

The system is architected as a set of decoupled services, ensuring that limitations in one area (e.g., Google API quotas) do not catastrophically fail the entire application.

### **3.1 Frontend Layer: React \+ Vite on Vercel**

The frontend serves as the interaction layer for three distinct user roles: Students, Advisers, and Coordinators.

* **Build Tool:** **Vite** is mandated over Create-React-App. Vite uses native ES modules during development and Rollup for production builds, resulting in significantly faster start times and smaller bundle sizes—crucial for users on varying internet speeds.12  
* **UI Framework:** **Tailwind CSS**. By using utility classes, we avoid the heavy runtime performance cost associated with CSS-in-JS libraries like Styled Components. This keeps the browser client fast and responsive.  
* **State Management:** **React Context API**. Given the scope (departmental), a heavy state manager like Redux is unnecessary overhead. Context API combined with custom hooks (e.g., useAuth, useSubmission) provides sufficient global state management for user sessions and document status.6

Deployment Configuration (Vercel):  
Vercel is chosen for its "Zero Configuration" support for React. It automatically detects the build settings. Crucially, Vercel acts as a global CDN, caching the UI assets at the edge. This means users in the Philippines (Bukidnon) will load the interface from a nearby edge node (e.g., Singapore or Japan), minimizing latency.8

### **3.2 Backend Layer: REST API on Render**

The backend is the orchestrator. It does not store state (stateless architecture) but manages the flow of data between the client, the database, and external APIs.

* **Framework:** **Express.js**. It provides a robust routing mechanism.  
* **Middleware Stack:**  
  * helmet: Sets secure HTTP headers to prevent XSS and clickjacking.  
  * cors: Configured to strictly allow requests only from the Vercel frontend domain.  
  * multer: Handles multipart/form-data for file uploads. *Crucially*, Multer will be configured to use MemoryStorage, holding the file file in RAM buffer temporarily before streaming to Google Drive. This bypasses the ephemeral file system of Render, which wipes data on restart.14  
  * rate-limit: Essential for free tier survival. It prevents abuse of the expensive plagiarism check endpoints (See Section 5).

### **3.3 Data Layer: MongoDB Atlas (M0)**

The M0 Sandbox provides 512MB of storage. To maximize this, we strictly prohibit storing binary data (files) in the database.

**Storage Strategy:**

* **MongoDB Stores:** Metadata (Titles, Authors, Dates), Authentication Data, Plagiarism Reports (JSON), and Vector Embeddings.  
* **Google Drive Stores:** Actual PDF/DOCX files. MongoDB only holds the fileId and webViewLink references.16

## **4\. The Document Vault: Zero-Cost Storage Engineering**

The user requirement for a "Document Vault" 1 implies secure, long-term storage. While AWS S3 is the industry standard, it is not free. The **Google Drive API** is the superior zero-cost alternative, provided it is implemented correctly using **Service Accounts**.

### **4.1 Service Account vs. OAuth**

Using standard OAuth (where users log in with their Google accounts) is flawed for a centralized vault because files would reside in the *student's* drive. If the student graduates and deletes their account, the department loses the file.

The Solution: Service Account "Bot"  
We utilize a Google Cloud Service Account. This is a non-human account that represents the application itself.

1. **Shared Folder Architecture:** An administrator (e.g., the IT Dean or Capstone Coordinator) creates a folder in their institutional Google Drive (which typically has 15GB or unlimited storage).  
2. **Delegation:** This folder is "Shared" with the Service Account's email address (service-account@project.iam.gserviceaccount.com) with "Editor" permissions.  
3. **Quota Consumption:** Any file the Service Account uploads into this shared folder consumes the *Administrator's* storage quota, not the Service Account's (which is 15GB but harder to manage).15

**Key Insight:** This architecture creates a centralized "Vault" that survives student turnover. The application has full programmatic control to organize files into subfolders (e.g., /2025/Capstone1/GroupA), ensuring an organized digital archive.15

### **4.2 Stream-Based Upload Implementation**

To handle file uploads on a low-memory server (Render Free Tier has 512MB RAM), we cannot load a 50MB PDF entirely into memory if multiple users upload simultaneously.

Implementation Detail:  
We use a Pass-Through Stream.

1. The request hits the Node.js server as a stream.  
2. The code initiates a Google Drive files.create request, passing the incoming request stream directly to Google's servers.  
3. **Result:** The server acts as a pipe, never holding the full file in RAM. This ensures the application remains stable even when handling large thesis documents on constrained hardware.14

## **5\. The Hybrid Plagiarism & Integrity Engine**

The core innovation of this system is the **Hybrid Integrity Engine**. A "lightweight" checker must balance accuracy with the strict quotas of free APIs. We cannot scan the entire internet. Therefore, we implement a two-tiered approach: **Deep Internal Scanning** and **Heuristic External Scanning**.

### **5.1 Tier 1: Internal Semantic Analysis (The "Vault Check")**

This tier checks for "recycling" or "self-plagiarism" within the university's own repository. Since we control this data, we can perform exhaustive checks using **Vector Search**.

**Mechanism:**

1. **Text Extraction:** Upon upload, the system uses pdf-parse to extract raw text from the document.20  
2. **Chunking:** The text is split into semantic chunks (e.g., 256-512 tokens). Overlapping windows (e.g., 50 token overlap) are used to preserve context between chunks.  
3. **Vectorization:** These chunks are sent to the **Hugging Face Inference API** (Free Tier). We utilize a model like sentence-transformers/all-MiniLM-L6-v2, which is optimized for semantic similarity.  
   * *Free Tier Limit:* Hugging Face offers generous free usage, but rate limiting applies (approx. 1,000 requests/day depending on load).21  
   * *Queueing:* To prevent hitting rate limits during bulk uploads, embedding tasks are added to a **Task Queue** (using a lightweight library like bee-queue backed by Redis, or a simple in-memory queue if Redis is unavailable).  
4. **Indexing:** The resulting 384-dimensional vectors are stored in the MongoDB Atlas embeddings collection.  
5. **Search:** When a new document is uploaded, its vectors are queried against the database using MongoDB's $vectorSearch operator.3  
6. **Detection Logic:** The system flags documents that return a **Cosine Similarity score \> 0.85**. This detects paraphrasing (e.g., changing "The cat sat on the mat" to "The feline rested on the rug") because the *semantic meaning* (vector direction) remains similar, even if the words differ.

### **5.2 Tier 2: External Fingerprinting (The "Web Check")**

Checking the open web is expensive. The **Google Custom Search JSON API** provides a free tier, but it is strictly capped at **100 queries per day**.23 To make this viable for a class of students, we cannot check every sentence. We use a **Stochastic Fingerprinting Algorithm**.

**The Algorithm:**

1. **Candidate Selection:** The system analyzes the text to identify "suspicious" or "high-entropy" sentences. It filters out common academic phrases (e.g., "The purpose of this study is...") using a stop-phrase list.  
2. **Fingerprint Extraction:** It selects a random sample of 5-10 unique sentences from the document body (excluding references and appendices).  
3. **Exact Match Query:** These sentences are sent to the Google Search API enclosed in quotes (e.g., "specific unique sentence from the thesis").  
4. **Hit Analysis:**  
   * **Zero Results:** Likely original.  
   * **Results Found:** High probability of copy-pasting. The system records the URL of the match.  
5. **Quota Protection:** The system strictly limits this check to 5 queries per document. This allows checking \~20 documents per day on the free tier. This is sufficient for a "Draft" vs. "Final" submission workflow, where only final drafts trigger the external web check.23

### **5.3 The Similarity Report**

The system aggregates these findings into a JSON report stored in MongoDB:

JSON

{  
  "internal\_score": 0.15, // 15% similarity with internal vault  
  "external\_matches": \[  
    { "snippet": "...", "url": "wikipedia.org/...", "risk": "high" }  
  \],  
  "composite\_score": 0.25, // Weighted average  
  "verdict": "Review Required"  
}

This report is presented to the Adviser via the React dashboard, satisfying the requirement for "clear similarity reports".1

## **6\. Implementation Specifications**

### **6.1 Database Schema Design (Mongoose)**

The schema must support RBAC (Role-Based Access Control) and document versioning.

| Collection | Schema Highlights | Purpose |
| :---- | :---- | :---- |
| **Users** | email, password (hashed), role (enum: 'Student', 'Adviser', 'Coordinator'), department | Authentication and Authorization.24 |
| **Projects** | title, members (Array of User IDs), adviser (User ID), status | Core capstone metadata. |
| **Submissions** | project (Ref), version (Number), driveFileId (Google), driveViewLink, embeddings (Array of Floats), plagiarismReport (Object) | The core artifact. Embeddings are stored here for vector search. |
| **Config** | currentTerm, submissionEnabled (Boolean) | Global settings managed by the Coordinator. |

### **6.2 Directory Structure (Best Practices)**

To maintain a clean codebase within a single repository (monorepo structure for simplicity), the following structure is recommended 6:

/project-root  
/client (React Frontend)  
/src  
/components (Reusable UI: Navbar, FileUpload, etc.)  
/pages (Dashboards: StudentDashboard, AdviserDashboard)  
/context (AuthContext, ProjectContext)  
/hooks (Custom hooks for API calls)  
/server (Node Backend)  
/config (DB connection, Passport strategies)  
/controllers (Logic: authController, submissionController)  
/models (Mongoose Schemas)  
/routes (API Definitions)  
/services (Business Logic: driveService, plagiarismService)  
/utils (Helpers: vectorMath, textExtractor)  
.env (Environment Variables \- NOT COMMITTED)  
package.json (Root scripts for deployment)

## **7\. Environment Variable Formats & Configuration**

Security is paramount. API keys and secrets must rarely be hardcoded. The .env configuration is critical for the deployment strategy.

### **7.1 The .env Configuration Standard**

Ini, TOML

\# \--- SERVER CONFIGURATION \---  
PORT\=5000  
NODE\_ENV\=production  
\# URL of the frontend (for CORS security)  
CLIENT\_URL\=https://your-frontend.vercel.app

\# \--- DATABASE (MongoDB Atlas) \---  
\# Connection string with standard URI format  
MONGO\_URI\=mongodb+srv://\<db\_user\>:\<db\_pass\>@cluster0.abcde.mongodb.net/capstone\_db?retryWrites=true\&w=majority

\# \--- AUTHENTICATION (JWT) \---  
JWT\_SECRET\=super\_secure\_random\_string\_min\_32\_chars  
JWT\_EXPIRE\=7d

\# \--- GOOGLE CLOUD (Drive & Search) \---  
\# The tricky part: Handling JSON keys in single-line env vars  
\# See Deployment Strategy below for "Base64" encoding instruction  
GOOGLE\_CREDENTIALS\_BASE64\=ewogICJ0eXBlIjogInNlcnZpY2VfY...  
GOOGLE\_DRIVE\_PARENT\_FOLDER\_ID\=1a2B3c... (The shared folder ID)  
GOOGLE\_SEARCH\_API\_KEY\=AIzaSy...  
GOOGLE\_SEARCH\_CX\=0123456... (Custom Search Engine ID)

\# \--- AI & INTEGRITY \---  
HUGGING\_FACE\_TOKEN\=hf\_... (For inference API)

### **7.2 Handling Multi-line JSON Credentials**

Google Service Account keys are multi-line JSON files. Most hosting platforms (like Render) struggle with multi-line environment variables.

**The Base64 Strategy:**

1. **Encode:** The developer must encode the credentials.json file to a Base64 string locally.  
   * *Linux/Mac Terminal:* base64 \-i credentials.json \-o credentials\_b64.txt  
   * *Windows PowerShell:* \[Convert\]::ToBase64String(\[IO.File\]::ReadAllBytes("./credentials.json"))  
2. **Deploy:** Copy the resulting long string into the GOOGLE\_CREDENTIALS\_BASE64 variable in the Render dashboard.  
3. **Decode:** In the Node.js application (/config/google.js), decode it at runtime:  
   JavaScript  
   const credentials \= JSON.parse(  
     Buffer.from(process.env.GOOGLE\_CREDENTIALS\_BASE64, 'base64').toString('utf-8')  
   );

   This method ensures secure, error-free credential injection.26

## **8\. Deployment Strategy**

The deployment pipeline is designed for automation and resilience on free-tier infrastructure.

### **8.1 Backend Deployment (Render)**

1. **Source:** Connect Render to the GitHub repository.  
2. **Service Type:** "Web Service" (Free).  
3. **Build Command:** cd server && npm install.  
4. **Start Command:** cd server && node index.js.  
5. **Environment Variables:** Input the variables defined in Section 7.1.  
6. **Network Access:** Render IPs are dynamic. In MongoDB Atlas **Network Access**, add the IP address 0.0.0.0/0 (Allow from Anywhere). While typically a security risk, it is the standard workaround for free dynamic hosting. Security is enforced via the strong Database Username/Password in the connection string.28

### **8.2 Frontend Deployment (Vercel)**

1. **Source:** Connect Vercel to the GitHub repository.  
2. **Framework Preset:** "Vite" (Vercel usually auto-detects this).  
3. **Build Command:** cd client && npm run build.  
4. **Output Directory:** client/dist.  
5. **Environment Variables:** Add VITE\_API\_URL pointing to the Render backend URL (e.g., https://my-capstone-api.onrender.com).

### **8.3 The "Keep-Alive" Protocol**

To prevent the Render backend from sleeping (which causes a 30-50s delay for the first user):

1. Create a simple endpoint in server/index.js: app.get('/health', (req, res) \=\> res.sendStatus(200));.  
2. Register a free account at **UptimeRobot** or **Cron-Job.org**.  
3. Create a monitor that pings https://my-capstone-api.onrender.com/health every **10 minutes**.  
4. **Result:** The server receives consistent traffic, tricking Render's inactivity timer and ensuring the API is always ready for student submissions.10

## **9\. Conclusion**

This report establishes that a **zero-cost, professional-grade Capstone Management System** is not only feasible but architecturally robust given the current landscape of cloud services. By decoupling the storage (Google Drive), compute (Render), and interface (Vercel), and by engineering a **Hybrid Integrity Engine** that intelligently utilizes limited API quotas (Google Custom Search) alongside powerful internal vector analysis (MongoDB Atlas), the proposed solution meets the rigorous demands of academic integrity without the financial burden of commercial software.

This plan addresses the core needs of the Information Technology Department—centralized oversight, version control, and plagiarism detection—while adhering to a strict sustainability mandate. The result is a system that transforms the "Digital Waste" of manual processes into a streamlined, automated, and intelligent research ecosystem.

## **10\. Appendix: Data Tables and Reference Guides**

### **Table 1: Free Tier Resource Limits & Engineering Mitigations**

| Resource | Provider | Free Tier Limit | Engineering Mitigation Strategy |
| :---- | :---- | :---- | :---- |
| **Compute** | Render | 512MB RAM, Sleep after 15m | Stream uploads (don't load to RAM). Use UptimeRobot for keep-alive. |
| **Database** | MongoDB Atlas | 512MB Storage, 500 Conn. | Store files in Drive, not DB. Use connection pooling in Mongoose. |
| **File Storage** | Google Drive | 15GB (Personal Account) | Use Service Account to leverage Admin's 15GB+ quota. |
| **Search API** | Google Custom Search | 100 Queries / Day | Use fingerprinting (5 queries/doc) to scan \~20 docs/day. |
| **AI/ML** | Hugging Face | Rate Limited (\~1k/day) | Queue embedding jobs. Fallback to simpler algorithms if limit hit. |

### **Table 2: User Role Permissions Matrix**

| Feature / Action | Student | Adviser | Coordinator | Panel Member |
| :---- | :---- | :---- | :---- | :---- |
| **Create Account** | Yes (Self-Reg) | Admin Invite | System Owner | Admin Invite |
| **Upload Document** | Yes (Own Project) | No | No | No |
| **View Document** | Own Project | Assigned Projects | All Projects | Assigned Projects |
| **View Plagiarism Report** | Summary Only (Pass/Fail) | Full Detail | Full Detail | Full Detail |
| **Approve/Reject** | No | Yes | Yes (Final) | Yes (Defense) |
| **Manage Deadlines** | View Only | View Only | Create/Edit | View Only |

### **Table 3: Recommended Library Stack (Node.js)**

| Library | Version (Approx) | Purpose |
| :---- | :---- | :---- |
| express | ^4.18 | Web Server Framework |
| mongoose | ^8.0 | MongoDB Object Modeling |
| googleapis | ^126.0 | Google Drive & Search Interaction |
| multer | ^1.4 | Handling File Upload Streams |
| pdf-parse | ^1.1 | Extracting text from PDFs for checking |
| natural | ^6.10 | NLP for fingerprint extraction (tokenization) |
| @huggingface/inference | ^2.6 | Generating embeddings for vector search |
| cors, helmet, dotenv | Latest | Security and Configuration |

#### **Works cited**

1. Project Workspace\_ Capstone Management System with A.I Powered Plagiarism Checker (1).docx  
2. accessed on December 16, 2025, [https://www.mongodb.com/community/forums/t/is-vector-search-feature-paid-or-free/267191\#:\~:text=Vector%20Search%20is%20free%2C%20you,because%20of%20using%20Vector%20Search.](https://www.mongodb.com/community/forums/t/is-vector-search-feature-paid-or-free/267191#:~:text=Vector%20Search%20is%20free%2C%20you,because%20of%20using%20Vector%20Search.)  
3. MongoDB Vector Search Overview \- Atlas, accessed on December 16, 2025, [https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)  
4. Deploy for Free – Render Docs, accessed on December 16, 2025, [https://render.com/docs/free](https://render.com/docs/free)  
5. Clarification on Free Tier Instance RAM Allocation? \- Render community, accessed on December 16, 2025, [https://community.render.com/t/clarification-on-free-tier-instance-ram-allocation/26734](https://community.render.com/t/clarification-on-free-tier-instance-ram-allocation/26734)  
6. How to Structure a Scalable MERN Project for Teams \- DEV Community, accessed on December 16, 2025, [https://dev.to/rayan2228/how-to-structure-a-scalable-mern-project-for-teams-533g](https://dev.to/rayan2228/how-to-structure-a-scalable-mern-project-for-teams-533g)  
7. How to organise file structure of backend and frontend in MERN \- Stack Overflow, accessed on December 16, 2025, [https://stackoverflow.com/questions/51126472/how-to-organise-file-structure-of-backend-and-frontend-in-mern](https://stackoverflow.com/questions/51126472/how-to-organise-file-structure-of-backend-and-frontend-in-mern)  
8. Find a plan to power your projects. \- Vercel, accessed on December 16, 2025, [https://vercel.com/pricing](https://vercel.com/pricing)  
9. Structuring Your MERN Stack Project: Best Practices and Organization, accessed on December 16, 2025, [https://masterlwa.medium.com/structuring-your-mern-stack-project-best-practices-and-organization-5776861e2c92](https://masterlwa.medium.com/structuring-your-mern-stack-project-best-practices-and-organization-5776861e2c92)  
10. How to Run a Full-Time App on Render's Free Tier (Without It Sleeping) \- Sergei Liski, accessed on December 16, 2025, [https://sergeiliski.medium.com/how-to-run-a-full-time-app-on-renders-free-tier-without-it-sleeping-bec26776d0b9](https://sergeiliski.medium.com/how-to-run-a-full-time-app-on-renders-free-tier-without-it-sleeping-bec26776d0b9)  
11. prevent render server from sleeping \- node.js \- Stack Overflow, accessed on December 16, 2025, [https://stackoverflow.com/questions/75340700/prevent-render-server-from-sleeping](https://stackoverflow.com/questions/75340700/prevent-render-server-from-sleeping)  
12. m-soro/Project\_3: MERN Full Stack Capstone Project \- GitHub, accessed on December 16, 2025, [https://github.com/m-soro/Project\_3](https://github.com/m-soro/Project_3)  
13. Limits \- Vercel, accessed on December 16, 2025, [https://vercel.com/docs/limits](https://vercel.com/docs/limits)  
14. Creating a file with Google Drive API using a Service Account doesn't render file on authorized user account's GD \- Stack Overflow, accessed on December 16, 2025, [https://stackoverflow.com/questions/63403944/creating-a-file-with-google-drive-api-using-a-service-account-doesnt-render-fil](https://stackoverflow.com/questions/63403944/creating-a-file-with-google-drive-api-using-a-service-account-doesnt-render-fil)  
15. How to Upload Files to Google Drive with a Service Account \- Digital Inspiration, accessed on December 16, 2025, [https://www.labnol.org/google-api-service-account-220404](https://www.labnol.org/google-api-service-account-220404)  
16. Request limit in the free tier \- MongoDB Atlas, accessed on December 16, 2025, [https://www.mongodb.com/community/forums/t/request-limit-in-the-free-tier/9804](https://www.mongodb.com/community/forums/t/request-limit-in-the-free-tier/9804)  
17. MongoDB Pricing, accessed on December 16, 2025, [https://www.mongodb.com/pricing](https://www.mongodb.com/pricing)  
18. How to Use the Google Drive API with JavaScript | Bret Cameron, accessed on December 16, 2025, [https://www.bretcameron.com/blog/how-to-use-the-google-drive-api-with-javascript](https://www.bretcameron.com/blog/how-to-use-the-google-drive-api-with-javascript)  
19. Create and populate folders | Google Drive, accessed on December 16, 2025, [https://developers.google.com/workspace/drive/api/guides/folder](https://developers.google.com/workspace/drive/api/guides/folder)  
20. Parsing PDFs in Node.js \- LogRocket Blog, accessed on December 16, 2025, [https://blog.logrocket.com/parsing-pdfs-node-js/](https://blog.logrocket.com/parsing-pdfs-node-js/)  
21. Hub Rate limits \- Hugging Face, accessed on December 16, 2025, [https://huggingface.co/docs/hub/rate-limits](https://huggingface.co/docs/hub/rate-limits)  
22. MongoDB Vector Search Quick Start \- Atlas, accessed on December 16, 2025, [https://www.mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-quick-start/](https://www.mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-quick-start/)  
23. Custom Search JSON API | Programmable Search Engine \- Google for Developers, accessed on December 16, 2025, [https://developers.google.com/custom-search/v1/overview](https://developers.google.com/custom-search/v1/overview)  
24. MongoDB schema design for multiple user types \- Stack Overflow, accessed on December 16, 2025, [https://stackoverflow.com/questions/37404110/mongodb-schema-design-for-multiple-user-types](https://stackoverflow.com/questions/37404110/mongodb-schema-design-for-multiple-user-types)  
25. MERN Stack Guide: Components, Setup & Best Practices \- Strapi, accessed on December 16, 2025, [https://strapi.io/blog/mern-stack-guide-components-setup-best-practices](https://strapi.io/blog/mern-stack-guide-components-setup-best-practices)  
26. Google Cloud Keyfile.json · vercel community · Discussion \#219 \- GitHub, accessed on December 16, 2025, [https://github.com/vercel/community/discussions/219](https://github.com/vercel/community/discussions/219)  
27. How to Use Google Application .json Credentials in Environment Variables \- Paul Scanlon, accessed on December 16, 2025, [https://www.paulie.dev/posts/2024/06/how-to-use-google-application-json-credentials-in-environment-variables/](https://www.paulie.dev/posts/2024/06/how-to-use-google-application-json-credentials-in-environment-variables/)  
28. Connecting to MongoDB Atlas – Render Docs, accessed on December 16, 2025, [https://render.com/docs/connect-to-mongodb-atlas](https://render.com/docs/connect-to-mongodb-atlas)  
29. Can't connect to Mongodb Atlas from Render Web-Hosted App, accessed on December 16, 2025, [https://www.mongodb.com/community/forums/t/cant-connect-to-mongodb-atlas-from-render-web-hosted-app/192110](https://www.mongodb.com/community/forums/t/cant-connect-to-mongodb-atlas-from-render-web-hosted-app/192110)