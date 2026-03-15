# Implementation Plan: Recurring Sessions & UI Enhancements

This plan outlines the steps to implement recurring session creation functionality and new UI components in the Admin panel of Session Booker Pro.

## Overview
Administrators will be able to mark a session as "Recurring" during creation. They can specify a recurrence pattern (Weekly) and an end condition (Number of occurrences or End date). All instances will be generated and inserted bulk into the database.

## 1. Database Adjustments
- [ ] Add `group_id` column to `sessions` table (UUID, optional) to link series sessions.
- [ ] Add `is_recurring` column to `sessions` table (boolean) default false.
- [ ] Add `recurrence_rule` column (jsonb) to store patterns if needed.

## 2. Global UI: Notification System
- [ ] **Navbar Update**: Add a bell icon next to the profile avatar.
- [ ] **Notification Center**: Integrate with existing notifications table to show alerts.

## 3. Frontend: Schedule Modal Updates (Sessions.tsx)
- [ ] **Recurring Session Toggle**: Switch component with "Automatically create multiple weekly sessions" label.
- [ ] **Recurrence Options**: 
    - [ ] "Repeat Every": Fixed to 1 Week for now (or dropdown).
    - [ ] "Ends By": Dropdown with "Specific date" or "After X times".
    - [ ] "End Date" Picker / "Total Sessions" Input.
- [ ] **Price Override**: Optional field to set a series-specific price.
- [ ] **Generation Preview**: Text summary showing how many sessions will be created.

## 4. Frontend: Active Sessions - Views
- [ ] **List/Calendar Toggle**: Sub-tabs or buttons to switch layouts.
- [ ] **Calendar Layout**:
    - [ ] Horizontal week scroll or grid.
    - [ ] Session Cards: Title, Badge (Booking Count/Capacity), Progress Bar.
    - [ ] Empty slot "+" buttons.

## 5. Backend/Logic: Bulk Scheduling
- [ ] **Generation Utility**: Loop through dates based on start date and recurrence rule.
- [ ] **Conflict Validation**: Alert user if overlapping sessions are detected.
- [ ] **Supabase Bulk Insert**: Single RPC or multiple inserts (transactional preference).

## 6. Polish
- [ ] **Recurring Icon**: Show refresh/loop icon in session lists.
- [ ] **Success Toasts**: "Successfully scheduled 10 recurring sessions."
