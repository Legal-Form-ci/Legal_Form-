import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Users, 
  CreditCard, 
  FileText,
  Calendar,
  MapPin
} from "lucide-react";
import AdminLayout from "./AdminLayout";

const Analytics = () => {
  const { user, userRole, loading } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalServices: 0,
    totalRevenue: 0,
    totalUsers: 0,
    monthlyGrowth: 12.5,
    conversionRate: 68
  });

  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', companies: 12, services: 8, revenue: 2160000 },
    { month: 'Fév', companies: 15, services: 10, revenue: 2700000 },
    { month: 'Mar', companies: 18, services: 12, revenue: 3240000 },
    { month: 'Avr', companies: 22, services: 15, revenue: 3960000 },
    { month: 'Mai', companies: 25, services: 18, revenue: 4500000 },
    { month: 'Juin', companies: 30, services: 22, revenue: 5400000 },
    { month: 'Juil', companies: 28, services: 20, revenue: 5040000 },
    { month: 'Août', companies: 32, services: 24, revenue: 5760000 },
    { month: 'Sep', companies: 35, services: 26, revenue: 6300000 },
    { month: 'Oct', companies: 40, services: 30, revenue: 7200000 },
    { month: 'Nov', companies: 45, services: 35, revenue: 8100000 },
    { month: 'Déc', companies: 50, services: 40, revenue: 9000000 }
  ];

  const regionData = [
    { name: 'Abidjan', value: 65, color: '#3b82f6' },
    { name: 'Bouaké', value: 12, color: '#10b981' },
    { name: 'Yamoussoukro', value: 8, color: '#f59e0b' },
    { name: 'San-Pédro', value: 6, color: '#ef4444' },
    { name: 'Autres', value: 9, color: '#8b5cf6' }
  ];

  const companyTypeData = [
    { type: 'SARL', count: 180 },
    { type: 'SUARL', count: 120 },
    { type: 'SNC', count: 45 },
    { type: 'Association', count: 35 },
    { type: 'ONG', count: 20 }
  ];

  const statusData = [
    { name: 'Terminées', value: 320, color: '#10b981' },
    { name: 'En cours', value: 85, color: '#f59e0b' },
    { name: 'En attente', value: 45, color: '#3b82f6' },
    { name: 'Annulées', value: 15, color: '#ef4444' }
  ];

  useEffect(() => {
    if (!loading && user) {
      fetchAnalytics();
    }
  }, [user, loading]);

  const fetchAnalytics = async () => {
    try {
      // Fetch real data from Supabase
      const { data: companies } = await supabase
        .from('company_requests')
        .select('*');

      const { data: services } = await supabase
        .from('service_requests')
        .select('*');

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      const totalRevenue = (companies || [])
        .filter(c => c.payment_status === 'paid')
        .reduce((sum, c) => sum + (c.estimated_price || 0), 0);

      setStats({
        totalCompanies: companies?.length || 0,
        totalServices: services?.length || 0,
        totalRevenue,
        totalUsers: profiles?.length || 0,
        monthlyGrowth: 12.5,
        conversionRate: 68
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(value) + ' FCFA';
  };

  if (loading || loadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Statistiques & Analytics</h1>
          <p className="text-slate-400">Vue d'ensemble des performances</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Entreprises créées</p>
                  <p className="text-3xl font-bold text-white">{stats.totalCompanies}</p>
                  <div className="flex items-center mt-2 text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+{stats.monthlyGrowth}%</span>
                  </div>
                </div>
                <Building2 className="h-12 w-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Services</p>
                  <p className="text-3xl font-bold text-white">{stats.totalServices}</p>
                  <div className="flex items-center mt-2 text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+8.3%</span>
                  </div>
                </div>
                <FileText className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="flex items-center mt-2 text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+15.2%</span>
                  </div>
                </div>
                <CreditCard className="h-12 w-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Utilisateurs</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <div className="flex items-center mt-2 text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+22.1%</span>
                  </div>
                </div>
                <Users className="h-12 w-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Évolution du chiffre d'affaires</CardTitle>
              <CardDescription>Revenus mensuels en FCFA</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Companies Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Créations d'entreprises</CardTitle>
              <CardDescription>Nombre d'entreprises créées par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="companies" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Region Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Répartition par région
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {regionData.map((region, index) => (
                  <Badge key={index} style={{ backgroundColor: region.color }} className="text-white">
                    {region.name}: {region.value}%
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Types */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Types d'entreprises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={companyTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="type" type="category" stroke="#9ca3af" width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Statut des demandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Taux de conversion</CardTitle>
              <CardDescription>Visiteurs vers clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#374151"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#10b981"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${stats.conversionRate * 5.02} 502`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{stats.conversionRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Performance mensuelle</CardTitle>
              <CardDescription>Comparaison avec le mois précédent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Nouvelles demandes</p>
                    <p className="text-xl font-bold text-white">+45</p>
                  </div>
                  <Badge className="bg-green-500 text-white">+18%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Temps moyen de traitement</p>
                    <p className="text-xl font-bold text-white">5.2 jours</p>
                  </div>
                  <Badge className="bg-green-500 text-white">-12%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Satisfaction client</p>
                    <p className="text-xl font-bold text-white">4.8/5</p>
                  </div>
                  <Badge className="bg-green-500 text-white">+0.2</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
