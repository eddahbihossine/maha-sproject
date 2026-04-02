'use client'

import Link from 'next/link'
import { Home, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { useT } from '@/lib/i18n/use-t'

export function Footer() {
  const t = useT()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SEMSARI.ma</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          {/* For Students */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.forStudents')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground">
                  {t('footer.searchListings')}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">
                  {t('footer.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-foreground">
                  {t('footer.studentGuides')}
                </Link>
              </li>
              <li>
                <Link href="/universities" className="text-muted-foreground hover:text-foreground">
                  {t('footer.universities')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.forOwners')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/owner/register" className="text-muted-foreground hover:text-foreground">
                  {t('footer.listYourProperty')}
                </Link>
              </li>
              <li>
                <Link href="/owner/how-it-works" className="text-muted-foreground hover:text-foreground">
                  {t('footer.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/owner/pricing" className="text-muted-foreground hover:text-foreground">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/owner/resources" className="text-muted-foreground hover:text-foreground">
                  {t('footer.ownerResources')}
                </Link>
              </li>
              <li>
                <Link href="/owner/support" className="text-muted-foreground hover:text-foreground">
                  {t('footer.support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  {t('common.contact')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-muted-foreground hover:text-foreground">
                  {t('footer.press')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  {t('footer.blog')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {t('footer.rights', { year })}
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
              {t('footer.termsOfService')}
            </Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
              {t('footer.cookiePolicy')}
            </Link>
            <Link href="/gdpr" className="text-muted-foreground hover:text-foreground">
              {t('footer.gdpr')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
