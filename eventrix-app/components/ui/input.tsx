import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1 text-base text-gray-900 shadow-xs transition-[color,box-shadow] outline-none placeholder:text-gray-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400',
        'focus-visible:ring-2 focus-visible:ring-gray-400/50 dark:focus-visible:ring-gray-600/50',
        'aria-invalid:border-red-500 aria-invalid:ring-red-500/20 dark:aria-invalid:border-red-400 dark:aria-invalid:ring-red-400/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
