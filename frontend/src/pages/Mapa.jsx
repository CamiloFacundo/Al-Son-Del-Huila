import { useEffect, useState } from 'react';
import Mapa from '../components/Mapa';
import DestinoModal from '../components/DestinoModal';
import { getDestinos } from '../api/destinos';

// Página /mapa: todos los destinos del catálogo en el mapa; al pulsar uno se abre su ficha.
export default function MapaPagina() {
  const [destinos, setDestinos] = useState([]);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    getDestinos().then(setDestinos).catch(() => setError('No se pudieron cargar los destinos.'));
  }, []);

  return (
    <div style={{ padding: 'calc(var(--navbar-height, 72px) + 1.5rem) 1.5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.8rem', color: '#f2e9dc' }}>Mapa de destinos</h1>
      <p style={{ margin: '0 0 1rem', color: '#999', fontSize: '0.9rem' }}>
        {error || (destinos.length ? `${destinos.length} destinos del Huila. Pulsa un marcador para ver la ficha.` : 'Cargando destinos…')}
      </p>
      <div style={{ height: '70vh' }}>
        <Mapa destinos={destinos} onDestinoClick={setSeleccionado} />
      </div>
      <DestinoModal destino={seleccionado} isOpen={!!seleccionado} onClose={() => setSeleccionado(null)} />
    </div>
  );
}
