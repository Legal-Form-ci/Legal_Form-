import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Globe, CreditCard, Save } from "lucide-react";
import AdminLayout from "./AdminLayout";

interface SiteSettings {
  site_name: string;
  site_tagline: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_email: string;
  address: string;
  price_abidjan: number;
  price_interior: number;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Legal Form",
    site_tagline: "Créer, gérer et accompagner votre entreprise",
    contact_phone: "+225 01 71 50 04 73",
    contact_whatsapp: "+225 07 09 67 79 25",
    contact_email: "contact@legalform.ci",
    address: "BPM 387, Grand-Bassam, ANCIENNE CIE, Côte d'Ivoire",
    price_abidjan: 180000,
    price_interior: 150000,
  });
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now (could be extended to database)
      localStorage.setItem('site_settings', JSON.stringify(settings));
      
      toast({
        title: "Succès",
        description: "Paramètres sauvegardés",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Paramètres</h1>
            <p className="text-slate-400 mt-1">Configurez les paramètres du site</p>
          </div>
          <Button onClick={saveSettings} disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary">
              <Settings className="mr-2 h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-primary">
              <Globe className="mr-2 h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-primary">
              <CreditCard className="mr-2 h-4 w-4" />
              Tarification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informations générales</CardTitle>
                <CardDescription className="text-slate-400">
                  Paramètres de base du site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Nom du site</Label>
                  <Input
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Slogan</Label>
                  <Input
                    value={settings.site_tagline}
                    onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informations de contact</CardTitle>
                <CardDescription className="text-slate-400">
                  Coordonnées affichées sur le site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Téléphone principal</Label>
                    <Input
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">WhatsApp</Label>
                    <Input
                      value={settings.contact_whatsapp}
                      onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Adresse</Label>
                  <Input
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tarification</CardTitle>
                <CardDescription className="text-slate-400">
                  Prix des créations d'entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Prix Abidjan (FCFA)</Label>
                    <Input
                      type="number"
                      value={settings.price_abidjan}
                      onChange={(e) => setSettings({ ...settings, price_abidjan: parseInt(e.target.value) || 0 })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">Prix pour les entreprises à Abidjan</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Prix Intérieur (FCFA)</Label>
                    <Input
                      type="number"
                      value={settings.price_interior}
                      onChange={(e) => setSettings({ ...settings, price_interior: parseInt(e.target.value) || 0 })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">Prix pour les entreprises à l'intérieur du pays</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;