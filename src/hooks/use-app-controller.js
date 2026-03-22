import { useCallback, useMemo, useReducer, useRef } from 'react'

import { calculateSolarModel } from '@/lib/solar-model'
import { calculateBatteryModel } from '@/lib/battery-model'
import { createInitialForm } from '@/lib/app-state'

const initialState = {
    form: createInitialForm(),
    locationStatus: '',
    geocodingError: '',
    isSearchingAddress: false,
    isLocating: false,
}

function appReducer(state, action) {
    switch (action.type) {
        case 'SET_FORM': {
            const updater = action.updater
            const nextForm = typeof updater === 'function' ? updater(state.form) : updater
            return { ...state, form: nextForm }
        }
        case 'PATCH_UI':
            return { ...state, ...action.payload }
        default:
            return state
    }
}

export function useAppController() {
    const [state, dispatch] = useReducer(appReducer, initialState)
    const markerRef = useRef(null)

    const setForm = useCallback((updater) => {
        dispatch({ type: 'SET_FORM', updater })
    }, [])

    const patchUi = useCallback((payload) => {
        dispatch({ type: 'PATCH_UI', payload })
    }, [])

    const solar = useMemo(() => calculateSolarModel(state.form), [state.form])
    const battery = useMemo(() => calculateBatteryModel({ form: state.form, solar }), [state.form, solar])
    const maxMonthlyValue = Math.max(...solar.monthly)

    const reverseGeocode = useCallback(async (lat, lon) => {
        patchUi({ geocodingError: '' })
        try {
            const url = new URL('https://nominatim.openstreetmap.org/reverse')
            url.searchParams.set('format', 'jsonv2')
            url.searchParams.set('lat', String(lat))
            url.searchParams.set('lon', String(lon))
            url.searchParams.set('accept-language', 'es')

            const response = await fetch(url, { headers: { Accept: 'application/json' } })
            if (!response.ok) throw new Error(`Error HTTP ${response.status} en reverse geocoding`)

            const data = await response.json()
            setForm((current) => ({ ...current, address: data.display_name ?? current.address }))
            patchUi({ locationStatus: 'Direccion actualizada desde coordenadas.' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'No se pudo obtener direccion.'
            patchUi({
                geocodingError: message,
                locationStatus: 'No se pudo resolver direccion desde coordenadas.',
            })
        }
    }, [patchUi, setForm])

    const handleAddressSearch = useCallback(async () => {
        if (!state.form.address.trim()) {
            patchUi({ geocodingError: 'Ingresa una direccion para buscar.' })
            return
        }

        patchUi({
            isSearchingAddress: true,
            geocodingError: '',
            locationStatus: 'Buscando direccion...',
        })

        try {
            const url = new URL('https://nominatim.openstreetmap.org/search')
            url.searchParams.set('format', 'jsonv2')
            url.searchParams.set('q', state.form.address)
            url.searchParams.set('limit', '1')
            url.searchParams.set('accept-language', 'es')

            const response = await fetch(url, { headers: { Accept: 'application/json' } })
            if (!response.ok) throw new Error(`Error HTTP ${response.status} en busqueda de direccion`)
            const list = await response.json()
            if (!Array.isArray(list) || list.length === 0) throw new Error('No se encontraron resultados para esa direccion.')
            const first = list[0]
            setForm((current) => ({ ...current, lat: Number(first.lat), lon: Number(first.lon), address: first.display_name ?? current.address }))
            patchUi({ locationStatus: 'Direccion encontrada y mapa actualizado.' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'No se pudo buscar la direccion.'
            patchUi({ geocodingError: message, locationStatus: 'Busqueda de direccion fallida.' })
        } finally {
            patchUi({ isSearchingAddress: false })
        }
    }, [patchUi, setForm, state.form.address])

    const handleCoordinatePick = useCallback((lat, lon, updateAddress = false) => {
        const nextLat = Number(lat.toFixed(6))
        const nextLon = Number(lon.toFixed(6))
        setForm((current) => ({ ...current, lat: nextLat, lon: nextLon }))
        if (updateAddress) void reverseGeocode(nextLat, nextLon)
    }, [reverseGeocode, setForm])

    const updateLoss = useCallback((key, value) => {
        setForm((current) => ({ ...current, losses: { ...current.losses, [key]: value } }))
    }, [setForm])

    const useCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            patchUi({ geocodingError: 'El navegador no soporta geolocalizacion.' })
            return
        }
        if (!window.isSecureContext) {
            patchUi({ geocodingError: 'La geolocalizacion requiere HTTPS o localhost.' })
            return
        }

        patchUi({
            isLocating: true,
            geocodingError: '',
            locationStatus: 'Obteniendo ubicacion actual...',
        })

        const getPosition = (options) =>
            new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options)
            })

            ; (async () => {
                try {
                    let position
                    try {
                        position = await getPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
                    } catch {
                        position = await getPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 120000 })
                    }
                    handleCoordinatePick(position.coords.latitude, position.coords.longitude, true)
                    patchUi({ locationStatus: 'Ubicacion actual detectada.' })
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'permiso denegado o tiempo agotado'
                    patchUi({
                        geocodingError: `Geolocalizacion fallida: ${message}`,
                        locationStatus: 'No se pudo acceder a la ubicacion actual.',
                    })
                } finally {
                    patchUi({ isLocating: false })
                }
            })()
    }, [handleCoordinatePick, patchUi])

    const sizingHint = useMemo(() => {
        const form = state.form
        if (form.sizingMode === 'kwp') return `Paneles estimados: ${form.panelCount} | Superficie estimada: ${form.area.toFixed(2)} m²`
        if (form.sizingMode === 'panels') {
            return `${form.panelCount} paneles × ${form.panelPowerW} W = ${form.kwp.toFixed(2)} kWp | Area total: ${form.area.toFixed(2)} m²`
        }
        return `Paneles que caben aprox.: ${form.panelCount} | Potencia pico estimada: ${form.kwp.toFixed(2)} kWp`
    }, [state.form])

    return {
        form: state.form,
        setForm,
        markerRef,
        locationStatus: state.locationStatus,
        geocodingError: state.geocodingError,
        isSearchingAddress: state.isSearchingAddress,
        isLocating: state.isLocating,
        reverseGeocode,
        handleAddressSearch,
        handleCoordinatePick,
        useCurrentLocation,
        updateLoss,
        sizingHint,
        solar,
        battery,
        maxMonthlyValue,
    }
}
