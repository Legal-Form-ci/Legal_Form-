import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  MessageSquare, 
  Settings, 
  CreditCard, 
  Star, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  BarChart3,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole !== 'admin') {
        navigate("/client/dashboard");
      }
    }
  }, [user, userRole, loading, navigate]);

  const navItems: NavItem[] = [
    { label: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Créations d'entreprise", href: "/admin/companies", icon: Building2 },
    { label: "Demandes de services", href: "/admin/services", icon: Briefcase },
    { label: "Tickets", href: "/admin/tickets", icon: MessageSquare, badge: 3 },
    { label: "Conversations LexiPro", href: "/admin/lexia", icon: MessageSquare },
    { label: "Documents ID", href: "/admin/identity-documents", icon: FileText },
    { label: "Factures", href: "/admin/invoices", icon: FileText },
    { label: "Paiements", href: "/admin/payments", icon: CreditCard },
    { label: "Témoignages", href: "/admin/testimonials", icon: Star },
    { label: "Utilisateurs internes", href: "/admin/team", icon: Users },
    { label: "Statistiques", href: "/admin/analytics", icon: BarChart3 },
    { label: "Paramètres", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 z-40 hidden lg:flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <img src={logo} alt="Legal Form" className="h-10 w-10" />
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">Legal Form</span>
              <span className="text-xs text-slate-400">Administration</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                  isActive(item.href)
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white text-xs">{item.badge}</Badge>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <LogOut className="h-5 w-5 mr-3" />
            {sidebarOpen && "Déconnexion"}
          </Button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 bg-slate-700 border border-slate-600 rounded-full p-1.5 hover:bg-slate-600 transition-colors"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", sidebarOpen ? "-rotate-90" : "rotate-90")} />
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-800 border-b border-slate-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Legal Form" className="h-8 w-8" />
          <span className="font-bold text-primary">Legal Form</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/95 z-40 pt-16 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge className="bg-red-500 text-white">{item.badge}</Badge>
                  )}
                </button>
              );
            })}
            <div className="pt-4 border-t border-slate-700 mt-4">
              <Button
                variant="ghost"
                onClick={signOut}
                className="w-full justify-start text-slate-300 hover:text-white"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Déconnexion
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen",
        "lg:ml-64 pt-16 lg:pt-0",
        !sidebarOpen && "lg:ml-20"
      )}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
