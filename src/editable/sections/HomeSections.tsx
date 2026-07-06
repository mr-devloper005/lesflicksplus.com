import Link from 'next/link'
import { ArrowRight, Building2, FileText, Search } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type Props = { primaryTask: TaskKey; primaryRoute: string; posts: SitePost[]; timeSections: HomeTimeSection[] }
const wrap = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8'

function allPosts(posts: SitePost[], sections: HomeTimeSection[]) {
  const seen = new Set<string>()
  return [...posts, ...sections.flatMap((s) => s.posts)].filter((p) => {
    const key = p.slug || p.id || p.title
    if (!key || seen.has(key)) return false
    seen.add(key); return true
  })
}
function summary(post?: SitePost, max = 150) {
  const c = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const value = (typeof c.summary === 'string' && c.summary) || (typeof c.description === 'string' && c.description) || post?.summary || 'A fresh contribution from our community.'
  const clean = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}
function label(post?: SitePost) {
  const c = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof c.category === 'string' && c.category) || post?.tags?.[0] || 'Featured'
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: Props) {
  const pool = allPosts(posts, timeSections)
  const first = pool[0]
  return <section className="relative min-h-[540px] border-b-2 border-black bg-[#f4f3ee]">
    <div className="editable-float absolute -left-12 top-28 hidden h-44 w-44 rotate-[-18deg] items-center justify-center rounded-full border-2 border-black bg-[var(--slot4-accent)] text-7xl font-black lg:flex">L</div>
    <div className="editable-wiggle absolute -right-10 top-16 hidden h-36 w-36 rotate-12 items-center justify-center rounded-full border-2 border-black bg-[#ffd23f] text-6xl font-black md:flex">+</div>
    <div className={`${wrap} grid min-h-[540px] items-center gap-10 py-14 lg:grid-cols-[1.08fr_.92fr]`}>
      <div className="relative z-10">
        <h1 className="mt-6 max-w-3xl text-[clamp(3rem,5vw,4.75rem)] font-medium leading-[.9] tracking-[-.055em]">Make your<br/><span className="text-[var(--slot4-accent)]">work visible.</span></h1>
        <p className="mt-8 max-w-xl text-lg leading-8">Publish useful stories, discover independent businesses, and meet the people building thoughtful things.</p>
        <form action="/search" className="mt-8 flex max-w-xl border-2 border-black bg-white p-1.5 shadow-[6px_6px_0_#171717]">
          <Search className="ml-3 h-5 w-5 self-center"/><input name="q" aria-label="Search" placeholder="Search stories, places and people" className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none"/>
          <button className="bg-black px-6 font-bold text-white hover:bg-[var(--slot4-accent)] hover:text-black">Explore</button>
        </form>
      </div>
      {first ? <Link href={postHref(primaryTask, first, primaryRoute)} className="group relative mx-auto w-full max-w-[360px] rotate-2 border-2 border-black bg-white p-3 shadow-[10px_10px_0_#e867c7] transition hover:rotate-0">
        <div className="aspect-[4/3] overflow-hidden bg-[#ddd]"><img src={getEditablePostImage(first)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/></div>
        <div className="p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--slot4-accent)]">{label(first)}</p><h2 className="mt-2 text-3xl font-bold leading-tight">{first.title || 'Community spotlight'}</h2><p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{summary(first,110)}</p></div>
      </Link> : null}
    </div>
  </section>
}

export function EditableStoryRail({ primaryRoute }: Props) {
  const tasks = SITE_CONFIG.tasks.filter(t => t.enabled)
  const doubled = [...tasks, ...tasks, ...tasks]
  return <section className="overflow-hidden border-b-2 border-black bg-[#ffd23f] py-5"><div className="editable-marquee flex gap-4 pr-4">
    {doubled.map((task,i) => <Link key={`${task.key}-${i}`} href={task.route || primaryRoute} className="inline-flex shrink-0 items-center gap-3 rounded-full border-2 border-black bg-white px-6 py-3 text-lg font-bold hover:bg-[var(--slot4-accent)]">{task.key === 'listing' ? <Building2/> : <FileText/>}{task.label}<ArrowRight className="h-4 w-4"/></Link>)}
  </div></section>
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: Props) {
  const pool = allPosts(posts,timeSections).slice(0,6); if (!pool.length) return null
  const [lead,...rest] = pool
  return <section className="bg-[#ecebe5] py-16 sm:py-20"><div className={wrap}>
    <div className="flex items-end justify-between border-b-2 border-black pb-5"><div><p className="text-xs font-bold uppercase tracking-[.2em]">The front page</p><h2 className="mt-2 text-4xl font-medium tracking-[-.045em] sm:text-5xl">Worth your time.</h2></div><Link href={primaryRoute} className="hidden font-bold underline sm:block">View everything →</Link></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <Link href={postHref(primaryTask,lead,primaryRoute)} className="group border-2 border-black bg-white"><div className="aspect-[16/9] overflow-hidden"><img src={getEditablePostImage(lead)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/></div><div className="grid gap-5 p-6 md:grid-cols-[1fr_.55fr]"><h3 className="text-4xl font-semibold leading-[1.02] tracking-[-.04em]">{lead.title}</h3><p className="text-sm leading-6 text-[var(--slot4-muted-text)]">{summary(lead)}</p></div></Link>
      <div className="grid gap-4">{rest.map((p,i)=><Link key={p.id||p.slug||i} href={postHref(primaryTask,p,primaryRoute)} className={`group grid grid-cols-[110px_1fr] border-2 border-black p-2 transition hover:translate-x-1 ${i%2?'bg-[#ffd23f]':'bg-white'}`}><img src={getEditablePostImage(p)} alt="" className="h-24 w-full object-cover grayscale transition group-hover:grayscale-0"/><div className="px-4 py-2"><span className="text-[10px] font-bold uppercase tracking-[.15em]">{label(p)}</span><h3 className="mt-1 line-clamp-2 text-lg font-bold leading-tight">{p.title}</h3></div></Link>)}</div>
    </div>
  </div></section>
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: Props) {
  const pool = allPosts(posts,timeSections).slice(6,18); if (!pool.length) return null
  return <section className="border-y-2 border-black bg-[var(--slot4-accent)] py-16"><div className={wrap}><div className="max-w-3xl"><p className="font-bold uppercase tracking-[.18em]">Discover more</p><h2 className="mt-2 text-4xl font-medium leading-none tracking-[-.045em] sm:text-5xl">A lively mix of ideas and businesses.</h2></div>
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{pool.map((p,i)=><Link key={p.id||p.slug||i} href={postHref(primaryTask,p,primaryRoute)} className={`group overflow-hidden border-2 border-black bg-white transition hover:-translate-y-2 hover:shadow-[7px_7px_0_#171717] ${i%3===0?'lg:col-span-2':''}`}><div className={`${i%3===0?'aspect-[2/1]':'aspect-[4/3]'} overflow-hidden bg-[#ddd]`}><img src={getEditablePostImage(p)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/></div><div className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em]">{label(p)}</p><h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight">{p.title}</h3><p className="mt-3 line-clamp-2 text-sm text-[var(--slot4-muted-text)]">{summary(p,90)}</p></div></Link>)}</div>
  </div></section>
}

export function EditableHomeCta() {
  return <section className="bg-[#f4f3ee] px-4 py-20 text-center"><p className="text-sm font-bold uppercase tracking-[.22em]">Your corner of the internet</p><h2 className="mx-auto mt-4 max-w-4xl text-[clamp(3rem,6vw,5rem)] font-medium leading-[.94] tracking-[-.055em]">Share your work.<br/>Someone needs it.</h2><div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/create" className="border-2 border-black bg-black px-8 py-4 font-bold text-white shadow-[6px_6px_0_#e867c7] transition hover:-translate-y-1">Create a post</Link><Link href="/contact" className="border-2 border-black bg-white px-8 py-4 font-bold transition hover:bg-[#ffd23f]">Talk to us</Link></div></section>
}
