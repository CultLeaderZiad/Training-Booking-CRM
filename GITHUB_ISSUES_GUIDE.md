# GitHub Issues Guide: Training Booking CRM

## Repository
**Link:** [https://github.com/CultLeaderZiad/Training-Booking-CRM](https://github.com/CultLeaderZiad/Training-Booking-CRM)

## Project Overview
Training Booking CRM is a web application built to handle scheduling, booking, and management for personal trainers and their clients. It features modern UI/UX components, robust form handling, data visualization, and client-side routing.

### Tech Stack
- **Framework**: React (v18) with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Shadcn UI (Radix UI)
- **Routing**: React Router DOM (v6)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Data Viz**: Recharts
- **Date Handling**: date-fns & React Day Picker
- **Animations**: Framer Motion
- **Notifications**: Sonner

## Current State & Completed Tasks

Based on the initial setup and our implementation plan, the following foundational tasks and documentation have been completed:


## 2. Execution (During Work)

### **Branching**: 
specific branches should be created for the issue.
* **Branching Convention**: "feat/issue-ID-short-description' or 'fix/issue-ID-short-description'.
* **Commits**: All commit messages must reference the issue ID.
* **Commit Format**: "[#ISSUE ID] Commit message (e.g., "[#12] Add responsive styles to header")

### 1. Project Initialization
- [x] Initialized Vite + React + TypeScript project layout.
- [x] Configured Tailwind CSS, PostCSS, and Autoprefixer.
- [x] Set up code quality tools: ESLint, TypeScript configurations, and Vitest.
- [x] Defined `package.json` with all necessary application dependencies.

### 2. Core Architecture & UI Library Setup
- [x] Integrated `shadcn/ui` core primitives component library for rapid UI development.
- [x] Configured routing infrastructure using `react-router-dom`.
- [x] Established default dark-mode aesthetics (`var(--background) = 0 0% 7%`) and vibrant primary brand color (`var(--primary) = 24 95% 53%`).
- [x] Planned and styled typography using Space Grotesk (headings) and Inter (body).

### 3. Documentation & Planning
- [x] Created `README.md` with a high-level overview, full tech stack documentation, and local execution instructions.
- [x] Formulated detailed `IMPLEMENTATION PLAN.md` encompassing backend schema (Supabase tables extending `auth.users`), role management (User/Client/Admin), detailed page structure routing, and technical progression steps.

## How to Create Issues

When proposing or logging new issues in this repository, please adhere to our project guidelines:

1. **Bug Reports**: Include clear steps to reproduce, expected behavior, and actual behavior. Provide screenshots if ui-related.
2. **Feature Requests**: Reference the `IMPLEMENTATION PLAN.md` if the feature is already part of the roadmap. Detail the user story and clear acceptance criteria.
3. **Tasks & Chores**: Break down larger features from the implementation plan into manageable, deployable slices.
4. **Project Tracking**: Every created issue MUST be added to the GitHub Project board (e.g., in "To Do") so we can track the overall progress and sync activities.
