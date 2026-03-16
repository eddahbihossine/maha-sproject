# 🔐 Authentication Flow Diagrams

## User Registration Flow

```
┌─────────────┐
│   Browser   │
│  /register  │
└──────┬──────┘
       │
       │ 1. Fill form
       │    - First Name
       │    - Last Name  
       │    - Email
       │    - Password
       │    - Role (Student/Owner)
       │
       ▼
┌──────────────────┐
│  Register Page   │
│ (Client Side)    │
└────────┬─────────┘
         │
         │ 2. Submit form
         │    supabase.auth.signUp({
         │      email,
         │      password,
         │      options: {
         │        data: { first_name, last_name, role }
         │      }
         │    })
         │
         ▼
┌──────────────────┐
│  Supabase Auth   │
│    (Cloud)       │
└────────┬─────────┘
         │
         │ 3. Create user
         │    - Generate UUID
         │    - Hash password
         │    - Save metadata
         │    - Create session
         │
         ▼
┌──────────────────┐
│   Auth Provider  │
│ (Client Context) │
└────────┬─────────┘
         │
         │ 4. Detect session
         │    - Set user state
         │    - Extract role
         │    - Store in context
         │
         ▼
┌──────────────────┐
│   Redirect       │
│   Based on Role  │
└────────┬─────────┘
         │
         ├─ Student  → /
         ├─ Owner    → /owner/dashboard
         └─ Admin    → /admin
```

## User Login Flow

```
┌─────────────┐
│   Browser   │
│   /login    │
└──────┬──────┘
       │
       │ 1. Enter credentials
       │    - Email
       │    - Password
       │
       ▼
┌──────────────────┐
│   Login Page     │
│  (Client Side)   │
└────────┬─────────┘
         │
         │ 2. Submit form
         │    supabase.auth.signInWithPassword({
         │      email,
         │      password
         │    })
         │
         ▼
┌──────────────────┐
│  Supabase Auth   │
└────────┬─────────┘
         │
         │ 3. Verify credentials
         │    - Check password hash
         │    - Generate JWT
         │    - Create session
         │
         ▼
┌──────────────────┐
│   Auth Provider  │
└────────┬─────────┘
         │
         │ 4. Update context
         │    - Set user
         │    - Extract role from metadata
         │    - Notify components
         │
         ▼
┌──────────────────┐
│      Header      │
│   (Updates UI)   │
└────────┬─────────┘
         │
         │ 5. Show user info
         │    - Avatar with initials
         │    - Role-based menu
         │
         ▼
┌──────────────────┐
│   Redirect       │
└────────┬─────────┘
         │
         ├─ redirectTo param exists → Go there
         └─ No param → Redirect by role
            ├─ Student  → /
            ├─ Owner    → /owner/dashboard
            └─ Admin    → /admin
```

## Protected Route Access Flow

```
┌─────────────┐
│   Browser   │
│ /messages   │
└──────┬──────┘
       │
       │ 1. Navigate to protected route
       │
       ▼
┌──────────────────┐
│   Middleware     │
│  (middleware.ts) │
└────────┬─────────┘
         │
         │ 2. Check route type
         │    - Is this path protected?
         │    - /messages, /owner/*, /admin
         │
         ▼
┌──────────────────┐
│  Get User from   │
│  Supabase        │
└────────┬─────────┘
         │
         ▼
    ┌───────┐
    │ User? │
    └───┬───┘
        │
        ├─ NO ─────────────────────┐
        │                          │
        │                          ▼
        │                    ┌──────────────┐
        │                    │  Redirect to │
        │                    │  /login?     │
        │                    │  redirectTo= │
        │                    │  /messages   │
        │                    └──────────────┘
        │
        └─ YES ───────────────────┐
                                  │
                                  ▼
                            ┌──────────────┐
                            │ Check Role   │
                            │ from         │
                            │ user_metadata│
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Route = /admin│
                            │ Role = admin? │
                            └──────┬───────┘
                                   │
                            ┌──────┴──────┐
                            │             │
                         YES│             │NO
                            │             │
                            ▼             ▼
                     ┌──────────┐  ┌──────────┐
                     │  Allow   │  │ Redirect │
                     │  Access  │  │  to /    │
                     └──────────┘  └──────────┘
```

## Header Component Rendering Flow

```
┌──────────────────┐
│  Header Mounts   │
└────────┬─────────┘
         │
         │ 1. Call useAuth()
         │
         ▼
┌──────────────────┐
│  Auth Provider   │
└────────┬─────────┘
         │
         │ 2. Return { user, loading }
         │
         ▼
    ┌────────┐
    │Loading?│
    └────┬───┘
         │
    ┌────┴────┐
    │         │
 YES│         │NO
    │         │
    ▼         ▼
┌────────┐  ┌─────────┐
│ Show   │  │  User   │
│Spinner │  │ Exists? │
└────────┘  └────┬────┘
                 │
            ┌────┴────┐
            │         │
         YES│         │NO
            │         │
            ▼         ▼
    ┌────────────┐  ┌────────────┐
    │ Extract    │  │ Show       │
    │ Role from  │  │ Login/     │
    │ metadata   │  │ Signup     │
    └──────┬─────┘  │ Buttons    │
           │        └────────────┘
           ▼
    ┌──────────────┐
    │ Render Menu  │
    │ by Role      │
    └──────┬───────┘
           │
     ┌─────┴──────┬──────────┐
     │            │          │
  Student      Owner      Admin
     │            │          │
     ▼            ▼          ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│Search   │  │Dashboard│  │Admin    │
│Favorites│  │Add List │  │Panel    │
│Messages │  │My Lists │  │+ All    │
│Bookings │  │Messages │  └─────────┘
└─────────┘  └─────────┘
```

## Logout Flow

```
┌─────────────┐
│   Browser   │
│   Header    │
└──────┬──────┘
       │
       │ 1. Click avatar
       │    → Click "Log out"
       │
       ▼
┌──────────────────┐
│  handleSignOut() │
│   (Header)       │
└────────┬─────────┘
         │
         │ 2. Call signOut()
         │    from useAuth()
         │
         ▼
┌──────────────────┐
│  Auth Provider   │
│   signOut()      │
└────────┬─────────┘
         │
         │ 3. supabase.auth.signOut()
         │
         ▼
┌──────────────────┐
│  Supabase Auth   │
└────────┬─────────┘
         │
         │ 4. Clear session
         │    - Delete cookies
         │    - Invalidate JWT
         │    - Clear storage
         │
         ▼
┌──────────────────┐
│  Auth Provider   │
└────────┬─────────┘
         │
         │ 5. Update state
         │    setUser(null)
         │
         ▼
┌──────────────────┐
│  All Components  │
│  Re-render       │
└────────┬─────────┘
         │
         │ 6. Header updates
         │    - Hide avatar
         │    - Show Login/Signup
         │
         ▼
┌──────────────────┐
│  Redirect to /   │
└──────────────────┘
```

## Session Persistence Flow

```
┌─────────────┐
│   Browser   │
│  Refreshes  │
└──────┬──────┘
       │
       │ 1. Page loads
       │
       ▼
┌──────────────────┐
│  AuthProvider    │
│    useEffect     │
└────────┬─────────┘
         │
         │ 2. Run on mount
         │    supabase.auth.getSession()
         │
         ▼
┌──────────────────┐
│  Supabase Client │
└────────┬─────────┘
         │
         │ 3. Check cookies
         │    - JWT still valid?
         │    - Session exists?
         │
         ▼
    ┌──────────┐
    │ Session  │
    │  Valid?  │
    └─────┬────┘
          │
     ┌────┴────┐
     │         │
  YES│         │NO
     │         │
     ▼         ▼
┌────────┐  ┌────────┐
│Restore │  │ User = │
│Session │  │  null  │
│Set User│  └────────┘
└────┬───┘
     │
     │ 4. Subscribe to auth changes
     │    supabase.auth.onAuthStateChange()
     │
     ▼
┌──────────────────┐
│  Listen for:     │
│  - SIGNED_IN     │
│  - SIGNED_OUT    │
│  - TOKEN_REFRESH │
└────────┬─────────┘
         │
         │ 5. Auto-update state
         │    on any auth change
         │
         ▼
┌──────────────────┐
│  Components      │
│  Stay in Sync    │
└──────────────────┘
```

## Role-Based Access Matrix

```
┌──────────────┬─────────┬─────────┬─────────┐
│    Route     │ Student │  Owner  │  Admin  │
├──────────────┼─────────┼─────────┼─────────┤
│ /            │   ✅    │   ✅    │   ✅    │
│ /search      │   ✅    │   ✅    │   ✅    │
│ /login       │   ✅    │   ✅    │   ✅    │
│ /register    │   ✅    │   ✅    │   ✅    │
├──────────────┼─────────┼─────────┼─────────┤
│ /messages    │   ✅    │   ✅    │   ✅    │
│ /profile     │   ✅    │   ✅    │   ✅    │
│ /settings    │   ✅    │   ✅    │   ✅    │
├──────────────┼─────────┼─────────┼─────────┤
│ /favorites   │   ✅    │   ❌    │   ✅    │
│ /bookings    │   ✅    │   ❌    │   ✅    │
├──────────────┼─────────┼─────────┼─────────┤
│ /owner/*     │   ❌    │   ✅    │   ✅    │
│ /admin       │   ❌    │   ❌    │   ✅    │
└──────────────┴─────────┴─────────┴─────────┘

✅ = Allowed
❌ = Redirect to /
```

## Data Flow Architecture

```
┌───────────────────────────────────────┐
│           User Interface              │
│  ┌─────────┐  ┌─────────┐  ┌────────┐│
│  │ Header  │  │  Pages  │  │ Forms  ││
│  └────┬────┘  └────┬────┘  └────┬───┘│
└───────┼────────────┼──────────────┼───┘
        │            │              │
        │   useAuth()│              │
        │            │              │
        ▼            ▼              ▼
┌───────────────────────────────────────┐
│         Auth Provider Context         │
│  ┌─────────────────────────────────┐ │
│  │ State:                          │ │
│  │  - user: User | null            │ │
│  │  - loading: boolean             │ │
│  │  - signOut: () => Promise       │ │
│  └─────────────────────────────────┘ │
└─────────────────┬─────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│         Supabase Client               │
│  ┌─────────────────────────────────┐ │
│  │ Methods:                        │ │
│  │  - auth.signUp()                │ │
│  │  - auth.signInWithPassword()    │ │
│  │  - auth.signOut()               │ │
│  │  - auth.getUser()               │ │
│  │  - auth.onAuthStateChange()     │ │
│  └─────────────────────────────────┘ │
└─────────────────┬─────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│         Supabase Cloud                │
│  ┌─────────────────────────────────┐ │
│  │ - User Management               │ │
│  │ - Session Management            │ │
│  │ - JWT Generation                │ │
│  │ - Password Hashing              │ │
│  │ - Email Verification            │ │
│  │ - OAuth Integration             │ │
│  └─────────────────────────────────┘ │
└───────────────────────────────────────┘
```

---

## 🔑 Key Takeaways

1. **AuthProvider** wraps entire app and manages global auth state
2. **Middleware** intercepts requests and enforces role-based access
3. **Header** component consumes auth state and renders role-appropriate UI
4. **Supabase** handles all auth complexity (sessions, JWTs, password hashing)
5. **user_metadata** stores role information for access control
6. **Sessions persist** across page refreshes via cookies
7. **Components re-render** automatically when auth state changes

---

See `AUTHENTICATION_GUIDE.md` for detailed documentation.
