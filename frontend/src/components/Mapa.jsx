import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { capaClara } from "../utils/mapas";

const HUILA = [2.5359, -75.5277];

// Texto seguro para el HTML de los popups de Leaflet
const escapar = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nombreDe = (v) => (v && typeof v === 'object' ? v.nombre : v) || '';

// Mapa con un marcador por destino. Al pulsar "Ver más" en el popup llama a onDestinoClick(destino).
// Lo usan la página /mapa y el resultado del quiz.
export default function Mapa({ destinos = [], onDestinoClick }) {
  const contenedorRef = useRef(null);
  const mapRef = useRef(null);
  const capaMarcadores = useRef(null);
  const onClickRef = useRef(onDestinoClick);
  useEffect(() => { onClickRef.current = onDestinoClick; }, [onDestinoClick]);

  // Crear el mapa una sola vez
  useEffect(() => {
    const map = L.map(contenedorRef.current).setView(HUILA, 8);
    capaClara(map);
    capaMarcadores.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const alRedimensionar = () => map.invalidateSize();
    window.addEventListener('resize', alRedimensionar);
    return () => {
      window.removeEventListener('resize', alRedimensionar);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Pintar los marcadores cuando cambian los destinos
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    capaMarcadores.current.clearLayers();

    const puntos = [];
    destinos.forEach((destino) => {
      const lat = parseFloat(destino.latitud);
      const lng = parseFloat(destino.longitud);
      if (isNaN(lat) || isNaN(lng)) return;

      const popup = document.createElement('div');
      popup.innerHTML = `<b>${escapar(destino.nombre)}</b><br>${escapar(nombreDe(destino.municipio))}<br>${escapar(nombreDe(destino.categoria))}`;
      if (onClickRef.current) {
        const boton = document.createElement('button');
        boton.textContent = 'Ver más';
        boton.className = 'ver-mapa-btn';
        boton.addEventListener('click', () => onClickRef.current?.(destino));
        popup.appendChild(document.createElement('br'));
        popup.appendChild(boton);
      }
      L.marker([lat, lng]).bindPopup(popup).addTo(capaMarcadores.current);
      puntos.push([lat, lng]);
    });

    if (puntos.length > 0) {
      map.fitBounds(puntos, { padding: [30, 30], maxZoom: 13 });
    }
    // El contenedor puede haber cambiado de tamaño al cargar los datos
    setTimeout(() => map.invalidateSize(), 0);
  }, [destinos]);

  return <div ref={contenedorRef} style={{ height: '100%', width: '100%', minHeight: 320, borderRadius: '16px' }} />;
}
