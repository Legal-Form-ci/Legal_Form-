import jsPDF from 'jspdf';

interface ReceiptData {
  receiptNumber: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany?: string;
  amount: number;
  description: string;
  trackingNumber: string;
  transactionId: string;
  paymentMethod?: string;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generatePaymentReceiptPDF = (data: ReceiptData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor: [number, number, number] = [0, 124, 122];
  const textColor: [number, number, number] = [26, 26, 26];
  const mutedColor: [number, number, number] = [100, 100, 100];
  
  let y = 20;

  // Header with logo area
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('LEGAL FORM', 20, 28);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Création d'entreprises en Côte d'Ivoire", 20, 38);
  
  // Receipt title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('REÇU DE PAIEMENT', pageWidth - 20, 28, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${data.receiptNumber}`, pageWidth - 20, 38, { align: 'right' });
  
  y = 60;
  
  // Receipt details box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(15, y, pageWidth - 30, 25, 3, 3, 'F');
  
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Date de paiement:', 20, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(data.date), 60, y + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Transaction ID:', 20, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.transactionId, 60, y + 18);
  
  doc.setFont('helvetica', 'normal');
  doc.text('N° Suivi:', pageWidth / 2, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.trackingNumber, pageWidth / 2 + 25, y + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Méthode:', pageWidth / 2, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.paymentMethod || 'Mobile Money', pageWidth / 2 + 25, y + 18);
  
  y += 35;
  
  // Two columns: Legal Form info and Client info
  // Left column - From
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DE:', 20, y);
  
  y += 7;
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('LEGAL FORM CI', 20, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text('Abidjan, Côte d\'Ivoire', 20, y);
  y += 4;
  doc.text('+225 07 09 67 79 25', 20, y);
  y += 4;
  doc.text('contact@legalform.ci', 20, y);
  y += 4;
  doc.text('monentreprise@legalform.ci', 20, y);
  
  // Right column - To
  y -= 20;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYÉ PAR:', pageWidth / 2, y);
  
  y += 7;
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(data.clientName, pageWidth / 2, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  if (data.clientCompany) {
    doc.text(data.clientCompany, pageWidth / 2, y);
    y += 4;
  }
  doc.text(data.clientPhone, pageWidth / 2, y);
  y += 4;
  doc.text(data.clientEmail, pageWidth / 2, y);
  
  y += 20;
  
  // Payment details table
  doc.setFillColor(...primaryColor);
  doc.rect(15, y, pageWidth - 30, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, y + 7);
  doc.text('Montant', pageWidth - 25, y + 7, { align: 'right' });
  
  y += 12;
  
  // Table content
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Draw row
  doc.setFillColor(255, 255, 255);
  doc.rect(15, y, pageWidth - 30, 15, 'FD');
  doc.text(data.description, 20, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPrice(data.amount), pageWidth - 25, y + 10, { align: 'right' });
  
  y += 20;
  
  // Total section
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(pageWidth - 100, y, 85, 25, 3, 3, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text('Sous-total:', pageWidth - 95, y + 8);
  doc.text(formatPrice(data.amount), pageWidth - 20, y + 8, { align: 'right' });
  
  doc.setFillColor(...primaryColor);
  doc.roundedRect(pageWidth - 100, y + 12, 85, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL PAYÉ:', pageWidth - 95, y + 20);
  doc.text(formatPrice(data.amount), pageWidth - 20, y + 20, { align: 'right' });
  
  y += 45;
  
  // Stamp and signature section
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.circle(50, y + 25, 25);
  doc.setTextColor(...primaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('LEGAL FORM', 50, y + 22, { align: 'center' });
  doc.text('CÔTE D\'IVOIRE', 50, y + 28, { align: 'center' });
  doc.setFontSize(6);
  doc.text('PAIEMENT CONFIRMÉ', 50, y + 34, { align: 'center' });
  
  // Signature line
  doc.setDrawColor(...textColor);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 90, y + 40, pageWidth - 20, y + 40);
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature autorisée', pageWidth - 55, y + 48, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Direction Legal Form', pageWidth - 55, y + 54, { align: 'center' });
  
  // Footer
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(248, 249, 250);
  doc.rect(0, y - 10, pageWidth, 30, 'F');
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Ce reçu confirme le paiement intégral des services mentionnés.', pageWidth / 2, y, { align: 'center' });
  doc.text('Pour toute question: contact@legalform.ci | +225 07 09 67 79 25 | www.legalform.ci', pageWidth / 2, y + 6, { align: 'center' });
  
  return doc;
};

export const downloadReceiptPDF = (data: ReceiptData): void => {
  const doc = generatePaymentReceiptPDF(data);
  doc.save(`Recu-${data.receiptNumber}.pdf`);
};

export const getReceiptPDFBlob = async (data: ReceiptData): Promise<Blob> => {
  const doc = generatePaymentReceiptPDF(data);
  return doc.output('blob');
};

export const getReceiptPDFBase64 = (data: ReceiptData): string => {
  const doc = generatePaymentReceiptPDF(data);
  return doc.output('datauristring');
};
