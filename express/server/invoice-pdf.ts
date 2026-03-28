import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface PdfLineItem {
  description: string;
  quantity: string;
  unitRate: string;
  taxRate: string;
  lineTotal: string;
  lineTax: string;
  serviceDate?: string | null;
  technicianName?: string | null;
  serviceType?: string | null;
  serviceAddress?: string | null;
  servicedArea?: string | null;
  materials?: any;
}

interface PdfInvoiceData {
  invoiceNumber: string;
  status: string;
  issueDate: string | Date;
  dueDate: string | Date;
  subtotal: string;
  taxTotal: string;
  total: string;
  notes?: string | null;
  client?: {
    name: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
    propertyType?: string | null;
  };
  lineItems: PdfLineItem[];
}

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  try {
    const date = new Date(typeof d === "string" ? d.slice(0, 10) + "T12:00:00" : d);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "—";
  }
}

function formatMaterials(materials: any): string {
  if (!materials) return "";
  if (materials.type === "product" && materials.productName) {
    let s = materials.productName;
    if (materials.volume !== "" && materials.volume !== undefined) {
      s += ` — ${materials.volume} ${materials.unit || "oz"}`;
    }
    return `Product: ${s}`;
  }
  if (materials.type === "supplies" && materials.items?.length) {
    const items = materials.items.map((i: any) =>
      `${i.name}${i.quantity !== "" ? ` (×${i.quantity})` : ""}`
    ).join(", ");
    return `Supplies: ${items}`;
  }
  return "";
}

export function generateInvoicePdf(invoice: PdfInvoiceData): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Absolute Pest Services", margin, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("(484) 643-2225  |  rob@absolutepestservices.com  |  absolutepestservices.com", margin, 24);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`INVOICE ${invoice.invoiceNumber}`, pageWidth - margin, 16, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - margin, 24, { align: "right" });

  y = 45;
  doc.setTextColor(0, 0, 0);

  const col1X = margin;
  const col2X = pageWidth / 2 + 5;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("BILL TO", col1X, y);
  doc.text("INVOICE DETAILS", col2X, y);
  y += 5;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client?.name || "—", col1X, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (invoice.client?.address) {
    const addrLines = doc.splitTextToSize(invoice.client.address, 80);
    doc.text(addrLines, col1X, y);
    y += addrLines.length * 4;
  }
  if (invoice.client?.phone) { doc.text(invoice.client.phone, col1X, y); y += 4; }
  if (invoice.client?.email) { doc.text(invoice.client.email, col1X, y); y += 4; }
  if (invoice.client?.propertyType) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Property: ${invoice.client.propertyType.charAt(0).toUpperCase() + invoice.client.propertyType.slice(1)}`, col1X, y);
    y += 4;
  }

  let detailY = 50;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const details = [
    ["Invoice Date:", formatDate(invoice.issueDate)],
    ["Due Date:", formatDate(invoice.dueDate)],
    ["Total Due:", `$${parseFloat(invoice.total).toFixed(2)}`],
  ];
  for (const [label, value] of details) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(label, col2X, detailY);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", label === "Total Due:" ? "bold" : "normal");
    doc.text(value, col2X + 28, detailY);
    detailY += 5;
  }

  y = Math.max(y, detailY) + 6;

  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const tableBody: any[] = [];
  for (const item of invoice.lineItems) {
    let desc = item.description;
    if (item.serviceDate || item.technicianName || item.serviceType) {
      const meta: string[] = [];
      if (item.serviceDate) meta.push(`Date: ${formatDate(item.serviceDate)}`);
      if (item.technicianName) meta.push(`Tech: ${item.technicianName}`);
      if (item.serviceType) meta.push(`Service: ${item.serviceType}`);
      if (item.servicedArea) meta.push(`Area: ${item.servicedArea}`);
      if (item.serviceAddress) meta.push(`Location: ${item.serviceAddress}`);
      desc = meta.join("\n") + "\n\n" + desc;
    }
    const matStr = formatMaterials(item.materials);
    if (matStr) desc += "\n" + matStr;

    tableBody.push([
      desc,
      parseFloat(item.quantity).toString(),
      `$${parseFloat(item.unitRate).toFixed(2)}`,
      `${parseFloat(item.taxRate)}%`,
      `$${parseFloat(item.lineTotal).toFixed(2)}`,
    ]);
  }

  (doc as any).autoTable({
    startY: y,
    head: [["Description", "Qty", "Rate", "Tax", "Total"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [243, 244, 246], textColor: [31, 41, 55], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8, cellPadding: 3, textColor: [55, 65, 81] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 25, halign: "right" },
    },
    theme: "grid",
    styles: { lineColor: [229, 231, 235], lineWidth: 0.3 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  const totalsX = pageWidth - margin - 60;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 5;

  doc.setTextColor(107, 114, 128);
  doc.text("Tax:", totalsX, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${parseFloat(invoice.taxTotal).toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 6;

  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX, y - 2, pageWidth - margin, y - 2);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Total Due:", totalsX, y + 3);
  doc.text(`$${parseFloat(invoice.total).toFixed(2)}`, pageWidth - margin, y + 3, { align: "right" });
  y += 12;

  if (invoice.notes) {
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("NOTES", margin, y);
    y += 4;
    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 3.5 + 4;
  }

  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Thank you for choosing Absolute Pest Services!", pageWidth / 2, footerY, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Questions? Call (484) 643-2225 or email rob@absolutepestservices.com", pageWidth / 2, footerY + 5, { align: "center" });
  doc.text(`Please reference invoice ${invoice.invoiceNumber} when making payment.`, pageWidth / 2, footerY + 10, { align: "center" });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
