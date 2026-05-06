import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar        from "./components/Navbar"
import Footer        from "./components/Footer"
import CustomCursor  from "./components/CustomCursor"
import Home          from "./pages/Home"
import Catalogo      from "./pages/Catalogo"
import Mapa          from "./pages/Mapa"
import Login         from "./pages/Login"
import Register      from "./pages/Register"
import Actividades   from "./pages/Actividades"
import Rutas         from "./pages/Rutas"


function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />}        />
        <Route path="/catalogo"    element={<Catalogo />}    />
        <Route path="/mapa"        element={<Mapa />}        />
        <Route path="/actividades" element={<Actividades />} />
        <Route path="/rutas"       element={<Rutas />}       />
        <Route path="/login"       element={<Login />}       />
        <Route path="/register"    element={<Register />}    />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App