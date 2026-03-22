import { LocateFixed, MapPin, Search } from 'lucide-react'

import { LeafletMap } from '@/components/map/LeafletMap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppState } from '@/hooks/use-app-state'

export function StepLocation() {
  const state = useAppState()
  const { form, markerRef, locationStatus, geocodingError, isSearchingAddress, isLocating } = state

  return (
    <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Ubicación del proyecto
          </CardTitle>
          <CardDescription>Haz clic en el mapa o arrastra el marcador para ajustar coordenadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-primary/30">
            <LeafletMap lat={form.lat} lon={form.lon} markerRef={markerRef} onPick={state.handleCoordinatePick} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de entrada</CardTitle>
          <CardDescription>{locationStatus || 'Sincroniza dirección, coordenadas y temporada para el cálculo.'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Dirección postal</Label>
            <div className="flex gap-2">
              <Input value={form.address} onChange={(event) => state.setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Ej: Calle Mayor 1, Madrid" />
              <Button variant="outline" size="icon" onClick={state.handleAddressSearch} disabled={isSearchingAddress}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Latitud</Label>
              <Input type="number" step="0.0001" value={form.lat} onChange={(event) => state.setForm((current) => ({ ...current, lat: Number(event.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Longitud</Label>
              <Input type="number" step="0.0001" value={form.lon} onChange={(event) => state.setForm((current) => ({ ...current, lon: Number(event.target.value) }))} />
            </div>
          </div>

          {geocodingError && <p className="text-sm text-[hsl(var(--solar-alert))]">{geocodingError}</p>}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={state.useCurrentLocation} disabled={isLocating}>
              <LocateFixed className="mr-1 h-4 w-4" /> Ubicación actual
            </Button>
            <Button variant="outline" onClick={() => state.reverseGeocode(form.lat, form.lon)}>
              Actualizar dirección
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Temporada</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.season} onChange={(event) => state.setForm((current) => ({ ...current, season: event.target.value }))}>
              <option>Primavera</option>
              <option>Verano</option>
              <option>Otoño</option>
              <option>Invierno</option>
              <option>Anual</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
