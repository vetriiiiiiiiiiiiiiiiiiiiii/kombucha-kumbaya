'use client';

import { useState } from 'react';
import { footerLinks, site, socials } from '@/data/site';
import { activeCampaign } from '@/data/campaigns';

export function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <footer id="contact" className="relative border-t border-hairline bg-void">
      <div className="gutter py-14">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr_1fr]">
          {/* brand */}
          <div>
            <span className="display block text-[clamp(2rem,5vw,3.4rem)] leading-none text-bone">
              {site.brand}
            </span>
            <span className="label mt-4 block text-muted/70">{site.descriptor}</span>
            <p className="serif-note mt-8 max-w-[24ch] text-[1.2rem] leading-tight text-scoby/80">
              {activeCampaign.line}
            </p>
          </div>

          {/* links */}
          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <span className="label-sm block text-muted/50">{group.title}</span>
              <ul className="mt-6 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group relative inline-block text-[0.98rem] text-bone/85 transition-colors hover:text-honey"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-honey transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* newsletter */}
        <div className="mt-16 grid gap-8 border-t border-hairline pt-10 md:grid-cols-[1fr_1.1fr] md:items-end">
          <div>
            <span className="label-sm block text-muted/50">DISPATCHES</span>
            <p className="mt-4 max-w-[34ch] text-[1.05rem] leading-relaxed text-bone/85">
              New batches, new cities, and the occasional long read. Roughly once
              a month.
            </p>
          </div>

          <form
            className="flex w-full items-end gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              // Concept prototype: nothing leaves the browser.
              setSent(true);
            }}
          >
            <label className="flex-1">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-b border-hairline bg-transparent pb-3 text-[1rem] text-bone outline-none transition-colors placeholder:text-muted/40 focus:border-honey"
              />
            </label>
            <button
              type="submit"
              data-cursor="SEND"
              className="label shrink-0 border-b border-hairline pb-3 text-bone transition-colors hover:border-honey hover:text-honey"
            >
              {sent ? 'NOTED' : 'SIGN UP'} &#8594;
            </button>
          </form>
        </div>

        {/* socials + credit */}
        <div className="mt-14 flex flex-wrap items-end justify-between gap-8 border-t border-hairline pt-8">
          <ul className="flex flex-wrap gap-6">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="label text-muted transition-colors hover:text-bone">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="text-right">
            <span className="label-sm block text-muted/50">
              {site.home} / {site.est}
            </span>
            <span className="label-sm mt-3 block text-muted/40">
              CONCEPT BY {site.credit.studio} — {site.credit.disciplines.join(' × ')}
            </span>
            <span className="label-sm mt-2 block text-muted/30">{site.credit.note}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
