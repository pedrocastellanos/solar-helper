import { CircleHelp } from 'lucide-react'

export function HelpInfo({ text }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Mostrar ayuda"
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-64 -translate-x-1/2 rounded-md border border-border bg-white dark:bg-zinc-950 px-3 py-2 text-xs leading-relaxed text-slate-900 dark:text-slate-100 shadow-2xl ring-1 ring-black/10 group-hover:block group-focus-within:block dark:ring-white/10">
        {text}
      </span>
    </span>
  )
}