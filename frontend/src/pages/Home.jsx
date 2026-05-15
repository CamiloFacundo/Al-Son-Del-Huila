import Hero from "../components/Hero"
import CookieBanner from '../components/CookieBanner';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <Hero />
      <CookieBanner />
    </main>
  )
}