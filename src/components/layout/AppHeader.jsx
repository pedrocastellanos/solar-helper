import { MoonStar, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function AppHeader({ theme, onToggleTheme }) {
  return (
    <header className="rounded-2xl border bg-card/75 p-6 shadow-[0_10px_40px_-20px_hsl(var(--solar-glow))] backdrop-blur-md transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Solar UX Premium</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">Simulador Solar Fotovoltaico</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Simulación con mapa real OpenStreetMap, geolocalización y cálculo dinámico mensual/anual.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={onToggleTheme} className="transition-transform hover:scale-105">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}
