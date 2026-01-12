import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkles, ArrowRight, Building2, FileCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const WelcomePopup = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem("welcomePopupShown");
    
    if (!popupShown) {
      // Delay popup display by 2 seconds after page load
      const showTimer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("welcomePopupShown", "true");
      }, 2000);

      return () => clearTimeout(showTimer);
    }
  }, []);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setIsOpen(false);
    }
  }, [isOpen, countdown]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const features = [
    {
      icon: Building2,
      title: t('popup.feature1.title', 'Création rapide'),
      desc: t('popup.feature1.desc', 'Créez votre entreprise en 48h')
    },
    {
      icon: FileCheck,
      title: t('popup.feature2.title', '100% en ligne'),
      desc: t('popup.feature2.desc', 'Sans déplacement')
    },
    {
      icon: Clock,
      title: t('popup.feature3.title', 'Suivi en temps réel'),
      desc: t('popup.feature3.desc', 'Suivez votre dossier')
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] p-0 border-0 overflow-hidden bg-transparent">
        <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-2xl shadow-2xl overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent/30 blur-2xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Close button with countdown */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all group"
          >
            <span className="text-sm font-medium">{countdown}s</span>
            <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
          </button>

          {/* Content */}
          <div className="relative p-6 sm:p-8 text-center">
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 sm:mb-6">
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-accent animate-pulse" />
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-3">
              {t('popup.title', 'Bienvenue sur Legal Form')}
            </h2>
            
            {/* Subtitle */}
            <p className="text-white/90 text-base sm:text-lg mb-6 max-w-md mx-auto">
              {t('popup.subtitle', 'Votre partenaire de confiance pour la création et la gestion d\'entreprise en Côte d\'Ivoire')}
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent mx-auto mb-2" />
                    <h3 className="font-semibold text-white text-sm sm:text-base mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 text-xs sm:text-sm">
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/create" onClick={handleClose}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 h-auto group shadow-lg"
                >
                  {t('popup.cta', 'Créer mon entreprise')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleClose}
                className="w-full sm:w-auto border-2 border-white/30 bg-transparent text-white hover:bg-white/10 font-medium px-6 py-3 h-auto"
              >
                {t('popup.dismiss', 'Explorer le site')}
              </Button>
            </div>

            {/* Stats banner */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap justify-center gap-6 sm:gap-10 text-white">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-accent">100+</div>
                <div className="text-xs sm:text-sm text-white/70">{t('popup.stat1', 'Entreprises créées')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-accent">48h</div>
                <div className="text-xs sm:text-sm text-white/70">{t('popup.stat2', 'Délai moyen')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-accent">13</div>
                <div className="text-xs sm:text-sm text-white/70">{t('popup.stat3', 'Régions couvertes')}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
