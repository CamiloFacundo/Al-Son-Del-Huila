import {
  PiTreeEvergreenDuotone,
  PiBuildingsDuotone,
  PiBankDuotone,
  PiMountainsDuotone,
  PiForkKnifeDuotone,
  PiChurchDuotone,
  PiBookOpenDuotone,
  PiPlanetDuotone,
  PiConfettiDuotone,
  PiDropDuotone,
  PiMapPinDuotone,
} from "react-icons/pi"

// Por categoría (ids de la BD): icono, color para marcadores y chips (legible sobre fondo oscuro)
// y fondo para los destinos que aún no tienen foto.
const VISUALES = {
  1:  { Icon: PiTreeEvergreenDuotone, color: "#6fbf7e", fondo: "linear-gradient(145deg, #2f5d3a, #14281a)" }, // Naturaleza
  2:  { Icon: PiBuildingsDuotone,     color: "#e08a5a", fondo: "linear-gradient(145deg, #8a4b2a, #3a1f12)" }, // Cultural
  3:  { Icon: PiBankDuotone,          color: "#d9b26a", fondo: "linear-gradient(145deg, #7a5a32, #2e2213)" }, // Arqueológico
  4:  { Icon: PiMountainsDuotone,     color: "#5fbfb5", fondo: "linear-gradient(145deg, #3d6b6b, #152a2a)" }, // Aventura
  5:  { Icon: PiForkKnifeDuotone,     color: "#f0985c", fondo: "linear-gradient(145deg, #a4542b, #43200f)" }, // Gastronómico
  6:  { Icon: PiChurchDuotone,        color: "#b9a0d8", fondo: "linear-gradient(145deg, #6b5a7a, #2a2131)" }, // Religioso
  7:  { Icon: PiBookOpenDuotone,      color: "#e3c66b", fondo: "linear-gradient(145deg, #7a6432, #2f2612)" }, // Histórico
  8:  { Icon: PiPlanetDuotone,        color: "#8fa0f0", fondo: "linear-gradient(145deg, #2b3566, #0d1026)" }, // Astronómico
  9:  { Icon: PiConfettiDuotone,      color: "#ef7a62", fondo: "linear-gradient(145deg, #a8432f, #451a12)" }, // Eventos y festivales
  10: { Icon: PiDropDuotone,          color: "#62c3d9", fondo: "linear-gradient(145deg, #2e6a7a, #0f2830)" }, // Bienestar y descanso
}

const POR_DEFECTO = { Icon: PiMapPinDuotone, color: "#D4A843", fondo: "linear-gradient(145deg, #C4622Dcc, #C4622D44)" }

export function visualCategoria(categoriaId) {
  return VISUALES[categoriaId] ?? POR_DEFECTO
}
