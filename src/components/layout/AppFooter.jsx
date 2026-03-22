import { Button } from '@/components/ui/button'

export function AppFooter({ step, onPrev, onNext }) {
  return (
    <footer className="flex flex-wrap justify-end gap-2">
      <Button variant="secondary" onClick={onPrev} disabled={step === 1}>
        Atrás
      </Button>
      <Button onClick={onNext} disabled={step === 3}>
        Continuar
      </Button>
    </footer>
  )
}
