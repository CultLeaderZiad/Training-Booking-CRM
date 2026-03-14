# Project Plan

## 1. Supabase Setup & Database Schema
- [ ] **Initialize Supabase**:
  - Ensure `supabase-js` is installed.
  - Create `src/lib/supabase.ts` for the client instance.
  - Verify environment variables in `.env`.
- [ ] **Database Migrations**:
  - Create full schema migrations for all entities: `profiles`, `session_categories`, `session_types`, `session_schedules`, `bookings`, `app_settings`, `login_history`, `session_history`.
- [ ] **Role Management**:
  - Implement enums (`user_role`, `booking_status`).
  - Create Supabase function/trigger to auto-assign `'user'` role on new signups.

## 2. Authentication Pages (Frontend)
- [ ] **Auth Context**:
  - Create an `AuthContext` to manage session state globally.
- [ ] **Signup Page**:
  - Create `src/pages/auth/Signup.tsx` (implement email/password registration).
- [ ] **Login Page**:
  - Create `src/pages/auth/Login.tsx` (implement email/password login).

## 3. Mockup Dashboards & Testing
- [ ] **Protected Routes**:
  - Implement a protected route wrapper for dashboards.
- [ ] **User Dashboard**:
  - Create a mockup `src/pages/dashboard/UserDashboard.tsx`.
- [ ] **Admin Dashboard**:
  - Create a mockup `src/pages/admin/AdminDashboard.tsx`.
- [ ] **Testing Session**:
  - Test user signup, login.
  - Manually assign admin role in Supabase.
  - Verify Role-Based Access Control (RBAC) works across the mock dashboards.

**Status: Ready to Begin** >> Assigned Issue: [#2 Phase 1: Project Infrastructure, Auth & Profiles](https://github.com/CultLeaderZiad/Training-Booking-CRM/issues/2) | Branch: `feat/issue-2-auth-profiles`
