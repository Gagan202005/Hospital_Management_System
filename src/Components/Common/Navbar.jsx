import { Link} from 'react-router-dom'
import { NavbarLinks } from '../../Data/navbarlinks'
import { useSelector } from 'react-redux'
import DropDown from '../Core/dashboard/Dropdown'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Phone, Clock, MapPin, Menu } from "lucide-react";
import { Button } from "./Button";
const Navbar = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.profile);
    const navigate = useNavigate();
  return (
    <header className="bg-card shadow-card sticky top-0 z-50">
      {/* Emergency Banner */}
      <div className="bg-destructive text-destructive-foreground py-2">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 text-sm">
          <Phone className="h-4 w-4" />
          <span className="font-medium">Emergency: 911</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">24/7 Emergency Care Available</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
            <Link to="/"><h1 className="text-2xl font-bold text-primary">MediCare General Hospital</h1></Link>
              <p className="text-sm text-muted-foreground">Caring for Your Health Since 1985</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Mon-Fri: 6AM-10PM</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>123 Health St, Medical City</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">(555) 123-4567</span>
            </div>
          </div>

        </div>
        <nav className="hidden lg:flex items-center gap-8 mt-4 pt-4 border-t border-border">
          {
                    NavbarLinks?.map((cur,idx) =>(
    
                        <Link to={`${cur?.path}`} className='text-foreground hover:text-primary transition-colors' key={idx}>
                    {cur.title}  
                         </Link>
                     ))
                 }
          <div className="ml-auto">
            {
                (user===null) ? (
                    <div className='flex flex-row items-center gap-4'>
                        <Button variant="outline" size="sm" asChild>
                        <Link to={'/login'} >
                            Login
                        </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                        <Link to={'/signup'}>
                            Signup
                        </Link>
                        </Button>
                    </div>
                ) : (
                    <div> 
                        <DropDown></DropDown>
                    </div>
                )
            }
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;