'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/hooks/useEnvironment';
import { SectionMeta } from '@/components/ui/SectionMeta';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TasteProfileMeter } from '@/components/products/TasteProfile';
import { BubbleCanvas } from '@/components/ui/BubbleCanvas';
import { quizQuestions } from '@/data/quiz';
import { getProduct, products } from '@/data/products';
import { cn } from '@/lib/utils';

type Answers = Record<string, string>;

/**
 * Two questions and a reveal. The recommendation is a weighted tally held in
 * /data/quiz.ts, so the logic is content rather than code — a merchandiser can
 * retune which answers point at which bottle without touching this file.
 */
export function Quiz() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [pouring, setPouring] = useState(false);
  const fizz = useRef(0.4);
  const timers = useRef<number[]>([]);

  // Never leave a pending advance behind when the section unmounts.
  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    },
    []
  );

  const result = useMemo(() => {
    const score: Record<string, number> = {};
    for (const q of quizQuestions) {
      const chosen = q.options.find((o) => o.id === answers[q.id]);
      if (!chosen) continue;
      for (const [id, weight] of Object.entries(chosen.weights)) {
        score[id] = (score[id] ?? 0) + weight;
      }
    }
    const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    return best ? getProduct(best[0]) : products[0];
  }, [answers]);

  const total = quizQuestions.length;
  const done = step >= total;

  /**
   * The exit is decoration; the state change is not. Advancing on a timer
   * rather than on the tween's onComplete means a backgrounded or throttled
   * tab — where rAF stops and GSAP never completes — cannot strand the quiz
   * on a question forever.
   */
  const animateOut = (then: () => void) => {
    if (reduced || !stage.current) {
      then();
      return;
    }
    gsap.to(stage.current.querySelectorAll('[data-panel]'), {
      opacity: 0,
      y: -22,
      duration: 0.35,
      stagger: 0.03,
      ease: 'power2.in',
    });
    timers.current.push(window.setTimeout(then, 380));
  };

  const choose = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    animateOut(() => {
      setAnswers(next);
      if (step + 1 >= total) {
        // the pour: a beat of anticipation before the reveal
        setPouring(true);
        fizz.current = 2.4;
        timers.current.push(
          window.setTimeout(
            () => {
              setPouring(false);
              setStep(step + 1);
            },
            reduced ? 0 : 1250
          )
        );
      } else {
        setStep(step + 1);
      }
    });
  };

  const restart = () => {
    animateOut(() => {
      setAnswers({});
      setStep(0);
    });
  };

  /* fade each panel in as it arrives */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !stage.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-panel]',
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.85, stagger: 0.06, ease: 'power3.out' }
      );
    }, stage);
    return () => ctx.revert();
  }, [step, pouring, reduced]);

  return (
    <section
      ref={section}
      id="quiz"
      className="relative overflow-hidden bg-ink py-[14svh]"
      aria-label="Find your booch quiz"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: done
            ? `radial-gradient(70% 55% at 50% 60%, ${result.colour.accent}26 0%, transparent 70%)`
            : 'radial-gradient(70% 55% at 50% 60%, rgba(192,118,42,0.12) 0%, transparent 70%)',
          transition: 'background 1.2s ease',
        }}
      />
      <BubbleCanvas
        className="absolute inset-0 h-full w-full"
        density={14}
        speed={0.8}
        intensityRef={fizz}
        seed={31}
      />

      <div className="relative gutter">
        <SectionMeta index="04" label="RECOMMENDATION" note="Two questions. One bottle." />

        <div ref={stage} className="mt-12 min-h-[30rem]">
          {/* --- pouring --- */}
          {pouring ? (
            <div data-panel className="flex min-h-[26rem] flex-col items-center justify-center">
              <span className="label text-honey">POURING</span>
              <span className="display-tight mt-6 text-[clamp(2rem,6vw,4.5rem)] text-bone">
                READING THE FERMENT
              </span>
              <span className="mt-8 block h-px w-[min(28rem,70vw)] overflow-hidden bg-hairline">
                <span
                  className="block h-px bg-honey"
                  style={{ animation: 'kb-quiz-fill 1.2s cubic-bezier(0.65,0,0.35,1) forwards' }}
                />
              </span>
            </div>
          ) : null}

          {/* --- questions --- */}
          {!pouring && !done
            ? (() => {
                const q = quizQuestions[step];
                return (
                  <div key={q.id}>
                    <div data-panel className="flex items-baseline gap-5">
                      <span className="label text-honey">{q.index}</span>
                      <span className="label text-muted/60">
                        OF {String(total).padStart(2, '0')}
                      </span>
                    </div>

                    <h2
                      data-panel
                      className="display-tight mt-6 max-w-[16ch] text-[clamp(2rem,6.5vw,5.5rem)] text-bone"
                    >
                      {q.question}
                    </h2>

                    <div className="mt-12 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
                      {q.options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          data-panel
                          data-cursor="CHOOSE"
                          onClick={() => choose(q.id, opt.id)}
                          className="group relative flex min-h-[11rem] flex-col justify-between bg-ink p-6 text-left transition-colors duration-500 hover:bg-soil"
                        >
                          <span className="label-sm text-muted/50 transition-colors group-hover:text-honey">
                            {opt.id.toUpperCase()}
                          </span>
                          <span>
                            <span className="display block text-[1.7rem] text-bone">
                              {opt.label}
                            </span>
                            <span className="mt-2 block text-[0.85rem] text-muted">{opt.sub}</span>
                          </span>
                          <span
                            aria-hidden
                            className="absolute inset-x-0 bottom-0 h-px w-0 bg-honey transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()
            : null}

          {/* --- result --- */}
          {!pouring && done ? (
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1fr]">
              <div data-panel className="relative flex justify-center">
                <div
                  aria-hidden
                  className="absolute inset-0 blur-3xl"
                  style={{
                    background: `radial-gradient(50% 44% at 50% 60%, ${result.colour.accent}55, transparent 72%)`,
                  }}
                />
                <img
                  src={result.media.bottle}
                  alt={result.name}
                  className="relative h-[24rem] w-auto drop-shadow-[0_36px_60px_rgba(0,0,0,0.65)] md:h-[30rem]"
                  style={reduced ? undefined : { animation: 'kb-drift 6s ease-in-out infinite alternate' }}
                />
              </div>

              <div>
                <span data-panel className="label block" style={{ color: result.colour.accent }}>
                  YOUR BOOCH
                </span>
                <h2
                  data-panel
                  className="display-tight mt-5 text-[clamp(2.4rem,7vw,5.5rem)] text-bone"
                >
                  {result.flavour.toUpperCase()}
                </h2>
                <p data-panel className="serif-note mt-3 text-[1.5rem] leading-tight text-scoby">
                  {result.tagline}
                </p>
                <p data-panel className="mt-6 max-w-[44ch] text-[0.98rem] leading-relaxed text-muted">
                  {result.description}
                </p>

                <div data-panel className="mt-8 max-w-[26rem]">
                  <TasteProfileMeter profile={result.profile} accent={result.colour.accent} />
                </div>

                <div data-panel className="mt-10 flex flex-wrap items-center gap-3">
                  <MagneticButton href="#shop" variant="solid" cursor="SHOP">
                    SHOP {result.flavour.toUpperCase()}
                  </MagneticButton>
                  <MagneticButton onClick={restart} variant="quiet" arrow={false}>
                    START AGAIN
                  </MagneticButton>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* progress */}
        <div className="mt-14 flex items-center gap-3">
          {quizQuestions.map((q, i) => (
            <span
              key={q.id}
              className={cn(
                'h-px flex-1 transition-all duration-700',
                i < step ? 'bg-honey' : 'bg-hairline'
              )}
            />
          ))}
          <span className="label-sm ml-3 text-muted/60">
            {String(Math.min(step, total)).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  );
}
