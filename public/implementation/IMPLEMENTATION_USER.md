# Implementation Plan: User/Client Dashboard

This plan outlines the steps to build a premium, high-converting dashboard for Clients and New Users of Session Booker Pro.

## 🎯 Overview
The User Dashboard serves as the central hub for clients to manage their training journey, discover new sessions, and track their financial history (in-person payments). It will maintain the project's premium aesthetic (Dark Mode, Vibrant Orange, Space Grotesk).

## 🚀 Proposed Features

### 1. Hero & Personalization
- [ ] Personalized greeting based on time of day (e.g., "Good Evening, [Name]").
- [ ] Quick-action "Book Next Session" button.

### 2. Client Stats & Payments (In-Person)
- [ ] **Total Invested**: Summary of all "Completed" or "Confirmed" booking values.
- [ ] **Attendance Rate**: Percentage of sessions attended vs. booked.
- [ ] **Sessions Completed**: Counter for past training sessions.
- [ ] *Note: Payments are tracked via the `base_price` of the sessions booked as in-person transactions.*

### 3. My Schedule (Booking Management)
- [ ] **Upcoming sessions**: Display instances from the `sessions` table that the user is linked to via `bookings`.
- [ ] **Action**: Allow users to request cancellation (updates booking status to 'cancelled').
- [ ] **Views**: Toggle between list view and **Calendar View** on the My Bookings page.
- [ ] **Empty State**: Call-to-action to browse available slots if no bookings exist.

### 4. Interactive Booking (Discovery)
- [ ] **Featured Sessions**: A curated list or grid of upcoming "Active Sessions" from the admin scheduler.
- [ ] **Filter by Category**: Quick chips for "HIIT", "Strength", etc.
- [ ] **Booking Flow**: Multi-step confirmation with **Automatic Notification** creation.
- [ ] **Status Mapping**: Bookings created as 'pending' with instant 'Success' notification.

### 5. Notification Center
- [ ] Integrated bell icon in the dashboard layout.
- [ ] Real-time updates for:
    - [ ] Admin confirmations of pending bookings.
    - [ ] New session announcements.

---

## 🛠 Technical Tasks

### Phase 1: Data Integration
- [ ] Implement `fetchUserData` to retrieve:
    - [ ] User's `bookings` (joined with `sessions` and `session_types`).
    - [ ] All available `active sessions` for discovery.
    - [ ] In-person payment totals (reduce booking values).

### Phase 2: Page Architecture
- [ ] **Dashboard Layout**: Move away from the basic placeholder to a multi-column responsive grid.
- [ ] **Metric Cards**: Build sleek, glassmorphic cards for "Total Invested" and "Upcoming".
- [ ] **Theming**: Ensure consistent use of `#f97316` (Orange) and `#1A1D24` (Background).

### Phase 3: Booking Flow
- [ ] Create a "Confirm Booking" dialog for discovery items.
- [ ] Logic to prevent double-booking the same session ID.
- [ ] Update `bookings` table via Supabase on join.

### Phase 4: Polish
- [ ] Add smooth entry animations using `framer-motion`.
- [ ] Implementation of the custom "In-person Payment" history ledger.

---

## 📝 Success Criteria
- [ ] User can see their personal stats (sessions completed, money spent in-person).
- [ ] User can book a featured session with 2 clicks.
- [ ] User can see their upcoming schedule with cancellation options.
- [ ] Dashboard follows the "Wow" aesthetics established in the Admin layout.
