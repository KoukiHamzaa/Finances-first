import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import {cn} from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(function TabsList({className, ...props}, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-surface-3 p-1 text-ink-soft',
        className
      )}
      {...props}
    />
  );
});

const TabsTrigger = React.forwardRef(function TabsTrigger({className, ...props}, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium',
        'transition-colors hover:text-ink',
        'data-[state=active]:bg-card data-[state=active]:text-ink data-[state=active]:shadow-xs',
        'disabled:pointer-events-none disabled:opacity-45',
        className
      )}
      {...props}
    />
  );
});

const TabsContent = React.forwardRef(function TabsContent({className, ...props}, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('focus-visible:outline-none', className)}
      {...props}
    />
  );
});

export {Tabs, TabsList, TabsTrigger, TabsContent};