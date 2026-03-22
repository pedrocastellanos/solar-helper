# Simulador Solar Web

Este proyecto es una aplicación web para estimar, de forma rápida y técnica, cómo se comportaría una instalación fotovoltaica en una ubicación concreta.

Además de calcular producción, también recomienda inclinación y orientación, compara tipos de seguimiento solar y ofrece una estimación base de baterías/autonomía.

Los datos de radiación y métricas solares se obtienen desde **PVGIS**, servicio oficial de la **Unión Europea** operado por el **Joint Research Centre (JRC) de la Comisión Europea**.

> Está pensado para **predimensionado** y análisis comparativo. Para un diseño final de ingeniería siempre hace falta validación en campo.

## Qué hace el sistema

- Selección de ubicación con mapa (OpenStreetMap).
- Configuración del sistema (kWp, área, pérdidas, tipo de cubierta, seguimiento).
- Dimensionamiento por paneles (cantidad, potencia y dimensiones).
- Producción mensual y anual estimada.
- Inclinación y azimut recomendados.
- Comparativa entre `fijo`, `1 eje` y `2 ejes`.
- Cálculo básico de baterías: energía útil, cobertura nocturna y autonomía por equipo.
- Integración profesional con **PVGIS (JRC, Comisión Europea)**: `PVcalc`, `tmy`, `MRcalc` y `DRcalc`.

## Stack técnico

- React 19 + Vite 8
- TailwindCSS 4
- wouter (ruteo SPA)
- react-leaflet + Leaflet (mapa)
- lucide-react (iconografía)

## Cómo se calcula la inclinación y orientación recomendada

La lógica vive en `src/lib/solar-model.js`.

### 1) Inclinación recomendada (tilt)

Primero se obtiene una base dependiente de latitud:

`tiltBase = clamp(|lat| * 0.76 + 3, 8, 45)`

Después se aplica un ajuste según temporada elegida:

- Primavera: `-2°`
- Verano: `-10°`
- Otoño: `+2°`
- Invierno: `+10°`
- Anual: `0°`

Finalmente se limita por restricciones reales:

- mínimo técnico: `5°`
- máximo por tipo de cubierta (`ROOF_TYPES.maxTilt`)

Resultado final:

`tiltRecomendada = clamp(tiltBase + ajusteEstacional, 5, maxTiltCubierta)`

### 2) Orientación recomendada (azimut)

Base por hemisferio:

- hemisferio norte: sur (`180°`)
- hemisferio sur: norte (`0°`)

Ajuste estacional este-oeste:

- Primavera: `0°`
- Verano: `-8°`
- Otoño: `+4°`
- Invierno: `+8°`
- Anual: `0°`

Y se normaliza el ángulo a `[0, 360)`:

`azimut = ((base + ajuste) % 360 + 360) % 360`

## Modelo de producción solar (técnico)

### 1) Pérdidas y Performance Ratio (PR)

Se suman pérdidas: temperatura, suciedad, cableado, inversor y mismatch.

`PR = clamp(1 - pérdidasTotales/100, 0.55, 0.95)`

Ese rango evita simulaciones extremas poco realistas.

### 2) Irradiación simplificada mensual

Para cada mes se usa el día medio (`MID_MONTH_DAY`) y se estima la declinación:

`declinación = 23.45° * sin(2π * (284 + día) / 365)`

Con latitud `φ`:

`exposición = clamp(cos(φ - declinación), 0.12, 0.98)`

`irradiaciónDiaria ≈ 1.7 + 5.5 * exposición`

> Es un modelo paramétrico para comparaciones rápidas, no un motor horario con TMY.

### 3) Producción mensual y anual

Para cada mes:

`E_mes = kWp * irradiaciónDiaria * díasMes * PR * factorSeguimiento * factorEstacional`

Con:

- `factorSeguimiento`: `fixed=1`, `oneAxis=1.2`, `twoAxis=1.35`
- `factorEstacional`: ponderación por temporada/hemisferio (`1.08`, `0.96` o `1`)

Luego:

- `E_anual_AC = suma(E_mes)`
- `E_anual_DC = E_anual_AC / PR`

## Comparador de seguimiento

El sistema usa una referencia anual fija y deriva:

- fijo
- 1 eje (`x1.20`)
- 2 ejes (`x1.35`)

También calcula el incremento porcentual frente a fijo para facilitar la lectura de ganancia energética.

## Ejecutar el proyecto

```bash
pnpm install
pnpm run dev
```

Comandos útiles:

```bash
pnpm run lint
pnpm run build
pnpm run preview
```

## Nota sobre CORS y proxy

PVGIS no permite acceso AJAX directo desde navegador.  
Para desarrollo, este proyecto usa proxy en `vite.config.js` (`/api/pvgis -> https://re.jrc.ec.europa.eu/api`).

En producción se recomienda exponer un backend/proxy propio equivalente para mantener compatibilidad y control de cuotas.