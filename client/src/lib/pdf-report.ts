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
}

interface ReportOptions {
  customerName: string;
  dateFrom: string;
  dateTo: string;
  logs: JobLogEntry[];
  employees: { id: number; name: string }[];
}

export function generateJobReport(options: ReportOptions) {
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

  const fileName = `APS_Report_${customerName.replace(/\s+/g, "_")}_${dateFrom}_to_${dateTo}.pdf`;
  doc.save(fileName);
}
