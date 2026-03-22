import { Suspense, use } from 'react'

import { StepResults } from '@/components/steps/StepResults'
import { HelpInfo } from '@/components/common/HelpInfo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppState } from '@/hooks/use-app-state'
import { getPvgisBundleCached } from '@/lib/pvgis-service'

const PVGIS_HELP = {
  fixedAnnual: 'Estimación total de la energía que el sistema generará en un año si los paneles están en posición fija. Se calcula evaluando la irradiancia, temperatura y pérdidas por cableado o polvo.',
  oneAxisAnnual: 'Energía anual proyectada si los paneles se instalan sobre un eje móvil que sigue al sol de oriente a poniente durante el día. Suele incrementar la producción matutina y vespertina.',
  twoAxisAnnual: 'Energía anual calculada para un sistema con seguimiento astronómico total (dos ejes). Los paneles siempre apuntarán directamente al sol, logrando el máximo desempeño técnico posible.',
  ed: 'Producción diaria promedio de energía eléctrica en corriente alterna del sistema fijo. Es útil para estimar la entrega diaria típica en condiciones promedio del histórico meteorológico.',
  hid: 'Irradiación diaria promedio sobre el plano del generador (H(i)_d). Resume cuánta energía solar por metro cuadrado llega al panel en un día típico.',
  him: 'Irradiación mensual promedio sobre el plano del generador (H(i)_m). Muestra la energía solar acumulada por metro cuadrado para un mes representativo.',
  hiy: 'Irradiación global anual recibida sobre el plano inclinado de los paneles (H(i)_y). Es un sumatorio vital para saber la "materia prima solar" con la que cuenta la instalación en esa ubicación exacta.',
  sdm: 'Variabilidad mensual de la producción (SD_m). Indica cuánto puede variar la energía entre meses equivalentes de distintos años históricos.',
  sdy: 'Desviación estándar de la producción anual. Refleja qué tanto podría fluctuar la generación año tras año debido a años inusualmente nublados o extremadamente soleados.',
  aoiLoss: 'Pérdica óptica por el Ángulo de Incidencia (AOI). Ocurre cuando los rayos solares no impactan perpendicularmente el cristal del panel, causando que parte de la luz se refleje en lugar de penetrar la celda.',
  tgLoss: 'Efecto térmico. A medida que la temperatura del panel aumenta por encima de 25°C, el silicio reduce su eficiencia geométrica al convertir radiación en electricidad.',
  totalLoss: 'Aglomera todas las ineficiencias del sistema (cables, sombras, inversores, temperatura, reflexión y suciedad ambiental) calculadas minuciosamente por la base de datos de PVGIS.',
  gain1: 'Comparativa financiera que muestra exactamente en qué porcentaje mejora tu rendimiento anual al invertir en una estructura de seguimiento de 1 eje frente a un anclaje fijo sobre techo o suelo.',
  gain2: 'Porcentaje extra de energía captada al usar seguidores de 2 ejes. Generalmente se evalúa si este margen extra justifica el elevado costo de mantenimiento mecánico del motor dual.',
  tmy: 'Año Meteorológico Típico (TMY). Es un compendio estadístico de más de una década de datos meteorológicos condensados en un sólo año "representativo" de 8760 horas, excelente para simulaciones bancarias.',
  mrRows: 'Datos Mensuales (MRcalc) que consolidan las variables solares promedio de todos los eneros, febreros, etc. a lo largo de los años históricos recopilados. Se obtienen usualmente 12 filas.',
  mrHorizontal: 'Irradiación global promedio que cae mensualmente en una superficie plana paralela al nivel del suelo.',
  mrOptimal: 'Irradiación global promedio capturada mensualmente gracias a que los paneles están inclinados en su ángulo matemático más productivo para esa latitud puntual.',
  drRows: 'Perfil Diario de Irradiación (DRcalc) que expone el comportamiento del sol hora por hora durante un mes específico (ej: enero a diciembre). Devuelve 24 muestras temporales para el día tipo del mes.',
  drPeak: 'La cresta máxima de radiación solar (vatios por metro cuadrado) que logra tocar el panel en el instante de mayor esplendor del medio día.',
  drTemp: 'Promedio de temperatura ambiental reportada a 2 metros de altura sobre el suelo en esa coordenada GPS, dato clave para calibrar las caídas térmicas del equipamiento inversor a medio día.',
}

function MetricTitle({ text, help }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {text}
      <HelpInfo text={help} />
    </span>
  )
}

function PvgisResultsPanel({ resource }) {
  const pvgis = use(resource)

  if (!pvgis || pvgis.disabled) return null
  if (pvgis.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PVGIS profesional (API)</CardTitle>
          <CardDescription>No se pudo completar la consulta.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{pvgis.error}</p>
        </CardContent>
      </Card>
    )
  }

  const fixedPv = pvgis.summary?.pvcalc?.fixed
  const oneAxisPv = pvgis.summary?.pvcalc?.oneAxis
  const twoAxisPv = pvgis.summary?.pvcalc?.twoAxis
  const pvTotals = pvgis.summary?.pvcalc?.rawTotals?.fixed ?? {}
  const oneAxisGainPct = typeof fixedPv === 'number' && typeof oneAxisPv === 'number' && fixedPv > 0 ? ((oneAxisPv / fixedPv - 1) * 100) : null
  const twoAxisGainPct = typeof fixedPv === 'number' && typeof twoAxisPv === 'number' && fixedPv > 0 ? ((twoAxisPv / fixedPv - 1) * 100) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos más detallados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Generación estática anual" help={PVGIS_HELP.fixedAnnual} /></p>
            <p className="text-lg font-semibold">{typeof fixedPv === 'number' ? `${fixedPv.toLocaleString('es-ES')} kWh` : 'N/D'}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Seguidor Eje Simple anual" help={PVGIS_HELP.oneAxisAnnual} /></p>
            <p className="text-lg font-semibold">{typeof oneAxisPv === 'number' ? `${oneAxisPv.toLocaleString('es-ES')} kWh` : 'N/D'}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Seguidor Eje Doble anual" help={PVGIS_HELP.twoAxisAnnual} /></p>
            <p className="text-lg font-semibold">{typeof twoAxisPv === 'number' ? `${twoAxisPv.toLocaleString('es-ES')} kWh` : 'N/D'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Producción diaria promedio" help={PVGIS_HELP.ed} /></p>
            <p className="text-base font-semibold">{typeof pvTotals?.E_d === 'number' ? `${pvTotals.E_d.toLocaleString('es-ES')} kWh/día` : 'N/D'}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Irradiación diaria en plano" help={PVGIS_HELP.hid} /></p>
            <p className="text-base font-semibold">{typeof pvTotals?.['H(i)_d'] === 'number' ? `${pvTotals['H(i)_d'].toLocaleString('es-ES')} kWh/m²·día` : 'N/D'}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Irradiación mensual en plano" help={PVGIS_HELP.him} /></p>
            <p className="text-base font-semibold">{typeof pvTotals?.['H(i)_m'] === 'number' ? `${pvTotals['H(i)_m'].toLocaleString('es-ES')} kWh/m²·mes` : 'N/D'}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Variabilidad mensual" help={PVGIS_HELP.sdm} /></p>
            <p className="text-base font-semibold">{typeof pvTotals?.SD_m === 'number' ? `${pvTotals.SD_m.toLocaleString('es-ES')} kWh` : 'N/D'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Irradiación anual en plano" help={PVGIS_HELP.hiy} /></p>
            <p className="text-base font-semibold">{typeof pvTotals?.['H(i)_y'] === 'number' ? `${pvTotals['H(i)_y'].toLocaleString('es-ES')} kWh/m²·año` : 'N/D'}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Variabilidad interanual" help={PVGIS_HELP.sdy} /></p>
            <p className="text-base font-semibold">{typeof pvTotals?.SD_y === 'number' ? `${pvTotals.SD_y.toLocaleString('es-ES')} kWh` : 'N/D'}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Pérdida AOI / térmica" help={`${PVGIS_HELP.aoiLoss} ${PVGIS_HELP.tgLoss}`} /></p>
            <p className="text-base font-semibold">
              {typeof pvTotals?.l_aoi === 'number' && typeof pvTotals?.l_tg === 'number' ? `${pvTotals.l_aoi}% / ${pvTotals.l_tg}%` : 'N/D'}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Pérdida total PVGIS" help={PVGIS_HELP.totalLoss} /></p>
            <p className="text-base font-semibold">{typeof pvTotals?.l_total === 'number' ? `${pvTotals.l_total}%` : 'N/D'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Ganancia 1 eje vs fijo" help={PVGIS_HELP.gain1} /></p>
            <p className="text-base font-semibold">{oneAxisGainPct == null ? 'N/D' : `+${oneAxisGainPct.toFixed(1)}%`}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p><MetricTitle text="Ganancia 2 ejes vs fijo" help={PVGIS_HELP.gain2} /></p>
            <p className="text-base font-semibold">{twoAxisGainPct == null ? 'N/D' : `+${twoAxisGainPct.toFixed(1)}%`}</p>
          </div>
        </div>

        {Array.isArray(pvgis.warnings) && pvgis.warnings.length > 0 ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
            {pvgis.warnings.join(' ')}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function PvgisLoadingPanel() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center justify-center py-14 gap-6">
          <div className="lds-circle text-primary"><div></div></div>
          <p className="text-sm text-muted-foreground animate-pulse text-center">Cargando resultados...</p>
        </div>
      </div>
    </div>
  )
}

export function ResultsPage() {
  const state = useAppState()
  const pvgisResource = getPvgisBundleCached({ form: state.form, solar: state.solar })

  return (
    <Suspense fallback={<PvgisLoadingPanel />}>
      <StepResults
        pvgisResource={pvgisResource}
        pvgisPanel={<PvgisResultsPanel resource={pvgisResource} />}
      />
    </Suspense>
  )
}
