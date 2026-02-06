import { useState, useEffect, useRef } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIContentGenerator from "@/components/AIContentGenerator";
import ReactMarkdown from "react-markdown";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Image as ImageIcon, 
  Save,
  Bold,
  Italic,
  List,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Newspaper,
  Quote,
  Code,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  ListOrdered,
  Minus,
  Palette,
  Undo,
  Redo,
  ChevronLeft,
  ChevronRight
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

const ITEMS_PER_PAGE = 10;

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
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "",
    tags: "",
    is_published: false,
    author_name: ""
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'admin')) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  // Pagination
  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value)
    }));
  };

  const handleContentChange = (newContent: string) => {
    // Save to undo stack
    setUndoStack(prev => [...prev.slice(-20), formData.content]);
    setRedoStack([]);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousContent = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, formData.content]);
      setFormData(prev => ({ ...prev, content: previousContent }));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, formData.content]);
      setFormData(prev => ({ ...prev, content: nextContent }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `blog/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('company-logos')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      // If single image, set as cover
      if (uploadedUrls.length === 1) {
        setFormData(prev => ({ ...prev, cover_image: uploadedUrls[0] }));
      } else {
        // Insert images into content
        const imageMarkdown = uploadedUrls.map(url => `![Image](${url})`).join('\n\n');
        handleContentChange(formData.content + '\n\n' + imageMarkdown);
        if (!formData.cover_image) {
          setFormData(prev => ({ ...prev, cover_image: uploadedUrls[0] }));
        }
      }

      toast({ title: t('admin.uploadSuccess', 'Images téléchargées avec succès') });
    } catch (error: any) {
      toast({ 
        title: t('admin.error', 'Erreur'), 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const insertFormatting = (type: string, extraData?: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'texte en gras'}**`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'italic':
        newText = `*${selectedText || 'texte en italique'}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'h1':
        newText = `\n# ${selectedText || 'Titre principal'}\n`;
        break;
      case 'h2':
        newText = `\n## ${selectedText || 'Sous-titre'}\n`;
        break;
      case 'h3':
        newText = `\n### ${selectedText || 'Section'}\n`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'élément de liste'}\n- élément 2\n- élément 3`;
        break;
      case 'numbered':
        newText = `\n1. ${selectedText || 'premier élément'}\n2. deuxième élément\n3. troisième élément`;
        break;
      case 'link':
        newText = `[${selectedText || 'texte du lien'}](https://url.com)`;
        break;
      case 'quote':
        newText = `\n> ${selectedText || 'Citation importante'}\n`;
        break;
      case 'code':
        newText = selectedText.includes('\n') 
          ? `\n\`\`\`\n${selectedText || 'code'}\n\`\`\`\n`
          : `\`${selectedText || 'code'}\``;
        break;
      case 'table':
        newText = `\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|----------|\n| Données 1 | Données 2 | Données 3 |\n| Données 4 | Données 5 | Données 6 |\n`;
        break;
      case 'hr':
        newText = `\n---\n`;
        break;
      case 'color':
        // Color is applied via custom span (rendered in preview)
        newText = `<span style="color:${extraData || '#008080'}">${selectedText || 'texte coloré'}</span>`;
        break;
      case 'center':
        newText = `<div style="text-align:center">\n\n${selectedText || 'Texte centré'}\n\n</div>`;
        break;
    }

    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);
    handleContentChange(before + newText + after);

    // Focus and set cursor position
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPos = start + newText.length + cursorOffset;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({ 
        title: t('admin.error', 'Erreur'), 
        description: t('admin.fillRequired', 'Veuillez remplir les champs obligatoires'),
        variant: "destructive" 
      });
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const postData = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      excerpt: formData.excerpt || formData.content.substring(0, 200).replace(/[#*_`]/g, '') + '...',
      content: formData.content,
      cover_image: formData.cover_image || null,
      category: formData.category || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      is_published: formData.is_published,
      published_at: formData.is_published ? new Date().toISOString() : null,
      author_name: formData.author_name || 'Legal Form'
    };

    try {
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({ title: t('admin.articleUpdated', 'Article mis à jour') });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) throw error;
        toast({ title: t('admin.articleCreated', 'Article créé') });
      }

      setDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast({ 
        title: t('admin.error', 'Erreur'), 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_image: post.cover_image || "",
      category: post.category || "",
      tags: post.tags?.join(', ') || "",
      is_published: post.is_published || false,
      author_name: post.author_name || ""
    });
    setUndoStack([]);
    setRedoStack([]);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDelete', 'Êtes-vous sûr de vouloir supprimer cet article ?'))) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ 
        title: t('admin.error', 'Erreur'), 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ title: t('admin.articleDeleted', 'Article supprimé') });
      fetchPosts();
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      category: "",
      tags: "",
      is_published: false,
      author_name: ""
    });
    setUndoStack([]);
    setRedoStack([]);
    setEditorTab("write");
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const colorOptions = ['#008080', '#e74c3c', '#3498db', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('admin.newsManagement', 'Gestion des Actualités')}</h1>
            <p className="text-slate-400 mt-1">{t('admin.newsDesc', 'Créez et gérez les articles d\'actualité')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.newArticle', 'Nouvel article')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  {editingPost ? t('admin.editArticle', 'Modifier l\'article') : t('admin.newArticle', 'Nouvel article')}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('admin.title', 'Titre')} *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder={t('admin.titlePlaceholder', 'Titre de l\'article')}
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">{t('admin.slug', 'Slug URL')}</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="titre-de-l-article"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t('admin.category', 'Catégorie')}</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Fiscalité, Juridique, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">{t('admin.author', 'Auteur')}</Label>
                    <Input
                      id="author"
                      value={formData.author_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                      placeholder="Legal Form"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">{t('admin.tags', 'Tags')}</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="fiscalité, entreprise"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">{t('admin.excerpt', 'Résumé')}</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder={t('admin.excerptPlaceholder', 'Bref résumé de l\'article')}
                    rows={2}
                  />
                </div>

                {/* Advanced Rich Text Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t('admin.content', 'Contenu')} *</Label>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant="ghost" onClick={handleUndo} disabled={undoStack.length === 0}>
                        <Undo className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={handleRedo} disabled={redoStack.length === 0}>
                        <Redo className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-1 p-2 border rounded-t-md bg-muted">
                    {/* Text formatting */}
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('bold')} title="Gras">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('italic')} title="Italique">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* Headings */}
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('h1')} title="Titre H1">
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('h2')} title="Titre H2">
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('h3')} title="Titre H3">
                      <Heading3 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* Lists */}
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('list')} title="Liste à puces">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('numbered')} title="Liste numérotée">
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* Advanced */}
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('quote')} title="Citation">
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('code')} title="Code">
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('link')} title="Lien">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('table')} title="Tableau">
                      <TableIcon className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('hr')} title="Ligne horizontale">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* Colors */}
                    <div className="relative group">
                      <Button type="button" size="sm" variant="ghost" title="Couleur du texte">
                        <Palette className="h-4 w-4" />
                      </Button>
                      <div className="absolute top-full left-0 mt-1 hidden group-hover:flex gap-1 p-2 bg-popover border rounded-md shadow-lg z-50">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => insertFormatting('color', color)}
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('center')} title="Centrer">
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1" />
                    
                    {/* Image upload */}
                    <Label htmlFor="imageUpload" className="cursor-pointer">
                      <Button type="button" size="sm" variant="outline" asChild disabled={uploading}>
                        <span>
                          <ImageIcon className="h-4 w-4 mr-1" />
                          {uploading ? 'Upload...' : 'Images'}
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  {/* Editor with tabs */}
                  <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as "write" | "preview")}>
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="write">Écrire</TabsTrigger>
                      <TabsTrigger value="preview">Aperçu</TabsTrigger>
                    </TabsList>
                    <TabsContent value="write" className="mt-0">
                      <Textarea
                        ref={contentRef}
                        value={formData.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Rédigez votre article ici... (Markdown et HTML supportés)"
                        rows={16}
                        className="rounded-t-none font-mono text-sm min-h-[400px]"
                      />
                    </TabsContent>
                    <TabsContent value="preview" className="mt-0">
                      <div className="border rounded-md p-4 min-h-[400px] max-h-[500px] overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
                        {formData.content ? (
                          <ReactMarkdown
                            components={{
                              h1: ({children}) => <h1 className="text-3xl font-bold text-primary mb-4 mt-6">{children}</h1>,
                              h2: ({children}) => <h2 className="text-2xl font-semibold text-foreground mb-3 mt-5">{children}</h2>,
                              h3: ({children}) => <h3 className="text-xl font-medium text-foreground mb-2 mt-4">{children}</h3>,
                              p: ({children}) => <p className="mb-4 leading-relaxed">{children}</p>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                              blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 bg-muted/50 py-2">{children}</blockquote>,
                              table: ({children}) => <table className="w-full border-collapse border my-4">{children}</table>,
                              th: ({children}) => <th className="border p-2 bg-muted font-semibold text-left">{children}</th>,
                              td: ({children}) => <td className="border p-2">{children}</td>,
                              code: ({children, className}) => className ? (
                                <pre className="bg-muted p-3 rounded-md overflow-x-auto my-4"><code className="text-sm">{children}</code></pre>
                              ) : (
                                <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                              ),
                              hr: () => <hr className="my-6 border-t-2 border-muted" />,
                              a: ({href, children}) => <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">{children}</a>,
                              img: ({src, alt}) => <img src={src} alt={alt || ''} className="max-w-full h-auto rounded-lg my-4" />,
                            }}
                          >
                            {formData.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground">L'aperçu apparaîtra ici...</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* AI Content Generator */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-md border-2 border-dashed border-primary/30">
                  <div className="flex-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      ✨ Génération IA
                    </p>
                    <p className="text-xs text-muted-foreground">Écrivez votre contenu, puis cliquez sur Générer pour enrichir automatiquement</p>
                  </div>
                  <AIContentGenerator
                    content={formData.content}
                    onGenerate={(generated) => {
                      setFormData(prev => ({
                        ...prev,
                        title: generated.title || prev.title,
                        excerpt: generated.excerpt || prev.excerpt,
                        category: generated.category || prev.category,
                        content: generated.formattedContent || prev.content,
                        slug: generateSlug(generated.title || prev.title),
                      }));
                    }}
                    disabled={formData.content.length < 20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover">{t('admin.coverImage', 'Image de couverture')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cover"
                      value={formData.cover_image}
                      onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                      placeholder="https://..."
                      className="flex-1"
                    />
                  </div>
                  {formData.cover_image && (
                    <img src={formData.cover_image} alt="Cover preview" className="h-32 object-cover rounded-md" />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label>Publier immédiatement</Label>
                  </div>
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" />
                    {editingPost ? 'Mettre à jour' : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Total articles</p>
              <p className="text-2xl font-bold text-white">{posts.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Publiés</p>
              <p className="text-2xl font-bold text-green-400">{posts.filter(p => p.is_published).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Brouillons</p>
              <p className="text-2xl font-bold text-yellow-400">{posts.filter(p => !p.is_published).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Vues totales</p>
              <p className="text-2xl font-bold text-primary">{posts.reduce((acc, p) => acc + (p.views_count || 0), 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Articles Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Articles ({posts.length})</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm font-normal">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-slate-400">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Image</TableHead>
                  <TableHead className="text-slate-400">Titre</TableHead>
                  <TableHead className="text-slate-400">Catégorie</TableHead>
                  <TableHead className="text-slate-400">Statut</TableHead>
                  <TableHead className="text-slate-400">Vues</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : paginatedPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      Aucun article
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPosts.map((post) => (
                    <TableRow key={post.id} className="border-slate-700">
                      <TableCell>
                        {post.cover_image ? (
                          <img src={post.cover_image} alt="" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center">
                            <Newspaper className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-medium max-w-[200px] truncate">
                        {post.title}
                      </TableCell>
                      <TableCell>
                        {post.category && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            {post.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.is_published ? "default" : "secondary"} className={post.is_published ? "bg-green-500" : "bg-yellow-500"}>
                          {post.is_published ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{post.views_count || 0}</TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(post.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(post)}>
                            <Edit2 className="h-4 w-4 text-blue-400" />
                          </Button>
                          <Button size="icon" variant="ghost" asChild>
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 text-green-400" />
                            </a>
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default NewsManagement;