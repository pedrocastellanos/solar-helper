import { DAYS_PER_MONTH, MID_MONTH_DAY, ROOF_TYPES, TRACKER_FACTOR } from '@/constants/solar'
import { clamp } from '@/lib/math'

function seasonMultiplier(season, monthIndex, latitude) {
  if (season === 'Anual') return 1
  const northSets = {
    Primavera: [2, 3, 4],
    Verano: [5, 6, 7],
    Otoño: [8, 9, 10],
    Invierno: [11, 0, 1],
  }
  const southSets = {
    Primavera: [8, 9, 10],
    Verano: [11, 0, 1],
    Otoño: [2, 3, 4],
    Invierno: [5, 6, 7],
  }
  const active = (latitude >= 0 ? northSets : southSets)[season] ?? []
  return active.includes(monthIndex) ? 1.08 : 0.96
}

export function calculateSolarModel(form) {
  const latitude = Number(form.lat)
  const latitudeRad = (latitude * Math.PI) / 180
  const losses = Object.values(form.losses).reduce((acc, v) => acc + v, 0)
  const performanceRatio = clamp(1 - losses / 100, 0.55, 0.95)
  const trackerFactor = TRACKER_FACTOR[form.tracker]

  const monthly = MID_MONTH_DAY.map((day, index) => {
    const declination = (23.45 * Math.PI) / 180 * Math.sin((2 * Math.PI * (284 + day)) / 365)
    const solarExposure = clamp(Math.cos(latitudeRad - declination), 0.12, 0.98)
    const irradiationDaily = 1.7 + 5.5 * solarExposure
    const seasonal = seasonMultiplier(form.season, index, latitude)
    const value = form.kwp * irradiationDaily * DAYS_PER_MONTH[index] * performanceRatio * trackerFactor * seasonal
    return Math.round(value)
  })

  const annualAc = monthly.reduce((sum, value) => sum + value, 0)
  const annualDc = Math.round(annualAc / performanceRatio)
  const roof = ROOF_TYPES.find((item) => item.id === form.roofType)
  const baseTilt = clamp(Math.abs(latitude) * 0.76 + 3, 8, 45)
  const seasonOffset = { Primavera: -2, Verano: -10, Otoño: 2, Invierno: 10, Anual: 0 }[form.season] ?? 0
  const recommendedTilt = clamp(baseTilt + seasonOffset, 5, roof?.maxTilt ?? 45)
  const southFacing = latitude >= 0 ? 180 : 0
  const eastWestShift = { Primavera: 0, Verano: -8, Otoño: 4, Invierno: 8, Anual: 0 }[form.season] ?? 0
  const recommendedAzimuth = ((southFacing + eastWestShift) % 360 + 360) % 360

  const totalLossFactor = clamp(1 - losses / 100, 0.55, 0.95)
  const fixedAc = Math.max(1, Math.round((annualAc / trackerFactor) * totalLossFactor))
  const trackerAnnual = {
    fixed: fixedAc,
    oneAxis: Math.round(fixedAc * TRACKER_FACTOR.oneAxis),
    twoAxis: Math.round(fixedAc * TRACKER_FACTOR.twoAxis),
  }
  const trackerIncrementPct = {
    fixed: 0,
    oneAxis: Math.round(((trackerAnnual.oneAxis / Math.max(1, trackerAnnual.fixed)) - 1) * 100),
    twoAxis: Math.round(((trackerAnnual.twoAxis / Math.max(1, trackerAnnual.fixed)) - 1) * 100),
  }

  return {
    monthly,
    annualAc,
    annualDc,
    losses,
    tilt: Math.round(recommendedTilt),
    azimuth: recommendedAzimuth,
    trackerAnnual,
    trackerIncrementPct,
  }
}
