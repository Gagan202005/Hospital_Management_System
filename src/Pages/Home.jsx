import About from "../Components/Core/home/About"
import AppointmentSection from "../Components/Core/home/Appointmentsection"
import HeroSection from "../Components/Core/home/Herosection"
import Footer  from "../Components/Common/Footer"
import ServicesSection from "../Components/Core/home/Servicesection"
export default function Home(){
    return(
         <div className="w-full h-full">
         <HeroSection></HeroSection>
         <ServicesSection></ServicesSection>
         <About/>
         <AppointmentSection></AppointmentSection>
         <Footer></Footer>
         </div>
    )
}