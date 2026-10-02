import * as React from 'react';

import {cn} from '@/lib/utils';

const Input = React.forwardRef(function Input({className, type = 'text', ...props}, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm text-ink transition-colors',
        'placeholder:text-ink-faint',
        'disabled:cursor-not-allowed disabled:opacity-45',
        'aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
});

export {Input};