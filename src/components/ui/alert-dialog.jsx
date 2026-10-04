import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';

const AlertDialogOverlay = React.forwardRef(function AlertDialogOverlay(
  {className, ...props},
  ref
) {
  return (
    <AlertDialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-ink/45',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className
      )}
      {...props}
    />
  );
});

const AlertDialogContent = React.forwardRef(function AlertDialogContent(
  {className, ...props},
  ref
) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 m-auto h-fit w-[calc(100%-2rem)] max-w-md',
          'gap-4 rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-lg',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
});

function AlertDialogHeader({className, ...props}) {
  return <div className={cn('flex flex-col gap-2 text-start', className)} {...props} />;
}

function AlertDialogFooter({className, ...props}) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

const AlertDialogTitle = React.forwardRef(function AlertDialogTitle(
  {className, ...props},
  ref
) {
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      className={cn('text-base font-semibold text-ink', className)}
      {...props}
    />
  );
});

const AlertDialogDescription = React.forwardRef(function AlertDialogDescription(
  {className, ...props},
  ref
) {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-ink-soft', className)}
      {...props}
    />
  );
});

const AlertDialogAction = React.forwardRef(function AlertDialogAction(
  {className, variant = 'default', ...props},
  ref
) {
  return (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(buttonVariants({variant}), className)}
      {...props}
    />
  );
});

const AlertDialogCancel = React.forwardRef(function AlertDialogCancel(
  {className, ...props},
  ref
) {
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(buttonVariants({variant: 'secondary'}), className)}
      {...props}
    />
  );
});

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};