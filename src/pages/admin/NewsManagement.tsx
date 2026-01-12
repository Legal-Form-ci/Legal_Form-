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
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Upload, 
  Image as ImageIcon, 
  FileVideo, 
  Save,
  Bold,
  Italic,
  List,
  Heading,
  Link as LinkIcon,
  Newspaper
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
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      // If single image, set as cover
      if (uploadedUrls.length === 1) {
        setFormData(prev => ({ ...prev, cover_image: uploadedUrls[0] }));
      } else {
        // Insert images into content
        const imageMarkdown = uploadedUrls.map(url => `![Image](${url})`).join('\n\n');
        setFormData(prev => ({ 
          ...prev, 
          content: prev.content + '\n\n' + imageMarkdown,
          cover_image: prev.cover_image || uploadedUrls[0]
        }));
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

  const insertFormatting = (type: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'texte'}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'texte'}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'heading':
        newText = `## ${selectedText || 'Titre'}`;
        cursorOffset = selectedText ? 0 : 3;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'élément'}`;
        cursorOffset = selectedText ? 0 : 3;
        break;
      case 'link':
        newText = `[${selectedText || 'texte'}](url)`;
        cursorOffset = selectedText ? 0 : 1;
        break;
    }

    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: before + newText + after }));
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
      excerpt: formData.excerpt || formData.content.substring(0, 200) + '...',
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t('admin.category', 'Catégorie')}</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder={t('admin.categoryPlaceholder', 'Fiscalité, Juridique, etc.')}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">{t('admin.tags', 'Tags')} ({t('admin.commaSeparated', 'séparés par des virgules')})</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="fiscalité, entreprise, réforme"
                  />
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

                {/* Rich text editor toolbar */}
                <div className="space-y-2">
                  <Label>{t('admin.content', 'Contenu')} *</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-t-md bg-muted">
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('bold')}>
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('italic')}>
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('heading')}>
                      <Heading className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('list')}>
                      <List className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('link')}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <div className="flex-1" />
                    <Label htmlFor="imageUpload" className="cursor-pointer">
                      <Button type="button" size="sm" variant="ghost" asChild disabled={uploading}>
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
                  <Textarea
                    ref={contentRef}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={t('admin.contentPlaceholder', 'Contenu de l\'article (Markdown supporté)')}
                    rows={12}
                    className="rounded-t-none font-mono text-sm"
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
                    <Label>{t('admin.publishNow', 'Publier maintenant')}</Label>
                  </div>
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" />
                    {editingPost ? t('admin.update', 'Mettre à jour') : t('admin.create', 'Créer')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">{posts.length}</div>
              <p className="text-slate-400">{t('admin.totalArticles', 'Total articles')}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{posts.filter(p => p.is_published).length}</div>
              <p className="text-slate-400">{t('admin.published', 'Publiés')}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">{posts.filter(p => !p.is_published).length}</div>
              <p className="text-slate-400">{t('admin.drafts', 'Brouillons')}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">
                {posts.reduce((sum, p) => sum + (p.views_count || 0), 0)}
              </div>
              <p className="text-slate-400">{t('admin.totalViews', 'Vues totales')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Articles Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              {t('admin.articles', 'Articles')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                {t('admin.noArticles', 'Aucun article pour le moment')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">{t('admin.title', 'Titre')}</TableHead>
                      <TableHead className="text-slate-300">{t('admin.category', 'Catégorie')}</TableHead>
                      <TableHead className="text-slate-300">{t('admin.status', 'Statut')}</TableHead>
                      <TableHead className="text-slate-300">{t('admin.views', 'Vues')}</TableHead>
                      <TableHead className="text-slate-300">{t('admin.date', 'Date')}</TableHead>
                      <TableHead className="text-slate-300">{t('admin.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="text-white font-medium max-w-[250px] truncate">
                          {post.title}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {post.category || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={post.is_published ? 'bg-green-500' : 'bg-yellow-500'}>
                            {post.is_published ? t('admin.published', 'Publié') : t('admin.draft', 'Brouillon')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {post.views_count || 0}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(post.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" asChild className="text-slate-300 hover:text-white">
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(post)} className="text-slate-300 hover:text-white">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default NewsManagement;
