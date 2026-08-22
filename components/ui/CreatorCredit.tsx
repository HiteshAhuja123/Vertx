import { ArrowUpRight } from 'lucide-react';

interface CreatorCreditProps {
  className?: string;
}

/**
 * Studio signature. Kept visually consistent across every site built by AHUJA —
 * do not restyle per-project; adapt only the wrapping layout if needed.
 */
export function CreatorCredit({ className = '' }: CreatorCreditProps) {
  return (
    <a
      href="https://hitesh-portfolio-website.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1 rounded-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-vortx-white/40 ${className}`}
    >
      <span className="font-sans font-normal text-2xs sm:text-xs text-vortx-gray">
        Crafted by
      </span>
      <span className="inline-flex items-center gap-0.5">
        <span className="font-display font-black uppercase tracking-tighter text-2xs sm:text-xs text-vortx-white transition-transform duration-200 ease-out group-hover:translate-x-[2px]">
          AHUJA
        </span>
        <ArrowUpRight
          aria-hidden="true"
          strokeWidth={2.5}
          className="w-3 h-3 text-vortx-gray transition-all duration-200 ease-out group-hover:translate-x-[2.5px] group-hover:-translate-y-[2.5px] group-hover:text-vortx-white/70"
        />
      </span>
      <span className="sr-only">(opens in new tab)</span>
    </a>
  );
}
