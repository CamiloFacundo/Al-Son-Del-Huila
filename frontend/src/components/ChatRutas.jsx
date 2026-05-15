import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiPaperPlaneTiltDuotone,
  PiRobotDuotone,
  PiUserDuotone,
  PiImageDuotone,
  PiSpinnerDuotone,
  PiMapPinDuotone,
  PiFloppyDiskDuotone,
} from "react-icons/pi"
import { enviarMensaje, extraerDestinos, extraerRuta } from "../api/groq"
import styles from "./ChatRutas.module.css"

function renderTexto(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g,     "<em>$1</em>")
    .replace(/\n/g,            "<br/>")
    .replace(/\[DESTINOS:.*?\]/g, "")
    .replace(/\[RUTA:.*?\]/g,    "")
}

export default function ChatRutas({
  onDestinosChange,
  onRutaGenerada,
  rutaActiva,
  todosDestinos,
  usuario,
}) {
  const BIENVENIDA = {
    id:   0,
    rol:  "assistant",
    texto: rutaActiva
      ? `Tienes seleccionada la ruta **${rutaActiva.nombre}**. ¿Qué quieres hacer con ella? Puedo sugerirte destinos adicionales, explicarte cada lugar o crear una variante.`
      : `¡Hola! Soy Huily :) Tu asistente de rutas en el Huila.\n\nPuedo ayudarte a:\n- Crear rutas personalizadas (usa el icono de mapa)\n- Explorar destinos en el mapa\n- Identificar destinos por foto (sube una imagen)\n- Guardar tus rutas favoritas\n\n¿Por dónde empezamos?`,
    destinos: [],
  }

  const [mensajes,  setMensajes]  = useState([BIENVENIDA])
  const [input,     setInput]     = useState("")
  const [cargando,  setCargando]  = useState(false)
  const [rutaPendiente, setRutaPendiente] = useState(null)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const fileRef    = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes, cargando])

  useEffect(() => {
    setMensajes([{
      ...BIENVENIDA,
      texto: rutaActiva
        ? `Ruta **${rutaActiva.nombre}** seleccionada con ${rutaActiva.destinos?.length} destinos. ¿Quieres modificarla o saber más sobre algún destino?`
        : BIENVENIDA.texto
    }])
  }, [rutaActiva?.id])

  const enviar = async (texto = input, imagen = null) => {
    if ((!texto.trim() && !imagen) || cargando) return

    const msgUsuario = {
      id:      Date.now(),
      rol:     "user",
      texto:   texto.trim(),
      imagen,
      destinos: [],
    }

    setMensajes(prev => [...prev, msgUsuario])
    setInput("")
    setCargando(true)

    try {
      const historial = mensajes
        .filter(m => m.id !== 0)
        .map(m => ({
          rol:    m.rol,
          texto:  m.texto,
          imagen: m.imagen,
        }))

      historial.push({ rol: "user", texto: texto.trim(), imagen })

      const contexto = rutaActiva
        ? { rutaActiva: rutaActiva.nombre, destinos: rutaActiva.destinos }
        : null

      const respuesta = await enviarMensaje(historial, contexto)

      const destinosEncontrados = extraerDestinos(respuesta, todosDestinos)
      const rutaGenerada        = extraerRuta(respuesta, todosDestinos)

      const msgIA = {
        id:       Date.now() + 1,
        rol:      "assistant",
        texto:    respuesta,
        destinos: destinosEncontrados,
        ruta:     rutaGenerada,
      }

      setMensajes(prev => [...prev, msgIA])

      if (destinosEncontrados.length > 0) {
        onDestinosChange?.(destinosEncontrados)
      }

      if (rutaGenerada) {
        setRutaPendiente(rutaGenerada)
        onRutaGenerada?.(rutaGenerada)
      }

    } catch (err) {
      setMensajes(prev => [...prev, {
        id:       Date.now() + 1,
        rol:      "assistant",
        texto:    "Tuve un problema al conectarme. ¿Puedes intentarlo de nuevo?",
        destinos: [],
        error:    true,
      }])
    } finally {
      setCargando(false)
      inputRef.current?.focus()
    }
  }

  const handleImagen = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      enviar("¿Qué destino del Huila se parece a esta imagen? ¿Puedes recomendarme lugares similares?", ev.target.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const guardarRuta = () => {
    if (!usuario) {
      setMensajes(prev => [...prev, {
        id:       Date.now(),
        rol:      "assistant",
        texto:    "Para guardar rutas necesitas iniciar sesión. ¿Te gustaría hacerlo?",
        destinos: [],
      }])
      return
    }
    if (rutaPendiente) {
      onRutaGenerada?.(rutaPendiente, true)
      setRutaPendiente(null)
    }
  }

  const SUGERENCIAS = [
    "Crea una ruta de 2 días por el sur del Huila",
    "¿Qué destinos de aventura recomiendas?",
    "Ruta para familia con niños",
    "Destinos cerca de Neiva",
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.mensajes}>
        <AnimatePresence initial={false}>
          {mensajes.map(msg => (
            <motion.div
              key={msg.id}
              className={`${styles.msg} ${msg.rol === "user" ? styles.msgUser : styles.msgIA}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className={`${styles.avatar} ${msg.rol === "user" ? styles.avatarUser : styles.avatarIA}`}>
                {msg.rol === "user"
                  ? <PiUserDuotone  size={14} />
                  : <PiRobotDuotone size={14} />
                }
              </div>
              <div className={`${styles.burbuja} ${msg.rol === "user" ? styles.burbujaUser : styles.burbujaIA} ${msg.error ? styles.burbujaError : ""}`}>
                {msg.imagen && (
                  <img
                    src={msg.imagen}
                    alt="imagen subida"
                    className={styles.imagenSubida}
                  />
                )}
                <div dangerouslySetInnerHTML={{ __html: renderTexto(msg.texto) }} />
                {msg.destinos?.length > 0 && (
                  <div className={styles.chips}>
                    {msg.destinos.map(d => (
                      <button
                        key={d.id}
                        className={styles.chip}
                        onClick={() => onDestinosChange?.([d])}
                      >
                        <PiMapPinDuotone size={11} />
                        {d.nombre}
                      </button>
                    ))}
                  </div>
                )}
                {msg.ruta && usuario && (
                  <motion.button
                    className={styles.btnGuardar}
                    onClick={guardarRuta}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <PiFloppyDiskDuotone size={14} />
                    Guardar ruta "{msg.ruta.nombre}"
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {cargando && (
          <motion.div
            className={`${styles.msg} ${styles.msgIA}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={`${styles.avatar} ${styles.avatarIA}`}>
              <PiRobotDuotone size={14} />
            </div>
            <div className={`${styles.burbuja} ${styles.burbujaIA}`}>
              <div className={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {mensajes.length === 1 && (
        <div className={styles.sugerencias}>
          {SUGERENCIAS.map(s => (
            <button
              key={s}
              className={styles.sugerencia}
              onClick={() => enviar(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <button
            className={styles.btnImagen}
            onClick={() => fileRef.current?.click()}
            title="Subir imagen"
          >
            <PiImageDuotone size={18} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImagen}
          />
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre rutas o sube una foto..."
            rows={1}
            disabled={cargando}
          />
          <motion.button
            className={`${styles.btnEnviar} ${(!input.trim() || cargando) ? styles.btnDisabled : ""}`}
            onClick={() => enviar()}
            disabled={!input.trim() || cargando}
            whileHover={input.trim() ? { scale: 1.08 } : {}}
            whileTap={input.trim()   ? { scale: 0.95 } : {}}
          >
            {cargando
              ? <PiSpinnerDuotone size={18} className={styles.spinner} />
              : <PiPaperPlaneTiltDuotone size={18} />
            }
          </motion.button>
        </div>
      </div>
    </div>
  )
}