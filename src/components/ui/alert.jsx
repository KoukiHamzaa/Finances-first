import * as React from 'react';
import {cva} from 'class-variance-authority';

import {cn} from '@/lib/utils';

const alertVariants = cva('relative grid gap-1 rounded-md border px-4 py-3 text-sm', {
  variants: {
    variant: {
      default: 'border-border bg-secondary text-ink',
      destructive: 'border-destructive/35 bg-destructive/8 text-destructive',
      warning: 'border-warning/40 bg-warning/10 text-warning',
      positive: 'border-positive/35 bg-positive/8 text-positive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Alert = React.forwardRef(function Alert({className, variant, ...props}, ref) {
  return <div ref={ref} role="alert" className={cn(alertVariants({variant}), className)} {...props} />;
});

const AlertTitle = React.forwardRef(function AlertTitle({className, ...props}, ref) {
  return <div ref={ref} className={cn('font-medium', className)} {...props} />;
});

const AlertDescription = React.forwardRef(function AlertDescription({className, ...props}, ref) {
  return <div ref={ref} className={cn('text-ink-soft [&_strong]:text-ink', className)} {...props} />;
});

export {Alert, AlertTitle, AlertDescription, alertVariants};