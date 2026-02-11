import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'client';
      }
      
      return data?.role || 'client';
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return 'client';
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = "Un compte existe déjà avec cet email. Veuillez vous connecter.";
        } else if (error.message.includes('Password')) {
          errorMessage = "Le mot de passe doit contenir au moins 6 caractères.";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Veuillez entrer une adresse email valide.";
        }
        
        toast({
          title: "Erreur d'inscription",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }
      
      // If user was created and auto-confirmed
      if (data.user && data.session) {
        // Create profile
        await supabase.from('profiles').upsert({
          user_id: data.user.id,
          full_name: fullName,
          phone: phone,
        }, { onConflict: 'user_id' });

        // Create default role
        await supabase.from('user_roles').upsert({
          user_id: data.user.id,
          role: 'client',
        }, { onConflict: 'user_id' });

        setUserRole('client');
        
        toast({
          title: "Inscription réussie",
          description: "Bienvenue sur Legal Form !",
        });

        navigate('/client/dashboard');
      } else if (data.user) {
        // Email confirmation required
        toast({
          title: "Inscription réussie",
          description: "Bienvenue sur Legal Form ! Vous pouvez maintenant vous connecter.",
        });
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('SignUp error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou mot de passe incorrect.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
        }
        
        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      
      // Fetch user role and redirect
      if (data.user) {
        // Ensure profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!profile) {
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            full_name: data.user.user_metadata?.full_name || '',
            phone: data.user.user_metadata?.phone || '',
          });
        }

        // Get or create role
        let { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!roleData) {
          await supabase.from('user_roles').insert({
            user_id: data.user.id,
            role: 'client',
          });
          roleData = { role: 'client' };
        }
        
        const role = roleData?.role || 'client';
        setUserRole(role);
        
        console.log('[useAuth] User role determined:', role);
        
        // Navigate immediately based on role - no setTimeout needed
        if (role === 'admin' || role === 'team') {
          console.log('[useAuth] Navigating to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log('[useAuth] Navigating to client dashboard');
          navigate('/client/dashboard', { replace: true });
        }
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('SignIn error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      toast({
        title: "Déconnexion",
        description: "À bientôt !",
      });
      
      navigate("/");
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  return {
    user,
    session,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
  };
};
