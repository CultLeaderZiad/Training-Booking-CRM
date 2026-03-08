# Goal Description
Implement a full backend and interactive dashboards for the existing Personal Trainer booking web app. The backend will be powered by Supabase (PostgreSQL database, Authentication, Edge Functions, and Storage). The frontend will be extended to include protected routes, role-based access control, and comprehensive admin/client dashboards.

## Branding & UI/UX Guidelines
Based on the current project setup:
*   **Typography**: `Space Grotesk` for headings (h1-h6), `Inter` for body text.
*   **Color Palette**: Dark mode by default (`var(--background) = 0 0% 7%`), with a vibrant orange/amber primary color (`var(--primary) = 24 95% 53%`).
*   **UI Components**: Built using Shadcn UI.
*   **UX Patterns**: 
    *   **Routing**: Use unique pages with specific slugs for entity management (e.g., `/admin/sessions/new` or `/admin/sessions/[id]`) rather than large modals.
    *   **Modals**: Strictly reserved for destructive confirmations (e.g., "Are you sure you want to cancel?") and small field edits.
    *   **Notifications**: Use screen toast messages positioned at the **top left**.
*   **Payments**: No online payments for now; payments are handled on premises. Stripe integration is deferred to a future phase.

## Proposed Database Schema (Supabase)

### Enums
- `user_role`: `'user'`, `'client'`, `'admin'`
- `booking_status`: `'pending'`, `'confirmed'`, `'cancelled'`, `'completed'`

*(Note: Session types and categories are tables, not enums, to allow admin CRUD).*

### Tables

### 1. `profiles` (extends auth.users)
*   `id` (uuid, references `auth.users`)
*   `first_name` (text)
*   `last_name` (text)
*   `avatar_url` (text)
*   `role` (enum: `user_role`) - defaults to `'user'`
*   `is_banned` (boolean) - defaults to `false`
*   `banned_at` (timestamp)
*   `add1` (text) - Address line 1
*   `add2` (text) - Address line 2
*   `post_code` (text)
*   `city` (text)
*   `county` (text)
*   `country` (text)
*   `phone_prefix` (text)
*   `phone_number` (text)
*   `created_at` (timestamp)
*   `updated_at` (timestamp)

### 2. `session_categories`
*   `id` (uuid, PK)
*   `name` (text) - e.g., "HIIT", "Strength"
*   `description` (text)
*   `created_at` (timestamp)

### 3. `session_types` (Session Templates)
*   `id` (uuid, PK)
*   `name` (text) - e.g., "HIIT Intensive", "Strength Training"
*   `description` (text)
*   `base_price` (numeric)
*   `category_id` (uuid, FK to `session_categories`)
*   `location` (text)
*   `max_slots` (integer)
*   `is_active` (boolean)
*   `created_at` (timestamp)

### 4. `session_schedules` (Availability Rules)
*(Using JSONB to simplify dynamic and recurring schedule storage)*
*   `id` (uuid, PK)
*   `session_type_id` (uuid, FK to `session_types`)
*   `schedule_rules` (jsonb) - Stores active days, start/end times, recurring patterns, and exceptions/holidays.
*   `created_at` (timestamp)

### 5. `bookings`
*   `id` (uuid, PK)
*   `user_id` (uuid, FK to `profiles`)
*   `session_id` (uuid, FK to `session_types`)
*   `booking_datetime` (timestamp)
*   `status` (enum: `booking_status`) - defaults to `'pending'`
*   `cancel_reason` (text)
*   `cancelled_at` (timestamp)
*   `created_at` (timestamp)
*   `updated_at` (timestamp)

### 6. `app_settings` (Global Admin Settings)
*   `id` (integer, PK) - single row
*   `max_advance_booking_days` (integer) - Managed in Admin Settings limit on how far in advance clients can book.
*   `updated_at` (timestamp)

### 7. `login_history`
*   `id` (uuid, PK)
*   `user_id` (uuid, FK to `profiles`)
*   `login_timestamp` (timestamp)
*   `ip_address` (text)
*   `user_agent` (text)

### 8. `session_history` (Audit Log)
*   `id` (uuid, PK)
*   `session_id` (uuid, FK to `session_types`)
*   `action` (text) - create, update, delete
*   `changed_by` (uuid, FK to `profiles`)
*   `payload` (jsonb) - previous/new state
*   `created_at` (timestamp)

## Feedback Resolutions
- **Waitlist**: No waitlist feature needed when max slots are reached.
- **Account Rejection**: If an admin rejects a user, the account will be completely deleted from the system rather than just restricted.
- **Advance Booking limits**: Handled via the `/admin/settings` page, saving max advance booking days in `app_settings`.
- **Session Types / Categories**: Made fully manageable by admins via DB tables.
- **Schedule Rules**: Consolidated availability definitions into a `jsonb` structure.

## Role Management Logic
*   **New Signups**: Assigned the `'user'` role by default.
*   **First Booking**: Upon successful booking of their first session, a Supabase trigger (or edge function) automatically upgrades the user's role to `'client'`.
*   **Admin Controls**: Admins can manually update user roles, and define their status as banned. Rejections lead to account deletion.

---

## Proposed Page Structure & Routing

### General Pages
*   `/login` - User login
*   `/signup` - User registration
*   `/profile` - General user profile management (update details, address, avatar, etc.)

### Client Dashboards (`/dashboard/*`)
*   `/dashboard` - Client overview (upcoming session, quick stats).
*   `/dashboard/bookings` - List of upcoming and past bookings.
*   `/dashboard/bookings/[id]` - Specific booking details (with options to modify or cancel with a reason).

### Admin Dashboards (`/admin/*`)
*   `/admin/dashboard` - High-level overview (active bookings, new clients, revenues).
*   `/admin/categories` - Manage categories (create/delete).
*   `/admin/session-types` - List all session types.
*   `/admin/session-types/new` - Create a new session type.
*   `/admin/session-types/[id]` - Edit session details & set availability/calendar JSON rules.
*   `/admin/bookings` - Manage all bookings across all clients (approve, reject, mark complete).
*   `/admin/clients` - List all users/clients. Manage roles, ban/delete users.
*   `/admin/clients/[id]` - View specific client details and their complete booking history.
*   `/admin/reporting` - Reporting tools for session popularity, attendance rates, and basic financials.
*   `/admin/settings` - Global app settings (e.g., booking max advance time).

---

## Technical Implementation Steps

1.  **Supabase Setup**: 
    *   Initialize Supabase project.
    *   Execute SQL migrations to create the tables, enums, Row Level Security (RLS) policies, and Triggers (for role auto-updates & login tracking).
2.  **App Infrastructure**: 
    *   Set up Supabase Auth context/provider in the frontend.
    *   Configure Shadcn UI components (Toaster top-left, Modals, Forms).
3.  **Authentication Flow**: 
    *   Build Login, Signup, and Logout functionality.
    *   Implement route protection guards (Admin vs Client vs User).
4.  **Admin Features Development**:
    *   Implement Sessions CRUD.
    *   Implement Availability Calendar logic via JSON builder.
    *   Implement Client Management (Roles/Deletion).
    *   Implement Booking Management.
5.  **Client Features Development**:
    *   Implement Session discovery/booking flow.
    *   Implement Client Dashboard & Booking management.
6.  **Review & Polish**:
    *   Ensure all branding guidelines are met.
    *   Verify UX flows (no excessive modals, correct toast placements).
