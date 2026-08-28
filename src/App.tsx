import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import CoreValues from './components/CoreValues'
import Services from './components/Services'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Rentals from './components/Rentals'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollProgress from './components/ui/ScrollProgress'
import SectionBridge from './components/ui/SectionBridge'
import SectionTransition from './components/ui/SectionTransition'

export default function App() {
  return (
    <div className="grain relative min-h-screen bg-chelsea-soft">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <SectionBridge variant="wave" />
        <SectionTransition type="door">
          <About />
        </SectionTransition>
        <SectionBridge variant="sweep" />
        <SectionTransition type="curtain-down">
          <CoreValues />
        </SectionTransition>
        <SectionBridge variant="fold" />
        <SectionTransition type="flow-left">
          <Services />
        </SectionTransition>
        <SectionBridge variant="wave" />
        <SectionTransition type="rise">
          <Stats />
        </SectionTransition>
        <SectionBridge variant="sweep" />
        <SectionTransition type="door">
          <Testimonials />
        </SectionTransition>
        <SectionBridge variant="fold" />
        <Rentals />
        <SectionTransition type="curtain-up">
          <CTA />
        </SectionTransition>
        <SectionBridge variant="wave" />
        <SectionTransition type="flow-right">
          <Contact />
        </SectionTransition>
      </main>
      <SectionTransition type="flow-up">
        <Footer />
      </SectionTransition>
    </div>
  )
}
