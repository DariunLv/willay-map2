import Head from 'next/head'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import PublicMapSection from '@/components/landing/PublicMapSection'
import BenefitsSection from '@/components/landing/BenefitsSection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>Willay Map - Sistema de Gestión de Problemas Ciudadanos</title>
        <meta name="description" content="Reporta y gestiona problemas ciudadanos en tiempo real. Una plataforma digital para mejorar la comunicación entre ciudadanos y autoridades locales." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="reportes ciudadanos, problemas urbanos, municipalidad, mapa interactivo, gestión municipal" />
        <meta property="og:title" content="Willay Map - Sistema de Gestión de Problemas Ciudadanos" />
        <meta property="og:description" content="Reporta y gestiona problemas ciudadanos en tiempo real." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PublicMapSection />
        <BenefitsSection />
        <Footer />
      </main>
    </>
  )
}