import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SetupSuperAdmin() {
  const [isCreating, setIsCreating] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingAdmin();
  }, []);

  const checkExistingAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        toast.error('Un administrateur existe déjà');
        navigate('/auth');
        return;
      }
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      setChecking(false);
    }
  };

  const createSuperAdmin = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-super-admin', {
        body: {
          email: 'admin@legalform.ci',
          password: '@LegalForm2025',
          full_name: 'Super Admin',
          phone: ''
        }
      });

      if (error) throw error;

      toast.success('Compte super admin créé avec succès!');
      
      // Auto-login
      setTimeout(async () => {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: 'admin@legalform.ci',
          password: '@LegalForm2025',
        });

        if (loginError) {
          console.error('Auto-login error:', loginError);
          navigate('/auth');
        } else {
          navigate('/admin/dashboard');
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Error creating super admin:', error);
      toast.error(error.message || 'Erreur lors de la création du compte');
    } finally {
      setIsCreating(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuration Initiale</h1>
          <p className="text-muted-foreground">
            Créer le compte super administrateur
          </p>
        </div>

        <div className="space-y-4 mb-6 bg-muted/50 p-4 rounded-lg">
          <div>
            <span className="font-semibold">Email:</span> admin@legalform.ci
          </div>
          <div>
            <span className="font-semibold">Mot de passe:</span> @LegalForm2025
          </div>
        </div>

        <Button
          onClick={createSuperAdmin}
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            'Créer le compte super admin'
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Ce compte sera créé automatiquement et vous serez connecté.
        </p>
      </div>
    </div>
  );
}
