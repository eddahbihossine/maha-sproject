# 🎯 Getting Started Checklist

Copy this checklist and mark items as you complete them!

## Step 1: Create Supabase Project (5 min)

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Click "Start your project"
- [ ] Create new organization (if needed)
- [ ] Create new project
  - [ ] Choose project name: "student-accommodation"
  - [ ] Generate strong database password
  - [ ] Choose region closest to you
  - [ ] Click "Create new project"
- [ ] Wait for project to be ready (~2 minutes)

## Step 2: Get Your Credentials (2 min)

- [ ] In Supabase Dashboard, click "Settings" (gear icon)
- [ ] Click "API" in the sidebar
- [ ] Copy your Project URL
- [ ] Copy your anon/public key
- [ ] Keep this tab open (you'll need these!)

## Step 3: Configure Frontend (2 min)

- [ ] Open `.env.local` in your editor
- [ ] Replace `your_supabase_project_url` with your Project URL
- [ ] Replace `your_supabase_anon_key` with your anon key
- [ ] Save the file
- [ ] Example:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
  ```

## Step 4: Create Database Schema (3 min)

- [ ] In Supabase Dashboard, click "SQL Editor"
- [ ] Click "New query"
- [ ] Open `supabase-schema.sql` in your project
- [ ] Copy ALL the SQL code
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" (or press Cmd/Ctrl + Enter)
- [ ] Wait for "Success" message
- [ ] Check Tables: Click "Table Editor" - you should see tables!

## Step 5: Enable Email Authentication (2 min)

- [ ] In Supabase Dashboard, click "Authentication"
- [ ] Click "Providers"
- [ ] Find "Email" in the list
- [ ] Toggle it ON (if not already)
- [ ] Scroll down and click "Save"
- [ ] (Optional) Customize email templates

## Step 6: Start Your App (1 min)

- [ ] Open terminal in project folder
- [ ] Run: `pnpm dev`
- [ ] Wait for "ready" message
- [ ] Open browser to: http://localhost:3000
- [ ] You should see the homepage!

## Step 7: Test Registration (3 min)

- [ ] Click "Sign up" button
- [ ] Fill in the form:
  - [ ] Choose role (Student or Owner)
  - [ ] Enter first name
  - [ ] Enter last name
  - [ ] Enter email (use a real email!)
  - [ ] Create password (6+ characters)
  - [ ] Confirm password
- [ ] Click "Create account"
- [ ] Check your email for confirmation
- [ ] Click the confirmation link
- [ ] Success! ✅

## Step 8: Test Login (1 min)

- [ ] Go back to http://localhost:3000
- [ ] Click "Sign in"
- [ ] Enter your email
- [ ] Enter your password
- [ ] Click "Sign in"
- [ ] You should be redirected to homepage
- [ ] Check if header shows you're logged in

## Step 9: Test Protected Routes (1 min)

- [ ] If you're a Student:
  - [ ] Try to access: http://localhost:3000/owner
  - [ ] Should redirect to login ❌
  
- [ ] If you're an Owner:
  - [ ] Try to access: http://localhost:3000/owner
  - [ ] Should show owner dashboard ✅

## Step 10: Test Logout (1 min)

- [ ] Click on your avatar/profile in header
- [ ] Click "Log out"
- [ ] You should be logged out
- [ ] Try accessing /owner again
- [ ] Should redirect to login ✅

## ✅ Verification Checklist

All green? You're ready to build! 🚀

- [ ] ✅ Supabase project created
- [ ] ✅ Credentials copied to .env.local
- [ ] ✅ Database schema created (tables visible)
- [ ] ✅ Email auth enabled
- [ ] ✅ Can register new user
- [ ] ✅ Email confirmation works
- [ ] ✅ Can login successfully
- [ ] ✅ Protected routes redirect when not logged in
- [ ] ✅ Can access allowed routes when logged in
- [ ] ✅ Can logout

## 🎉 Success! What's Next?

Now that authentication works, you can:

### Immediate Next Steps:
1. [ ] Create a listing (once API is built)
2. [ ] Update your profile
3. [ ] Browse existing listings
4. [ ] Test the messaging system
5. [ ] Make your first booking

### For Developers:
1. [ ] Build REST API endpoints in Django
2. [ ] Connect frontend forms to API
3. [ ] Add image upload functionality
4. [ ] Implement real-time messaging
5. [ ] Add payment integration

## 🐛 If Something Doesn't Work

### Can't register?
- [ ] Check email provider is enabled in Supabase
- [ ] Try a different email address
- [ ] Check browser console for errors
- [ ] Verify .env.local has correct credentials

### Email confirmation not working?
- [ ] Check spam/junk folder
- [ ] In Supabase: Auth → Users → Manually confirm
- [ ] Or disable email confirmation in Auth settings

### Can't login?
- [ ] Verify email is confirmed
- [ ] Try "Forgot password" flow
- [ ] Check password is correct
- [ ] Clear browser cookies and try again

### Protected routes not redirecting?
- [ ] Check middleware.ts is in project root
- [ ] Restart Next.js server (Ctrl+C, then pnpm dev)
- [ ] Clear browser cache
- [ ] Check browser console for errors

## 📚 Documentation Reference

- **Quick Commands**: `QUICK_REFERENCE.md`
- **Detailed Setup**: `SETUP_GUIDE.md`
- **Troubleshooting**: `IMPLEMENTATION_SUMMARY.md`
- **API Docs**: `backend/README.md`

## 💡 Pro Tips

1. **Keep Supabase Dashboard Open**: You can see users, data, and logs in real-time
2. **Use Incognito Mode**: Test login/logout without cache issues
3. **Check Browser Console**: Most errors show up there first
4. **Read Logs**: Supabase → Logs shows authentication attempts
5. **Test Both Roles**: Register as both student and owner to test all features

---

## 🎊 Congratulations!

If you completed all steps, you have:
- ✅ A working authentication system
- ✅ User registration and login
- ✅ Protected routes
- ✅ Role-based access
- ✅ A foundation to build on

**Time to start building features! 🚀**

---

**Stuck on a step?** 
1. Re-read the instruction carefully
2. Run `./check-setup.sh` to verify setup
3. Check the corresponding .md file for details
4. Look at browser console for error messages

**All working?** 
🎉 Awesome! Now go build something amazing!
