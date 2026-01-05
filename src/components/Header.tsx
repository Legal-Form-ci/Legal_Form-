import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, LogIn, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navigation = [
    { name: t('nav.home'), href: "/" },
    { name: t('nav.services'), href: "/services" },
    { name: t('nav.regions'), href: "/regions" },
    { name: t('nav.showcase'), href: "/showcase" },
    { name: t('nav.pricing'), href: "/pricing" },
    { name: t('hero.track', 'Suivre mon dossier'), href: "/tracking", icon: Search },
    { name: t('nav.contact'), href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={logo} alt="Legal Form" className="h-12 w-12 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl text-primary">Legal Form</span>
              <span className="text-xs text-muted-foreground">Création d'entreprise</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA + Language */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Language Switcher */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => changeLanguage('fr')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  i18n.language === 'fr' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  i18n.language === 'en' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted'
                }`}
              >
                EN
              </button>
            </div>
            
            {user ? (
              <Link to={userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard'}>
                <Button variant="outline" className="font-semibold">
                  {t('nav.mySpace')}
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="font-semibold">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('nav.login')}
                </Button>
              </Link>
            )}
            <Link to="/create">
              <Button className="bg-gradient-accent hover:opacity-90 shadow-soft font-semibold">
                {t('nav.createCompany')}
              </Button>
            </Link>
          </div>

          {/* Mobile: Language + Menu */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Language Switcher */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => changeLanguage('fr')}
                className={`px-2 py-1.5 text-xs font-medium transition-colors ${
                  i18n.language === 'fr' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1.5 text-xs font-medium transition-colors ${
                  i18n.language === 'en' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted'
                }`}
              >
                EN
              </button>
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-border animate-fade-in">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 px-4 space-y-2">
              {user ? (
                <Link to={userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard'} onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold">
                    {t('nav.mySpace')}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('nav.login')}
                  </Button>
                </Link>
              )}
              <Link to="/create" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gradient-accent hover:opacity-90 shadow-soft font-semibold">
                  {t('nav.createCompany')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
