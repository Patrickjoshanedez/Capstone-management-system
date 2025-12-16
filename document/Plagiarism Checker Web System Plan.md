# **Architecting a Text-Only Plagiarism Detection System: A Comprehensive 2025 Technical Report**

## **1\. Executive Summary**

In the rapidly evolving landscape of 2025, the integrity of written content faces unprecedented challenges. The ubiquity of generative AI and the ease of digital reproduction have necessitated robust, accessible, and cost-effective plagiarism detection mechanisms. While enterprise solutions like Turnitin and Copyleaks offer comprehensive suites including Optical Character Recognition (OCR) for scanned documents, a significant market gap exists for a lightweight, "text-first" architecture.1 This report articulates the strategic and technical roadmap for developing a dedicated web-based plagiarism checker that strictly processes text-format files (TXT, DOCX, native PDF), deliberately excluding image processing to optimize for latency, server costs, and architectural simplicity.

The proposed system leverages the advancements of the 2025 web stack—specifically Next.js 15 and Supabase—to deliver a scalable, serverless application. By adhering to a strict "no-OCR" constraint, the architecture bypasses the heavy computational requirements of computer vision, focusing resources instead on sophisticated text extraction pipelines, seamless API orchestration, and granular reporting interfaces.3 This strategic choice not only reduces operational overhead but also aligns with a "freemium" business model by utilizing high-value, low-cost APIs available via the RapidAPI marketplace, particularly those that provide source linking without the premium price tag of major enterprise endpoints.5

Furthermore, the development methodology adopts a modern Agile framework augmented by GitHub Copilot as a "coding partner." This moves beyond simple code completion to "Vibe Coding" and agentic planning, where AI assists in everything from sprint backlog generation to real-time refactoring of complex React Server Components.7 This report serves as a definitive guide for technical stakeholders, detailing every facet of the system from data ingestion workflows and database schema design to the nuances of frontend "diff view" rendering and API rate-limit management.

## ---

**2\. Architectural Vision and Stack Selection**

The architecture of a modern web application in 2025 is defined by its ability to handle asynchronous data streams, manage state on the server, and scale elastically at the edge. The "Text-Only" Plagiarism Checker is designed as a monolithic-modular hybrid, leveraging the simplicity of a single codebase with the power of microservices via third-party APIs.

### **2.1 The Core Framework: Next.js 15 (App Router)**

The selection of Next.js 15 is driven by the paradigm shift towards React Server Components (RSC). In the context of a plagiarism checker, where report generation involves heavy data processing and API latency, the App Router's architecture is superior to traditional client-side rendering.9

#### **2.1.1 Server Actions for Data Mutation**

Traditional web architectures required a separate API layer (e.g., Express.js) to handle form submissions. Next.js 15 introduces robust Server Actions, allowing the file upload mechanism to be defined directly within the component logic but executed securely on the server.10 This reduces the "glue code" required to manage file streams. For this system, the file upload—a critical entry point—is handled via a Server Action that receives the FormData, validates the MIME type, and streams the binary directly to storage or parsing logic without exposing sensitive keys to the client.11

#### **2.1.2 Streaming and Suspense**

Plagiarism analysis is inherently slow; it depends on the latency of external APIs which may take several seconds to traverse billions of web pages. Next.js 15 allows the application to render the application shell (header, sidebar, history) immediately, while "streaming" the report results as they become available.9 This prevents the "white screen of death" and improves perceived performance, a critical UX metric for retention.

### **2.2 The Backend-as-a-Service: Supabase**

Building a custom backend with AWS (EC2/RDS) introduces unnecessary DevOps overhead. Supabase is selected as the backend infrastructure due to its convergence of Database, Auth, and Storage into a single Postgres-powered ecosystem, which is significantly more cost-effective for this specific architecture than comparable AWS services.12

#### **2.2.1 PostgreSQL over NoSQL**

While document stores (MongoDB) are popular for unstructured text, the relational integrity required for user credit management, scan history tracking, and cross-referencing plagiarism matches necessitates a relational database. Supabase provides a full PostgreSQL instance. The architecture utilizes the pgvector extension capability (future-proofing) and standard relational tables to map Users \-\> Scans \-\> Matches with strict foreign key constraints, ensuring data consistency.14

#### **2.2.2 Storage vs. Database for Text**

A critical architectural decision involves where to store the text. Storing large bodies of text in the PostgreSQL database can cause "bloat" and slow down queries. Therefore, the architecture adopts a hybrid approach:

* **Original File:** Stored in Supabase Storage (S3-compatible) for archival and potential re-download.15  
* **Parsed Text:** Stored in the Database (or a dedicated text column) only if it is under a certain character limit (e.g., 50KB). Larger texts are stored as plain text files in a separate "processed" bucket in Storage, with only the reference path stored in the DB.16

### **2.3 Middleware and Edge Computing**

To manage the "freemium" nature of the external APIs, the application requires strict rate limiting.

* **Edge Middleware:** Next.js Middleware running on Vercel Edge is used to intercept requests before they hit the core logic. This layer checks the user's authentication token (JWT from Supabase) and their remaining credits.11  
* **Rate Limiting (Redis):** A serverless Redis instance (e.g., Upstash) is integrated to track API usage per minute. If the global counter for the RapidAPI key exceeds 60 requests/minute, the middleware queues the request or returns a "Busy, please wait" signal, protecting the developer from overage charges or IP bans.17

## ---

**3\. The "Text-Only" Ingestion Pipeline**

The constraint to exclude images and OCR defines the ingestion pipeline. This module is responsible for accepting files, rigorously validating them, and extracting plain text without triggering heavy image processing libraries.

### **3.1 Strict Validation Logic**

Client-side validation is insufficient for security; server-side validation is mandatory.

* **MIME Type Checking:** The Server Action accepts only specific MIME types: text/plain, application/pdf, and application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX).  
* **Magic Number Inspection:** To prevent users from renaming an .exe or .jpg to .txt, the system inspects the file header (Magic Bytes). For PDF, it must start with %PDF (hex 25 50 44 46). If the header does not match the extension, the file is rejected immediately.4

### **3.2 Parsing Strategy: The No-OCR Approach**

Extracting text from "born-digital" documents is fundamentally different from OCR.

#### **3.2.1 PDF Extraction (pdf-parse)**

The pdf-parse library is the chosen tool for Node.js environments. It extracts text streams from the PDF binary.

* **The "Empty Text" Indicator:** A key logic gate is handling scanned PDFs. If pdf-parse returns a text string with a length of 0 or a string containing only whitespace, the system infers that the PDF is image-based.  
* **User Feedback Loop:** Instead of failing silently or attempting OCR (violation of constraints), the system throws a specific error: ERR\_IMAGE\_PDF. The UI then displays: "This document appears to be a scan. This system only supports text-selectable PDFs." This manages user expectations without incurring compute costs.3

#### **3.2.2 DOCX Extraction (mammoth.js)**

DOCX files are essentially zipped XML archives. mammoth.js is selected over other parsers because it focuses on the *semantic* text content, ignoring headers, footers, and complex styling that are irrelevant for plagiarism checking. This ensures the text sent to the API is clean and devoid of XML artifact noise.3

#### **3.2.3 Text Normalization**

Before transmission to the API, the text undergoes normalization to maximize match probability and minimize token usage.

* **Sanitization:** Removal of non-printable characters and control codes.  
* **Whitespace:** Collapsing multiple spaces/tabs into single spaces.  
* **Citation Removal (Optional):** Advanced logic may attempt to identify and exclude text within quotes or bibliography sections to reduce false positives, although this is complex to implement perfectly.20

### **3.3 Large File Handling and Chunking**

Most free-tier APIs have limits (e.g., 1000 words per request).

* **Sliding Window:** The text is split into chunks. A "sliding window" overlap of 50-100 words is maintained between chunks to ensure that a plagiarized sentence split across a chunk boundary is still detected.  
* **Asynchronous Batching:** These chunks are not sent sequentially (too slow) nor all at once (rate limit risk). They are processed using a Promise.all with a concurrency limit (e.g., p-limit) to respect the API's "requests per second" constraints.17

## ---

## **4/. Analysis of Plagiarism Checker APIs (RapidAPI Ecosystem)**

The core of the system is the detection engine. A thorough analysis of the RapidAPI marketplace reveals a spectrum of options, from simple string matching to AI-powered analysis. The requirement is for a "free" or high-value freemium API that excludes payment gateways.

### **4.1 Primary Candidate: Plagiarism Checker with Source Links**

* **Provider:** RazaSaeed135 (RapidAPI)  
* **Endpoint:** https://plagiarism-checker-with-source-links.p.rapidapi.com/checkplagiarism.php.5  
* **Cost/Limits:** The "Basic" plan offers **1,000 requests/month**. This is generous for a prototype or small-scale deployment.  
* **Data Richness:** Unlike simple boolean checkers, this API returns a detailed JSON array.  
  JSON

  This structure is vital for building the "Diff View" report, as it links specific sentences to specific URLs.5  
* **Latency:** Generally reliable, though response times can vary based on text length.

### **4.2 Secondary/Backup Candidate: NLP Hub Plagiarism Checker**

* **Provider:** NLP Hub  
* **Limits:** **60 requests per minute** (Soft cap). This is a high-throughput option suitable for handling bursty traffic.17  
* **Trade-off:** The response detail may be less granular than RazaSaeed135, or the matching algorithm may be less strict. It serves as an excellent fallback if the primary API's monthly quota is exhausted.

### **4.3 The "Build-Your-Own" Fallback: Search API Strategy**

To ensure the system remains functional even if dedicated plagiarism APIs fail or quotas are reached, a "Search-Based" fallback architecture is proposed. This mimics how early plagiarism checkers worked.

* **Logic:**  
  1. **Shingling:** The document is broken into "shingles" (sequences of 10-15 words).  
  2. **Sampling:** Randomly select 5-10 unique shingles from the text (avoiding common phrases).  
  3. **Search Query:** Send these shingles as exact match queries (wrapped in quotes) to a Search API.  
* **Search API Options:**  
  * **Brave Search API:** Offers a **free tier of 2,000 queries/month**. It is developer-friendly and privacy-focused.21  
  * **DuckDuckGo:** While free Python libraries exist, they are unreliable for production due to rate limiting.22 Brave is the preferred stable alternative.  
  * **Google Custom Search JSON API:** Provides 100 queries/day. Useful for a final "deep check" verification.24  
* **Interpretation:** If a search query returns exact matches, the document is flagged as "Potentially Plagiarized," prompting the user to upgrade or wait for a full scan.

### **4.4 Other Necessary APIs (Non-Payment)**

* **Authentication:** **Supabase Auth** is the standard. It supports OAuth (Google, GitHub) and Magic Links. It is chosen over Clerk for this specific "free-tier" report because Supabase offers **50,000 Monthly Active Users (MAU)** on its free tier, whereas Clerk caps at 10,000 MAU. For a bootstrapped project, this higher ceiling is critical.25  
* **Database & Realtime:** Supabase (PostgreSQL) handles the relational data. Its Realtime API (WebSockets) is used to push scan status updates to the frontend.14

## ---

**5\. Agile Development Strategy with GitHub Copilot**

Building this system requires a disciplined, iterative approach. The Agile methodology (Scrum) is adapted here, with GitHub Copilot acting as a specialized "Agent" integrated into every phase of the SDLC (Software Development Life Cycle).

### **5.1 The "Copilot-Augmented" Workflow**

In 2025, Copilot is not just a text completer; it is a workflow engine. The "Copilot Workspace" allows developers to maintain context across the entire repository.7

#### **5.1.1 Sprint 0: Planning and Architecture**

* **Goal:** Define the backlog and architecture.  
* **Copilot Interaction:**  
  * *Prompt:* "Act as a Technical Product Manager. Based on the requirement for a text-only plagiarism checker using Next.js 15 and Supabase, generate a list of User Stories for the MVP. Include acceptance criteria for 'File Upload', 'Text Parsing', and 'Report Visualization'.".8  
  * *Result:* Copilot generates a Markdown table of issues. The developer can then use the GitHub CLI or Copilot to bulk-create these issues in the repository.27

#### **5.1.2 Sprint 1: The Ingestion Engine (Weeks 1-2)**

* **Focus:** File Upload (Server Actions), Validation, Supabase Storage.  
* **Copilot Interaction (Vibe Coding):**  
  * *Prompt:* "Create a Next.js 15 Server Action uploadFile that accepts FormData. Use zod to validate that the file is less than 2MB and is of type PDF, DOCX, or TXT. If valid, upload to Supabase Storage bucket 'raw-files'. Return the path.".28  
  * *Refactoring:* Use "Copilot Edits" to modify the next.config.js to allow larger server action bodies if necessary.10

#### **5.1.3 Sprint 2: The Parsing & Analysis Core (Weeks 3-4)**

* **Focus:** pdf-parse, mammoth.js, RapidAPI integration.  
* **Copilot Interaction (Logic Generation):**  
  * *Prompt:* "Write a TypeScript function that takes a Buffer from a PDF. Use pdf-parse to extract text. If the text length is 0, throw a custom ImagePdfError. Handle binary encoding correctly.".3  
  * *Prompt:* "Generate an Axios request function to call plagiarism-checker-with-source-links.p.rapidapi.com. heavily type the response based on this JSON schema:. Implement error handling for 429 status codes."

#### **5.1.4 Sprint 3: Frontend Visualization & Diff View (Weeks 5-6)**

* **Focus:** Reporting UI, Realtime updates.  
* **Copilot Interaction (Component Design):**  
  * *Prompt:* "Build a React component using Shadcn/UI for a 'Diff View'. The left pane shows original text, right pane shows matched text. Highlight the original text in red if the plaged boolean is true from the API response.".28

#### **5.1.5 Sprint 4: Optimization & Polish (Weeks 7-8)**

* **Focus:** Redis Rate Limiting, Mobile Responsiveness, Search Fallback.  
* **Copilot Interaction (TDD):**  
  * *Prompt:* "Write a Jest test for the rateLimit middleware. Mock the Redis client. Ensure it returns 429 if the counter exceeds 60.".29

## ---

**6\. Data Modeling and State Management**

A robust data model is the backbone of the application. The schema must support the relational nature of users owning documents and documents having multiple scan results.

### **6.1 Database Schema (PostgreSQL)**

| Table Name | Column | Type | Description |
| :---- | :---- | :---- | :---- |
| **profiles** | id | UUID | Primary Key, references auth.users. |
|  | credits | Integer | Default 5\. Decrements on scan. |
|  | tier | Enum | 'free', 'pro'. |
| **documents** | id | UUID | Primary Key. |
|  | user\_id | UUID | Foreign Key to profiles. |
|  | storage\_path | Text | Path to file in Supabase Storage. |
|  | file\_name | Text | Original filename. |
|  | parsed\_text | Text | Extracted plain text (nullable). |
|  | created\_at | Timestamp | Upload time. |
| **scans** | id | UUID | Primary Key. |
|  | document\_id | UUID | Foreign Key to documents. |
|  | status | Enum | 'pending', 'processing', 'completed', 'failed'. |
|  | overall\_score | Float | 0-100% plagiarism score. |
| **scan\_matches** | id | UUID | Primary Key. |
|  | scan\_id | UUID | Foreign Key to scans. |
|  | sentence | Text | The specific sentence flagged. |
|  | match\_url | Text | The source URL found. |
|  | similarity | Float | Percentage match for this sentence. |

### **6.2 Managing State in Next.js 15**

The application minimizes client-side global state (Redux) in favor of Server State.

* **Fetching:** Data is fetched directly in Server Components using await supabase.from('scans').select('\*'). This ensures the UI always reflects the database state without complex synchronization logic.9  
* **Realtime Updates:** For the "Status" indicator (e.g., watching a scan go from 'processing' to 'completed'), a client-side useEffect subscribes to the scans table via Supabase Realtime. When the status column changes, the UI invalidates the Server Component cache (router.refresh()), triggering a re-render with the new data.14

## ---

**7\. Frontend Engineering and UX Standards**

The frontend must be professional, accessible, and responsive.

### **7.1 The "Diff View" Implementation**

The core value proposition is the visualization of plagiarism. A split-pane view is standard.

* **Left Pane (User Text):** Renders the parsed text. Critical implementation detail: The text is tokenized into sentences. Each sentence is wrapped in a \<span\>. If the API returns a match for that sentence, a CSS class bg-red-100 is applied.  
* **Right Pane (Source Context):** Initially empty. When a user clicks a highlighted sentence in the left pane, the right pane populates with the matchedtext and matchedlink from the API response.  
* **Accessibility:** All interactive elements must support keyboard navigation. The color contrast of the red highlight must meet WCAG AA standards. Screen readers must be able to announce "Plagiarized content detected" when focusing on a highlighted span.30

### **7.2 File Upload UX**

Since large files might take time to upload and process, the UX must provide feedback.

* **Progress Simulation:** Next.js Server Actions do not inherently support upload progress bars. To mitigate this, the UI uses a "determinate" progress bar that moves to 90% based on an estimated time (calculated from file size) and completes to 100% only when the Server Action returns.  
* **Drag and Drop:** Implemented using react-dropzone. It provides immediate visual feedback (border color change) when a valid file is hovered, and error messages ("File too large") if invalid.31

## ---

**8\. Security, Compliance, and Deployment**

### **8.1 Row Level Security (RLS)**

Supabase RLS is the primary security barrier.

* **Policy:** CREATE POLICY "Users can only see their own documents" ON documents FOR SELECT USING (auth.uid() \= user\_id);  
* **Impact:** Even if a malicious user guesses a document UUID, the database engine will return 0 rows, preventing data leakage.16

### **8.2 Input Sanitization**

Text extracted from documents can contain malicious scripts (XSS vectors). Before storing parsed\_text or rendering it in the report, it is passed through a sanitization library (e.g., dompurify on the client, or simple stripping on the server) to ensure no executable code remains.32

### **8.3 Deployment on Vercel**

The project is deployed to Vercel, the creators of Next.js.

* **Environment Variables:** API keys (RAPIDAPI\_KEY, SUPABASE\_KEY) are stored in Vercel's Environment Variables panel, never committed to GitHub.  
* **CI/CD:** A GitHub Action is configured to run linting (eslint) and unit tests (jest) on every Pull Request. Vercel automatically deploys the main branch to production.33

## ---

**9\. Conclusion**

This report outlines a rigorous, technically sound path to building a text-only plagiarism checker in 2025\. By strategically excluding image processing, the architecture remains lightweight and cost-effective. The combination of **Next.js 15** for a streaming, server-centric frontend and **Supabase** for a unified backend provides a robust foundation that rivals enterprise tooling at a fraction of the cost. The integration of **RapidAPI's** freemium endpoints, backed by a **Search API fallback**, ensures service continuity. Finally, the adoption of **GitHub Copilot** as an active partner in the **Agile** workflow accelerates development, turning a complex system integration task into a manageable, iterative process. This blueprint addresses all data, logic, and infrastructure needs to deliver a modern, secure, and highly functional web system.

#### **Works cited**

1. Best Plagiarism Detection APIs in 2025 \- Eden AI, accessed on December 16, 2025, [https://www.edenai.co/post/best-plagiarism-detection-apis](https://www.edenai.co/post/best-plagiarism-detection-apis)  
2. Free Plagiarism Checker \- Detect AI Plagiarism \- Copyleaks, accessed on December 16, 2025, [https://copyleaks.com/plagiarism-checker](https://copyleaks.com/plagiarism-checker)  
3. 7 PDF Parsing Libraries for Extracting Data in Node.js \- Strapi, accessed on December 16, 2025, [https://strapi.io/blog/7-best-javascript-pdf-parsing-libraries-nodejs-2025](https://strapi.io/blog/7-best-javascript-pdf-parsing-libraries-nodejs-2025)  
4. How to Accurately Extract PDF Data Using Apryse SDK and Node.js, accessed on December 16, 2025, [https://apryse.com/blog/pdf-data-extraction-with-nodejs](https://apryse.com/blog/pdf-data-extraction-with-nodejs)  
5. Plagiarism Checker with Source Links \- Rapid API, accessed on December 16, 2025, [https://rapidapi.com/razasaeed135/api/plagiarism-checker-with-source-links](https://rapidapi.com/razasaeed135/api/plagiarism-checker-with-source-links)  
6. Plagiarism Checker with Source Links \- Rapid API, accessed on December 16, 2025, [https://rapidapi.com/razasaeed135/api/plagiarism-checker-with-source-links/pricing](https://rapidapi.com/razasaeed135/api/plagiarism-checker-with-source-links/pricing)  
7. Best practices for using GitHub Copilot, accessed on December 16, 2025, [https://docs.github.com/en/copilot/get-started/best-practices](https://docs.github.com/en/copilot/get-started/best-practices)  
8. Planning a project with GitHub Copilot, accessed on December 16, 2025, [https://docs.github.com/en/copilot/tutorials/plan-a-project](https://docs.github.com/en/copilot/tutorials/plan-a-project)  
9. SvelteKit vs Next.js | Better Stack Community, accessed on December 16, 2025, [https://betterstack.com/community/guides/scaling-nodejs/sveltekit-vs-nextjs/](https://betterstack.com/community/guides/scaling-nodejs/sveltekit-vs-nextjs/)  
10. next.config.js: serverActions, accessed on December 16, 2025, [https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)  
11. Epic Next.js 15 Tutorial Part 5: File upload using server actions \- Strapi, accessed on December 16, 2025, [https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions](https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions)  
12. Supabase vs AWS: Feature and Pricing Comparison (2025) \- Bytebase, accessed on December 16, 2025, [https://www.bytebase.com/blog/supabase-vs-aws-pricing/](https://www.bytebase.com/blog/supabase-vs-aws-pricing/)  
13. Building an open warehouse architecture: Supabase's integration with Amazon S3 Tables, accessed on December 16, 2025, [https://aws.amazon.com/blogs/storage/building-an-open-warehouse-architecture-supabases-integration-with-amazon-s3-tables/](https://aws.amazon.com/blogs/storage/building-an-open-warehouse-architecture-supabases-integration-with-amazon-s3-tables/)  
14. Database | Supabase Docs, accessed on December 16, 2025, [https://supabase.com/docs/guides/database/overview](https://supabase.com/docs/guides/database/overview)  
15. Storage Quickstart | Supabase Docs, accessed on December 16, 2025, [https://supabase.com/docs/guides/storage/quickstart](https://supabase.com/docs/guides/storage/quickstart)  
16. Storage | Supabase Docs, accessed on December 16, 2025, [https://supabase.com/docs/guides/storage](https://supabase.com/docs/guides/storage)  
17. Plagiarism Checker \- RapidAPI, accessed on December 16, 2025, [https://rapidapi.com/nlp-hub-nlp-hub-default/api/plagiarism-checker1](https://rapidapi.com/nlp-hub-nlp-hub-default/api/plagiarism-checker1)  
18. Rate Limits and Fallbacks in Eden AI API Calls, accessed on December 16, 2025, [https://www.edenai.co/post/rate-limits-and-fallbacks-in-eden-ai-api-calls](https://www.edenai.co/post/rate-limits-and-fallbacks-in-eden-ai-api-calls)  
19. 5 useful NPM packages for PDF processing in Node.js | Tech Tonic \- Medium, accessed on December 16, 2025, [https://medium.com/deno-the-complete-reference/5-useful-npm-packages-for-pdf-processing-in-node-js-c573cee51804](https://medium.com/deno-the-complete-reference/5-useful-npm-packages-for-pdf-processing-in-node-js-c573cee51804)  
20. Top 7 Plagiarism Checkers (Free & Paid) \- Best Tools Comparison \- GPTZero, accessed on December 16, 2025, [https://gptzero.me/news/best-plagiarism-checkers/](https://gptzero.me/news/best-plagiarism-checkers/)  
21. Brave Search API vs the Bing API, accessed on December 16, 2025, [https://brave.com/search/api/guides/brave-search-api-vs-bing-api/](https://brave.com/search/api/guides/brave-search-api-vs-bing-api/)  
22. duckduckgo-search \- PyPI, accessed on December 16, 2025, [https://pypi.org/project/duckduckgo-search/](https://pypi.org/project/duckduckgo-search/)  
23. New Duckduckgo API Rate Limits? \- Reddit, accessed on December 16, 2025, [https://www.reddit.com/r/duckduckgo/comments/1fy3gr9/new\_duckduckgo\_api\_rate\_limits/](https://www.reddit.com/r/duckduckgo/comments/1fy3gr9/new_duckduckgo_api_rate_limits/)  
24. Google API Search Limits, accessed on December 16, 2025, [https://empowerlearning1.zohodesk.com/portal/en/kb/articles/google-api-search-limits](https://empowerlearning1.zohodesk.com/portal/en/kb/articles/google-api-search-limits)  
25. Pricing & Fees \- Supabase, accessed on December 16, 2025, [https://supabase.com/pricing](https://supabase.com/pricing)  
26. 7 Best Authentication Frameworks for 2025 (Free & Paid Compared) \- DEV Community, accessed on December 16, 2025, [https://dev.to/syedsakhiakram66/7-best-authentication-frameworks-for-2025-free-paid-compared-159g](https://dev.to/syedsakhiakram66/7-best-authentication-frameworks-for-2025-free-paid-compared-159g)  
27. Planning and tracking work for your team or project \- GitHub Docs, accessed on December 16, 2025, [https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/planning-and-tracking-work-for-your-team-or-project](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/planning-and-tracking-work-for-your-team-or-project)  
28. AI Prompt: Bootstrap Next.js v16 app with Supabase Auth, accessed on December 16, 2025, [https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth)  
29. Our experiment with GitHub Copilot: A practical guide for development teams, accessed on December 16, 2025, [https://www.thoughtworks.com/insights/blog/generative-ai/experiment-github-copilot-practical-guide](https://www.thoughtworks.com/insights/blog/generative-ai/experiment-github-copilot-practical-guide)  
30. UI Design Best Practices for 2025 \- Webstacks, accessed on December 16, 2025, [https://www.webstacks.com/blog/ui-design-best-practices](https://www.webstacks.com/blog/ui-design-best-practices)  
31. NextJS Server Action file upload with Progress Bar \- Reddit, accessed on December 16, 2025, [https://www.reddit.com/r/nextjs/comments/179vwlp/nextjs\_server\_action\_file\_upload\_with\_progress\_bar/](https://www.reddit.com/r/nextjs/comments/179vwlp/nextjs_server_action_file_upload_with_progress_bar/)  
32. Guide to Modern Web Application Architecture in 2025 \- eSparkBiz, accessed on December 16, 2025, [https://www.esparkinfo.com/web-development/application/architecture](https://www.esparkinfo.com/web-development/application/architecture)  
33. Web Application Architecture: The Latest Guide (2026 AI Update) \- ClickIT, accessed on December 16, 2025, [https://www.clickittech.com/software-development/web-application-architecture/](https://www.clickittech.com/software-development/web-application-architecture/)