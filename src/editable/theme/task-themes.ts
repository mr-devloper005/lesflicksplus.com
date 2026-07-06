import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Editable task surfaces.

  Archive and detail pages now share the same paper-and-ink visual language as
  the homepage: warm background, heavy black outlines, pink/yellow accents,
  compact editorial typography and playful card motion. Per-task copy still
  varies so each section keeps its own small voice.
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Archivo Black', 'Arial Black', system-ui, sans-serif"
const BODY_FONT = "'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#f4f3ee',
  surface: '#fffdf6',
  raised: '#ecebe5',
  text: '#070707',
  muted: '#5b5b55',
  line: '#aaa8a1',
  accent: '#e867c7',
  accentSoft: '#f8c8ed',
  onAccent: '#050505',
  glow: 'rgba(232,103,199,0.24)',
  radius: '1.35rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Articles', note: 'Thoughtful reads, guides and ideas worth keeping.' },
  listing: { ...base, kicker: 'Businesses', note: 'Useful profiles, local names and professional services.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Fresh offers and community notices ready to act on.' },
  image: { ...base, kicker: 'Photos', note: 'A visual feed of standout images and galleries.' },
  sbm: { ...base, kicker: 'Bookmarks', note: 'Curated resources and links worth saving.' },
  pdf: { ...base, kicker: 'Documents', note: 'Downloadable guides, reports and references.' },
  profile: { ...base, kicker: 'People', note: 'Discover creators, businesses and public profiles.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
