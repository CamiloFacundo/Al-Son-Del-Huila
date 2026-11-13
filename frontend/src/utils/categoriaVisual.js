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

// Fondo e icono para los destinos que aún no tienen foto, según su categoría (ids de la BD).
const VISUALES = {
  1:  { Icon: PiTreeEvergreenDuotone, fondo: "linear-gradient(145deg, #2f5d3a, #14281a)" }, // Naturaleza
  2:  { Icon: PiBuildingsDuotone,     fondo: "linear-gradient(145deg, #8a4b2a, #3a1f12)" }, // Cultural
  3:  { Icon: PiBankDuotone,          fondo: "linear-gradient(145deg, #7a5a32, #2e2213)" }, // Arqueológico
  4:  { Icon: PiMountainsDuotone,     fondo: "linear-gradient(145deg, #3d6b6b, #152a2a)" }, // Aventura
  5:  { Icon: PiForkKnifeDuotone,     fondo: "linear-gradient(145deg, #a4542b, #43200f)" }, // Gastronómico
  6:  { Icon: PiChurchDuotone,        fondo: "linear-gradient(145deg, #6b5a7a, #2a2131)" }, // Religioso
  7:  { Icon: PiBookOpenDuotone,      fondo: "linear-gradient(145deg, #7a6432, #2f2612)" }, // Histórico
  8:  { Icon: PiPlanetDuotone,        fondo: "linear-gradient(145deg, #2b3566, #0d1026)" }, // Astronómico
  9:  { Icon: PiConfettiDuotone,      fondo: "linear-gradient(145deg, #a8432f, #451a12)" }, // Eventos y festivales
  10: { Icon: PiDropDuotone,          fondo: "linear-gradient(145deg, #2e6a7a, #0f2830)" }, // Bienestar y descanso
}

const POR_DEFECTO = { Icon: PiMapPinDuotone, fondo: "linear-gradient(145deg, #C4622Dcc, #C4622D44)" }

export function visualCategoria(categoriaId) {
  return VISUALES[categoriaId] ?? POR_DEFECTO
}
