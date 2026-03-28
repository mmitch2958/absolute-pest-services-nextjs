import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface JobLogEntry {
  id: number;
  employeeId: number;
  customerName: string;
  siteLocation: string;
  servicedArea: string;
  workPerformed: string;
  jobDate: string;
  customFields?: Record<string, any>;
  photos?: Array<{ id: number; url: string; caption: string | null }>;
}

interface ReportOptions {
  customerName: string;
  dateFrom: string;
  dateTo: string;
  logs: JobLogEntry[];
  employees: { id: number; name: string }[];
}

// Convert a public image URL to a base64 data URI for jsPDF
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Append a photo appendix page to the PDF document
async function appendPhotoPage(
  doc: jsPDF,
  logsWithPhotos: JobLogEntry[],
  employeeMap: Map<number, string>
) {
  const allPhotos: Array<{
    photo: { id: number; url: string; caption: string | null };
    logRef: string;
  }> = [];

  for (const log of logsWithPhotos) {
    if (!log.photos?.length) continue;
    const logRef = `${new Date(log.jobDate).toLocaleDateString()} — ${log.customerName} / ${log.siteLocation}`;
    for (const photo of log.photos) {
      allPhotos.push({ photo, logRef });
    }
  }

  if (allPhotos.length === 0) return;

  doc.addPage();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Photo Attachments", margin, 20);

  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.3);
  doc.line(margin, 24, pageWidth - margin, 24);

  const colW = 58;
  const colH = 44;
  const captionH = 10;
  const colGap = 8;
  const rowGap = 18;
  const cols = 3;
  let x = margin;
  let y = 30;

  for (let i = 0; i < allPhotos.length; i++) {
    const { photo, logRef } = allPhotos[i];

    // Fetch and embed image
    const base64 = await urlToBase64(photo.url);
    if (base64) {
      try {
        // Determine format from mime type or URL
        const format = base64.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(base64, format, x, y, colW, colH);
      } catch {
        // If image fails, draw a placeholder box
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, colW, colH);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Image unavailable", x + 2, y + colH / 2);
      }
    } else {
      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, colW, colH);
    }

    // Caption below image
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    if (photo.caption) {
      const lines = doc.splitTextToSize(photo.caption, colW);
      doc.text(lines.slice(0, 2), x, y + colH + 4);
    }

    // Log reference (tiny, below caption)
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    const refLines = doc.splitTextToSize(logRef, colW);
    doc.text(refLines.slice(0, 1), x, y + colH + captionH);

    doc.setTextColor(0, 0, 0);

    // Advance grid position
    const col = i % cols;
    if (col < cols - 1) {
      x += colW + colGap;
    } else {
      x = margin;
      y += colH + captionH + rowGap;

      // Add new page if needed
      if (y + colH > pageHeight - margin) {
        doc.addPage();
        y = 20;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Photo Attachments (continued)", margin, y);
        doc.setDrawColor(0, 100, 0);
        doc.setLineWidth(0.3);
        doc.line(margin, y + 4, pageWidth - margin, y + 4);
        y += 14;
      }
    }
  }
}

export async function generateJobReport(options: ReportOptions) {
  const { customerName, dateFrom, dateTo, logs, employees } = options;
  const doc = new jsPDF();

  const employeeMap = new Map(employees.map(e => [e.id, e.name]));
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Absolute Pest Services", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Pest Control Solutions", pageWidth / 2, 27, { align: "center" });

  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.line(14, 32, pageWidth - 14, 32);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Service Report", pageWidth / 2, 42, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const infoY = 52;
  doc.text(`Customer: ${customerName}`, 14, infoY);
  doc.text(`Report Period: ${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`, 14, infoY + 6);
  doc.text(`Total Service Visits: ${logs.length}`, 14, infoY + 12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, infoY + 18);

  const uniqueAreas = [...new Set(logs.map(l => l.servicedArea))];
  if (uniqueAreas.length > 0) {
    doc.text(`Areas Serviced: ${uniqueAreas.join(", ")}`, 14, infoY + 24);
  }

  const logsWithPhotos = logs.filter(l => l.photos && l.photos.length > 0);
  const hasAnyPhotos = logsWithPhotos.length > 0;

  const tableData = logs.map(log => {
    let workText = log.workPerformed;
    if (log.customFields && typeof log.customFields === "object" && Object.keys(log.customFields).length > 0) {
      const extras = Object.entries(log.customFields)
        .map(([key, value]) => {
          const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
          return `${label}: ${display}`;
        })
        .join("\n");
      workText += "\n" + extras;
    }
    // Per design spec: note photos in table, appendix page has the actual images
    if (log.photos && log.photos.length > 0) {
      workText += `\n[Photos: ${log.photos.length} — See Appendix]`;
    }
    return [
      new Date(log.jobDate).toLocaleDateString(),
      employeeMap.get(log.employeeId) || "Unknown",
      log.siteLocation,
      log.servicedArea,
      workText,
    ];
  });

  autoTable(doc, {
    startY: infoY + 32,
    head: [["Date", "Technician", "Location", "Area", "Work Performed"]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [34, 85, 34],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: "auto" },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 200;

  if (finalY + 30 < doc.internal.pageSize.getHeight()) {
    doc.setDrawColor(0, 100, 0);
    doc.setLineWidth(0.3);
    doc.line(14, finalY + 10, pageWidth - 14, finalY + 10);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Absolute Pest Services", pageWidth / 2, finalY + 16, { align: "center" });
    doc.text("Phone: (484) 643-2225 | Email: rob@absolutepestservices.com", pageWidth / 2, finalY + 21, { align: "center" });
    doc.text("www.absolutepestservices.com", pageWidth / 2, finalY + 26, { align: "center" });
  }

  // Append photo pages if any logs have photos
  if (hasAnyPhotos) {
    await appendPhotoPage(doc, logsWithPhotos, employeeMap);
  }

  const fileName = `APS_Report_${customerName.replace(/\s+/g, "_")}_${dateFrom}_to_${dateTo}.pdf`;
  doc.save(fileName);
}

// ─── Single Job Receipt Generator ─────────────────────────────────────────────

export interface JobReceiptData {
  id: number;
  customerName: string;
  siteLocation: string;
  siteAddress?: string;
  servicedArea: string;
  workPerformed: string;
  jobDate: string;
  customFields?: Record<string, any>;
  photos?: Array<{ id: number; url: string; caption: string | null }>;
  employeeName: string;
}

export async function generateJobReceipt(data: JobReceiptData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 100, 0); // Green
  doc.text("Absolute Pest Services", pageWidth / 2, y, { align: "center" });
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Professional Pest Control Solutions", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // Receipt title
  y += 12;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("SERVICE RECEIPT", pageWidth / 2, y, { align: "center" });

  // Receipt details box
  y += 15;
  doc.setFillColor(248, 248, 248);
  doc.rect(margin, y, pageWidth - (margin * 2), 50, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", margin + 5, y + 10);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(data.jobDate).toLocaleDateString(), margin + 25, y + 10);

  doc.setFont("helvetica", "bold");
  doc.text("Receipt #:", margin + 80, y + 10);
  doc.setFont("helvetica", "normal");
  doc.text(`APS-${data.id.toString().padStart(5, "0")}`, margin + 108, y + 10);

  doc.setFont("helvetica", "bold");
  doc.text("Technician:", margin + 5, y + 20);
  doc.setFont("helvetica", "normal");
  doc.text(data.employeeName, margin + 30, y + 20);

  doc.setFont("helvetica", "bold");
  doc.text("Customer:", margin + 80, y + 20);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName, margin + 105, y + 20);

  // Service details
  y += 60;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Service Details", margin, y);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Location:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.siteLocation, margin + 25, y);

  if (data.siteAddress) {
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Address:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.siteAddress, margin + 25, y);
  }

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Area Serviced:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.servicedArea, margin + 32, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Work Performed:", margin, y);
  
  y += 6;
  doc.setFont("helvetica", "normal");
  const workLines = doc.splitTextToSize(data.workPerformed, pageWidth - (margin * 2));
  doc.text(workLines, margin, y);
  y += workLines.length * 5 + 5;

  // Custom fields
  if (data.customFields && typeof data.customFields === "object" && Object.keys(data.customFields).length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Additional Information:", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    
    for (const [key, value] of Object.entries(data.customFields)) {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
      doc.text(`• ${label}: ${display}`, margin + 5, y);
      y += 5;
    }
    y += 5;
  }

  // Photos (if any)
  if (data.photos && data.photos.length > 0) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`Photos Attached: ${data.photos.length}`, margin, y);
    
    // Add photo appendix page
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Photo Attachments", margin, 20);
    doc.line(margin, 24, pageWidth - margin, 24);
    
    let photoY = 30;
    for (const photo of data.photos) {
      const base64 = await urlToBase64(photo.url);
      if (base64 && photoY < 250) {
        try {
          const format = base64.startsWith("data:image/png") ? "PNG" : "JPEG";
          // Scale to fit width
          doc.addImage(base64, format, margin, photoY, 80, 60);
          if (photo.caption) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(photo.caption, margin, photoY + 65);
          }
          photoY += 75;
        } catch {
          // Skip failed images
        }
      }
    }
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for choosing Absolute Pest Services!", pageWidth / 2, footerY, { align: "center" });
  doc.text("Phone: (484) 643-2225 | Email: rob@absolutepestservices.com", pageWidth / 2, footerY + 5, { align: "center" });
  doc.text("www.absolutepestservices.com", pageWidth / 2, footerY + 10, { align: "center" });

  // Save
  const fileName = `APS_Receipt_${data.customerName.replace(/\s+/g, "_")}_${new Date(data.jobDate).toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
