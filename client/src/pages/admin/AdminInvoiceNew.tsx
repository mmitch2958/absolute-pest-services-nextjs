import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import type { Client } from "@shared/schema";

interface LineItem {
  description: string;
  quantity: string;
  unitRate: string;
  taxRate: string;
}

function calcLine(item: LineItem) {
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.unitRate) || 0;
  const tax = parseFloat(item.taxRate) || 0;
  const lineTotal = qty * rate;
  const lineTax = lineTotal * (tax / 100);
  return { lineTotal, lineTax };
}

export default function AdminInvoiceNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unitRate: "", taxRate: "0" },
  ]);
  const [saving, setSaving] = useState(false);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const activeClients = (clients as Client[]).filter((c) => c.status === "active" || c.status === "prospect");

  const addLine = () =>
    setLineItems((prev) => [...prev, { description: "", quantity: "1", unitRate: "", taxRate: "0" }]);

  const removeLine = (idx: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const updateLine = (idx: number, field: keyof LineItem, value: string) =>
    setLineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const subtotal = lineItems.reduce((sum, item) => sum + calcLine(item).lineTotal, 0);
  const taxTotal = lineItems.reduce((sum, item) => sum + calcLine(item).lineTax, 0);
  const total = subtotal + taxTotal;

  const handleSubmit = async () => {
    if (!clientId) {
      toast({ title: "Required", description: "Please select a client", variant: "destructive" });
      return;
    }
    if (!dueDate) {
      toast({ title: "Required", description: "Please set a due date", variant: "destructive" });
      return;
    }
    if (lineItems.some((item) => !item.description || !item.unitRate)) {
      toast({ title: "Required", description: "Each line item needs a description and rate", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clientId: parseInt(clientId),
        issueDate,
        dueDate,
        subtotal: subtotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        total: total.toFixed(2),
        notes: notes || null,
        status: "draft",
        lineItems: lineItems.map((item, idx) => {
          const { lineTotal, lineTax } = calcLine(item);
          return {
            description: item.description,
            quantity: item.quantity,
            unitRate: item.unitRate,
            taxRate: item.taxRate,
            lineTotal: lineTotal.toFixed(2),
            lineTax: lineTax.toFixed(2),
            sortOrder: idx,
          };
        }),
      };

      const res = await apiRequest("POST", "/api/admin/invoices", payload);
      const data = await res.json();

      if (data.success) {
        toast({ title: "Invoice created", description: `Draft invoice #${data.invoice.invoiceNumber} saved` });
        setLocation("/admin/invoices");
      } else {
        toast({ title: "Error", description: data.message || "Failed to create invoice", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/invoices")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Create Invoice</h1>
        <p className="text-muted-foreground mt-1">New invoice will be saved as a draft</p>
      </div>

      {/* Client & Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 space-y-1">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {activeClients.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}{c.email ? ` — ${c.email}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Issue Date *</Label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Due Date *</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label>Notes</Label>
            <Textarea
              placeholder="Payment terms, special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button variant="outline" size="sm" onClick={addLine}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
            <span className="col-span-5">Description</span>
            <span className="col-span-2 text-right">Qty</span>
            <span className="col-span-2 text-right">Rate ($)</span>
            <span className="col-span-1 text-right">Tax %</span>
            <span className="col-span-1 text-right">Total</span>
            <span className="col-span-1" />
          </div>

          {lineItems.map((item, idx) => {
            const { lineTotal } = calcLine(item);
            return (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 md:col-span-5">
                  <Input
                    placeholder="Service description"
                    value={item.description}
                    onChange={(e) => updateLine(idx, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unitRate}
                    onChange={(e) => updateLine(idx, "unitRate", e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    value={item.taxRate}
                    onChange={(e) => updateLine(idx, "taxRate", e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="col-span-4 md:col-span-1 text-right font-medium text-sm pr-1">
                  ${lineTotal.toFixed(2)}
                </div>
                <div className="col-span-2 md:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(idx)}
                    disabled={lineItems.length === 1}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          <Separator />

          {/* Totals */}
          <div className="flex flex-col items-end gap-1 text-sm pr-10">
            <div className="flex gap-8">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="w-24 text-right font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-8">
              <span className="text-muted-foreground">Tax</span>
              <span className="w-24 text-right font-medium">${taxTotal.toFixed(2)}</span>
            </div>
            <Separator className="w-40 my-1" />
            <div className="flex gap-8 text-base">
              <span className="font-semibold">Total</span>
              <span className="w-24 text-right font-bold">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => setLocation("/admin/invoices")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Draft"}
        </Button>
      </div>
    </div>
  );
}
