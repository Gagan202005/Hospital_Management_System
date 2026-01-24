import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DropDown from '../Core/Patient/Dropdown'
import { Phone, Clock, MapPin, Menu, X, Bot } from "lucide-react"; // Added Bot, X
import { Button } from "../ui/button"; // Assuming path is correct based on your snippet
import { useState } from 'react';

const Navbar = () => {
    const { user } = useSelector(state => state.profile);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <header className="bg-card shadow-card sticky top-0 z-50 border-b-slate-200 border-b">
            
            {/* Emergency Banner (Unchanged) */}
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
                    
                    {/* Logo Section */}
                    <div className="flex items-center gap-8">
                        <div>
                            <Link to="/">
                                <h1 className="text-2xl font-bold text-primary">MediCare General Hospital</h1>
                            </Link>
                            <p className="text-sm text-muted-foreground">Caring for Your Health Since 1985</p>
                        </div>
                    </div>

                    {/* Contact Info (Desktop Only) */}
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

                {/* Navigation Bar */}
                <nav className="flex items-center gap-8 mt-4 pt-4 border-t border-border">
                    
                    {/* Desktop Links (Replaced Map with Static Links) */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link to="/" className='text-foreground hover:text-primary transition-colors'>
                            Home
                        </Link>
                        <Link to="/about" className='text-foreground hover:text-primary transition-colors'>
                            About Us
                        </Link>
                        <a href="/#services" className='text-foreground hover:text-primary transition-colors cursor-pointer'>
                            Departments
                        </a>
                        <Link to="/find-doctor" className='text-foreground hover:text-primary transition-colors'>
                            Find a Doctor
                        </Link>
                        <Link to="/contact" className='text-foreground hover:text-primary transition-colors'>
                            Contact Us
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="ml-auto flex items-center gap-4">
                        
                        {/* AI Chatbot Button */}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="hidden sm:flex gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                            onClick={() => navigate("/ai-chat")}
                        >
                            <Bot className="h-4 w-4" /> AI Help
                        </Button>

                        {/* Auth Buttons */}
                        {user === null ? (
                            <div className='hidden sm:flex flex-row items-center gap-4'>
                                <Button variant="outline" size="sm" asChild>
                                    <Link to={'/login'}>Login</Link>
                                </Button>
                                <Button variant="default" size="sm" asChild>
                                    <Link to={'/signup'}>Signup</Link>
                                </Button>
                            </div>
                        ) : (
                            <div> 
                                <DropDown />
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button variant="ghost" size="icon" className="lg:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </nav>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mt-4 pt-4 border-t border-border flex flex-col gap-4 text-foreground font-medium pb-2 animate-in fade-in slide-in-from-top-2">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                        <a href="/#services" onClick={() => setIsMobileMenuOpen(false)}>Departments</a>
                        <Link to="/find-doctor" onClick={() => setIsMobileMenuOpen(false)}>Find a Doctor</Link>
                        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                        <Link to="/ai-chat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-primary">
                            <Bot className="h-4 w-4"/> AI Assistant
                        </Link>
                        
                        {user === null && (
                            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
                                <Button variant="outline" asChild onClick={() => setIsMobileMenuOpen(false)}>
                                    <Link to="/login">Login</Link>
                                </Button>
                                <Button variant="default" asChild onClick={() => setIsMobileMenuOpen(false)}>
                                    <Link to="/signup">Signup</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;