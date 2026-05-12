import { Button } from "@/components/ui/button";
import { Menu, LogOut, Shield, ClipboardList, Hammer } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, isStaff, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/9339ea5f-8267-4cb7-aa75-5a50bbd6123e.png" 
            alt="TaskTroopers Logo" 
            className="h-12 w-12"
          />
          <h1 className="text-2xl font-bold text-foreground">TaskTroopers</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/#home" className="text-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/#services" className="text-foreground hover:text-primary transition-colors">Services</Link>
          <Link to="/#quote" className="text-foreground hover:text-primary transition-colors">Request a Quote</Link>
          <Link to="/#contact" className="text-foreground hover:text-primary transition-colors">Contact Us</Link>
          <Link to="/blog" className="text-foreground hover:text-primary transition-colors">Blog</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-foreground">
                  <ClipboardList className="h-4 w-4 mr-2" /> My Jobs
                </Button>
              </Link>
              {isStaff && !isAdmin && (
                <Link to="/staff">
                  <Button variant="ghost" className="text-foreground">
                    <Hammer className="h-4 w-4 mr-2" /> Staff
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-foreground">
                    <Shield className="h-4 w-4 mr-2" /> Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" className="text-foreground" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth"><Button variant="ghost" className="text-foreground">Log In</Button></Link>
              <Link to="/auth"><Button className="bg-gradient-primary hover:opacity-90">Sign Up</Button></Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link to="/#home" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/#services" className="text-foreground hover:text-primary transition-colors">Services</Link>
            <Link to="/#quote" className="text-foreground hover:text-primary transition-colors">Request a Quote</Link>
            <Link to="/#contact" className="text-foreground hover:text-primary transition-colors">Contact Us</Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">Blog</Link>
            <div className="flex flex-col space-y-2 pt-4 border-t border-border">
              {user ? (
                <>
                  <Link to="/dashboard"><Button variant="ghost" className="text-foreground justify-start w-full">My Jobs</Button></Link>
                  {isStaff && !isAdmin && (
                    <Link to="/staff"><Button variant="ghost" className="text-foreground justify-start w-full">Staff</Button></Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin"><Button variant="ghost" className="text-foreground justify-start w-full">Admin</Button></Link>
                  )}
                  <Button variant="ghost" className="text-foreground justify-start" onClick={handleSignOut}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Link to="/auth"><Button variant="ghost" className="text-foreground justify-start w-full">Log In</Button></Link>
                  <Link to="/auth"><Button className="bg-gradient-primary hover:opacity-90 justify-start w-full">Sign Up</Button></Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;