import { DEFAULT_CUBA_COORDS, PVGIS_DEFAULT_CONFIG } from '@/constants/solar'
import { getDefaultLoads } from '@/lib/battery-model'

export function createInitialForm() {
  return {
    address: '',
    lat: DEFAULT_CUBA_COORDS.lat,
    lon: DEFAULT_CUBA_COORDS.lon,
    season: 'Anual',
    roofType: 'teja-curva',
    sizingMode: 'kwp',
    kwp: 5.4,
    area: 12,
    panelCount: 10,
    panelPowerW: 540,
    panelWidthM: 1.13,
    panelHeightM: 2.28,
    inverterPowerKw: 5,
    batteryVoltage: 51.2,
    batteryAh: 100,
    batteryCount: 1,
    batteryDodPct: 80,
    batteryEfficiencyPct: 92,
    nightDemandHours: 8,
    loads: getDefaultLoads(),
    losses: { temperature: 2.5, dirt: 3, wiring: 2, inverter: 4, mismatch: 1.5 },
    tracker: 'fixed',
    pvgisVersion: PVGIS_DEFAULT_CONFIG.version,
  }
}
