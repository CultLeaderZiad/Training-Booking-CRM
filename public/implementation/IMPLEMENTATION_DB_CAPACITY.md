# Implementation Plan: Session Capacity & Description
**Goal**: Add a default capacity to session types that carries over to newly created schedule sessions. Update the frontend to manage both capacity and description fields across session types and sessions. Also add dashboard metrics reactivity and fix missing title properties.

## 1. Database Adjustments (Supabase)
- [ ] Add `capacity` column to `session_types` table.
   - Type: integer (or smallint).
   - Constraints: greater than 0, default to 1 (or allow null depending on preference, but empty by default is requested in the modal).
   - SQL Migration or manual update tracking.

## 2. Frontend: Session Types Management
- [ ] **Modal - Create Session Type**: Add `capacity` field. Leave it empty by default.
- [ ] **Modal - Edit Session Type**: Add `capacity` field. Populate with existing value.
- [ ] **Data Table - Session Types List**: 
   - Add `capacity` column to the UI table.
   - Separate the `description` into its own column after the title, instead of showing it truncated below the title.

## 3. Frontend: Schedule Sessions Management
- [ ] **Modal - Create Schedule Session**: 
   - Add event listener/effect when a `session_type` is selected.
   - Automatically fill the `capacity` field based on the chosen session type's default `capacity`.
   - Add a `description` field that also defaults to the chosen `session_type` description.
   - Add a `Session Title` field that initially populates with the `session_type` default, so it's not null and can be edited.
- [ ] **Modal - Edit Schedule Session**: Show `description` field as well so it can be edited or viewed. Show `Session Title`.
- [ ] **Data Table - Active Sessions**: 
   - Add a new `description` column after the session name.
   - Read and display the actual session `title` rather than the `session_type` name.

## 4. Frontend: Dashboard Overview
- [ ] **Metrics Reactivity**:
  - Update Admin Overview so that if a session's price changes, or a new session is scheduled, or bookings are made, the total revenue, new clients, upcoming sessions, and pending requests fetch or subscribe to the latest data and update in real-time.
- [ ] **Total Revenue Toggle**:
  - Add a toggle button in the "Total Revenue" metric card.
  - Option 1: View actual "Client's Bookings Revenue" (revenue generated from actual bookings).
  - Option 2: View estimated "Sessions Pricing" (potential revenue from active scheduled sessions based on price or similar logic, as requested).

## 5. Types & API Adjustments
- [ ] Update `session_types` TypeScript interface to include `capacity: number | null`.
- [ ] Update `sessions` TypeScript interface if any changes occur to `description` or `capacity`.
- [ ] Ensure Supabase fetching functions, insert operations, and update operations accommodate `capacity`, `description`, and `title` respectively for both tables.
- [ ] Adjust metric calculation functions to account for the dual-mode revenue toggle.

## 6. Testing & Verification
- [ ] Verify creating/editing a session type updates Supabase.
- [ ] Verify the templates list correctly renders capacity and description.
- [ ] Verify the select trigger on Create Session fills capacity, description, and title automatically.
- [ ] Verify creating/editing a session updates Supabase and is correctly rendered with the true session title and the new description column.
- [ ] Verify Overview Dashboard revenue toggle works back and forth without page refresh.
- [ ] Verify real-time/refetch behavior of metrics values upon modifying a session/booking.
