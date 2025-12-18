import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Edit, Trash2, Shield, Users } from "lucide-react";
import AdminLayout from "./AdminLayout";

interface InternalUser {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
  phone: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  service_client: "Service Client",
  superviseur: "Superviseur",
  comptable: "Comptable",
  controle_qualite: "Contrôle Qualité",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-500",
  service_client: "bg-blue-500",
  superviseur: "bg-purple-500",
  comptable: "bg-green-500",
  controle_qualite: "bg-orange-500",
};

const TeamManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "service_client",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('internal_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('internal_users')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Utilisateur ${!currentStatus ? 'activé' : 'désactivé'}`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    // Note: Creating internal users requires first creating an auth user
    // This is a simplified version - in production, you'd use an edge function
    toast({
      title: "Information",
      description: "La création d'utilisateurs internes nécessite une configuration supplémentaire. Contactez le développeur.",
    });
    setIsDialogOpen(false);
  };

  if (loading) {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Équipe Legal Form</h1>
            <p className="text-slate-400 mt-1">Gérez les utilisateurs internes et leurs permissions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Ajouter un membre de l'équipe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-slate-300">Nom complet</Label>
                  <Input
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Prénom Nom"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                    placeholder="email@legalform.ci"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Téléphone</Label>
                  <Input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Rôle</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="service_client">Service Client</SelectItem>
                      <SelectItem value="superviseur">Superviseur</SelectItem>
                      <SelectItem value="comptable">Comptable</SelectItem>
                      <SelectItem value="controle_qualite">Contrôle Qualité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full bg-primary hover:bg-primary/90">
                  Créer le membre
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(roleLabels).map(([role, label]) => {
            const count = users.filter(u => u.role === role).length;
            return (
              <Card key={role} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 rounded-full ${roleColors[role]} mx-auto mb-2 flex items-center justify-center`}>
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Users Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membres de l'équipe ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Nom</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Téléphone</TableHead>
                    <TableHead className="text-slate-300">Rôle</TableHead>
                    <TableHead className="text-slate-300">Statut</TableHead>
                    <TableHead className="text-slate-300">Ajouté le</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                        Aucun membre dans l'équipe
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="font-medium text-white">{user.full_name}</TableCell>
                        <TableCell className="text-slate-300">{user.email}</TableCell>
                        <TableCell className="text-slate-300">{user.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge className={roleColors[user.role]}>
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.is_active ? 'bg-green-500' : 'bg-red-500'}>
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className="text-slate-300 hover:text-white"
                            >
                              {user.is_active ? 'Désactiver' : 'Activer'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TeamManagement;
