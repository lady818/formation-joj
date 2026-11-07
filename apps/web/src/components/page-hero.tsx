import type { ReactNode } from 'react';
import { AYO_SRC, Sparkles } from '@/components/ayo';
import { cn } from '@/lib/utils';

/** Le bandeau vert des pages, avec Ayo dans son soleil et le zigzag de son chapeau. */
export function PageHero({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.42_0.13_152)] via-senegal-green to-[oklch(0.62_0.15_130)] text-white shadow-xl shadow-senegal-green/20 duration-700 animate-in animate-gradient fade-in slide-in-from-top-4',
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-0 pattern-diamonds" />
      <Sparkles />
      <span
        aria-hidden="true"
        className="absolute -top-16 -right-16 hidden size-64 rounded-full bg-senegal-yellow/90 sm:block"
      />
      <span
        aria-hidden="true"
        className="absolute -top-24 -right-24 hidden size-80 animate-spin-slow rounded-full border-2 border-dashed border-white/30 sm:block"
      />
      <img
        src={AYO_SRC}
        alt=""
        className="absolute top-4 right-6 hidden size-36 animate-ayo-float rounded-full object-cover object-top shadow-2xl ring-4 ring-white sm:block"
      />
      <div className="relative p-6 sm:p-8 sm:pr-52">
        {eyebrow && (
          <p className="text-xs font-bold tracking-[0.2em] text-senegal-yellow uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      </div>
      {children && <div className="relative px-6 pb-6 sm:px-8 sm:pb-8">{children}</div>}
      <span aria-hidden="true" className="relative block h-3 pattern-zigzag" />
    </section>
  );
}
