import Hero from "../components/Hero"
import MasVisitados from "../components/MasVisitados"
import CookieBanner from '../components/CookieBanner';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <Hero />
      <MasVisitados />
      <CookieBanner />
    </main>
  )
}