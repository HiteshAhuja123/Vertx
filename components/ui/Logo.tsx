import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md';
  tagline?: string;
  className?: string;
}

export function Logo({ size = 'sm', tagline = 'WARRIORS, NOT WATCHERS.', className = '' }: LogoProps) {
  const mark = size === 'md' ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-8 h-8 sm:w-9 sm:h-9';
  const wordmark =
    size === 'md'
      ? 'text-xl sm:text-2xl tracking-[0.25em]'
      : 'text-lg sm:text-xl md:text-2xl tracking-[0.22em] group-hover:tracking-[0.25em]';

  return (
    <Link href="/" className={`group flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <svg
        className={`${mark} transition-transform duration-300 group-hover:scale-105`}
        viewBox="0 0 115 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 10 18 L 95 18 L 82 38 L 38 25 Z" className="fill-vortx-white" />
        <path d="M 38 38 L 103 58 L 60 90 L 45 68 Z" className="fill-vortx-white" />
      </svg>
      <div className="flex flex-col justify-center">
        <span className={`font-display font-extrabold text-vortx-white transition ${wordmark}`}>VORTX</span>
        <span className="text-2xs sm:text-xs font-bold tracking-[0.1em] text-vortx-gray/80 -mt-0.5 whitespace-nowrap">
          {tagline}
        </span>
      </div>
    </Link>
  );
}
