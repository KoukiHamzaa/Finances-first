import {cva} from 'class-variance-authority';

import {cn} from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-ink-soft',
        positive: 'border-transparent bg-positive/12 text-positive',
        negative: 'border-transparent bg-destructive/12 text-destructive',
        warning: 'border-transparent bg-warning/15 text-warning',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({className, variant, ...props}) {
  return <span className={cn(badgeVariants({variant}), className)} {...props} />;
}

export {Badge, badgeVariants};