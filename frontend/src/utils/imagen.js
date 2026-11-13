// Reduce una foto en el navegador antes de enviarla (las de móvil pesan varios MB).
// Devuelve un data URL JPEG de máximo `max` px por lado.
export function reducirImagen(file, max = 1024, calidad = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo no es una imagen."))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", calidad))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("No se pudo leer la imagen."))
    }
    img.src = url
  })
}
