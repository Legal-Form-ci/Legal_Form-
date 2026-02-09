import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  HelpCircle,
  GripVertical,
  Building2,
  CreditCard,
  Clock,
  FileText,
  Users,
  Settings,
  Loader2
} from "lucide-react";

interface FAQ {
  id: string;
  category_id: string;
  category_name: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { id: 'company-creation', name: "Création d'entreprise", icon: Building2 },
  { id: 'payment', name: 'Paiement & Tarifs', icon: CreditCard },
  { id: 'process', name: 'Processus & Suivi', icon: Clock },
  { id: 'documents', name: 'Documents & Livrables', icon: FileText },
  { id: 'services', name: 'Services Additionnels', icon: Users },
  { id: 'general', name: 'Général', icon: Settings },
];

const FAQManagement = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [formData, setFormData] = useState({
    category_id: "general",
    category_name: "Général",
    question: "",
    answer: "",
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'admin')) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs' as any)
        .select('*')
        .order('category_id')
        .order('sort_order');

      if (!error && data) {
        setFaqs(data as unknown as FAQ[]);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      category_name: category?.name || 'Général'
    }));
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({ 
        title: "Erreur", 
        description: "La question et la réponse sont obligatoires",
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);

    try {
      if (editingFaq) {
        const { error } = await supabase
          .from('faqs' as any)
          .update({
            category_id: formData.category_id,
            category_name: formData.category_name,
            question: formData.question,
            answer: formData.answer,
            sort_order: formData.sort_order,
            is_active: formData.is_active
          } as any)
          .eq('id', editingFaq.id);

        if (error) throw error;
        toast({ title: "FAQ mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from('faqs' as any)
          .insert({
            category_id: formData.category_id,
            category_name: formData.category_name,
            question: formData.question,
            answer: formData.answer,
            sort_order: formData.sort_order,
            is_active: formData.is_active
          } as any);

        if (error) throw error;
        toast({ title: "FAQ créée avec succès" });
      }

      setDialogOpen(false);
      resetForm();
      fetchFaqs();
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      category_id: faq.category_id,
      category_name: faq.category_name,
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order,
      is_active: faq.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette FAQ ?")) return;

    const { error } = await supabase
      .from('faqs' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({ 
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ title: "FAQ supprimée" });
      fetchFaqs();
    }
  };

  const toggleActive = async (faq: FAQ) => {
    const { error } = await supabase
      .from('faqs' as any)
      .update({ is_active: !faq.is_active } as any)
      .eq('id', faq.id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      fetchFaqs();
    }
  };

  const resetForm = () => {
    setEditingFaq(null);
    setFormData({
      category_id: "general",
      category_name: "Général",
      question: "",
      answer: "",
      sort_order: 0,
      is_active: true
    });
  };

  const filteredFaqs = filterCategory === "all" 
    ? faqs 
    : faqs.filter(f => f.category_id === filterCategory);

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-8 w-8 text-primary" />
              Gestion des FAQ
            </h1>
            <p className="text-slate-400 mt-1">Gérez les questions fréquentes affichées sur le site</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFaq ? "Modifier la FAQ" : "Nouvelle FAQ"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => {
                          const Icon = cat.icon;
                          return (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {cat.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ordre d'affichage</Label>
                    <Input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      min={0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Question *</Label>
                  <Input
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Quelle est votre question ?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Réponse *</Label>
                  <Textarea
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Rédigez une réponse claire et détaillée..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Astuce : Utilisez des retours à la ligne pour structurer votre réponse
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>FAQ active et visible</Label>
                  </div>
                  <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90">
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {editingFaq ? "Mettre à jour" : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Total FAQ</p>
              <p className="text-2xl font-bold text-white">{faqs.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Actives</p>
              <p className="text-2xl font-bold text-green-400">{faqs.filter(f => f.is_active).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Catégories</p>
              <p className="text-2xl font-bold text-primary">{new Set(faqs.map(f => f.category_id)).size}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Inactives</p>
              <p className="text-2xl font-bold text-accent">{faqs.filter(f => !f.is_active).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="text-slate-400">Filtrer par catégorie :</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-64 bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">FAQ ({filteredFaqs.length})</CardTitle>
            <CardDescription className="text-slate-400">
              Les modifications sont synchronisées en temps réel sur le site public
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune FAQ trouvée</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400 w-8">#</TableHead>
                    <TableHead className="text-slate-400">Catégorie</TableHead>
                    <TableHead className="text-slate-400">Question</TableHead>
                    <TableHead className="text-slate-400">Statut</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaqs.map((faq) => (
                    <TableRow key={faq.id} className="border-slate-700">
                      <TableCell className="text-slate-400">
                        <GripVertical className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-primary border-primary/50">
                          {faq.category_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white max-w-md">
                        <p className="font-medium truncate">{faq.question}</p>
                        <p className="text-xs text-slate-400 truncate mt-1">{faq.answer.substring(0, 80)}...</p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={faq.is_active ? "default" : "secondary"}
                          className={faq.is_active ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-accent/20 text-accent border-accent/50"}
                        >
                          {faq.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(faq)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Switch checked={faq.is_active} className="scale-75" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(faq)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(faq.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default FAQManagement;
