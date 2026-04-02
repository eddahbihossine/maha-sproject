'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Home,
  Search,
  Heart,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Menu,
  Building2,
  Plus,
  LayoutDashboard,
  Globe,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { useT } from '@/lib/i18n/use-t'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const { user, loading, signOut, language, setLanguage } = useAuth()
  const router = useRouter()
  const t = useT()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch user role from metadata or profile
  useEffect(() => {
    if (user) {
      // Get role from user metadata
      const role = user.user_metadata?.role || 'student'
      const firstName = user.user_metadata?.first_name || ''
      const lastName = user.user_metadata?.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'User'
      
      setUserRole(role)
      setUserName(fullName)
    } else {
      setUserRole(null)
      setUserName(null)
    }
  }, [user])

  const isStudent = userRole === 'student'
  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  // Get user initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">SEMSARI.ma</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              {t('common.search')}
            </Link>
          </Button>
          {user && isStudent && (
            <Button variant="ghost" asChild>
              <Link href="/favorites">
                <Heart className="mr-2 h-4 w-4" />
                {t('common.favorites')}
              </Link>
            </Button>
          )}
          {user && (isStudent || isOwner) && (
            <Button variant="ghost" asChild>
              <Link href="/messages">
                <MessageCircle className="mr-2 h-4 w-4" />
                {t('common.messages')}
              </Link>
            </Button>
          )}
          {user && isOwner && (
            <Button variant="ghost" asChild>
              <Link href="/owner/dashboard">
                <Building2 className="mr-2 h-4 w-4" />
                {t('common.dashboard')}
              </Link>
            </Button>
          )}
          {user && isAdmin && (
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t('common.admin')}
              </Link>
            </Button>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">{t('language.switch')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void setLanguage('en')}>
                  {t('language.english')}{language === 'en' ? ' ✓' : ''}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void setLanguage('fr')}>
                  {t('language.french')}{language === 'fr' ? ' ✓' : ''}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="hidden sm:flex" disabled>
              <Globe className="h-4 w-4" />
              <span className="sr-only">{t('language.switch')}</span>
            </Button>
          )}

          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              {/* Owner: Add Listing */}
              {isOwner && (
                <Button asChild className="hidden sm:flex">
                  <Link href="/owner/listings/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('header.addListing')}
                  </Link>
                </Button>
              )}

              {/* User Menu */}
              {mounted ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        {t('common.profile')}
                      </Link>
                    </DropdownMenuItem>
                    {isStudent && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/favorites">
                            <Heart className="mr-2 h-4 w-4" />
                            {t('common.favorites')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/bookings">
                            <Building2 className="mr-2 h-4 w-4" />
                            {t('header.myBookings')}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isOwner && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/owner/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            {t('common.dashboard')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/owner/listings">
                            <Building2 className="mr-2 h-4 w-4" />
                            {t('header.myListings')}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('common.settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('common.logOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" disabled>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/login">{t('common.logIn')}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t('common.signUp')}</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          {mounted ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 pt-8">
                  <Link
                    href="/search"
                    className="flex items-center gap-2 text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search className="h-5 w-5" />
                    Search Listings
                  </Link>
                  {user && isStudent && (
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-5 w-5" />
                      Favorites
                    </Link>
                  )}
                  {user && (isStudent || isOwner) && (
                    <Link
                      href="/messages"
                      className="flex items-center gap-2 text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Messages
                    </Link>
                  )}
                  {user && isOwner && (
                    <>
                      <Link
                        href="/owner/dashboard"
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                      <Link
                        href="/owner/listings/new"
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Plus className="h-5 w-5" />
                        Add Listing
                      </Link>
                    </>
                  )}
                  {user && isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Admin Panel
                    </Link>
                  )}
                  {!user && (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        Log in
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Plus className="h-5 w-5" />
                        Sign up
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon" className="md:hidden" disabled>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
