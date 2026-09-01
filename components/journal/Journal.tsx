'use client';

import { SectionMeta } from '@/components/ui/SectionMeta';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { Figure } from '@/components/ui/Figure';
import { journalPosts } from '@/data/journal';
import type { JournalPost } from '@/types';

/**
 * FROM THE CULTURE — an asymmetric editorial spread.
 *
 * The layout is driven by each post's `feature` weight rather than a uniform
 * grid, so the page reads like a magazine contents page: one lead, one wide
 * band, two columns and a quiet footnote.
 */
export function Journal() {
  const lead = journalPosts.find((p) => p.feature === 'lead');
  const wide = journalPosts.find((p) => p.feature === 'wide');
  const columns = journalPosts.filter((p) => p.feature === 'column');
  const quiet = journalPosts.find((p) => p.feature === 'quiet');

  return (
    <section id="journal"
      data-chapter="FROM THE CULTURE" className="relative bg-void py-[13svh]" aria-label="Journal">
      <div className="gutter">
        <SectionMeta index="10" label="JOURNAL" note="Longer reading, published slowly." />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <AnimatedText
            text="FROM THE CULTURE."
            as="h2"
            mode="chars"
            className="display-tight max-w-[13ch] text-[clamp(2.4rem,7.5vw,7rem)] text-bone"
          />
          <a
            href="#journal"
            data-cursor="READ"
            className="label border-b border-hairline pb-2 text-muted transition-colors hover:border-honey hover:text-honey"
          >
            ALL WRITING &#8594;
          </a>
        </div>

      </div>

      {/* The lead runs full-bleed with its title breaking over the image —
          the one moment in the section that ignores the gutter entirely. */}
      {lead ? (
        <a href="#journal" data-cursor="READ" className="group relative mt-16 block">
          <Figure
            src={lead.media}
            alt={lead.title}
            ratio="21 / 9"
            parallax={10}
            className="w-full"
          />
          <div className="pointer-events-none absolute inset-0 flex items-end">
            <div className="w-full gutter pb-[clamp(1.5rem,4vw,3.5rem)]">
              <span className="label-sm text-honey">{lead.kicker}</span>
              <h3 className="display-tight mt-4 max-w-[16ch] text-[clamp(2rem,6vw,5.5rem)] text-bone drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
                {lead.title}
              </h3>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
                <p className="max-w-[52ch] text-[0.98rem] leading-relaxed text-scoby/90">
                  {lead.excerpt}
                </p>
                <span className="label-sm text-muted/70">
                  {lead.date} / {lead.readTime}
                </span>
              </div>
            </div>
          </div>
        </a>
      ) : null}

      <div className="gutter">
        {/* columns */}
        <div className="mt-20 grid gap-12 md:grid-cols-2 lg:gap-16">
          {columns.map((post) => (
            <Post key={post.id} post={post} size="column" />
          ))}
        </div>

        {/* wide band */}
        {wide ? (
          <div className="mt-20 border-t border-hairline pt-12">
            <Post post={wide} size="wide" />
          </div>
        ) : null}

        {/* footnote */}
        {quiet ? (
          <div className="mt-16 border-t border-hairline pt-8">
            <a href="#journal" data-cursor="READ" className="group flex flex-wrap items-baseline justify-between gap-4">
              <span className="flex items-baseline gap-5">
                <span className="label-sm text-honey">{quiet.kicker}</span>
                <span className="serif-note text-[clamp(1.3rem,2.6vw,2rem)] text-bone transition-colors group-hover:text-honey">
                  {quiet.title}
                </span>
              </span>
              <span className="label-sm text-muted/60">
                {quiet.date} / {quiet.readTime}
              </span>
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Post({ post, size }: { post: JournalPost; size: 'lead' | 'wide' | 'column' }) {
  const ratio = size === 'lead' ? '3 / 2' : size === 'wide' ? '16 / 9' : '4 / 5';

  return (
    <article className="group">
      <a href="#journal" data-cursor="READ" className="block">
        <Figure
          src={post.media}
          alt={post.title}
          ratio={ratio}
          parallax={size === 'wide' ? 8 : 0}
        />

        <div
          className={
            size === 'wide'
              ? 'mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between'
              : 'mt-7'
          }
        >
          <div className={size === 'wide' ? 'max-w-[30ch]' : ''}>
            <span className="label-sm text-honey">{post.kicker}</span>
            <h3
              className={
                size === 'lead'
                  ? 'display mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[0.95] text-bone transition-colors group-hover:text-honey'
                  : size === 'wide'
                    ? 'display mt-4 text-[clamp(1.6rem,3vw,2.4rem)] leading-[0.95] text-bone transition-colors group-hover:text-honey'
                    : 'display mt-4 text-[1.35rem] leading-[1] text-bone transition-colors group-hover:text-honey'
              }
            >
              {post.title}
            </h3>
          </div>

          <div className={size === 'wide' ? 'max-w-[42ch]' : 'mt-4'}>
            <p className="text-[0.95rem] leading-relaxed text-muted">{post.excerpt}</p>
            <span className="label-sm mt-5 block text-muted/50">
              {post.date} / {post.readTime}
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}
