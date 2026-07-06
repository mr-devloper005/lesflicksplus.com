import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchAd({ slot, eager = false }: { slot: string; eager?: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Ads slot={slot} showLabel eager={eager} className="mx-auto w-full" />
    </div>
  )
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const strong = index % 6 === 0

  return (
    <Link href={href} className={`group block overflow-hidden border border-[var(--editable-border)] bg-white transition duration-300 hover:-translate-y-1.5 hover:shadow-[7px_7px_0_#171717] ${strong ? 'md:col-span-2' : ''}`}>
      {image ? (
        <div className={`relative overflow-hidden bg-[#deded7] ${strong ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}>
          <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <span className="absolute left-4 top-4 border border-[var(--editable-border)] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black">{taskLabel}</span>
        </div>
      ) : null}
      <div className="p-5 sm:p-6">
        {!image ? <span className="bg-[var(--slot4-accent)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black">{taskLabel}</span> : null}
        <h2 className="mt-4 line-clamp-3 text-2xl font-black leading-[1.02] tracking-[-0.05em] text-[var(--editable-page-text,#211713)]">{post.title}</h2>
        {summary ? <p className="mt-4 line-clamp-3 text-sm font-semibold leading-7 text-[var(--editable-page-text,#211713)]/65">{summary}</p> : null}
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--slot4-accent)]">Open result <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--editable-page-bg,#fff7ee)] text-[var(--editable-page-text,#2f1d16)]">
        <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-[#f4f3ee]">
          <div className="editable-float absolute -left-12 top-28 hidden h-44 w-44 rotate-[-18deg] items-center justify-center rounded-full border border-[var(--editable-border)] bg-[var(--slot4-accent)] text-7xl font-black lg:flex">?</div>
          <div className="editable-wiggle absolute -right-10 top-20 hidden h-36 w-36 rotate-12 items-center justify-center rounded-full border border-[var(--editable-border)] bg-[#ffd23f] text-6xl font-black md:flex">+</div>
          <div className="mx-auto grid min-h-[540px] w-full max-w-[var(--editable-container)] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.15em]">
                <Search className="h-4 w-4" /> {pagesContent.search.hero.badge}
              </span>
              <h1 className="mt-6 max-w-3xl text-[clamp(3.2rem,6vw,5.8rem)] font-medium leading-[.88] tracking-[-.06em]">
                Find what <span className="text-[var(--slot4-accent)]">matters.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg font-medium leading-8 text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>
            </div>

            <form action="/search" className="relative z-10 mx-auto w-full max-w-[520px] rotate-1 border border-[var(--editable-border)] bg-white p-4 shadow-[10px_10px_0_#e867c7] transition hover:rotate-0 sm:p-5">
              <input type="hidden" name="master" value="1" />
              <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[var(--slot4-accent)]">Search the archive</p>
              <label className="flex items-center gap-3 border border-[var(--editable-border)] bg-[#f4f3ee] px-4 py-3">
                <Search className="h-5 w-5 opacity-45" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-current/35" />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 border border-[var(--editable-border)] bg-[#f4f3ee] px-4 py-3">
                  <Filter className="h-4 w-4 opacity-45" />
                  <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-current/35" />
                </label>
                <select name="task" defaultValue={task} className="border border-[var(--editable-border)] bg-[#f4f3ee] px-4 py-3 text-sm font-black outline-none">
                  <option value="">All content types</option>
                  {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </div>
              <button className="mt-3 inline-flex h-12 w-full items-center justify-center bg-black px-6 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-[var(--slot4-accent)] hover:text-black" type="submit">Search</button>
            </form>
          </div>
        </section>

        <SearchAd slot="header" eager />

        <section className="bg-[#ecebe5] py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--editable-border)] pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] opacity-50">{results.length} results</p>
                <h2 className="mt-2 text-4xl font-medium tracking-[-0.055em] sm:text-5xl">{query ? `Results for "${query}"` : pagesContent.search.resultsTitle}</h2>
              </div>
              <Link href="/article" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3 text-sm font-black transition hover:bg-[#ffd23f]">Browse latest <ArrowRight className="h-4 w-4" /></Link>
            </div>

            {results.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
              </div>
            ) : (
              <div className="mt-8 border border-dashed border-[var(--editable-border)] bg-white p-10 text-center">
                <p className="text-3xl font-black tracking-[-0.04em]">No matching posts found.</p>
                <p className="mt-3 text-sm font-semibold opacity-60">Try a different keyword, task type, or category.</p>
              </div>
            )}
          </div>
        </section>

        <SearchAd slot="footer" />
      </main>
    </EditableSiteShell>
  )
}
