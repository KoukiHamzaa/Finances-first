import * as React from 'react';

import {cn} from '@/lib/utils';

const NativeSelect = React.forwardRef(function NativeSelect(
  {className, children, ...props},
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-9 w-full appearance-none rounded-md border border-input bg-card pe-9 ps-3 text-sm text-ink',
          'transition-colors disabled:cursor-not-allowed disabled:opacity-45',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute end-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint"
      >
        <path
          d="M4 6.5 8 10.5l4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

export {NativeSelect};