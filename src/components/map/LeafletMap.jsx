import { useEffect } from 'react'

import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import markerIcon from '@/assets/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const customMarkerIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
  className: 'leaflet-marker-clean',
})

function MapEvents({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng, true)
    },
  })
  return null
}

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center, map])
  return null
}

export function LeafletMap({ lat, lon, markerRef, onPick }) {
  return (
    <MapContainer center={[lat, lon]} zoom={13} className="h-[360px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={[lat, lon]} />
      <MapEvents onPick={onPick} />
      <Marker
        draggable
        icon={customMarkerIcon}
        position={[lat, lon]}
        eventHandlers={{
          dragend() {
            const marker = markerRef.current
            if (!marker) return
            const position = marker.getLatLng()
            onPick(position.lat, position.lng, true)
          },
        }}
        ref={(ref) => {
          markerRef.current = ref
        }}
      />
    </MapContainer>
  )
}
