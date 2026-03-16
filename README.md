# 🏠 Student Accommodation Platform

A full-stack platform for students to find accommodation in Morocco, built with **Next.js**, **Django REST API**, and **Supabase**.

## ✨ Features

### Authentication & Authorization
- ✅ Email/Password authentication via Supabase Auth
- ✅ Google OAuth ready (needs configuration)
- ✅ Role-based access (Student, Owner, Admin)
- ✅ Protected routes and middleware
- ✅ Session management

### For Students
- 🔍 Search and filter accommodations
- 📍 Location-based search by city/university
- 💬 Direct messaging with property owners
- 📅 Booking management
- ⭐ Reviews and ratings

### For Property Owners
- 📝 Create and manage listings
- 📊 Dashboard with analytics
- 📨 Manage booking requests
- 💬 Communication with students

### Platform Features
- 🌐 Multilingual support (EN/FR)
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS & shadcn/ui
- 🔐 Secure with JWT authentication
- ⚡ Real-time updates ready (Supabase Realtime)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.9+ (for backend)
- Supabase account (free tier works!)

### 1. Clone and Install
```bash
cd student-accommodation-platform
pnpm install
```

### 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run the App
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. (Optional) Run Django Backend
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

Backend API available at [http://localhost:8000/api/](http://localhost:8000/api/)

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[backend/README.md](./backend/README.md)** - Django API documentation

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Auth**: Supabase Auth
- **Forms**: React Hook Form + Zod validation

### Backend
- **Framework**: Django 5.0
- **API**: Django REST Framework
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT (Simple JWT)
- **Storage**: Supabase Storage (ready)

### Infrastructure
- **Auth & Database**: Supabase
- **Real-time**: Supabase Realtime (ready)
- **Deployment**: Vercel (frontend) + Any (backend)

## 📁 Project Structure

```
├── app/                      # Next.js app directory
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── listings/            # Listing pages
│   ├── owner/               # Owner dashboard
│   ├── messages/            # Messaging
│   └── admin/               # Admin panel
├── components/              # React components
│   ├── layout/             # Header, Footer
│   ├── listings/           # Listing components
│   └── ui/                 # shadcn/ui components
├── lib/                     # Utilities
│   ├── supabase/           # Supabase clients
│   ├── auth/               # Auth context
│   └── types.ts            # TypeScript types
├── backend/                 # Django backend
│   ├── users/              # User app
│   ├── listings/           # Listings app
│   ├── bookings/           # Bookings app
│   └── config/             # Django settings
├── middleware.ts            # Route protection
└── .env.local              # Environment variables
```

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend (backend/.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key
SECRET_KEY=your_django_secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 🛠️ Available Scripts

### Frontend
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Backend
```bash
python manage.py runserver        # Start Django server
python manage.py makemigrations   # Create migrations
python manage.py migrate          # Apply migrations
python manage.py createsuperuser  # Create admin user
```

## 📸 Screenshots

(Add screenshots of your app here)

## 🔄 Workflow

1. **User registers** → Supabase Auth creates account
2. **User logs in** → JWT tokens issued
3. **Protected routes** → Middleware validates session
4. **API calls** → Django REST API (optional, can use Supabase directly)
5. **Real-time** → Supabase Realtime for messaging

## 🚧 Roadmap

- [ ] Complete API endpoints
- [ ] Image upload functionality
- [ ] Real-time messaging
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Map integration
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 📧 Contact

Questions? Open an issue or reach out!

---

**Built with ❤️ for students finding their home away from home**
# maha-sproject
