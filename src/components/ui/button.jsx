import * as React from 'react';
import {cva} from 'class-variance-authority';

import {cn} from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90 active:opacity-80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        outline: 'border border-border bg-transparent text-ink hover:bg-accent',
        ghost: 'bg-transparent text-ink-soft hover:bg-accent hover:text-ink',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        link: 'text-brand underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4',
        lg: 'h-11 px-6',
        icon: 'size-9 p-0',
        'icon-sm': 'size-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(function Button(
  {className, variant, size, type = 'button', ...props},
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({variant, size}), className)}
      {...props}
    />
  );
});

export {Button, buttonVariants};