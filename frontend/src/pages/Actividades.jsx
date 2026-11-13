import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PiCameraPlusDuotone, PiImageSquareDuotone } from 'react-icons/pi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Publicacion from '../components/Publicacion';
import styles from './Actividades.module.css';

const MAX_MB = 8;
const FORM_VACIO = { imagen: null, descripcion: '', ubicacion: '' };

// Muro de Actividades: fotos de experiencias en el Huila, con likes y comentarios.
export default function Actividades() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [publicaciones, setPublicaciones] = useState([]);
  const [paginaSiguiente, setPaginaSiguiente] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorForm, setErrorForm] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [toast, setToast] = useState(null);

  const avisar = useCallback((texto, tipo = 'success') => {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const cargarPagina = useCallback(async (pagina) => {
    setCargando(true);
    setErrorCarga('');
    try {
      const { data } = await api.get('/publicaciones', { params: { page: pagina } });
      setPublicaciones(prev => {
        // Evitar duplicados si alguien publicó mientras se paginaba
        const ids = new Set(prev.map(p => p.id));
        return pagina === 1 ? data.data : [...prev, ...data.data.filter(p => !ids.has(p.id))];
      });
      setPaginaSiguiente(data.pagina_siguiente);
    } catch {
      setErrorCarga('No se pudieron cargar las publicaciones.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarPagina(1); }, [cargarPagina]);

  // Cerrar el modal con Escape
  useEffect(() => {
    if (!showModal) return;
    const alPulsar = (e) => { if (e.key === 'Escape') cerrarModal(); };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [showModal]); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiarPublicacion = (actualizada) =>
    setPublicaciones(prev => prev.map(p => (p.id === actualizada.id ? { ...p, ...actualizada } : p)));

  const quitarPublicacion = (id) => setPublicaciones(prev => prev.filter(p => p.id !== id));

  const abrirModal = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: location } });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setFormData(FORM_VACIO);
    setErrorForm('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const elegirFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrorForm('El archivo debe ser una imagen.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setErrorForm(`La foto no puede pesar más de ${MAX_MB} MB.`); return; }
    setErrorForm('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFormData({ ...formData, imagen: file });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const publicar = async (e) => {
    e.preventDefault();
    if (!formData.imagen) { setErrorForm('Elige una foto.'); return; }
    setSubiendo(true);
    setErrorForm('');
    const data = new FormData();
    data.append('imagen', formData.imagen);
    if (formData.descripcion.trim()) data.append('descripcion', formData.descripcion.trim());
    if (formData.ubicacion.trim()) data.append('ubicacion', formData.ubicacion.trim());
    try {
      const res = await api.post('/publicaciones', data);
      setPublicaciones(prev => [res.data, ...prev]);
      cerrarModal();
      avisar('¡Publicado!');
    } catch (err) {
      setErrorForm(
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        err.response?.data?.message ||
        'No se pudo publicar. Inténtalo de nuevo.'
      );
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Actividades</h1>
          <p className={styles.subtitulo}>Experiencias de viajeros en el Huila</p>
        </div>
        {isAuthenticated && (
          <button className={styles.btnCrear} onClick={abrirModal}>
            <PiCameraPlusDuotone size={18} /> Nueva publicación
          </button>
        )}
      </div>

      {!isAuthenticated && (
        <div className={styles.invitacion}>
          <PiImageSquareDuotone size={26} />
          <p>¿Visitaste algún rincón del Huila? <Link to="/login" state={{ from: location }}>Inicia sesión</Link> o <Link to="/register">crea una cuenta</Link> para compartir tus fotos, dar me gusta y comentar.</p>
        </div>
      )}

      <div className={styles.feed}>
        {publicaciones.map(pub => (
          <Publicacion key={pub.id} pub={pub} onCambio={cambiarPublicacion} onBorrada={quitarPublicacion} avisar={avisar} />
        ))}

        {cargando && <p className={styles.loading}>Cargando publicaciones…</p>}

        {errorCarga && (
          <div className={styles.vacio}>
            <p>{errorCarga}</p>
            <button className={styles.btnSecundario} onClick={() => cargarPagina(paginaSiguiente || 1)}>Reintentar</button>
          </div>
        )}

        {!cargando && !errorCarga && publicaciones.length === 0 && (
          <div className={styles.vacio}>
            <p>Aún no hay publicaciones. ¡Sé el primero en compartir tu experiencia!</p>
            <button className={styles.btnCrear} onClick={abrirModal}><PiCameraPlusDuotone size={18} /> Compartir una foto</button>
          </div>
        )}

        {!cargando && !errorCarga && paginaSiguiente && publicaciones.length > 0 && (
          <button className={styles.btnSecundario} onClick={() => cargarPagina(paginaSiguiente)}>Ver más publicaciones</button>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={cerrarModal}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="titulo-nueva">
            <div className={styles.modalHeader}>
              <h2 id="titulo-nueva">Compartir experiencia</h2>
              <button className={styles.closeBtn} onClick={cerrarModal} aria-label="Cerrar">✕</button>
            </div>
            <form onSubmit={publicar} className={styles.modalForm} noValidate>
              <div className={styles.imageUploadArea}>
                {previewUrl ? (
                  <div className={styles.imagePreview}>
                    <img src={previewUrl} alt="Vista previa de la foto" />
                    <label className={styles.changeImageBtn}>
                      Cambiar foto
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirFoto} hidden />
                    </label>
                  </div>
                ) : (
                  <label className={styles.uploadLabel}>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirFoto} />
                    <PiCameraPlusDuotone size={40} className={styles.uploadIcon} />
                    <span>Subir foto</span>
                    <small>JPG, PNG o WebP · hasta {MAX_MB} MB</small>
                  </label>
                )}
              </div>
              <div className={styles.formFields}>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="¿Qué viviste en este lugar?"
                  rows="3"
                  maxLength={255}
                  className={styles.textarea}
                  aria-label="Descripción"
                />
                <span className={styles.contador}>{formData.descripcion.length}/255</span>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                  placeholder="📍 Ubicación (ej: Desierto de la Tatacoa)"
                  maxLength={100}
                  className={styles.input}
                  aria-label="Ubicación"
                />
              </div>
              {errorForm && <p className={styles.errorForm} role="alert">{errorForm}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className={styles.submitBtn} disabled={subiendo || !formData.imagen}>
                  {subiendo ? 'Publicando…' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles[toast.tipo]}`} role="status">{toast.texto}</div>}
    </div>
  );
}
