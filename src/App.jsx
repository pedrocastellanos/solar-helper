import { useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { Analytics } from '@vercel/analytics/react'

import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeader } from '@/components/layout/AppHeader'
import { StepNav } from '@/components/layout/StepNav'
import { AppStateProvider } from '@/context/AppStateProvider'
import { STEPS } from '@/constants/solar'
import { useAppController } from '@/hooks/use-app-controller'
import { ConfigurationPage } from '@/pages/ConfigurationPage'
import { LocationPage } from '@/pages/LocationPage'
import { ResultsPage } from '@/pages/ResultsPage'

function App() {
  const initialTheme =
    typeof window !== 'undefined'
      ? (localStorage.getItem('solar-theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
      : 'light'

  const [step, setStep] = useState(1)
  const [location, navigate] = useLocation()
  const [theme, setTheme] = useState(initialTheme)

  const stateValue = useAppController()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('solar-theme', theme)
  }, [theme])

  useEffect(() => {
    const routeToStep = {
      '/': 1,
      '/ubicacion': 1,
      '/configuracion': 2,
      '/resultados': 3,
    }
    setStep(routeToStep[location] ?? 1)
  }, [location])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  const stepPath = {
    1: '/ubicacion',
    2: '/configuracion',
    3: '/resultados',
  }

  return (
    <main className="mx-auto grid min-h-svh w-full max-w-7xl gap-4 p-4 lg:p-6 animate-in fade-in duration-500">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} />

      <StepNav
        steps={STEPS}
        step={step}
        onSetStep={(nextStep) => {
          setStep(nextStep)
          navigate(stepPath[nextStep] ?? '/ubicacion')
        }}
      />

      <AppStateProvider value={stateValue}>
        <Switch>
          <Route path="/ubicacion" component={LocationPage} />
          <Route path="/configuracion" component={ConfigurationPage} />
          <Route path="/resultados" component={ResultsPage} />
          <Route path="/" component={LocationPage} />
          <Route component={LocationPage} />
        </Switch>
      </AppStateProvider>

      <AppFooter
        step={step}
        onPrev={() => {
          const nextStep = Math.max(1, step - 1)
          navigate(stepPath[nextStep] ?? '/ubicacion')
        }}
        onNext={() => {
          const nextStep = Math.min(3, step + 1)
          navigate(stepPath[nextStep] ?? '/resultados')
        }}
      />

      <Analytics />
    </main>
  )
}

export default App
