import { PVGIS_DEFAULT_CONFIG } from '@/constants/solar'

function toPvgisAspect(azimuthDegrees) {
  const normalized = ((Number(azimuthDegrees) % 360) + 360) % 360
  return normalized - 180
}

function getNumericFromObject(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return null
}

function firstArrayValue(data) {
  if (!Array.isArray(data) || data.length === 0) return null
  return data[0]
}

function summarizePvcalc(pvcalc) {
  const totals = pvcalc?.outputs?.totals ?? {}
  const monthly = pvcalc?.outputs?.monthly ?? {}
  const mapMonthlyEnergy = (rows) =>
    Array.isArray(rows)
      ? rows
        .map((row) => Number(row?.E_m))
        .filter((value) => Number.isFinite(value))
      : []
  const fixed = getNumericFromObject(totals.fixed ?? {}, ['E_y', 'Ey'])
  const oneAxis =
    getNumericFromObject(totals.inclined_axis ?? {}, ['E_y', 'Ey']) ??
    getNumericFromObject(totals.vertical_axis ?? {}, ['E_y', 'Ey'])
  const twoAxis = getNumericFromObject(totals.twoaxis ?? {}, ['E_y', 'Ey']) ?? getNumericFromObject(totals.two_axis ?? {}, ['E_y', 'Ey'])
  return {
    fixed,
    oneAxis,
    twoAxis,
    monthly: {
      fixed: mapMonthlyEnergy(monthly.fixed),
      oneAxis: mapMonthlyEnergy(monthly.inclined_axis ?? monthly.vertical_axis),
      twoAxis: mapMonthlyEnergy(monthly.twoaxis ?? monthly.two_axis),
    },
    rawTotals: totals,
  }
}

function summarizeTmy(tmy) {
  const outputs = tmy?.outputs ?? {}
  const tmyHourly = outputs?.tmy_hourly
  return {
    hasTmy: Boolean(tmyHourly),
    rows: Array.isArray(tmyHourly) ? tmyHourly.length : 0,
    firstRow: firstArrayValue(tmyHourly) ?? null,
  }
}

function summarizeMrcalc(mrcalc) {
  const monthly = Array.isArray(mrcalc?.outputs?.monthly) ? mrcalc.outputs.monthly : []
  const monthlyRows = monthly.length
  const avgHorizontalIrrad =
    monthlyRows > 0 ? monthly.reduce((sum, item) => sum + (Number(item?.['H(h)_m']) || 0), 0) / monthlyRows : null
  const avgOptimalPlaneIrrad =
    monthlyRows > 0 ? monthly.reduce((sum, item) => sum + (Number(item?.['H(i_opt)_m']) || 0), 0) / monthlyRows : null
  const avgTemp = monthlyRows > 0 ? monthly.reduce((sum, item) => sum + (Number(item?.T2m) || 0), 0) / monthlyRows : null

  return {
    monthlyRows,
    avgHorizontalIrrad,
    avgOptimalPlaneIrrad,
    avgTemp,
  }
}

function summarizeDrcalc(drcalc) {
  const daily = Array.isArray(drcalc?.outputs?.daily_profile) ? drcalc.outputs.daily_profile : []
  const rows = daily.length
  const peakGlobalIrrad =
    rows > 0
      ? daily.reduce((max, item) => Math.max(max, Number(item?.['G(i)']) || 0), 0)
      : null
  const avgTemp =
    rows > 0 ? daily.reduce((sum, item) => sum + (Number(item?.T2m) || 0), 0) / rows : null
  return {
    rows,
    peakGlobalIrrad,
    avgTemp,
  }
}

export function buildPvgisRequestConfig({ form, solar }) {
  const baseParams = {
    lat: Number(form.lat),
    lon: Number(form.lon),
    outputformat: 'json',
    usehorizon: PVGIS_DEFAULT_CONFIG.useHorizon ? 1 : 0,
    raddatabase: PVGIS_DEFAULT_CONFIG.radiationDb,
  }

  const pvcalcParams = {
    ...baseParams,
    peakpower: Number(form.kwp),
    loss: Number(solar.losses.toFixed(1)),
    fixed: 1,
    angle: Number(solar.tilt),
    aspect: Number(toPvgisAspect(solar.azimuth).toFixed(1)),
    inclined_axis: 1,
    inclined_optimum: 1,
    twoaxis: 1,
    optimalangles: PVGIS_DEFAULT_CONFIG.optimalAngles ? 1 : 0,
  }

  const tmyParams = {
    lat: Number(form.lat),
    lon: Number(form.lon),
    outputformat: 'json',
    usehorizon: PVGIS_DEFAULT_CONFIG.useHorizon ? 1 : 0,
  }

  return {
    version: PVGIS_DEFAULT_CONFIG.version,
    pvcalcParams,

    tmyParams,
    warnings: [],
  }
}

export function summarizePvgisBundle({ pvcalc, tmy }) {
  return {
    pvcalc: summarizePvcalc(pvcalc),
    tmy: summarizeTmy(tmy),
  }
}

export function summarizeExtendedPvgisBundle({ mrcalc, drcalc }) {
  return {
    mrcalc: summarizeMrcalc(mrcalc),
    drcalc: summarizeDrcalc(drcalc),
  }
}

