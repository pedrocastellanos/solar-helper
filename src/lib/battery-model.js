import { clamp } from '@/lib/math'

const DEFAULT_LOADS = [
  { id: 'nevera', name: 'Nevera', watts: 180, quantity: 1, hoursOn: 24 },
  { id: 'luces-led', name: 'Luces LED', watts: 12, quantity: 8, hoursOn: 6 },
  { id: 'ventilador', name: 'Ventilador', watts: 75, quantity: 2, hoursOn: 8 },
]

export function getDefaultLoads() {
  return DEFAULT_LOADS.map((item) => ({ ...item }))
}

export function calculateBatteryModel({ form, solar }) {
  const inverterKw = Math.max(0.1, Number(form.inverterPowerKw) || 0.1)
  const batteryVoltage = Math.max(12, Number(form.batteryVoltage) || 12)
  const batteryAh = Math.max(1, Number(form.batteryAh) || 1)
  const batteryCount = Math.max(1, Number(form.batteryCount) || 1)
  const dod = clamp(Number(form.batteryDodPct) || 80, 20, 100)
  const roundTripEfficiency = clamp(Number(form.batteryEfficiencyPct) || 92, 60, 100)

  const bankNominalKwh = (batteryVoltage * batteryAh * batteryCount) / 1000
  const usableKwh = bankNominalKwh * (dod / 100) * (roundTripEfficiency / 100)
  const maxInstantLoadKw = inverterKw * 0.9

  const loads = Array.isArray(form.loads) ? form.loads : []
  const fallbackHours = Math.max(1, Number(form.nightDemandHours) || 8)

  const nightDemandKwh = loads.reduce((sum, item) => {
    const loadKw = ((item.watts || 0) * (item.quantity || 0)) / 1000
    const hoursOn = Math.max(0, Number(item.hoursOn) || fallbackHours)
    return sum + loadKw * hoursOn
  }, 0)
  const nightCoveragePct = nightDemandKwh > 0 ? clamp((usableKwh / nightDemandKwh) * 100, 0, 100) : 100

  const autonomyByLoad = loads.map((item) => {
    const loadKw = ((item.watts || 0) * (item.quantity || 0)) / 1000
    const runtimeHours = loadKw > 0 ? usableKwh / loadKw : 0
    const configuredHours = Math.max(0, Number(item.hoursOn) || fallbackHours)
    const configuredEnergyKwh = loadKw * configuredHours
    return {
      ...item,
      loadKw,
      runtimeHours,
      configuredHours,
      configuredEnergyKwh,
    }
  })

  const solarDailyAvgKwh = solar?.annualAc ? solar.annualAc / 365 : 0
  const rechargeHoursFromSolar = solarDailyAvgKwh > 0 ? usableKwh / (solarDailyAvgKwh / 5) : 0

  return {
    inverterKw,
    maxInstantLoadKw,
    bankNominalKwh,
    usableKwh,
    nightDemandKwh,
    nightCoveragePct,
    autonomyByLoad,
    rechargeHoursFromSolar,
  }
}
