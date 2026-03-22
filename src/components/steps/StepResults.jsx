import { use, useMemo } from 'react'
import { CheckCircle2, Radar, SunMedium, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpInfo } from '@/components/common/HelpInfo'
import { MONTHS, LOSS_LABELS, TOOLTIPS, TRACKER_GAIN } from '@/constants/solar'
import { useAppState } from '@/hooks/use-app-state'
import { buildStepResultsModel } from '@/lib/step-results-model'

export function StepResults({ pvgisPanel = null, pvgisResource = null }) {
  const state = useAppState()
  const { form, solar, battery } = state
  const pvgis = pvgisResource ? use(pvgisResource) : null
  const apiPvcalc = pvgis?.summary?.pvcalc
  const {
    trackerAnnual,
    selectedMonthlySeries,
    selectedMaxMonthlyValue,
    fixedAnnual,
    selectedAnnual,
    selectedDeltaKwh,
    selectedDeltaPct,
    selectedMonthlyAvg,
    maxTrackerAnnual,
  } = useMemo(
    () => buildStepResultsModel({ form, solar, apiPvcalc }),
    [form, solar, apiPvcalc],
  )

  return (
    <section className="grid gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Cantidad de paneles', value: `${form.panelCount ?? '-'} uds`, icon: SunMedium },
          { label: 'kWp instalado', value: `${form.kwp.toFixed(2)} kWp`, icon: SunMedium },
          { label: 'Producción anual AC', value: `${selectedAnnual.toLocaleString('es-ES')} kWh`, icon: Zap },
          { label: 'Inclinación óptima', value: `${solar.tilt}°`, icon: Radar },
          { label: 'Orientación óptima', value: `${solar.azimuth}°`, icon: CheckCircle2 },
        ].map((item) => (
          <Card key={item.label} className="transition-transform duration-200 hover:-translate-y-1">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Producción mensual estimada</CardTitle>
          <CardDescription>Modelo dinámico según latitud, temporada, pérdidas y tipo de seguimiento.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {selectedMonthlySeries.map((value, index) => (
            <div key={MONTHS[index]} className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-muted-foreground">{value}</span>
              <div className="flex h-44 items-end">
                <div
                  className="w-4 rounded-t bg-linear-to-t from-primary to-[hsl(var(--solar-halo))] transition-all duration-300 hover:brightness-110"
                  style={{ height: `${(value / selectedMaxMonthlyValue) * 160}px` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{MONTHS[index]}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pérdidas del sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(form.losses).map(([key, value]) => (
              <div key={key} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
                <span className="text-muted-foreground" title={TOOLTIPS[key]}>
                  {LOSS_LABELS[key] ?? key}
                </span>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-[hsl(var(--solar-cool))]" style={{ width: `${Math.min(100, value * 12)}%` }} />
                </div>
                <strong className="text-foreground">{value.toFixed(1)}%</strong>
              </div>
            ))}
            <div className="grid grid-cols-[110px_1fr_auto] items-center gap-3 border-t pt-2 text-sm">
              <span className="font-medium">Total</span>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-[hsl(var(--solar-alert))]" style={{ width: `${Math.min(100, solar.losses * 5)}%` }} />
              </div>
              <strong>{solar.losses.toFixed(1)}%</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparador de seguimiento</CardTitle>
            <CardDescription className="space-y-2">
              <span className="inline-flex items-center gap-1">
                Fijo <HelpInfo text="Paneles con estructura estática. Menor complejidad y menor coste, pero menor captación energética." />
              </span>
              <span className="inline-flex items-center gap-1">
                1 eje <HelpInfo text="Seguimiento sobre un eje (habitualmente este-oeste). Mejora captación frente a fijo." />
              </span>
              <span className="inline-flex items-center gap-1">
                2 ejes <HelpInfo text="Seguimiento en azimut e inclinación. Máxima captación, mayor costo y mantenimiento." />
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Button variant={form.tracker === 'fixed' ? 'default' : 'outline'} onClick={() => state.setForm((current) => ({ ...current, tracker: 'fixed' }))}>
                Fijo
              </Button>
              <Button variant={form.tracker === 'oneAxis' ? 'default' : 'outline'} onClick={() => state.setForm((current) => ({ ...current, tracker: 'oneAxis' }))}>
                1 eje
              </Button>
              <Button variant={form.tracker === 'twoAxis' ? 'default' : 'outline'} onClick={() => state.setForm((current) => ({ ...current, tracker: 'twoAxis' }))}>
                2 ejes
              </Button>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-sm font-medium text-foreground">Resumen del modo seleccionado</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">Producción anual</p>
                  <p className="text-base font-semibold text-foreground">{selectedAnnual.toLocaleString('es-ES')} kWh</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Promedio mensual</p>
                  <p className="text-base font-semibold text-foreground">{selectedMonthlyAvg.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kWh</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Ganancia vs fijo</p>
                  <p className="text-base font-semibold text-primary">
                    {form.tracker === 'fixed' ? 'Base' : `+${selectedDeltaKwh.toLocaleString('es-ES')} kWh (+${selectedDeltaPct}%)`}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Incremento estimado actual: <span className="font-semibold text-primary">{TRACKER_GAIN[form.tracker]}</span></p>
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium text-foreground">Comparación anual por modo</p>
              {[
                { key: 'fixed', label: 'Fijo' },
                { key: 'oneAxis', label: 'Seguidor 1 eje' },
                { key: 'twoAxis', label: 'Seguidor 2 ejes' },
              ].map((item) => {
                const value = trackerAnnual[item.key] ?? 0
                const pct =
                  item.key === 'fixed'
                    ? 0
                    : Math.round(((value / Math.max(1, fixedAnnual)) - 1) * 100)
                const deltaKwh = Math.max(0, value - fixedAnnual)
                const isActive = form.tracker === item.key
                return (
                  <div key={item.key} className={`rounded-md border p-2 ${isActive ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{value.toLocaleString('es-ES')} kWh/año</p>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${(value / maxTrackerAnnual) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.key === 'fixed' ? 'Referencia base' : `+${deltaKwh.toLocaleString('es-ES')} kWh frente a fijo (+${pct}%)`}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {pvgisPanel}

      <Card>
        <CardHeader>
          <CardTitle>Baterías y autonomía</CardTitle>
          <CardDescription>Estimación de cobertura nocturna y autonomía por equipo según datos técnicos ingresados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Banco nominal</p>
              <p className="text-lg font-semibold">{battery.bankNominalKwh.toFixed(2)} kWh</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Energía utilizable</p>
              <p className="text-lg font-semibold">{battery.usableKwh.toFixed(2)} kWh</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Cobertura nocturna</p>
              <p className="text-lg font-semibold">{battery.nightCoveragePct.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Potencia máx recomendada inversor</p>
              <p className="text-lg font-semibold">{battery.maxInstantLoadKw.toFixed(2)} kW</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Demanda energética configurada: <strong>{battery.nightDemandKwh.toFixed(2)} kWh</strong> (sumando horas por equipo)
            </p>
            <p className="text-sm text-muted-foreground">
              Horas estimadas de recarga solar del banco: <strong>{battery.rechargeHoursFromSolar.toFixed(1)} h</strong>
            </p>
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Autonomía por equipo (si estuviera solo conectado)</p>
            {battery.autonomyByLoad.map((load) => (
              <div key={load.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-sm">
                <span className="text-muted-foreground">{load.name} ({load.quantity} × {load.watts} W)</span>
                <span>{load.configuredHours.toFixed(1)} h/d</span>
                <span>{load.configuredEnergyKwh.toFixed(2)} kWh/d</span>
                <strong>{load.runtimeHours.toFixed(1)} h</strong>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
