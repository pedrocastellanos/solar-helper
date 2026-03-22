import { HelpInfo } from '@/components/common/HelpInfo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CONFIG_HELP, LOSS_LABELS, ROOF_TYPES, TOOLTIPS } from '@/constants/solar'
import { useAppState } from '@/hooks/use-app-state'
import { recalculateSizing } from '@/lib/configuration-model'

export function StepConfiguration() {
  const state = useAppState()
  const { form, sizingHint } = state

  const updateLoads = (updater) => {
    state.setForm((current) => {
      const nextLoads = updater(current.loads ?? [])
      return { ...current, loads: nextLoads }
    })
  }

  const updateFromPanels = (updates) => state.setForm((current) => recalculateSizing(current, updates))

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tipo de tejado
            <HelpInfo text={CONFIG_HELP.roofType} />
          </CardTitle>
          <CardDescription>La inclinación recomendada respeta el límite técnico del tejado seleccionado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ROOF_TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => state.setForm((current) => ({ ...current, roofType: item.id }))}
              className={`rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${form.roofType === item.id ? 'border-primary bg-primary/10 shadow' : 'border-border bg-background hover:border-primary/40'
                }`}
            >
              <p className="font-semibold">{item.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">Inclinación máx: {item.maxTilt}°</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Dimensionamiento
            <HelpInfo text={CONFIG_HELP.sizing} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant={form.sizingMode === 'kwp' ? 'default' : 'outline'} onClick={() => state.setForm((current) => recalculateSizing(current, { sizingMode: 'kwp' }))}>
              Quiero instalar X kWp
            </Button>
            <Button variant={form.sizingMode === 'area' ? 'default' : 'outline'} onClick={() => state.setForm((current) => recalculateSizing(current, { sizingMode: 'area' }))}>
              Tengo X m² disponibles
            </Button>
            <Button variant={form.sizingMode === 'panels' ? 'default' : 'outline'} onClick={() => state.setForm((current) => recalculateSizing(current, { sizingMode: 'panels' }))} className="sm:col-span-2">
              Quiero usar X paneles
            </Button>
          </div>

          {form.sizingMode === 'kwp' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-2">
                  Potencia instalada objetivo (kWp)
                  <HelpInfo text={CONFIG_HELP.kwp} />
                </Label>
                <Input type="number" min="0.5" step="0.1" value={form.kwp} onChange={(event) => state.setForm((current) => recalculateSizing(current, { kwp: Number(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Potencia por panel (W)</Label>
                <Input
                  type="number"
                  min="50"
                  step="5"
                  value={form.panelPowerW}
                  onChange={(event) => updateFromPanels({ panelPowerW: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ancho panel (m)</Label>
                <Input
                  type="number"
                  min="0.3"
                  step="0.01"
                  value={form.panelWidthM}
                  onChange={(event) => updateFromPanels({ panelWidthM: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alto panel (m)</Label>
                <Input
                  type="number"
                  min="0.3"
                  step="0.01"
                  value={form.panelHeightM}
                  onChange={(event) => updateFromPanels({ panelHeightM: Number(event.target.value) })}
                />
              </div>
            </div>
          ) : form.sizingMode === 'panels' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cantidad de paneles</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.panelCount}
                  onChange={(event) => updateFromPanels({ panelCount: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Potencia por panel (W)</Label>
                <Input
                  type="number"
                  min="50"
                  step="5"
                  value={form.panelPowerW}
                  onChange={(event) => updateFromPanels({ panelPowerW: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ancho panel (m)</Label>
                <Input
                  type="number"
                  min="0.3"
                  step="0.01"
                  value={form.panelWidthM}
                  onChange={(event) => updateFromPanels({ panelWidthM: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alto panel (m)</Label>
                <Input
                  type="number"
                  min="0.3"
                  step="0.01"
                  value={form.panelHeightM}
                  onChange={(event) => updateFromPanels({ panelHeightM: Number(event.target.value) })}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-2">
                  Superficie disponible (m²)
                  <HelpInfo text={CONFIG_HELP.area} />
                </Label>
                <Input type="number" min="1" step="0.1" value={form.area} onChange={(event) => state.setForm((current) => recalculateSizing(current, { area: Number(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Potencia por panel (W)</Label>
                <Input
                  type="number"
                  min="50"
                  step="5"
                  value={form.panelPowerW}
                  onChange={(event) => updateFromPanels({ panelPowerW: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ancho panel (m)</Label>
                <Input
                  type="number"
                  min="0.3"
                  step="0.01"
                  value={form.panelWidthM}
                  onChange={(event) => updateFromPanels({ panelWidthM: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alto panel (m)</Label>
                <Input
                  type="number"
                  min="0.3"
                  step="0.01"
                  value={form.panelHeightM}
                  onChange={(event) => updateFromPanels({ panelHeightM: Number(event.target.value) })}
                />
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">{sizingHint}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de baterías y consumo</CardTitle>
          <CardDescription>Configura inversor, banco de baterías y equipos para estimar cobertura nocturna y autonomía.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Potencia inversor (kW)</Label>
              <Input type="number" min="0.5" step="0.1" value={form.inverterPowerKw} onChange={(e) => state.setForm((current) => ({ ...current, inverterPowerKw: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Tensión batería (V)</Label>
              <Input type="number" min="12" step="0.1" value={form.batteryVoltage} onChange={(e) => state.setForm((current) => ({ ...current, batteryVoltage: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Capacidad batería (Ah)</Label>
              <Input type="number" min="1" step="1" value={form.batteryAh} onChange={(e) => state.setForm((current) => ({ ...current, batteryAh: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Cantidad de baterías</Label>
              <Input type="number" min="1" step="1" value={form.batteryCount} onChange={(e) => state.setForm((current) => ({ ...current, batteryCount: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Prof. descarga DoD (%)</Label>
              <Input type="number" min="20" max="100" step="1" value={form.batteryDodPct} onChange={(e) => state.setForm((current) => ({ ...current, batteryDodPct: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Eficiencia batería (%)</Label>
              <Input type="number" min="60" max="100" step="1" value={form.batteryEfficiencyPct} onChange={(e) => state.setForm((current) => ({ ...current, batteryEfficiencyPct: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Horas de consumo nocturno previstas</Label>
            <Input type="number" min="1" max="24" step="1" value={form.nightDemandHours} onChange={(e) => state.setForm((current) => ({ ...current, nightDemandHours: Number(e.target.value) }))} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Equipos de consumo</Label>
              <Button type="button" variant="outline" size="sm" onClick={() =>
                updateLoads((loads) => [
                  ...loads,
                  { id: `load-${Date.now()}`, name: 'Nuevo equipo', watts: 100, quantity: 1, hoursOn: 4 },
                ])
              }>
                Agregar equipo
              </Button>
            </div>
            <div className="hidden rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:grid sm:grid-cols-16 sm:gap-2">
              <span className="sm:col-span-5">Equipo (nombre o descripción)</span>
              <span className="sm:col-span-3">Potencia por unidad (W)</span>
              <span className="sm:col-span-2">Cantidad</span>
              <span className="sm:col-span-3">Horas encendido</span>
              <span className="sm:col-span-3 text-right">Acción</span>
            </div>
            {form.loads.map((load, index) => (
              <div key={load.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-16">
                <div className="space-y-1 sm:col-span-5">
                  <Label className="text-xs text-muted-foreground sm:hidden">Equipo</Label>
                  <Input className="sm:col-span-5" value={load.name} onChange={(e) =>
                    updateLoads((loads) =>
                      loads.map((item, idx) => {
                        if (idx !== index) return item
                        return { ...item, name: e.target.value }
                      }),
                    )
                  } placeholder="Ej: Refrigerador, TV, router..." />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground sm:hidden">Potencia por unidad (W)</Label>
                  <Input className="sm:col-span-3" type="number" min="1" step="1" value={load.watts} onChange={(e) =>
                    updateLoads((loads) =>
                      loads.map((item, idx) => {
                        if (idx !== index) return item
                        return { ...item, watts: Number(e.target.value) }
                      }),
                    )
                  } placeholder="Ej: 150" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground sm:hidden">Cantidad</Label>
                  <Input className="sm:col-span-2" type="number" min="1" step="1" value={load.quantity} onChange={(e) =>
                    updateLoads((loads) =>
                      loads.map((item, idx) => {
                        if (idx !== index) return item
                        return { ...item, quantity: Number(e.target.value) }
                      }),
                    )
                  } placeholder="Ej: 2" />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground sm:hidden">Horas encendido</Label>
                  <Input
                    className="sm:col-span-3"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={load.hoursOn ?? ''}
                    onChange={(e) =>
                      updateLoads((loads) =>
                        loads.map((item, idx) => {
                          if (idx !== index) return item
                          return { ...item, hoursOn: Number(e.target.value) }
                        }),
                      )
                    }
                    placeholder="Ej: 6"
                  />
                </div>
                <Button type="button" variant="ghost" className="sm:col-span-3" onClick={() => updateLoads((loads) => loads.filter((_, idx) => idx !== index))}>
                  Quitar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pérdidas avanzadas
            <HelpInfo text={CONFIG_HELP.losses} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(form.losses).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground/80">
                  {LOSS_LABELS[key] ?? key}
                  <HelpInfo text={TOOLTIPS[key]} />
                </span>
                <span className="text-muted-foreground">{value.toFixed(1)}%</span>
              </div>
              <Slider value={[value]} min={0} max={key === 'inverter' ? 8 : 5} step={0.1} onValueChange={([v]) => state.updateLoss(key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
