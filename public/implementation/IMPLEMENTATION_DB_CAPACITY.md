# Implementation Plan: Session Capacity & Description
**Goal**: Add a default capacity to session types that carries over to newly created schedule sessions. Update the frontend to manage both capacity and description fields across session types and sessions.

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
- [ ] **Modal - Edit Schedule Session**: Show `description` field as well so it can be edited or viewed.
- [ ] **Data Table - Active Sessions**: 
   - Add a new `description` column after the session name.

## 4. Types & API Adjustments
- [ ] Update `session_types` TypeScript interface to include `capacity: number | null`.
- [ ] Update `sessions` TypeScript interface if any changes occur to `description` or `capacity`.
- [ ] Ensure Supabase fetching functions, insert operations, and update operations accommodate `capacity` and `description` respectively for both tables.

## 5. Testing & Verification
- [ ] Verify creating/editing a session type updates Supabase.
- [ ] Verify the templates list correctly renders capacity and description.
- [ ] Verify the select trigger on Create Session fills both capacity and description automatically.
- [ ] Verify creating/editing a session updates Supabase and is correctly rendered with the new description column.
