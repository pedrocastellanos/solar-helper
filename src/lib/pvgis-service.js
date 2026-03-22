import { pvgisGet } from '@/lib/pvgis-client'
import { PVGIS_DEFAULT_CONFIG } from '@/constants/solar'
import { buildPvgisRequestConfig, summarizeExtendedPvgisBundle, summarizePvgisBundle } from '@/lib/pvgis-model'

const promiseCache = new Map()

function pickCacheFields(form, solar) {
  return {
    lat: Number(form.lat).toFixed(4),
    lon: Number(form.lon).toFixed(4),
    kwp: Number(form.kwp).toFixed(2),
    tracker: form.tracker,
    losses: Number(solar.losses).toFixed(2),
  }
}

export function getPvgisCacheKey({ form, solar }) {
  return JSON.stringify(pickCacheFields(form, solar))
}

export async function getPvgisBundle({ form, solar }) {
  const request = buildPvgisRequestConfig({ form, solar })
  const { version, pvcalcParams, tmyParams, warnings } = request
  const mrcalcParams = {
    lat: Number(form.lat),
    lon: Number(form.lon),
    horirrad: 1,
    optrad: 1,
    selectrad: 1,
    angle: Number(solar.tilt),
    mr_dni: 1,
    avtemp: 1,
    outputformat: 'json',
  }
  const drcalcParams = {
    lat: Number(form.lat),
    lon: Number(form.lon),
    month: 0,
    angle: Number(solar.tilt),
    aspect: 0,
    global: 1,
    clearsky: 1,
    showtemperatures: 1,
    outputformat: 'json',
  }

  const [pvcalc, tmy, mrcalc, drcalc] = await Promise.all([
    pvgisGet({ version, tool: 'PVcalc', params: pvcalcParams }),
    pvgisGet({ version, tool: 'tmy', params: tmyParams }),
    pvgisGet({ version, tool: 'MRcalc', params: mrcalcParams }),
    pvgisGet({ version, tool: 'DRcalc', params: drcalcParams }),
  ])

  const summary = summarizePvgisBundle({ pvcalc, tmy })
  const extended = summarizeExtendedPvgisBundle({ mrcalc, drcalc })
  return {
    disabled: false,
    fetchedAt: new Date().toISOString(),
    version,
    database: PVGIS_DEFAULT_CONFIG.radiationDb,
    warnings,
    request: {
      useHorizon: PVGIS_DEFAULT_CONFIG.useHorizon,
      optimalAngles: PVGIS_DEFAULT_CONFIG.optimalAngles,
      hasUserHorizon: false,
      hasOffgrid: false,
    },
    summary,
    extended,
  }
}

export function getPvgisBundleCached({ form, solar }) {
  const key = getPvgisCacheKey({ form, solar })
  const existing = promiseCache.get(key)
  if (existing) return existing
  const promise = getPvgisBundle({ form, solar }).catch((error) => ({
    disabled: false,
    error: error instanceof Error ? error.message : 'Error desconocido consultando PVGIS',
  }))
  promiseCache.set(key, promise)
  return promise
}

