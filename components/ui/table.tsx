'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Table — warm TAI visual treatment.
 * Stronger header hierarchy, warm hover states, sticky-header support.
 */
function Table({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<'table'> & { containerClassName?: string }) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        'relative w-full overflow-auto rounded-xl border border-border/50 bg-card shadow-soft',
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

/**
 * `sticky` pins the header while the body scrolls. It sticks to the *container*,
 * not the viewport — `overflow: auto` on the wrapper makes it the scroll box —
 * so it only does anything when the caller also caps the container's height
 * (see `containerClassName` on Table). The opaque `bg-cream-light` is what keeps
 * rows from showing through as they pass underneath.
 */
function TableHeader({
  className,
  sticky = false,
  ...props
}: React.ComponentProps<'thead'> & { sticky?: boolean }) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        'bg-cream-light border-b border-border/50 [&_tr]:border-b-0',
        sticky && 'sticky top-0 z-10',
        className,
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-cream-light/60 border-t border-border/50 font-semibold [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border/40 transition-colors',
        'hover:bg-cream-light/60',
        'data-[state=selected]:bg-brand/5 data-[state=selected]:border-brand/20',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Sentence case, not uppercase. All-caps headers are the reflex of every
        // admin template, and they cost real legibility: caps strip the word
        // shapes the eye uses to skim a header row. Weight and colour separate
        // the header from the body here instead.
        'text-muted-foreground h-11 px-4 text-left align-middle text-xs font-bold whitespace-nowrap',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 py-3.5 align-middle whitespace-nowrap text-sm',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm font-medium', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
