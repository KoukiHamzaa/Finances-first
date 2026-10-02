import * as React from 'react';

import {cn} from '@/lib/utils';

const Progress = React.forwardRef(function Progress(
  {className, value = 0, max = 100, label, ...props},
  ref
) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-brand transition-[inline-size] duration-200"
        style={{width: `${pct}%`}}
      />
    </div>
  );
});

export {Progress};