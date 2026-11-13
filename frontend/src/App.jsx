import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar          from "./components/Navbar"
import Footer          from "./components/Footer"
import CustomCursor    from "./components/CustomCursor"
import ProtectedRoute  from "./components/ProtectedRoute"
import Home            from "./pages/Home"

// Cada página se descarga solo cuando se visita (antes todo iba en un único JS).
// Así la portada no carga Leaflet, jsPDF, html2canvas, etc.
const Catalogo       = lazy(() => import("./pages/Catalogo"))
const Mapa           = lazy(() => import("./pages/Mapa"))
const Login          = lazy(() => import("./pages/Login"))
const Register       = lazy(() => import("./pages/Register"))
const Actividades    = lazy(() => import("./pages/Actividades"))
const Rutas          = lazy(() => import("./pages/Rutas"))
const Quiz           = lazy(() => import("./pages/Quiz"))
const Resultado      = lazy(() => import("./pages/Resultado"))
const Privacidad     = lazy(() => import("./pages/Privacidad"))
const Terminos       = lazy(() => import("./pages/Terminos"))
const Perfil         = lazy(() => import("./pages/Perfil"))
const GoogleCallback = lazy(() => import("./pages/GoogleCallback"))

function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Navbar />
      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <Routes>
        <Route path="/"            element={<Home />}       />
        <Route path="/catalogo"    element={<Catalogo />}   />
        <Route path="/mapa"        element={<Mapa />}       />
        <Route path="/actividades" element={<Actividades />}/>
        <Route path="/rutas"       element={<Rutas />}      />
        <Route path="/login"       element={<Login />}      />
        <Route path="/register"    element={<Register />}   />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos"   element={<Terminos />}   />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
        <Route path="/quiz"        element={<Quiz />}       />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        } />
        <Route path="/resultado" element={
          <ProtectedRoute>
            <Resultado />
          </ProtectedRoute>
        }/>
      </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  )
}

export default App