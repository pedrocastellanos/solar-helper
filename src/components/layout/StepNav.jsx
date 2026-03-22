import { ChevronRight } from 'lucide-react'

export function StepNav({ steps, step, onSetStep }) {
  return (
    <nav className="mx-auto grid w-full max-w-4xl gap-2 rounded-2xl border bg-card/70 p-3 shadow-sm backdrop-blur sm:grid-cols-3">
      {steps.map((label, index) => {
        const currentStep = index + 1
        const status = currentStep < step ? 'done' : currentStep === step ? 'active' : 'idle'
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSetStep(currentStep)}
            className={`group flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${
              status === 'active'
                ? 'border-primary bg-primary text-primary-foreground shadow'
                : status === 'done'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-background text-foreground hover:border-primary/40'
            }`}
          >
            <span className="font-medium">
              {currentStep}. {label}
            </span>
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        )
      })}
    </nav>
  )
}
