User: replace emoji logo with an actual logo from libraries

GitHub Copilot: Searched for regex `📚|🎓|📖|🎯|📁|🎬|📊`, 11 results

Searched for regex `lucide-react|@heroicons|react-icons`, 5 results

Good, `lucide-react` is already installed. Let me read the files that contain emojis to understand the context better: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/LandingPage.jsx#1-1), lines 1 to 100

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/progress/ProgressTracker.jsx#1-1), lines 1 to 100

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/submission/SubmissionPortal.jsx#1-1), lines 1 to 130

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/LandingPage.jsx#200-200), lines 200 to 300

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/LandingPage.jsx#250-250), lines 250 to 380

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#200-200), lines 200 to 250

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/submission/SubmissionPortal.jsx#190-190), lines 190 to 230

Now let me read the footer section and check the Sidebar component for more emoji logos: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/LandingPage.jsx#395-395), lines 395 to 456

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/layout/Sidebar.jsx#1-1), lines 1 to 100

Now I have a complete picture. Let me update all files to replace emojis with Lucide React icons. I'll make the changes: 

Using "Multi-Replace String in Files"


```

```


Using "Multi-Replace String in Files"


```

```
Now let me check the rest of ProgressTracker to see how the icons are rendered: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/progress/ProgressTracker.jsx#100-100), lines 100 to 192

I need to update the icon rendering in the timeline and also replace those emoji icons at the bottom: 

Using "Multi-Replace String in Files"


```

```
Now let's update SubmissionPortal.jsx: 

Using "Multi-Replace String in Files"


```

```
Now let's update the StudentDashboard.jsx with the navigation icons: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#1-1), lines 1 to 50

Using "Multi-Replace String in Files"


```

```
Now let's update the Sidebar component to handle both string emojis and JSX icons: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/layout/Sidebar.jsx#60-60), lines 60 to 117

Using "Multi-Replace String in Files"


```

```
Now let me check if there are any other dashboards with emojis (Adviser and Coordinator): 

Searched for regex `icon: ['"]?[🏠👤🔔📤📊📋📁📂🎓📝👨]` (`**/*.jsx`), 6 results

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#1-1), lines 1 to 50

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#110-110), lines 110 to 150

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/CoordinatorDashboard.jsx#1-1), lines 1 to 50

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/CoordinatorDashboard.jsx#120-120), lines 120 to 150

Using "Multi-Replace String in Files"


```

```

```

```
Let me verify there are no remaining emoji logos: 

Searched for regex `📚|🎓|📖|🎯|📁|🎬|📊|🏠|👤|🔔|📤|📋|💼|👥|📝|🔍|📄|👨|👩|☀️|🌙|🚪|🎉|💡` (`**/client/src/**/*.jsx`), 14 results

There are still some emojis in other components. Let me update them: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/similarity/SimilarityReport.jsx#1-1), lines 1 to 120

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/notifications/NotificationPanel.jsx#1-1), lines 1 to 120

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/profile/ProfileSection.jsx#90-90), lines 90 to 120

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/notifications/NotificationPanel.jsx#175-175), lines 175 to 200

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/similarity/SimilarityReport.jsx#120-120), lines 120 to 160

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#365-365), lines 365 to 400

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#280-280), lines 280 to 320

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/CoordinatorDashboard.jsx#240-240), lines 240 to 380

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/submission/SubmissionPortal.jsx#150-150), lines 150 to 320

Now let me update all the remaining components with Lucide icons: 

Using "Multi-Replace String in Files"


```

```

```

```


Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/notifications/NotificationPanel.jsx#195-195), lines 195 to 220

Now let me update the remaining files - StudentDashboard, AdviserDashboard, CoordinatorDashboard, SubmissionPortal with their remaining emoji replacements: 

Using "Multi-Replace String in Files"


```

```

```

```

```

```


Using "Multi-Replace String in Files"


```

```
Now let me handle the ProfileSection user icon: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/profile/ProfileSection.jsx#1-1), lines 1 to 30

Using "Multi-Replace String in Files"


```

```
Summarized conversation historyNow let me verify if there are any remaining emojis in the codebase: 

Searched for regex `[\u{1F300}-\u{1F9FF}]|📚|📝|📊|🔍|👨|👩|📄|📁|☀️|🌙|✅|❌|⚠️|🎉|💡|👤|🔔|🏠|📈|📋`, 1 result

The only remaining emoji is in the documentation file (deployment-guide.md), which is appropriate for documentation and doesn't need to be replaced since it's not a UI component.

**Summary:** I've successfully replaced all emoji icons with Lucide React icons across the application:

| File | Changes Made |
|------|-------------|
| LandingPage.jsx | Navigation icons, features grid, role cards, footer integrations |
| ProgressTracker.jsx | Stage icons, completion celebration, tips section |
| SubmissionPortal.jsx | File type icons, upload area, guidelines header |
| Sidebar.jsx | Logo, navigation items, dark mode toggle, logout button |
| StudentDashboard.jsx | Nav items, empty project state |
| AdviserDashboard.jsx | Nav items, empty teams state |
| CoordinatorDashboard.jsx | Nav items, archive section, search results |
| SimilarityReport.jsx | Score indicators, empty states |
| NotificationPanel.jsx | Notification type icons, empty state |
| ProfileSection.jsx | Avatar fallback icon |

All emoji icons have been replaced with professional vector icons from `lucide-react`, maintaining consistent sizing with Tailwind CSS classes using the `tw-` prefix as per your coding standards.

Made changes.

User: Proposing a capstone project is a critical step that sets the foundation for your entire final year. A strong proposal needs to convince your panel that the problem is real, your solution is feasible, and the project is technically complex enough to meet graduation requirements.

Here is a standard structure for a capstone proposal, typically used in IT, Computer Science, and Engineering fields:

1. The Introduction (The "Why")
This section sets the stage and explains the motivation behind the project.

Project Title: A clear, concise name that describes what the system does (e.g., "Automated Inventory Management System with Predictive Analytics for Local Pharmacies").

Background of the Study: Provide context. What is the current state of the industry or area you are looking at?

Problem Statement: This is the most important part. What specific pain point are you solving? Be precise—"Efficiency is low" is too vague; "Manual data entry leads to a 15% error rate in stock counts" is much better.

Objectives: * General Objective: Your main goal.

Specific Objectives: The "to-do" list of technical features (e.g., "To implement a secure login," "To generate monthly PDF reports").

2. Scope and Delimitation (The "What")
This defines the boundaries of your project so you don't suffer from "scope creep."

Scope: List exactly what the system will do (e.g., User authentication, Data visualization, SMS notifications).

Delimitations: List what the system will not do. This protects you from the panel asking for impossible features later (e.g., "The system will not handle online payments in the initial version").

3. Methodology (The "How")
How are you going to build it?

Software Development Life Cycle (SDLC): Specify if you are using Agile/Scrum (recommended for most capstones), Waterfall, or V-Model.

Requirements Analysis: How will you gather data? (Interviews, surveys, or observing current workflows).

Technical Stack:

Frontend: (e.g., React, Vue, HTML/CSS)

Backend: (e.g., Node.js, Python/Django, PHP/Laravel)

Database: (e.g., MySQL, PostgreSQL, MongoDB)

Tools: (e.g., GitHub for version control, Docker for deployment)

4. System Architecture & Design
Visual representations help the panel understand your logic quickly.

Context Diagram/C1-C3 Diagrams: Shows how the system interacts with external entities (users, APIs).

Use Case Diagram: Shows the different roles (Admin, User, Guest) and what they can do.

ERD (Entity Relationship Diagram): Shows your database structure.

5. Feasibility and Timeline
Technical Feasibility: Do you have the skills and hardware to build this?

Gantt Chart: A visual timeline showing when you will finish the design, coding, testing, and documentation phases.

this should be in the details of the proposal, when I click proposal it should be filled, just the highlights and there's an error I encountered on the dashboard 
It never mentioned anyone, It should mention like the name of the adviser linked to the gmail, and the member's

GitHub Copilot: Let me explore the current implementation to understand the project structure and dashboard components: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/models/Project.js)

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#1-1), lines 1 to 100

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/controllers/projectController.js#1-1), lines 1 to 100

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#100-100), lines 100 to 200

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/controllers/projectController.js#100-100), lines 100 to 200

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#200-200), lines 200 to 400

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#400-400), lines 400 to 584

Now I can see the current structure. The issue is that:
1. The project details dialog is basic and doesn't have the proposal structure
2. The adviser and member names might not be showing if they're using `firstName`/`lastName` but the User model might use `name` instead

Let me check the User model: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/models/User.js#1-1), lines 1 to 60

Good, the User model has `firstName` and `lastName`. The populate in the controller is using `name email role` but should be `firstName lastName email role`. Let me also update the Project model to include proposal details and fix the controller: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/models/Project.js)

Now I need to:
1. Update the Project model to include proposal fields
2. Fix the controller to populate `firstName lastName email role` instead of `name email role`
3. Update the frontend to display proposal details and fix the member/adviser name display 

Using "Replace String in File"


```

```
Now let me fix the controller to populate the correct user fields: 

Searched for regex `populate.*name email role` (`**/*.js`), 5 results

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/controllers/projectController.js#140-140), lines 140 to 300

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/controllers/projectController.js#290-290), lines 290 to 404

Now let me update the controller to fix the populate fields: 

Using "Multi-Replace String in Files"


```

```
Now let me add an endpoint to update proposal details and create a comprehensive proposal view in the frontend. First, let me add the update proposal endpoint: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/routes/api.js#1-1), lines 1 to 60

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/routes/api.js#55-55), lines 55 to 65

Using "Replace String in File"


```

```
Now let me add the updateProposal function to the controller: 

Using "Replace String in File"

Let me read the end of the file to append the new function: 

Using "Replace String in File"


```

```
Now let me create a comprehensive ProposalDetails component for viewing and editing proposals: 

Created [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/proposal/ProposalDetails.jsx)

Now let me update the StudentDashboard to use the new ProposalDetails component instead of the basic dialog: 

Using "Replace String in File"


```

```
Now let me update the project list display to show proper names and update the details dialog: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#350-350), lines 350 to 400

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#395-395), lines 395 to 440

Now let me find and replace the old Project Details Dialog with the new ProposalDetails component: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#485-485), lines 485 to 540

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#535-535), lines 535 to 585

Now let me replace the old dialog with the new ProposalDetails component: 

Using "Replace String in File"


```

```
Now let me also update the AdviserDashboard to use the same ProposalDetails component and fix the name display: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#1-1), lines 1 to 100

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#100-100), lines 100 to 200

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#200-200), lines 200 to 350

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#350-350), lines 350 to 560

Now let me update the AdviserDashboard to use ProposalDetails: 

Using "Replace String in File"


```

```
Now I'll add a state for showing the ProposalDetails and update the dialog section. Let me also add a review action bar: 

Using "Replace String in File"


```

```
Now let me update the dialog section to include a button to view the full proposal and add ProposalDetails: 

Using "Replace String in File"


```

```
Summarized conversation historyNow let me check the project cards in AdviserDashboard to also display names properly: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#180-180), lines 180 to 260

The members are already being displayed correctly there. Let me also check the project cards section: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx#280-280), lines 280 to 350

Good, the team member names are already being displayed properly in those sections. Now let me also update the CoordinatorDashboard to use ProposalDetails consistently: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/CoordinatorDashboard.jsx#1-1), lines 1 to 100

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/CoordinatorDashboard.jsx#100-100), lines 100 to 200

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/CoordinatorDashboard.jsx#500-500), lines 500 to 550

Let me add ProposalDetails to the CoordinatorDashboard too: 

Using "Replace String in File"


```

```


Using "Replace String in File"


```

```
Now I need to read more of the Dialog section and add a button to view proposal, similar to AdviserDashboard: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/CoordinatorDashboard.jsx#540-540), lines 540 to 660

Now let me update the CoordinatorDashboard to add the "View Full Proposal" button and the ProposalDetails component: 

Using "Replace String in File"


```

```
Now let me add the ProposalDetails component at the end of the coordinator dashboard: 

Using "Replace String in File"


```

```
Now let me verify the StudentDashboard is properly updated. Let me check if it has all the necessary changes: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#1-1), lines 1 to 50

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#50-50), lines 50 to 100

Searched for regex `ProposalDetails.*isOpen` (`**/StudentDashboard.jsx`), no results

Searched for text `ProposalDetails` (`**/StudentDashboard.jsx`), 4 results

Good, the StudentDashboard has ProposalDetails integrated. Let me verify it's using the correct props: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx#490-490), lines 490 to 520

The StudentDashboard is correctly configured with `canEdit={true}` so students can edit their proposals. Now let me verify the ProposalDetails component exists and has correct implementation: 

Searched for files matching `**/proposal/ProposalDetails.jsx`, 1 match

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/proposal/ProposalDetails.jsx#1-1), lines 1 to 100

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/proposal/ProposalDetails.jsx#100-100), lines 100 to 200

The ProposalDetails component looks good. Now let me check if the backend controller properly populates the adviser field too: 

Searched for text `populate('adviser'` (`**/projectController.js`), 4 results

The adviser is being populated with `firstName lastName`. Let me verify the full context of `listProjects` and other key functions: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/server/controllers/projectController.js#140-140), lines 140 to 180

The populate is correct now with `firstName lastName email role`. Let me also check if there are any errors in the code: 

Checked [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/proposal/ProposalDetails.jsx), [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/StudentDashboard.jsx), [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/AdviserDashboard.jsx), [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/pages/CoordinatorDashboard.jsx), no problems found

All files are error-free. Now let me also make sure the proposal folder exists for the ProposalDetails component: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components)

Good, the `proposal` folder exists. Let me verify the ProposalDetails.jsx file is complete and properly structured by checking a few more sections: 

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/proposal/ProposalDetails.jsx#200-200), lines 200 to 300

Read [](file:///c%3A/Users/patrick%20josh/Desktop/BukSU/Capstone/capstone%20management%20system/client/src/components/proposal/ProposalDetails.jsx#780-780), lines 780 to 831

The ProposalDetails component is complete. Now let me provide a summary of what was done:

## Summary of Changes

### 1. Fixed Name Display Bug
**Issue:** The dashboard was not showing adviser and member names properly.

**Root Cause:** The projectController.js was using `populate('members', 'name email role')` but the User model has `firstName` and `lastName` fields, not `name`.

**Fix:** Updated all `populate()` calls in projectController.js to use the correct fields:
- Changed `'name email role'` to `'firstName lastName email role'`
- This applies to `listProjects`, `getProjectById`, `getProjectLogs`, and `checkTitleSimilarity`

### 2. Added Comprehensive Proposal Structure
Created a new ProposalDetails.jsx component with the following sections:

1. **Team Information** - Shows adviser and members with proper name formatting
2. **Introduction**
   - Background of the Study
   - Problem Statement
   - General Objective
   - Specific Objectives (editable list)
3. **Scope & Delimitation**
   - Scope items (editable list)
   - Delimitations (editable list)
4. **Methodology**
   - SDLC Model (dropdown: Agile, Waterfall, Iterative, Spiral)
   - Requirements Analysis
   - Tech Stack (Frontend, Backend, Database, Tools list)
5. **System Architecture**
   - Context Diagram URL
   - Use Case Diagram URL
   - ERD Diagram URL
6. **Feasibility & Timeline**
   - Technical Feasibility
   - Project Timeline

### 3. Updated Project Model Schema
Enhanced Project.js with a comprehensive `proposal` subdocument to store all proposal fields.

### 4. Added New API Endpoint
Added `PUT /api/v1/projects/:projectId/proposal` in api.js and corresponding `updateProposal` function in the controller.

### 5. Integrated ProposalDetails Across Dashboards
- **StudentDashboard** - `canEdit={true}` - Students can edit when status is PROPOSED or REVISION_REQUIRED
- **AdviserDashboard** - `canEdit={false}` - Advisers can view full proposals via "View Full Proposal" button
- **CoordinatorDashboard** - `canEdit={false}` - Coordinators can view full proposals via "View Full Proposal" button

Made changes.

User: Plan on making this app fully functionable, plan any details, I need the capstone management done without bugs and errors give I want to focus solely on the capstone management side for now but if you can, you can also get the plagiarism checking, I want a full prompt to feed on the plan agent on copilot give me it

GitHub Copilot: # Capstone Management System - Complete Implementation Plan

## Executive Summary

This plan provides a comprehensive roadmap to make the Capstone Management System fully functional, focusing on core capstone workflow features with optional plagiarism checking integration.

---

## Phase 1: Foundation Fixes (Critical Bugs)

### 1.1 Fix User Name Population in Backend

**Problem:** The `projectController.js` uses `populate('members', 'name email role')` but the User model has `firstName` and `lastName` fields.

**Files to Fix:**
- projectController.js

**Changes:**
```javascript
// Change all instances of:
.populate('members', 'name email role')
.populate('adviser', 'name email')

// To:
.populate('members', 'firstName lastName email role')
.populate('adviser', 'firstName lastName email role')
```

### 1.2 Fix ProposalDetails Component Integration

**Problem:** ProposalDetails component needs to be properly integrated into dashboards with correct data flow.

**Files to Update:**
- StudentDashboard.jsx
- AdviserDashboard.jsx
- CoordinatorDashboard.jsx

---

## Phase 2: Project Lifecycle & State Machine

### 2.1 Complete Project States

| State | Description | Next Allowed States |
|-------|-------------|---------------------|
| `PROPOSED` | Initial submission | `PENDING_ADVISER_REVIEW` |
| `PENDING_ADVISER_REVIEW` | Awaiting adviser approval | `ADVISER_APPROVED`, `REVISION_REQUIRED` |
| `ADVISER_APPROVED` | Adviser approved | `PENDING_COORDINATOR_REVIEW` |
| `PENDING_COORDINATOR_REVIEW` | Awaiting coordinator | `APPROVED`, `REVISION_REQUIRED` |
| `REVISION_REQUIRED` | Needs changes | `PROPOSED` (resubmit) |
| `APPROVED` | Ready for development | `IN_PROGRESS` |
| `IN_PROGRESS` | Active development | `SUBMITTED_FOR_DEFENSE` |
| `SUBMITTED_FOR_DEFENSE` | Final review | `COMPLETED`, `REVISION_REQUIRED` |
| `COMPLETED` | Project finished | (Terminal) |
| `ARCHIVED` | Historical record | (Terminal) |

### 2.2 State Transition Controller

**File:** projectController.js

```javascript
const stateTransitions = {
  PROPOSED: ['PENDING_ADVISER_REVIEW'],
  PENDING_ADVISER_REVIEW: ['ADVISER_APPROVED', 'REVISION_REQUIRED'],
  ADVISER_APPROVED: ['PENDING_COORDINATOR_REVIEW'],
  PENDING_COORDINATOR_REVIEW: ['APPROVED', 'REVISION_REQUIRED'],
  REVISION_REQUIRED: ['PROPOSED'],
  APPROVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['SUBMITTED_FOR_DEFENSE'],
  SUBMITTED_FOR_DEFENSE: ['COMPLETED', 'REVISION_REQUIRED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: []
};

const rolePermissions = {
  student: ['PROPOSED', 'IN_PROGRESS', 'SUBMITTED_FOR_DEFENSE'],
  adviser: ['ADVISER_APPROVED', 'REVISION_REQUIRED'],
  coordinator: ['APPROVED', 'REVISION_REQUIRED', 'COMPLETED', 'ARCHIVED']
};
```

---

## Phase 3: Proposal Management (Full Structure)

### 3.1 Enhanced Proposal Schema

**File:** Project.js

Add complete proposal subdocument with all sections from the capstone proposal structure:

1. **Introduction Section**
   - Background of the Study
   - Problem Statement
   - General Objective
   - Specific Objectives (array)

2. **Scope & Delimitation**
   - Scope items (array)
   - Delimitations (array)

3. **Methodology**
   - SDLC Model (enum: Agile, Waterfall, Iterative, Spiral, V-Model)
   - Requirements Analysis approach
   - Technical Stack (frontend, backend, database, tools array)

4. **System Architecture**
   - Context Diagram URL
   - Use Case Diagram URL
   - ERD URL

5. **Feasibility & Timeline**
   - Technical Feasibility description
   - Timeline/Gantt Chart data

### 3.2 Proposal API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/projects/:id/proposal` | Get full proposal |
| `PUT` | `/api/v1/projects/:id/proposal` | Update proposal |
| `POST` | `/api/v1/projects/:id/proposal/submit` | Submit for review |
| `GET` | `/api/v1/projects/:id/proposal/history` | Get revision history |

---

## Phase 4: Role-Based Dashboards

### 4.1 Student Dashboard Features

- [ ] View assigned project with full details
- [ ] Edit proposal (when status allows)
- [ ] Submit proposal for review
- [ ] View feedback/comments from adviser
- [ ] Track progress through stages
- [ ] Upload documents/files
- [ ] View team members and adviser info

### 4.2 Adviser Dashboard Features

- [ ] View all assigned teams/projects
- [ ] Review proposal details
- [ ] Approve or request revisions
- [ ] Add comments/feedback
- [ ] Track student progress
- [ ] View submission history

### 4.3 Coordinator Dashboard Features

- [ ] View all projects in department
- [ ] Final approval authority
- [ ] Assign/reassign advisers
- [ ] Archive completed projects
- [ ] Generate reports
- [ ] Manage academic terms

---

## Phase 5: Document Management

### 5.1 File Upload System

**Supported Document Types:**
- Proposal documents (PDF, DOCX)
- Diagrams (PNG, JPG, SVG)
- Source code archives (ZIP)
- Presentations (PPTX, PDF)

### 5.2 Document Versioning

Track all document uploads with:
- Version number
- Upload timestamp
- Uploader info
- File metadata
- Previous version reference

---

## Phase 6: Notification System

### 6.1 Email Notifications

| Event | Recipients | Template |
|-------|-----------|----------|
| Proposal submitted | Adviser | `proposal-submitted` |
| Revision requested | Student team | `revision-requested` |
| Proposal approved | Student team | `proposal-approved` |
| Comment added | Relevant users | `new-comment` |
| Deadline reminder | Students | `deadline-reminder` |

### 6.2 In-App Notifications

Real-time notifications using the existing NotificationPanel component.

---

## Phase 7: Plagiarism Checking (Placeholder)

### 7.1 Placeholder Implementation

**File:** `server/controllers/similarityController.js`

```javascript
// Placeholder - stores report links without actual detection
exports.checkSimilarity = async (req, res) => {
  // Store submission reference
  // Return placeholder response with "pending" status
  // Manual report link can be added later
};
```

### 7.2 Future Integration Points

- External API integration (Turnitin, Copyscape)
- Local text comparison algorithm
- Document fingerprinting

---

## Phase 8: Testing & Quality Assurance

### 8.1 Backend Tests

```
tests/
├── unit/
│   ├── models/
│   │   ├── User.test.js
│   │   └── Project.test.js
│   └── controllers/
│       ├── authController.test.js
│       └── projectController.test.js
├── integration/
│   ├── auth.test.js
│   └── project-workflow.test.js
└── e2e/
    └── full-cycle.test.js
```

### 8.2 Frontend Tests

- Component unit tests
- User flow integration tests
- Accessibility testing

---

## Implementation Checklist

### Backend Tasks

- [ ] Fix User model population in all controllers
- [ ] Complete state machine implementation
- [ ] Add proposal CRUD endpoints
- [ ] Implement document upload/versioning
- [ ] Set up email notifications
- [ ] Add audit logging
- [ ] Create plagiarism placeholder
- [ ] Write API tests

### Frontend Tasks

- [ ] Fix name display in all dashboards
- [ ] Complete ProposalDetails component
- [ ] Add proposal editing forms
- [ ] Implement file upload UI
- [ ] Create progress visualization
- [ ] Add notification handling
- [ ] Implement comment system
- [ ] Build report generation UI

### Documentation

- [ ] API documentation (Swagger)
- [ ] User guides per role
- [ ] Deployment instructions
- [ ] Database schema diagram

---

## Copilot Agent Prompt

Use this prompt with the GitHub Copilot Plan Agent:

```
Create a detailed implementation plan for the Capstone Management System with the following requirements:

## Project Context
- MERN Stack (MongoDB, Express, React, Node.js)
- Three user roles: Student, Adviser, Coordinator
- Tailwind CSS with 'tw-' prefix mandatory
- Zero-cost deployment (Render, Vercel, MongoDB Atlas)

## Critical Fixes Needed
1. Fix User model population - change 'name' to 'firstName lastName' in all populate() calls in server/controllers/projectController.js
2. Integrate ProposalDetails component into StudentDashboard, AdviserDashboard, and CoordinatorDashboard

## Core Features to Implement

### 1. Project State Machine
States: PROPOSED → PENDING_ADVISER_REVIEW → ADVISER_APPROVED → PENDING_COORDINATOR_REVIEW → APPROVED → IN_PROGRESS → SUBMITTED_FOR_DEFENSE → COMPLETED → ARCHIVED
Include REVISION_REQUIRED state that can return to PROPOSED

### 2. Proposal Management
Full proposal structure with:
- Introduction (background, problem statement, objectives)
- Scope & Delimitation (arrays)
- Methodology (SDLC model, tech stack)
- System Architecture (diagram URLs)
- Feasibility & Timeline

### 3. Role-Based Access
- Students: Create/edit proposals, submit for review, view feedback
- Advisers: Review proposals, approve/request revisions, add comments
- Coordinators: Final approval, assign advisers, archive projects

### 4. Document Management
- File upload with versioning
- Support PDF, DOCX, images, ZIP
- Store metadata in MongoDB

### 5. Notifications
- Email notifications via Nodemailer (SMTP configured)
- In-app notifications for status changes

### 6. Plagiarism Placeholder
- Create similarity report placeholder
- Store report links without actual detection logic

## Technical Requirements
- All Tailwind classes must use 'tw-' prefix
- Use Lucide React icons (already installed)
- Follow existing code patterns in the repository
- Implement proper error handling
- Add audit logging for all significant actions

## Files to Modify
- server/controllers/projectController.js (fix populate, add state transitions)
- server/models/Project.js (enhance proposal schema)
- server/routes/api.js (add new endpoints)
- client/src/pages/StudentDashboard.jsx
- client/src/pages/AdviserDashboard.jsx
- client/src/pages/CoordinatorDashboard.jsx
- client/src/components/proposal/ProposalDetails.jsx

## Deliverables
1. Updated backend controllers with state machine
2. Enhanced Project model with full proposal schema
3. New API endpoints for proposal management
4. Updated dashboard components with proper data display
5. Email notification templates and triggers
6. Unit tests for critical functions
```

---

## Priority Order

1. **Immediate (Day 1-2):** Fix name population bug, integrate ProposalDetails
2. **High (Day 3-5):** Complete state machine, proposal CRUD
3. **Medium (Day 6-8):** Document management, notifications
4. **Low (Day 9-10):** Plagiarism placeholder, testing, documentation

User: I also need to consider the implementation of google docs API for editing the capstone

GitHub Copilot: # Complete Copilot Agent Prompt for Capstone Management System

Use this comprehensive prompt with the GitHub Copilot Plan Agent to implement the fully functional Capstone Management System:

---

```
## PROJECT CONTEXT

You are implementing a Capstone Management System using the MERN Stack (MongoDB, Express, React, Node.js).

### Current Project Location
- Path: c:\Users\patrick josh\Desktop\BukSU\Capstone\capstone management system
- Frontend: client/ (React + Vite)
- Backend: server/ (Express.js)

### Tech Stack
- Frontend: React 18 + Vite, Tailwind CSS with MANDATORY 'tw-' prefix, Lucide React icons
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB Atlas
- Storage: Google Drive API (Service Account) + Google Docs API for collaborative editing
- Auth: JWT + bcrypt
- Email: Nodemailer (SMTP configured)

### Deployment Constraints
- Zero-cost: Render Free Tier, Vercel, MongoDB Atlas M0
- RAM Limit: 512MB (stream files, never buffer in memory)

---

## PHASE 1: CRITICAL BUG FIXES (IMMEDIATE)

### 1.1 Fix User Model Population Bug

**Problem:** projectController.js uses `populate('members', 'name email role')` but User model has `firstName` and `lastName` fields.

**Files to modify:**
- server/controllers/projectController.js

**Changes required:**
```javascript
// Change ALL instances of:
.populate('members', 'name email role')
.populate('adviser', 'name email')

// To:
.populate('members', 'firstName lastName email role')
.populate('adviser', 'firstName lastName email role')
```

**Functions to update:**
- listProjects
- getProjectById
- getProjectLogs
- checkTitleSimilarity
- Any other function using populate on members or adviser

### 1.2 Fix Dashboard Name Display

**Files to modify:**
- StudentDashboard.jsx
- AdviserDashboard.jsx
- CoordinatorDashboard.jsx

**Changes required:**
Update all name displays to use:
```javascript
const formatName = (user) => {
  if (!user) return 'Unknown';
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email || 'Unknown';
};
```

---

## PHASE 2: PROJECT STATE MACHINE

### 2.1 Define State Transitions

**File:** projectController.js

Create a complete state machine:

```javascript
const PROJECT_STATES = {
  PROPOSED: 'PROPOSED',
  PENDING_ADVISER_REVIEW: 'PENDING_ADVISER_REVIEW',
  ADVISER_APPROVED: 'ADVISER_APPROVED',
  PENDING_COORDINATOR_REVIEW: 'PENDING_COORDINATOR_REVIEW',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED_FOR_DEFENSE: 'SUBMITTED_FOR_DEFENSE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

const STATE_TRANSITIONS = {
  PROPOSED: ['PENDING_ADVISER_REVIEW'],
  PENDING_ADVISER_REVIEW: ['ADVISER_APPROVED', 'REVISION_REQUIRED'],
  ADVISER_APPROVED: ['PENDING_COORDINATOR_REVIEW'],
  PENDING_COORDINATOR_REVIEW: ['APPROVED', 'REVISION_REQUIRED'],
  REVISION_REQUIRED: ['PROPOSED'],
  APPROVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['SUBMITTED_FOR_DEFENSE'],
  SUBMITTED_FOR_DEFENSE: ['COMPLETED', 'REVISION_REQUIRED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: []
};

const ROLE_PERMISSIONS = {
  student: {
    canTransitionTo: ['PENDING_ADVISER_REVIEW', 'IN_PROGRESS', 'SUBMITTED_FOR_DEFENSE'],
    canEdit: ['PROPOSED', 'REVISION_REQUIRED', 'IN_PROGRESS']
  },
  adviser: {
    canTransitionTo: ['ADVISER_APPROVED', 'REVISION_REQUIRED'],
    canReview: ['PENDING_ADVISER_REVIEW']
  },
  coordinator: {
    canTransitionTo: ['APPROVED', 'REVISION_REQUIRED', 'COMPLETED', 'ARCHIVED'],
    canReview: ['PENDING_COORDINATOR_REVIEW', 'SUBMITTED_FOR_DEFENSE']
  }
};
```

### 2.2 Implement State Transition Endpoint

**File:** api.js

Add endpoint:
```javascript
router.put('/projects/:projectId/transition', auth, projectController.transitionState);
```

**File:** projectController.js

Implement:
```javascript
exports.transitionState = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { newState, comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate transition is allowed
    // Check user has permission
    // Update project status
    // Create audit log entry
    // Send notification emails
    // Return updated project
  } catch (error) {
    next(error);
  }
};
```

---

## PHASE 3: COMPLETE PROPOSAL SCHEMA

### 3.1 Enhanced Project Model

**File:** Project.js

Add comprehensive proposal subdocument:

```javascript
const proposalSchema = new mongoose.Schema({
  // Introduction Section
  introduction: {
    background: { type: String, default: '' },
    problemStatement: { type: String, default: '' },
    generalObjective: { type: String, default: '' },
    specificObjectives: [{ type: String }]
  },
  
  // Scope & Delimitation
  scopeAndDelimitation: {
    scope: [{ type: String }],
    delimitations: [{ type: String }]
  },
  
  // Methodology
  methodology: {
    sdlcModel: {
      type: String,
      enum: ['Agile', 'Waterfall', 'Iterative', 'Spiral', 'V-Model', 'DevOps'],
      default: 'Agile'
    },
    requirementsAnalysis: { type: String, default: '' },
    techStack: {
      frontend: { type: String, default: '' },
      backend: { type: String, default: '' },
      database: { type: String, default: '' },
      tools: [{ type: String }]
    }
  },
  
  // System Architecture
  systemArchitecture: {
    contextDiagramUrl: { type: String, default: '' },
    useCaseDiagramUrl: { type: String, default: '' },
    erdUrl: { type: String, default: '' },
    architectureDescription: { type: String, default: '' }
  },
  
  // Feasibility & Timeline
  feasibilityAndTimeline: {
    technicalFeasibility: { type: String, default: '' },
    timeline: { type: String, default: '' },
    ganttChartUrl: { type: String, default: '' }
  },
  
  // Google Docs Integration
  googleDocsId: { type: String, default: '' },
  googleDocsUrl: { type: String, default: '' },
  lastSyncedAt: { type: Date }
}, { _id: false });

// Add to main project schema
proposal: proposalSchema
```

### 3.2 Proposal API Endpoints

**File:** api.js

```javascript
// Proposal endpoints
router.get('/projects/:projectId/proposal', auth, projectController.getProposal);
router.put('/projects/:projectId/proposal', auth, projectController.updateProposal);
router.post('/projects/:projectId/proposal/submit', auth, projectController.submitProposal);
router.get('/projects/:projectId/proposal/history', auth, projectController.getProposalHistory);

// Google Docs integration
router.post('/projects/:projectId/docs/create', auth, googleDocsController.createDocument);
router.get('/projects/:projectId/docs/sync', auth, googleDocsController.syncDocument);
router.get('/projects/:projectId/docs/url', auth, googleDocsController.getEditUrl);
```

---

## PHASE 4: GOOGLE DOCS API INTEGRATION

### 4.1 Setup Google Docs Service

**File:** server/services/googleDocsService.js

```javascript
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

class GoogleDocsService {
  constructor() {
    this.auth = null;
    this.docs = null;
    this.drive = null;
  }

  async initialize() {
    // Use service account credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    
    this.auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive'
      ]
    });

    this.docs = google.docs({ version: 'v1', auth: this.auth });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async createProposalDocument(projectTitle, teamMembers, advisorName, tenantId) {
    // Create Google Doc with proposal template
    // Set permissions for team members
    // Return document ID and URL
  }

  async getDocumentContent(documentId) {
    // Fetch document content
    // Parse into structured proposal format
  }

  async updateDocumentContent(documentId, proposalData) {
    // Update document with proposal data
  }

  async shareDocumentWithUser(documentId, email, role = 'writer') {
    // Share document with team member or adviser
  }

  async syncProposalFromDoc(documentId, projectId) {
    // Pull content from Google Doc
    // Update proposal in MongoDB
    // Return synced data
  }

  async syncProposalToDoc(documentId, proposalData) {
    // Push proposal data to Google Doc
  }
}

module.exports = new GoogleDocsService();
```

### 4.2 Google Docs Controller

**File:** server/controllers/googleDocsController.js

```javascript
const googleDocsService = require('../services/googleDocsService');
const Project = require('../models/Project');

exports.createDocument = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .populate('members', 'firstName lastName email')
      .populate('adviser', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if document already exists
    if (project.proposal?.googleDocsId) {
      return res.status(400).json({ 
        message: 'Document already exists',
        url: project.proposal.googleDocsUrl 
      });
    }

    // Create Google Doc
    const { documentId, documentUrl } = await googleDocsService.createProposalDocument(
      project.title,
      project.members,
      project.adviser,
      project.tenant
    );

    // Share with team members
    for (const member of project.members) {
      await googleDocsService.shareDocumentWithUser(documentId, member.email, 'writer');
    }
    
    // Share with adviser (commenter)
    if (project.adviser) {
      await googleDocsService.shareDocumentWithUser(documentId, project.adviser.email, 'commenter');
    }

    // Update project
    project.proposal = project.proposal || {};
    project.proposal.googleDocsId = documentId;
    project.proposal.googleDocsUrl = documentUrl;
    await project.save();

    res.json({
      success: true,
      documentId,
      documentUrl,
      message: 'Google Doc created and shared with team'
    });
  } catch (error) {
    next(error);
  }
};

exports.syncDocument = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { direction = 'from_doc' } = req.query; // 'from_doc' or 'to_doc'
    
    const project = await Project.findById(projectId);
    
    if (!project?.proposal?.googleDocsId) {
      return res.status(400).json({ message: 'No Google Doc linked to this project' });
    }

    if (direction === 'from_doc') {
      // Pull from Google Doc to MongoDB
      const syncedData = await googleDocsService.syncProposalFromDoc(
        project.proposal.googleDocsId,
        projectId
      );
      
      project.proposal = { ...project.proposal, ...syncedData, lastSyncedAt: new Date() };
      await project.save();
      
      res.json({ success: true, proposal: project.proposal });
    } else {
      // Push from MongoDB to Google Doc
      await googleDocsService.syncProposalToDoc(
        project.proposal.googleDocsId,
        project.proposal
      );
      
      project.proposal.lastSyncedAt = new Date();
      await project.save();
      
      res.json({ success: true, message: 'Synced to Google Doc' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getEditUrl = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project?.proposal?.googleDocsUrl) {
      return res.status(404).json({ message: 'No Google Doc linked' });
    }
    
    res.json({ url: project.proposal.googleDocsUrl });
  } catch (error) {
    next(error);
  }
};
```

### 4.3 Environment Variables

**File:** .env

Add:
```
# Google API Configuration
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Or use separate file
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json
```

---

## PHASE 5: PROPOSAL DETAILS COMPONENT

### 5.1 ProposalDetails Component

**File:** ProposalDetails.jsx

Create a comprehensive proposal viewer/editor component that:
- Displays all proposal sections (Introduction, Scope, Methodology, etc.)
- Shows team member names and adviser properly formatted
- Allows editing when user has permission
- Integrates with Google Docs (open in new tab, sync buttons)
- Saves changes to backend API
- Uses Tailwind CSS with 'tw-' prefix
- Uses Lucide React icons

Key features:
1. **Team Information Section** - Display adviser and members with proper names
2. **Introduction Section** - Background, Problem Statement, Objectives
3. **Scope & Delimitation** - Editable lists
4. **Methodology** - SDLC dropdown, tech stack inputs
5. **System Architecture** - Diagram URL inputs with preview
6. **Feasibility & Timeline** - Text areas and Gantt chart link
7. **Google Docs Integration** - Create/Open/Sync buttons

### 5.2 Dashboard Integration

Integrate ProposalDetails into all dashboards:

**StudentDashboard.jsx:**
- Show ProposalDetails with `canEdit={true}` when status allows
- Add "Edit in Google Docs" button
- Show sync status

**AdviserDashboard.jsx:**
- Show ProposalDetails with `canEdit={false}`
- Add "View Full Proposal" modal/drawer
- Show "Open in Google Docs" for commenting

**CoordinatorDashboard.jsx:**
- Show ProposalDetails with `canEdit={false}`
- Add "View Full Proposal" for any project
- Approval/Rejection workflow buttons

---

## PHASE 6: DOCUMENT MANAGEMENT

### 6.1 File Upload with Google Drive

**File:** server/services/googleDriveService.js

```javascript
const { google } = require('googleapis');
const stream = require('stream');

class GoogleDriveService {
  async uploadFile(fileBuffer, fileName, mimeType, folderId) {
    // Stream file to Google Drive (never buffer full file in memory)
    // Return file ID and web view link
  }

  async createFolder(folderName, parentFolderId) {
    // Create folder for project documents
  }

  async listFiles(folderId) {
    // List files in project folder
  }

  async deleteFile(fileId) {
    // Soft delete (move to trash)
  }

  async getFileMetadata(fileId) {
    // Get file info
  }
}
```

### 6.2 Document Version Tracking

**File:** server/models/Document.js

```javascript
const documentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  mimeType: { type: String, required: true },
  googleDriveId: { type: String, required: true },
  googleDriveUrl: { type: String, required: true },
  version: { type: Number, default: 1 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['proposal', 'diagram', 'source_code', 'documentation', 'presentation', 'other'],
    default: 'other'
  },
  metadata: {
    size: Number,
    originalName: String,
    description: String
  },
  previousVersion: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }
}, { timestamps: true });
```

---

## PHASE 7: NOTIFICATION SYSTEM

### 7.1 Email Notifications

**File:** server/services/emailService.js

Implement email templates for:
- Proposal submitted for review
- Revision requested (with comments)
- Proposal approved
- Status change notifications
- Document upload notifications
- Deadline reminders

### 7.2 In-App Notifications

**File:** server/models/Notification.js

```javascript
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'PROPOSAL_SUBMITTED',
      'REVISION_REQUESTED',
      'PROPOSAL_APPROVED',
      'STATUS_CHANGED',
      'COMMENT_ADDED',
      'DOCUMENT_UPLOADED',
      'DEADLINE_REMINDER'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  read: { type: Boolean, default: false },
  actionUrl: String
}, { timestamps: true });
```

---

## PHASE 8: PLAGIARISM PLACEHOLDER

### 8.1 Similarity Report Model

**File:** server/models/SimilarityReport.js

```javascript
const similarityReportSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  // Placeholder fields - actual detection not implemented
  similarityScore: { type: Number, min: 0, max: 100 },
  reportUrl: String,
  externalReportId: String,
  checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });
```

### 8.2 Placeholder Controller

**File:** server/controllers/similarityController.js

```javascript
// PLACEHOLDER - Does not implement actual detection
exports.createReport = async (req, res, next) => {
  // Store report metadata
  // Return pending status
  // Coordinator manually updates with external report link
};

exports.updateReport = async (req, res, next) => {
  // Allow coordinator to manually add similarity score and report URL
  // This is the manual workflow until actual detection is implemented
};
```

---

## PHASE 9: TESTING

### 9.1 Backend Tests

**File:** server/tests/projectController.test.js

Test:
- State transitions (valid and invalid)
- Role permissions
- Proposal CRUD operations
- Google Docs integration mocks

### 9.2 Frontend Tests

Test:
- ProposalDetails component rendering
- Form submissions
- Dashboard data display
- Name formatting

---

## IMPLEMENTATION CHECKLIST

### Backend Tasks
- [ ] Fix User model population in projectController.js
- [ ] Implement complete state machine with transitions
- [ ] Add proposal schema with all sections
- [ ] Create proposal API endpoints
- [ ] Implement Google Docs service
- [ ] Implement Google Drive service
- [ ] Create document versioning system
- [ ] Set up email notification templates
- [ ] Create in-app notification system
- [ ] Add plagiarism report placeholder
- [ ] Write unit tests

### Frontend Tasks
- [ ] Fix name display in all dashboards
- [ ] Create ProposalDetails component
- [ ] Integrate ProposalDetails into StudentDashboard
- [ ] Integrate ProposalDetails into AdviserDashboard
- [ ] Integrate ProposalDetails into CoordinatorDashboard
- [ ] Add Google Docs integration buttons
- [ ] Implement document upload UI
- [ ] Create notification panel
- [ ] Build similarity report viewer
- [ ] Add loading and error states everywhere

### Documentation
- [ ] API documentation with Swagger
- [ ] Google Docs setup guide
- [ ] Deployment instructions
- [ ] User guides per role

---

## CODING STANDARDS REMINDER

1. **Tailwind CSS:** ALL classes MUST use 'tw-' prefix
   ```jsx
   // Correct
   <div className="tw-bg-white tw-p-4 tw-rounded-lg">
   
   // Wrong
   <div className="bg-white p-4 rounded-lg">
   ```

2. **Icons:** Use Lucide React only
   ```jsx
   import { FileText, Users, CheckCircle } from 'lucide-react';
   ```

3. **Error Handling:** Centralized middleware in Express
4. **Validation:** Use Joi for input validation
5. **File Uploads:** Stream to Google Drive, never buffer in memory
6. **Authentication:** JWT with proper middleware checks

---

## PRIORITY ORDER

1. **Day 1:** Fix critical bugs (name population, dashboard display)
2. **Day 2-3:** Complete state machine and proposal schema
3. **Day 4-5:** Google Docs integration
4. **Day 6-7:** Document management and notifications
5. **Day 8:** Plagiarism placeholder and testing
6. **Day 9-10:** Polish, documentation, and deployment prep
```

---

## Summary

This comprehensive prompt covers:

| Area | Features |
|------|----------|
| **Critical Fixes** | User name population, dashboard display |
| **State Machine** | Complete project lifecycle with role-based transitions |
| **Proposal Management** | Full capstone proposal structure with all sections |
| **Google Docs Integration** | Create, share, sync documents for collaborative editing |
| **Document Management** | Google Drive storage with versioning |
| **Notifications** | Email and in-app notifications |
| **Plagiarism** | Placeholder system for manual report entry |
| **Testing** | Backend and frontend test coverage |

The prompt enforces your coding standards (tw- prefix, Lucide icons, MERN stack) and zero-cost deployment constraints.---

## Summary

This comprehensive prompt covers:

| Area | Features |
|------|----------|
| **Critical Fixes** | User name population, dashboard display |
| **State Machine** | Complete project lifecycle with role-based transitions |
| **Proposal Management** | Full capstone proposal structure with all sections |
| **Google Docs Integration** | Create, share, sync documents for collaborative editing |
| **Document Management** | Google Drive storage with versioning |
| **Notifications** | Email and in-app notifications |
| **Plagiarism** | Placeholder system for manual report entry |
| **Testing** | Backend and frontend test coverage |

The prompt enforces your coding standards (tw- prefix, Lucide icons, MERN stack) and zero-cost deployment constraints.