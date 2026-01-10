import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { logPageView } from "@/utils/analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import LexIA from "@/components/LexIA";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Create from "./pages/Create";
import Regions from "./pages/Regions";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Showcase from "./pages/Showcase";
import Testimonials from "./pages/Testimonials";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/Dashboard";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin";
import PaymentsDashboard from "./pages/admin/PaymentsDashboard";
import UnifiedDashboard from "./pages/admin/UnifiedDashboard";
import NewDashboard from "./pages/admin/NewDashboard";
import CompaniesManagement from "./pages/admin/CompaniesManagement";
import CompanyDetail from "./pages/admin/CompanyDetail";
import TeamManagement from "./pages/admin/TeamManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import Tickets from "./pages/admin/Tickets";
import Analytics from "./pages/admin/Analytics";
import InitialSetup from "./pages/admin/InitialSetup";
import LexIAConversations from "./pages/admin/LexIAConversations";
import IdentityDocuments from "./pages/admin/IdentityDocuments";
import InvoiceGenerator from "./pages/admin/InvoiceGenerator";
import AdditionalServicesAdmin from "./pages/admin/AdditionalServicesAdmin";
import ClientDashboard from "./pages/client/Dashboard";
import AdditionalServices from "./pages/AdditionalServices";
import ServiceRequest from "./pages/ServiceRequest";
import RequestDetail from "./pages/RequestDetail";
import NotFound from "./pages/NotFound";
import PublicTracking from "./pages/PublicTracking";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Ebooks from "./pages/Ebooks";
import EbookDownload from "./pages/EbookDownload";
import SetupSuperAdmin from "./pages/admin/SetupSuperAdmin";
import UsersManagement from "./pages/admin/UsersManagement";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PaymentCallback from "./pages/PaymentCallback";
import Payment from "./pages/Payment";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();

  React.useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ScrollToTop />
        <PageViewTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/additional" element={<AdditionalServices />} />
          <Route path="/service-request" element={<ServiceRequest />} />
          <Route path="/create" element={<Create />} />
          <Route path="/creation" element={<Create />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/tarifs" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/entreprises-creees" element={<Showcase />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/temoignages" element={<Testimonials />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/connexion" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/confidentialite" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/conditions" element={<Terms />} />
          <Route path="/admin/setup" element={<SetupSuperAdmin />} />
          <Route path="/admin/initial-setup" element={<InitialSetup />} />
          <Route path="/admin/dashboard" element={<NewDashboard />} />
          <Route path="/admin/old-dashboard" element={<UnifiedDashboard />} />
          <Route path="/admin/companies" element={<CompaniesManagement />} />
          <Route path="/admin/company/:id" element={<CompanyDetail />} />
          <Route path="/admin/team" element={<TeamManagement />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/payments" element={<PaymentsDashboard />} />
          <Route path="/admin/testimonials" element={<TestimonialsAdmin />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/tickets" element={<Tickets />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/lexia" element={<LexIAConversations />} />
          <Route path="/admin/identity-documents" element={<IdentityDocuments />} />
          <Route path="/admin/invoices" element={<InvoiceGenerator />} />
          <Route path="/admin/services" element={<AdditionalServicesAdmin />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/mon-espace" element={<ClientDashboard />} />
          <Route path="/request/:id" element={<RequestDetail />} />
          <Route path="/tracking" element={<PublicTracking />} />
          <Route path="/suivi" element={<PublicTracking />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/payment/success" element={<PaymentCallback />} />
          <Route path="/payment/failed" element={<PaymentCallback />} />
          <Route path="/payment/:requestId" element={<Payment />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/ebooks" element={<Ebooks />} />
          <Route path="/ebook/:slug" element={<EbookDownload />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/questions-frequentes" element={<FAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <SonnerToaster />
        <LexIA />
      </BrowserRouter>
      <VercelAnalytics />
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;