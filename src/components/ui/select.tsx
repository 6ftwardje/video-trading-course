import * as React from 'react'

import { cn } from '@/lib/utils'

type Option = { label: string; value: string; disabled?: boolean }

export type SelectProps = {
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
  name?: string
  id?: string
}

/**
 * Minimal, native-backed Select with shadcn-ish styling.
 * This keeps dependencies light while matching the existing UI conventions.
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className,
  name,
  id,
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        id={id}
        name={name}
        aria-label={ariaLabel}
        className={cn(
          'h-9 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 pr-9 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60'
        )}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]"
        aria-hidden="true"
      >
        <path d="M6 8l4 4 4-4" />
      </svg>
    </div>
  )
}







