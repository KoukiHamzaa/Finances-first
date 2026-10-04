import * as React from 'react';

import {cn} from '@/lib/utils';

const Card = React.forwardRef(function Card({className, ...props}, ref) {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground',
        className
      )}
      {...props}
    />
  );
});

const CardHeader = React.forwardRef(function CardHeader({className, ...props}, ref) {
  return <div ref={ref} className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />;
});

const CardTitle = React.forwardRef(function CardTitle({className, ...props}, ref) {
  return (
    <h3
      ref={ref}
      className={cn('text-sm font-semibold leading-tight text-ink', className)}
      {...props}
    />
  );
});

const CardDescription = React.forwardRef(function CardDescription({className, ...props}, ref) {
  return <p ref={ref} className={cn('text-sm text-ink-soft', className)} {...props} />;
});

const CardContent = React.forwardRef(function CardContent({className, ...props}, ref) {
  return <div ref={ref} className={cn('p-4 pt-0', className)} {...props} />;
});

const CardFooter = React.forwardRef(function CardFooter({className, ...props}, ref) {
  return <div ref={ref} className={cn('flex items-center gap-2 p-4 pt-0', className)} {...props} />;
});

export {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter};