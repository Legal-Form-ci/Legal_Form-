import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  Plus, Edit2, Trash2, Eye, Save, Sparkles, Loader2, ImageIcon, Newspaper,
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, Minus, Undo, Redo, ChevronLeft, ChevronRight,
  Table as TableIcon, Palette, Link as LinkIcon, Upload, X, Wand2
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  author_name: string | null;
  views_count: number | null;
  created_at: string;
}

const CATEGORIES = ["Fiscalité", "Juridique", "Entrepreneuriat", "Actualités", "Formation", "Conseils", "Financement", "Innovation"];
const ITEMS_PER_PAGE = 8;

const NewsManagement = () => {
  const { t } = useTranslation();
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showGenerateOptions, setShowGenerateOptions] = useState(false);

  // Undo/redo
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "",
    tags: "",
    is_published: false,
    author_name: "Legal Form",
  });

  useEffect(() => {
    if (!authLoading && userRole !== "admin") navigate("/auth");
  }, [userRole, authLoading]);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-20), form.content]);
    setRedoStack([]);
  }, [form.content]);

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, form.content]);
    setUndoStack(u => u.slice(0, -1));
    setForm(f => ({ ...f, content: prev }));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, form.content]);
    setRedoStack(r => r.slice(0, -1));
    setForm(f => ({ ...f, content: next }));
  };

  const insertAtCursor = (before: string, after: string = "") => {
    pushUndo();
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.substring(start, end);
    const newContent = form.content.substring(0, start) + before + selected + after + form.content.substring(end);
    setForm(f => ({ ...f, content: newContent }));
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    }, 0);
  };

  // AI Generation with options
  const handleGenerate = async (withImage: boolean) => {
    setShowGenerateOptions(false);
    if (!form.content.trim()) {
      toast({ title: "Contenu requis", description: "Saisissez au moins quelques mots", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    if (withImage) setGeneratingImage(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-content-generator", {
        body: { content: form.content, mode: "article", generateImage: withImage },
      });

      if (error) throw error;

      if (data) {
        pushUndo();
        setForm(f => ({
          ...f,
          title: data.title || f.title,
          slug: generateSlug(data.title || f.title),
          excerpt: data.excerpt || f.excerpt,
          category: data.category || f.category,
          tags: (data.tags || []).join(", "),
          content: data.formattedContent || f.content,
          cover_image: data.generatedImage || f.cover_image,
        }));
        toast({ title: "✨ Contenu généré", description: "L'IA a enrichi votre article avec succès" });
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({ title: "Erreur", description: error.message || "Impossible de générer", variant: "destructive" });
    } finally {
      setIsGenerating(false);
      setGeneratingImage(false);
    }
  };

  const savePost = async () => {
    if (!form.title || !form.content) {
      toast({ title: "Champs requis", description: "Titre et contenu sont obligatoires", variant: "destructive" });
      return;
    }

    const slug = form.slug || generateSlug(form.title);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);

    const postData = {
      title: form.title,
      slug,
      excerpt: form.excerpt,
      content: form.content,
      cover_image: form.cover_image,
      category: form.category,
      tags,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      author_name: form.author_name,
      author_id: user?.id,
    };

    try {
      if (editingPost) {
        const { error } = await supabase.from("blog_posts").update(postData).eq("id", editingPost.id);
        if (error) throw error;
        toast({ title: "Article mis à jour" });
      } else {
        const { error } = await supabase.from("blog_posts").insert(postData);
        if (error) throw error;
        toast({ title: "Article créé" });
      }
      setDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Article supprimé" });
      fetchPosts();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", category: "", tags: "", is_published: false, author_name: "Legal Form" });
    setEditingPost(null);
    setPreviewMode(false);
    setUndoStack([]);
    setRedoStack([]);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_image: post.cover_image || "",
      category: post.category || "",
      tags: (post.tags || []).join(", "),
      is_published: post.is_published || false,
      author_name: post.author_name || "Legal Form",
    });
    setDialogOpen(true);
  };

  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginatedPosts = posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Toolbar buttons
  const toolbarButtons = [
    { icon: Bold, action: () => insertAtCursor("**", "**"), title: "Gras" },
    { icon: Italic, action: () => insertAtCursor("*", "*"), title: "Italique" },
    { icon: Heading1, action: () => insertAtCursor("\n# ", "\n"), title: "Titre 1" },
    { icon: Heading2, action: () => insertAtCursor("\n## ", "\n"), title: "Titre 2" },
    { icon: Heading3, action: () => insertAtCursor("\n### ", "\n"), title: "Titre 3" },
    { icon: List, action: () => insertAtCursor("\n- ", "\n"), title: "Liste" },
    { icon: ListOrdered, action: () => insertAtCursor("\n1. ", "\n"), title: "Liste numérotée" },
    { icon: Quote, action: () => insertAtCursor("\n> ", "\n"), title: "Citation" },
    { icon: Minus, action: () => insertAtCursor("\n---\n"), title: "Séparateur" },
    { icon: LinkIcon, action: () => insertAtCursor("[", "](url)"), title: "Lien" },
    { icon: TableIcon, action: () => insertAtCursor("\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|---|---|---|\n| ", " | | |\n"), title: "Tableau" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              Gestion des Actualités
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {posts.length} article{posts.length !== 1 ? "s" : ""} • Éditeur assisté par IA
            </p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Nouvel article
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: posts.length, color: "text-primary" },
            { label: "Publiés", value: posts.filter(p => p.is_published).length, color: "text-green-600" },
            { label: "Brouillons", value: posts.filter(p => !p.is_published).length, color: "text-amber-600" },
            { label: "Vues totales", value: posts.reduce((sum, p) => sum + (p.views_count || 0), 0), color: "text-blue-600" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Posts list */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun article. Créez votre premier !</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                      <TableHead className="hidden md:table-cell">Statut</TableHead>
                      <TableHead className="hidden md:table-cell">Vues</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPosts.map(post => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {post.cover_image && (
                              <img src={post.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover hidden sm:block" />
                            )}
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{post.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{post.category || "—"}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={post.is_published ? "default" : "outline"}>
                            {post.is_published ? "Publié" : "Brouillon"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{post.views_count || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(post)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deletePost(post.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-4 border-t">
                    <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button key={i} size="sm" variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </Button>
                    ))}
                    <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Editor Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                {editingPost ? "Modifier l'article" : "Nouvel article"}
              </DialogTitle>
              <DialogDescription>
                Saisissez votre contenu et laissez l'IA l'enrichir automatiquement
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* AI Generator Section */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Assistant IA</p>
                        <p className="text-xs text-muted-foreground">Saisissez du texte ci-dessous, même minimal, puis cliquez sur Générer</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowGenerateOptions(true)}
                        disabled={isGenerating || !form.content.trim()}
                        className="gap-2"
                      >
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isGenerating ? "Génération..." : "Générer"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Options Popup */}
              <Dialog open={showGenerateOptions} onOpenChange={setShowGenerateOptions}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Type de génération
                    </DialogTitle>
                    <DialogDescription>
                      Choisissez le format de publication souhaité
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => handleGenerate(true)}>
                      <ImageIcon className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium">Article avec image IA</p>
                        <p className="text-xs text-muted-foreground">L'IA génère le contenu + une image de couverture</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => handleGenerate(false)}>
                      <Newspaper className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium">Article texte uniquement</p>
                        <p className="text-xs text-muted-foreground">L'IA structure et enrichit le contenu</p>
                      </div>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Title & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }))}
                    placeholder="Titre de l'article"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Résumé</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Résumé court de l'article"
                  rows={2}
                />
              </div>

              {/* Cover Image */}
              {form.cover_image && (
                <div className="space-y-2">
                  <Label>Image de couverture</Label>
                  <div className="relative inline-block">
                    <img src={form.cover_image} alt="Cover" className="w-full max-h-48 object-cover rounded-lg" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setForm(f => ({ ...f, cover_image: "" }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {generatingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Editor with toolbar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Contenu</Label>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant={previewMode ? "outline" : "default"} onClick={() => setPreviewMode(false)}>
                      <Edit2 className="h-3 w-3 mr-1" /> Éditeur
                    </Button>
                    <Button size="sm" variant={previewMode ? "default" : "outline"} onClick={() => setPreviewMode(true)}>
                      <Eye className="h-3 w-3 mr-1" /> Aperçu
                    </Button>
                  </div>
                </div>

                {!previewMode && (
                  <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-t-lg border border-b-0">
                    {toolbarButtons.map((btn, i) => (
                      <Button key={i} size="icon" variant="ghost" className="h-8 w-8" onClick={btn.action} title={btn.title}>
                        <btn.icon className="h-4 w-4" />
                      </Button>
                    ))}
                    <div className="w-px bg-border mx-1" />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={undo} disabled={undoStack.length === 0} title="Annuler">
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={redo} disabled={redoStack.length === 0} title="Rétablir">
                      <Redo className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {previewMode ? (
                  <div className="border rounded-lg p-6 min-h-[300px] bg-white prose prose-sm max-w-none">
                    {form.cover_image && (
                      <img src={form.cover_image} alt={form.title} className="w-full max-h-64 object-cover rounded-lg mb-6" />
                    )}
                    {form.title && <h1 className="text-2xl font-bold mb-2">{form.title}</h1>}
                    {form.excerpt && <p className="text-muted-foreground italic mb-4">{form.excerpt}</p>}
                    {form.category && <Badge className="mb-4">{form.category}</Badge>}
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{form.content}</ReactMarkdown>
                    {form.tags && (
                      <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                        {form.tags.split(",").filter(Boolean).map((tag, i) => (
                          <span key={i} className="text-primary text-sm font-medium">#{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea
                    ref={contentRef}
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Saisissez votre contenu ici... L'IA se charge du reste ✨"
                    className="min-h-[300px] font-mono text-sm rounded-t-none"
                  />
                )}
              </div>

              {/* Tags & Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="entrepreneuriat, SARL, Côte d'Ivoire"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Auteur</Label>
                  <Input
                    id="author"
                    value={form.author_name}
                    onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_published}
                    onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))}
                  />
                  <Label>{form.is_published ? "Publié" : "Brouillon"}</Label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>
                    Annuler
                  </Button>
                  <Button onClick={savePost} className="gap-2">
                    <Save className="h-4 w-4" />
                    {editingPost ? "Mettre à jour" : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default NewsManagement;
