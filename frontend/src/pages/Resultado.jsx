import html2canvas from 'html2canvas';
import Mapa from '../components/Mapa';
import jsPDF from 'jspdf';
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PiMapPinDuotone,
  PiCalendarDuotone,
  PiArrowRightDuotone,
  PiArrowLeftDuotone,
  PiFileImageDuotone,
  PiFilePdfDuotone,
} from "react-icons/pi";
import { recomendar } from "../api/recomendador";
import DestinoModal from "../components/DestinoModal";
import styles from "./Resultado.module.css";
import logo from "../assets/images/logo.png";

export default function Resultado() {
  const [itinerario, setItinerario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navbarHeight, setNavbarHeight] = useState(70);
  const navigate = useNavigate();
  const itinerarioRef = useRef(null);
  const [todosDestinos, setTodosDestinos] = useState([]);
  
  // Estados para el modal de destino
  const [selectedDestino, setSelectedDestino] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
      document.documentElement.style.setProperty('--navbar-height', `${navbar.offsetHeight}px`);
    }
  }, []);

  useEffect(() => {
    setTodosDestinos(itinerario.flatMap(dia => dia.destinos));
  }, [itinerario]);

  // Función para abrir el modal de destino
  const openDestinoModal = (destino) => {
    setSelectedDestino(destino);
    setModalOpen(true);
  };

  // Función para cerrar el modal
  const closeDestinoModal = () => {
    setModalOpen(false);
    setSelectedDestino(null);
  };

  // Escapa texto para HTML
  const escapeHTML = (str) => {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };

  // Genera el HTML completo del itinerario (sin emojis, profesional)
  const generarHTMLItinerario = () => {
    const fecha = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
    const totalDestinos = itinerario.reduce((acc, d) => acc + d.destinos.length, 0);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Itinerario - Al Son del Huila</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background: white;
            padding: 2rem;
            color: #1e2a3a;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 2px solid #d4a843;
            padding-bottom: 1rem;
          }
          .logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin-bottom: 0.5rem;
            object-fit: cover;
          }
          h1 { font-size: 1.8rem; color: #2c3e2f; }
          .sub { color: #5a6e5a; margin-top: 0.25rem; }
          .resumen {
            background: #f9f5eb;
            padding: 0.8rem;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 1.5rem;
            font-weight: 500;
          }
          .dia {
            margin-bottom: 2rem;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .dia-titulo {
            font-size: 1.4rem;
            font-weight: bold;
            color: #b47c2e;
            border-left: 5px solid #d4a843;
            padding-left: 1rem;
            margin-bottom: 1rem;
          }
          .destino {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 0.8rem;
            border-bottom: 1px solid #e9ecef;
          }
          .numero {
            background: #d4a843;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
          }
          .info { flex: 1; }
          .nombre { font-weight: 700; font-size: 1.1rem; margin-bottom: 0.2rem; }
          .meta {
            font-size: 0.8rem;
            color: #6c757d;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }
          .meta span::before {
            font-weight: 500;
            color: #b47c2e;
            margin-right: 0.25rem;
          }
          .meta .municipio::before { content: "Ubicación: "; }
          .meta .categoria::before { content: "Tipo: "; }
          .footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.7rem;
            color: #adb5bd;
            border-top: 1px solid #dee2e6;
            padding-top: 1rem;
          }
          @media print {
            body { padding: 0; }
            .destino { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logo}" class="logo" alt="Logo Al Son del Huila" />
            <h1>Al Son del Huila</h1>
            <div class="sub">Itinerario personalizado</div>
            <div class="resumen">${itinerario.length} días · ${totalDestinos} destinos · ${fecha}</div>
          </div>
          ${itinerario.map(dia => `
            <div class="dia">
              <div class="dia-titulo">Día ${dia.dia}</div>
              ${dia.destinos.map((dest, idx) => `
                <div class="destino">
                  <div class="numero">${idx+1}</div>
                  <div class="info">
                    <div class="nombre">${escapeHTML(dest.nombre)}</div>
                    <div class="meta">
                      <span class="municipio">${escapeHTML(dest.municipio || '')}</span>
                      <span class="categoria">${escapeHTML(dest.categoria || '')}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}
          <div class="footer">
            Generado por Al Son del Huila · Descubre el Huila como nunca antes
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Captura profesional (PNG o PDF) usando un iframe
  const capturarItinerario = async (formato = 'png') => {
    try {
      const htmlString = generarHTMLItinerario();
      const blob = new Blob([htmlString], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '1000px';
      iframe.style.height = '800px';
      iframe.src = url;
      document.body.appendChild(iframe);

      await new Promise((resolve) => { iframe.onload = resolve; });
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const elemento = doc.body;
      elemento.style.height = 'auto';
      elemento.style.overflow = 'visible';

      const canvas = await html2canvas(elemento, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: elemento.scrollWidth,
        windowHeight: elemento.scrollHeight,
      });

      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);

      const imagen = canvas.toDataURL('image/png');
      const timestamp = Date.now();

      if (formato === 'png') {
        const enlace = document.createElement('a');
        enlace.download = `itinerario_${timestamp}.png`;
        enlace.href = imagen;
        enlace.click();
      } else if (formato === 'pdf') {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imagen);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imagen, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`itinerario_${timestamp}.pdf`);
      }
    } catch (error) {
      console.error('Error al generar el itinerario:', error);
      alert('Error al generar la descarga. Revisa la consola.');
    }
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const saved = localStorage.getItem("quizRespuestas");
        if (!saved) { navigate("/quiz"); return; }
        const respuestas = JSON.parse(saved);
        const data = await recomendar(respuestas);
        setItinerario(data.itinerario || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [navigate]);

  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner} />
      <p>Generando tu ruta personalizada...</p>
      <span>Analizando tus preferencias</span>
    </div>
  );
  if (error) return (
    <div className={styles.errorState}>
      <p>⚠ {error}</p>
      <button onClick={() => navigate("/quiz")}>Volver al quiz</button>
    </div>
  );

  return (
    <div className={styles.page} style={{ paddingTop: navbarHeight }}>
      <div className={styles.header}>
        <img src={logo} alt="logo" className={styles.logoImg} />
        <div className={styles.headerTexto}>
          <h1 className={styles.titulo}>Tu ruta personalizada</h1>
          <p className={styles.subtitulo}>
            {itinerario.length} días · {itinerario.reduce((acc, d) => acc + d.destinos.length, 0)} destinos
          </p>
        </div>
        <button className={styles.btnNuevo} onClick={() => navigate("/quiz")}>
          <PiArrowLeftDuotone size={16} /> Nueva ruta
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.itinerarioColumn}>
          <div className={styles.itinerario} ref={itinerarioRef}>
            {itinerario.map((dia, i) => (
              <motion.div key={dia.dia} className={styles.diaCard}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <div className={styles.diaHeader}>
                  <PiCalendarDuotone size={16} /> <span>Día {dia.dia}</span>
                  <span className={styles.diaCount}>{dia.destinos.length} destinos</span>
                </div>
                <div className={styles.destinosList}>
                  {dia.destinos.map((destino, j) => (
                    <div key={`${dia.dia}-${j}`} className={styles.destinoItem}>
                      <div className={styles.destinoNum}>{j + 1}</div>
                      <div className={styles.destinoInfo}>
                        <h4>{destino.nombre || 'Destino sin nombre'}</h4>
                        <div className={styles.destinoMeta}>
                          <PiMapPinDuotone size={12} />
                          <span>{destino.municipio || 'Ubicación desconocida'}</span>
                          <span className={styles.dot}>·</span>
                          <span>{destino.categoria || 'Categoría no especificada'}</span>
                        </div>
                      </div>
                      <button 
                        className={styles.destinoBtn} 
                        onClick={() => openDestinoModal(destino)}
                      >
                        <PiArrowRightDuotone size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <div className={styles.botonesDescarga}>
            <button className={styles.btnDescarga} onClick={() => capturarItinerario('png')}>
              <PiFileImageDuotone size={20} /> PNG
            </button>
            <button className={styles.btnDescarga} onClick={() => capturarItinerario('pdf')}>
              <PiFilePdfDuotone size={20} /> PDF
            </button>
          </div>
        </div>
        <div className={styles.mapaWrapper}>
          {todosDestinos.length > 0 ? (
            <Mapa destinos={todosDestinos} onDestinoClick={openDestinoModal} />
          ) : (
            <div className={styles.mapaPlaceholder}>
              <PiMapPinDuotone size={48} className={styles.mapaIcon} />
              <h3>Mapa interactivo</h3>
              <p>Cargando destinos...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de destino */}
      <DestinoModal 
        destino={selectedDestino} 
        isOpen={modalOpen} 
        onClose={closeDestinoModal} 
      />
    </div>
  );
}