export const STEPS = ['Ubicación', 'Configuración', 'Resultados']
export const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
export const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
export const MID_MONTH_DAY = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349]
export const TRACKER_FACTOR = { fixed: 1, oneAxis: 1.2, twoAxis: 1.35 }
export const TRACKER_GAIN = { fixed: '0%', oneAxis: '+20%', twoAxis: '+35%' }
export const DEFAULT_CUBA_COORDS = { lat: 21.5218, lon: -77.7812 }

export const ROOF_TYPES = [
  { id: 'teja-curva', name: 'Teja curva', maxTilt: 35 },
  { id: 'teja-plana', name: 'Teja plana', maxTilt: 30 },
  { id: 'chapa-metalica', name: 'Chapa metálica', maxTilt: 45 },
  { id: 'cubierta-plana', name: 'Cubierta plana (lastre)', maxTilt: 10 },
  { id: 'pizarra', name: 'Tejado de pizarra', maxTilt: 40 },
]

export const LOSS_LABELS = {
  temperature: 'Temperatura',
  dirt: 'Suciedad',
  wiring: 'Cableado',
  inverter: 'Inversor',
  mismatch: 'Desajuste (mismatch)',
}

export const TOOLTIPS = {
  temperature: 'Pérdida por aumento de temperatura del módulo FV.',
  dirt: 'Pérdida por polvo/suciedad acumulada en paneles.',
  wiring: 'Pérdida resistiva en cableado DC/AC.',
  inverter: 'Pérdida por eficiencia de conversión del inversor.',
  mismatch: 'Pérdida por diferencias eléctricas entre módulos.',
}

export const CONFIG_HELP = {
  roofType:
    'Indica la estructura de cubierta donde se montarán los paneles. Define límites de inclinación recomendada.',
  sizing:
    'Permite definir si el diseño parte de la potencia objetivo (kWp) o de la superficie disponible (m²).',
  kwp: 'Potencia pico total del sistema fotovoltaico en condiciones estándar (STC).',
  area: 'Área útil disponible para instalar paneles solares en la cubierta.',
  losses:
    'Son factores técnicos que reducen la energía final entregada. Ajustarlos permite simular condiciones reales.',
  pvgis:
    'El cálculo profesional usa PVGIS 5.3 con ERA5, ángulos óptimos y rango temporal completo por defecto.',
}

export const PVGIS_DEFAULT_CONFIG = {
  version: 'v5_3',
  radiationDb: 'PVGIS-ERA5',
  useHorizon: false,
  optimalAngles: true,
}
