#!/bin/bash

echo "🏠 Student Accommodation Platform - Quick Start"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo "⚠️  Please edit .env.local and add your Supabase credentials!"
    echo ""
fi

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating..."
    cat > backend/.env << 'EOF'
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF
    echo "✅ Created backend/.env"
    echo "⚠️  Please edit backend/.env and add your Supabase credentials!"
    echo ""
fi

echo "📦 Installing frontend dependencies..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and backend/.env with your Supabase credentials"
echo "2. Run 'pnpm dev' to start the Next.js server"
echo "3. (Optional) Run Django backend: 'cd backend && source venv/bin/activate && python manage.py runserver'"
echo ""
echo "📖 See SETUP_GUIDE.md for detailed instructions"
