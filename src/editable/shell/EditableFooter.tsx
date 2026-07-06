'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="border-t-2 border-black bg-[var(--editable-footer-bg)] text-white">
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-[var(--slot4-accent)]/40 bg-[var(--slot4-surface-bg)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
            </span>
            <span className="editable-display text-xl font-semibold tracking-[0.01em]">{SITE_CONFIG.name}</span>
          </Link>
        </div>

        <div className="w-full lg:justify-self-end">
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-6 lg:items-center">
            {[
              ['Home', '/'],
              ['About', '/about'],
              ['Contact', '/contact'],
              ['Search', '/search'],
              ...(session ? [['Create', '/create']] : [['Sign in', '/login'], ['Sign up', '/signup']]),
            ].map(([label, href]) => (
              <Link key={href} href={href} className="block whitespace-nowrap text-sm font-semibold text-white/70 transition hover:text-[var(--slot4-accent)]">{label}</Link>
            ))}
            {session ? <button type="button" onClick={logout} className="w-fit whitespace-nowrap border border-white/60 px-4 py-2 text-left text-sm font-bold text-white transition hover:bg-white hover:text-black">Logout</button> : null}
          </nav>
        </div>
      </div>
      <div className="border-t border-white/20 px-4 py-5 text-center text-xs font-medium tracking-[0.12em] text-white/50">
        © {year} {SITE_CONFIG.name}. All rights reserved.
      </div>
    </footer>
  )
}
