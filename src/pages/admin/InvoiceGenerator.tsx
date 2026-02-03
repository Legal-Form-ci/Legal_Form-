import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, Plus, Trash2, FileText, Building2, Phone, Mail, MapPin, Calendar, User, Loader2 } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface ClientRequest {
  id: string;
  tracking_number: string;
  company_name?: string;
  contact_name: string;
  email: string;
  phone: string;
  type: 'company' | 'service';
  estimated_price: number;
  payment_status: string | null;
  service_type?: string;
}

const InvoiceGenerator = () => {
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [clients, setClients] = useState<ClientRequest[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `FAC-${Date.now().toString().slice(-6)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCompany: '',
    notes: '',
    serviceType: '',
    requestId: '',
    requestType: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);

  // Fetch clients (unpaid requests)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Fetch company requests
        const { data: companyData, error: companyError } = await supabase
          .from('company_requests')
          .select('id, tracking_number, company_name, contact_name, email, phone, estimated_price, payment_status')
          .order('created_at', { ascending: false });

        // Fetch service requests
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('id, tracking_number, company_name, contact_name, contact_email, contact_phone, estimated_price, payment_status, service_type')
          .order('created_at', { ascending: false });

        if (companyError) console.error('Company fetch error:', companyError);
        if (serviceError) console.error('Service fetch error:', serviceError);

        const allClients: ClientRequest[] = [
          ...(companyData || []).map(c => ({
            id: c.id,
            tracking_number: c.tracking_number || '',
            company_name: c.company_name,
            contact_name: c.contact_name,
            email: c.email,
            phone: c.phone,
            type: 'company' as const,
            estimated_price: c.estimated_price || 0,
            payment_status: c.payment_status,
          })),
          ...(serviceData || []).map(s => ({
            id: s.id,
            tracking_number: s.tracking_number || '',
            company_name: s.company_name || s.service_type,
            contact_name: s.contact_name || '',
            email: s.contact_email || '',
            phone: s.contact_phone || '',
            type: 'service' as const,
            estimated_price: s.estimated_price || 0,
            payment_status: s.payment_status,
            service_type: s.service_type,
          })),
        ];

        setClients(allClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setInvoiceData(prev => ({
        ...prev,
        clientName: client.contact_name,
        clientEmail: client.email,
        clientPhone: client.phone,
        clientCompany: client.company_name || '',
        requestId: client.id,
        requestType: client.type,
      }));

      // Set default item based on request
      const description = client.type === 'company' 
        ? `Création d'entreprise - ${client.company_name || 'SARL'}`
        : `Service - ${client.service_type || 'Autre'}`;
      
      setItems([{
        id: '1',
        description,
        quantity: 1,
        unitPrice: client.estimated_price || 0,
      }]);
    }
  };

  const serviceTypes = [
    { value: "creation_ei", label: "Création Entreprise Individuelle", price: 25000 },
    { value: "creation_sarl", label: "Création SARL", price: 150000 },
    { value: "creation_sarlu", label: "Création SARLU", price: 120000 },
    { value: "creation_association", label: "Création Association", price: 75000 },
    { value: "creation_ong", label: "Création ONG", price: 100000 },
    { value: "creation_sci", label: "Création SCI", price: 200000 },
    { value: "creation_gie", label: "Création GIE", price: 150000 },
    { value: "creation_scoops", label: "Création SCOOPS", price: 100000 },
    { value: "dfe", label: "Déclaration Fiscale d'Existence (DFE)", price: 15000 },
    { value: "ncc", label: "Numéro Compte Contribuable (NCC)", price: 15000 },
    { value: "cnps", label: "Déclaration CNPS", price: 25000 },
    { value: "modification", label: "Modification Statutaire", price: 50000 },
    { value: "domiciliation", label: "Domiciliation d'Entreprise", price: 100000 },
    { value: "autre", label: "Autre Service", price: 0 },
  ];

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      description: '', 
      quantity: 1, 
      unitPrice: 0 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleServiceChange = (value: string) => {
    const service = serviceTypes.find(s => s.value === value);
    if (service) {
      setInvoiceData({ ...invoiceData, serviceType: value });
      if (service.price > 0) {
        setItems([{ 
          id: '1', 
          description: service.label, 
          quantity: 1, 
          unitPrice: service.price 
        }]);
      }
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return 0; // Pas de TVA pour Legal Form
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handlePrint = async () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    // If linked to a request, update the estimated price
    if (invoiceData.requestId) {
      try {
        const tableName = invoiceData.requestType === 'service' ? 'service_requests' : 'company_requests';
        await supabase
          .from(tableName)
          .update({ estimated_price: calculateTotal() })
          .eq('id', invoiceData.requestId);
        
        toast.success("Facture liée à la demande mise à jour");
      } catch (error) {
        console.error('Error updating request:', error);
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${invoiceData.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #1a1a1a; background: white; }
          .invoice-container { max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #007c7a; }
          .logo-section { display: flex; align-items: center; gap: 15px; }
          .logo { width: 80px; height: auto; }
          .company-name { font-size: 28px; font-weight: 700; color: #007c7a; }
          .company-subtitle { font-size: 11px; color: #666; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { font-size: 36px; color: #007c7a; font-weight: 700; letter-spacing: 2px; }
          .invoice-number { font-size: 14px; color: #666; margin-top: 5px; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .party { width: 45%; }
          .party-title { font-size: 11px; color: #007c7a; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px; }
          .party-name { font-size: 16px; font-weight: 600; margin-bottom: 5px; }
          .party-detail { font-size: 11px; color: #555; margin-bottom: 3px; }
          .dates { display: flex; gap: 30px; margin-bottom: 30px; background: #f8f9fa; padding: 15px 20px; border-radius: 8px; }
          .date-item { }
          .date-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          .date-value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #007c7a; color: white; padding: 12px 15px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          th:first-child { border-radius: 8px 0 0 0; }
          th:last-child { border-radius: 0 8px 0 0; text-align: right; }
          td { padding: 15px; border-bottom: 1px solid #eee; font-size: 12px; }
          td:last-child { text-align: right; font-weight: 600; }
          .totals { margin-left: auto; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total-row.final { background: #007c7a; color: white; padding: 15px 20px; border-radius: 8px; font-size: 16px; font-weight: 700; margin-top: 10px; }
          .notes { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .notes-title { font-size: 11px; color: #007c7a; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
          .notes-content { font-size: 11px; color: #555; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #eee; display: flex; justify-content: space-between; align-items: flex-end; }
          .signature-section { text-align: center; }
          .signature-img { max-width: 120px; height: auto; margin: 0 auto 10px; }
          .stamp-img { max-width: 100px; height: auto; margin: 0 auto 15px; transform: rotate(-5deg); }
          .signature-text { font-size: 10px; color: #666; }
          .signature-name { font-size: 12px; font-weight: 600; color: #1a1a1a; margin-top: 5px; }
          .footer-contact { text-align: right; font-size: 10px; color: #666; }
          .footer-contact div { margin-bottom: 3px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .invoice-container { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="logo-section">
              <img src="${logoImg}" alt="Legal Form" class="logo" />
              <div>
                <div class="company-name">LEGAL FORM</div>
                <div class="company-subtitle">Création d'entreprises en Côte d'Ivoire</div>
              </div>
            </div>
            <div class="invoice-title">
              <h1>FACTURE</h1>
              <div class="invoice-number">${invoiceData.invoiceNumber}</div>
            </div>
          </div>

          <div class="parties">
            <div class="party">
              <div class="party-title">De</div>
              <div class="party-name">LEGAL FORM CI</div>
              <div class="party-detail">Abidjan, Côte d'Ivoire</div>
              <div class="party-detail">+225 07 09 67 79 25</div>
              <div class="party-detail">contact@legalform.ci</div>
              <div class="party-detail">monentreprise@legalform.ci</div>
            </div>
            <div class="party">
              <div class="party-title">Facturé à</div>
              <div class="party-name">${invoiceData.clientName || invoiceData.clientCompany}</div>
              ${invoiceData.clientCompany && invoiceData.clientName ? `<div class="party-detail">${invoiceData.clientCompany}</div>` : ''}
              ${invoiceData.clientAddress ? `<div class="party-detail">${invoiceData.clientAddress}</div>` : ''}
              ${invoiceData.clientPhone ? `<div class="party-detail">${invoiceData.clientPhone}</div>` : ''}
              ${invoiceData.clientEmail ? `<div class="party-detail">${invoiceData.clientEmail}</div>` : ''}
            </div>
          </div>

          <div class="dates">
            <div class="date-item">
              <div class="date-label">Date d'émission</div>
              <div class="date-value">${new Date(invoiceData.issueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div class="date-item">
              <div class="date-label">Date d'échéance</div>
              <div class="date-value">${new Date(invoiceData.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%">Description</th>
                <th style="width: 15%">Quantité</th>
                <th style="width: 17%">Prix unitaire</th>
                <th style="width: 18%">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatPrice(item.unitPrice)}</td>
                  <td>${formatPrice(item.quantity * item.unitPrice)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Sous-total</span>
              <span>${formatPrice(calculateSubtotal())}</span>
            </div>
            <div class="total-row">
              <span>TVA (0%)</span>
              <span>${formatPrice(0)}</span>
            </div>
            <div class="total-row final">
              <span>TOTAL</span>
              <span>${formatPrice(calculateTotal())}</span>
            </div>
          </div>

          ${invoiceData.notes ? `
          <div class="notes">
            <div class="notes-title">Notes</div>
            <div class="notes-content">${invoiceData.notes}</div>
          </div>
          ` : ''}

          <div class="footer">
            <div class="signature-section">
              <img src="/images/cachet-legal-form.png" alt="Cachet Legal Form" class="stamp-img" onerror="this.style.display='none'" />
              <img src="/images/signature-dirigeant.png" alt="Signature S. KONAN" class="signature-img" onerror="this.style.display='none'" />
              <div class="signature-text">Signature autorisée</div>
              <div class="signature-name">S. KONAN - Direction Legal Form</div>
            </div>
            <div class="footer-contact">
              <div><strong>LEGAL FORM CI</strong></div>
              <div>Abidjan, Côte d'Ivoire</div>
              <div>📞 +225 07 09 67 79 25</div>
              <div>📧 contact@legalform.ci</div>
              <div>🌐 www.legalform.ci</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
    toast.success("Facture générée avec succès!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Générateur de Factures</h1>
            <p className="text-muted-foreground">Créez des factures professionnelles pour vos clients</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="space-y-6">
            {/* Sélection du demandeur */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Sélectionner un demandeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingClients ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Select value={selectedClientId} onValueChange={handleClientSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un demandeur existant" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {clients.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Aucun demandeur trouvé
                        </div>
                      ) : (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.contact_name} - {client.company_name || client.service_type || 'N/A'} {client.payment_status !== 'approved' && client.payment_status !== 'completed' && client.payment_status !== 'paid' ? '(Non payé)' : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Sélectionnez un demandeur pour pré-remplir automatiquement les informations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Informations de la facture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Numéro de facture</Label>
                    <Input 
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Type de service</Label>
                    <Select value={invoiceData.serviceType} onValueChange={handleServiceChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map(service => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label} {service.price > 0 && `(${formatPrice(service.price)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date d'émission
                    </Label>
                    <Input 
                      type="date"
                      value={invoiceData.issueDate}
                      onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date d'échéance
                    </Label>
                    <Input 
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom du client *</Label>
                    <Input 
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
                      placeholder="KOUASSI Jean-Marc"
                    />
                  </div>
                  <div>
                    <Label>Entreprise (optionnel)</Label>
                    <Input 
                      value={invoiceData.clientCompany}
                      onChange={(e) => setInvoiceData({...invoiceData, clientCompany: e.target.value})}
                      placeholder="TECH INNOV SARL"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input 
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData({...invoiceData, clientEmail: e.target.value})}
                      placeholder="client@email.com"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </Label>
                    <Input 
                      value={invoiceData.clientPhone}
                      onChange={(e) => setInvoiceData({...invoiceData, clientPhone: e.target.value})}
                      placeholder="+225 XX XX XX XX XX"
                    />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </Label>
                  <Input 
                    value={invoiceData.clientAddress}
                    onChange={(e) => setInvoiceData({...invoiceData, clientAddress: e.target.value})}
                    placeholder="Abidjan, Cocody"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lignes de facture</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      {index === 0 && <Label>Description</Label>}
                      <Input 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Description du service"
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label>Qté</Label>}
                      <Input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-3">
                      {index === 0 && <Label>Prix unitaire</Label>}
                      <Input 
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA (0%)</span>
                    <span className="font-medium">{formatPrice(0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes additionnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                  placeholder="Conditions de paiement, remarques..."
                  rows={3}
                />
              </CardContent>
            </Card>

            <Button 
              onClick={handlePrint} 
              size="lg" 
              className="w-full"
              disabled={!invoiceData.clientName || items.every(i => !i.description)}
            >
              <Download className="h-5 w-5 mr-2" />
              Générer et Imprimer la Facture
            </Button>
          </div>

          {/* Aperçu */}
          <div className="lg:sticky lg:top-8">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle>Aperçu de la facture</CardTitle>
              </CardHeader>
              <CardContent className="p-6" ref={invoiceRef}>
                <div className="space-y-6 text-sm">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img src={logoImg} alt="Legal Form" className="h-12 w-auto" />
                      <div>
                        <div className="font-bold text-primary text-lg">LEGAL FORM</div>
                        <div className="text-xs text-muted-foreground">Création d'entreprises</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">FACTURE</div>
                      <div className="text-xs text-muted-foreground">{invoiceData.invoiceNumber}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Parties */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-primary mb-1">DE</div>
                      <div className="font-medium">LEGAL FORM CI</div>
                      <div className="text-xs text-muted-foreground">Abidjan, Côte d'Ivoire</div>
                      <div className="text-xs text-muted-foreground">+225 07 09 67 79 25</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-primary mb-1">FACTURÉ À</div>
                      <div className="font-medium">{invoiceData.clientName || 'Nom du client'}</div>
                      {invoiceData.clientCompany && (
                        <div className="text-xs text-muted-foreground">{invoiceData.clientCompany}</div>
                      )}
                      {invoiceData.clientAddress && (
                        <div className="text-xs text-muted-foreground">{invoiceData.clientAddress}</div>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex gap-6 bg-muted p-3 rounded-lg">
                    <div>
                      <div className="text-xs text-muted-foreground">Date d'émission</div>
                      <div className="font-medium">{new Date(invoiceData.issueDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Date d'échéance</div>
                      <div className="font-medium">{new Date(invoiceData.dueDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 bg-primary text-primary-foreground p-2 text-xs font-medium">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-2 text-center">Qté</div>
                      <div className="col-span-2 text-right">Prix</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                    {items.map(item => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 p-2 border-b text-xs">
                        <div className="col-span-6">{item.description || '-'}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-right">{formatPrice(item.unitPrice)}</div>
                        <div className="col-span-2 text-right font-medium">{formatPrice(item.quantity * item.unitPrice)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="ml-auto w-48 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">TVA</span>
                      <span>{formatPrice(0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-primary">
                      <span>TOTAL</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t text-center text-xs text-muted-foreground">
                    <div className="font-medium text-primary">LEGAL FORM CI</div>
                    <div>📞 +225 07 09 67 79 25 | 📧 contact@legalform.ci | 🌐 www.legalform.ci</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
