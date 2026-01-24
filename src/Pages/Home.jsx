import { useEffect } from "react"
import AboutSection from "../Components/Core/home/About"
import AppointmentSection from "../Components/Core/home/Appointmentsection"
import HeroSection from "../Components/Core/home/Herosection"
import Footer from "../Components/Common/Footer"
import ServicesSection from "../Components/Core/home/Servicesection"
import Navbar from "../Components/Common/Navbar"

export default function Home() {
    
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow">
                <HeroSection />
                <ServicesSection />
                <AboutSection />
                <AppointmentSection />
            </main>
            <Footer />
        </div>
    )
}