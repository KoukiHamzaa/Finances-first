import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import {cn} from '@/lib/utils';

function Checkbox({className, ...props}) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'group peer size-4 shrink-0 rounded-xs border border-input bg-card transition-colors',
        'data-[state=checked]:border-brand data-[state=checked]:bg-brand',
        'data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary-foreground">
        <svg
          viewBox="0 0 12 12"
          className="size-3 group-data-[state=indeterminate]:hidden"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M2.5 6.25 4.75 8.5 9.5 3.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          viewBox="0 0 12 12"
          className="size-3 group-data-[state=checked]:hidden"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M3 6h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export {Checkbox};