import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldNav } from "@/components/field-nav";
import { displayDateTime, getLocalDateString } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Calendar, Wrench, Building2, Loader2,
  Camera, X, ChevronLeft, ChevronRight, Pencil, Lock,
  DollarSign, Package, Boxes, Plus, Trash2, Search,
} from "lucide-react";
import { MaterialsData, PEST_CONTROL_SUPPLIES, PEST_CONTROL_PRODUCTS } from "./field-log";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobLogPhoto {
  id: number;
  jobLogId: number;
  url: string;
  caption: string | null;
  uploadedAt: string;
}

interface JobLog {
  id: number;
  customerName: string;
  siteLocation: string;
  siteAddress?: string | null;
  servicedArea: string;
  workPerformed: string;
  jobDate: string;
  status: string;
  serviceRateId?: number | null;
  amount?: string | null;
  customFields?: Record<string, unknown>;
  materials?: MaterialsData;
  createdAt: string;
}

// ─── Materials Display ────────────────────────────────────────────────────────
function MaterialsDisplay({ materials }: { materials: MaterialsData }) {
  if (!materials) return null;
  return (
    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
      <div className="flex items-center gap-1.5 mb-1">
        <Package className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Materials</span>
      </div>
      {materials.type === "product" && (
        <div className="text-sm space-y-0.5">
          <p><span className="text-muted-foreground">Product:</span> <span className="font-medium">{materials.productName || "—"}</span></p>
          {(materials.volume !== "" && materials.volume !== undefined) && (
            <p><span className="text-muted-foreground">Volume:</span> <span className="font-medium">{materials.volume} {materials.unit}</span></p>
          )}
        </div>
      )}
      {materials.type === "supplies" && materials.items.length > 0 && (
        <div className="space-y-0.5">
          {materials.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span>{item.name}</span>
              {item.quantity !== "" && <span className="text-muted-foreground font-medium">× {item.quantity}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Edit Materials Section ───────────────────────────────────────────────────
function EditMaterialsSection({ value, onChange }: { value: MaterialsData; onChange: (v: MaterialsData) => void }) {
  const [productSearch, setProductSearch] = useState(value?.type === "product" ? value.productName : "");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [supplySearch, setSupplySearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const mode = value?.type ?? "none";
  const product = value?.type === "product" ? value : null;
  const supplies = value?.type === "supplies" ? value : null;

  const filteredProducts = PEST_CONTROL_PRODUCTS.filter(p =>
    p.toLowerCase().includes(productSearch.toLowerCase())
  );

  function setMode(m: "none" | "product" | "supplies") {
    if (m === "none") { onChange(null); return; }
    if (m === "product") onChange({ type: "product", productName: "", volume: "", unit: "oz" });
    if (m === "supplies") onChange({ type: "supplies", items: [] });
  }

  function updateProduct(patch: any) {
    if (value?.type !== "product") return;
    onChange({ ...value, ...patch });
  }

  function addSupply(name: string) {
    const items = supplies?.items || [];
    if (items.find(i => i.name === name)) return;
    onChange({ type: "supplies", items: [...items, { name, quantity: "" }] });
    setSupplySearch(""); setShowDropdown(false);
  }

  function updateQty(idx: number, qty: number | "") {
    if (value?.type !== "supplies") return;
    const items = [...value.items];
    items[idx] = { ...items[idx], quantity: qty };
    onChange({ ...value, items });
  }

  function removeSupply(idx: number) {
    if (value?.type !== "supplies") return;
    onChange({ ...value, items: value.items.filter((_, i) => i !== idx) });
  }

  const filtered = PEST_CONTROL_SUPPLIES.filter(s =>
    s.toLowerCase().includes(supplySearch.toLowerCase()) &&
    !(supplies?.items || []).find(i => i.name === s)
  );

  return (
    <div className="space-y-3">
      <Label>Materials Used</Label>
      <div className="grid grid-cols-3 gap-2">
        {(["none", "product", "supplies"] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`py-2 rounded-lg text-sm font-medium border transition-colors ${mode === m ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"}`}>
            {m === "none" ? "None" : m === "product" ? "Product" : "Supplies"}
          </button>
        ))}
      </div>

      {mode === "product" && (
        <div className="space-y-3 p-3 bg-muted/40 rounded-lg border">
          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-muted-foreground">Product / Solution Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); updateProduct({ productName: e.target.value }); }}
                onFocus={() => setShowProductDropdown(true)}
                onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
                placeholder="Search or type a product..."
                className="w-full h-10 pl-9 pr-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {showProductDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredProducts.map(p => (
                  <button key={p} type="button" onMouseDown={() => { updateProduct({ productName: p }); setProductSearch(p); setShowProductDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted">{p}</button>
                ))}
                {productSearch.trim() && !PEST_CONTROL_PRODUCTS.some(p => p.toLowerCase() === productSearch.trim().toLowerCase()) && (
                  <button type="button" onMouseDown={() => { updateProduct({ productName: productSearch.trim() }); setShowProductDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 flex items-center gap-2 border-t font-medium text-primary">
                    <Plus className="w-3.5 h-3.5" />Add custom: "{productSearch.trim()}"
                  </button>
                )}
                {!productSearch.trim() && filteredProducts.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Type a name to search products</p>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Volume</label>
              <Input type="number" min="0" step="0.1" value={product?.volume ?? ""} onChange={e => updateProduct({ volume: e.target.value === "" ? "" : parseFloat(e.target.value) })} placeholder="0.0" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Unit</label>
              <div className="grid grid-cols-2 gap-1.5 h-10">
                {(["oz", "gallons"] as const).map(u => (
                  <button key={u} type="button" onClick={() => updateProduct({ unit: u })}
                    className={`rounded-md text-sm font-medium border ${product?.unit === u ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "supplies" && (
        <div className="space-y-3 p-3 bg-muted/40 rounded-lg border">
          <div className="relative">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Add Supply</label>
            <div className="relative">
              <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" value={supplySearch} onChange={e => { setSupplySearch(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="Search supply..." className="w-full h-10 pl-9 pr-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filtered.map(s => (
                  <button key={s} type="button" onMouseDown={() => addSupply(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted">{s}</button>
                ))}
                {supplySearch.trim() && !PEST_CONTROL_SUPPLIES.some(s => s.toLowerCase() === supplySearch.trim().toLowerCase()) && (
                  <button type="button" onMouseDown={() => addSupply(supplySearch.trim())} className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 flex items-center gap-2 border-t font-medium text-primary">
                    <Plus className="w-3.5 h-3.5" />Add custom: "{supplySearch.trim()}"
                  </button>
                )}
                {!supplySearch.trim() && filtered.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Type a name to add a custom supply</p>
                )}
              </div>
            )}
          </div>
          {supplies && supplies.items.length > 0 && (
            <div className="space-y-2">
              {supplies.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-background rounded border p-2">
                  <span className="flex-1 text-sm">{item.name}</span>
                  <label className="text-xs text-muted-foreground">Qty:</label>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateQty(idx, e.target.value === "" ? "" : parseInt(e.target.value))}
                    className="w-14 h-7 px-2 text-sm text-right border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button" onClick={() => removeSupply(idx)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ServiceRate {
  id: number;
  name: string;
  description: string | null;
  defaultRate: string;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, initialIndex, onClose }: { photos: JobLogPhoto[]; initialIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(initialIndex);
  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent(i => (i + 1) % photos.length);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const photo = photos[current];
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-white/60 text-sm">{current + 1} / {photos.length}</span>
        <button onClick={onClose} className="text-white p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative px-4 min-h-0">
        {photos.length > 1 && (
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <img src={photo.url} alt={photo.caption || `Photo ${current + 1}`} className="max-w-full max-h-full object-contain rounded-lg" style={{ maxHeight: "calc(100vh - 160px)" }} />
        {photos.length > 1 && (
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 z-10">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
      {photo.caption && (
        <div className="px-4 py-3 text-center">
          <p className="text-white/80 text-sm">{photo.caption}</p>
        </div>
      )}
    </div>
  );
}

// ─── PhotoThumbnailRow ────────────────────────────────────────────────────────
function PhotoThumbnailRow({ logId, onOpenLightbox }: { logId: number; onOpenLightbox: (photos: JobLogPhoto[], index: number) => void }) {
  const { data, isLoading } = useQuery<{ success: boolean; photos: JobLogPhoto[] }>({
    queryKey: ["/api/field/job-logs", logId, "photos"],
    queryFn: async () => {
      const res = await fetch(`/api/field/job-logs/${logId}/photos`, { credentials: "include" });
      return res.json();
    },
  });
  const photos = data?.photos || [];
  if (isLoading) return (
    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Loading photos…</span>
    </div>
  );
  if (photos.length === 0) return null;
  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <div className="flex items-center gap-1 mb-2">
        <Camera className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{photos.length} Photo{photos.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onOpenLightbox(photos, idx)}
            className="relative rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ aspectRatio: "1 / 1" }}
          >
            <img src={photo.url} alt={photo.caption || `Photo ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps {
  log: JobLog;
  serviceRates: ServiceRate[];
  onClose: () => void;
  onSaved: () => void;
}

function EditModal({ log, serviceRates, onClose, onSaved }: EditModalProps) {
  const { toast } = useToast();
  const [editMaterials, setEditMaterials] = useState<MaterialsData>(
    (log.materials as MaterialsData) ?? null
  );
  const form = useForm({
    defaultValues: {
      customerName: log.customerName,
      siteLocation: log.siteLocation,
      siteAddress: log.siteAddress || "",
      servicedArea: log.servicedArea,
      workPerformed: log.workPerformed,
      jobDate: log.jobDate ? String(log.jobDate).slice(0, 10) : getLocalDateString(),
      serviceRateId: log.serviceRateId ? String(log.serviceRateId) : "none",
      amount: log.amount ? String(log.amount) : "200",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("PATCH", `/api/field/job-logs/${log.id}`, {
        customerName: values.customerName,
        siteLocation: values.siteLocation,
        siteAddress: values.siteAddress || null,
        servicedArea: values.servicedArea,
        workPerformed: values.workPerformed,
        jobDate: values.jobDate,
        serviceRateId: values.serviceRateId === "none" ? null : Number(values.serviceRateId),
        amount: values.amount,
        materials: editMaterials || null,
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/field/job-logs"] });
      toast({ title: "Job updated", description: "Your changes have been saved." });
      onSaved();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Could not save changes.", variant: "destructive" });
    },
  });

  const watchedRateId = form.watch("serviceRateId");

  useEffect(() => {
    if (watchedRateId && watchedRateId !== "none") {
      const rate = serviceRates.find(r => r.id === Number(watchedRateId));
      if (rate) form.setValue("amount", rate.defaultRate);
    }
  }, [watchedRateId]);

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-lg">Edit Job Log</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="p-5 space-y-4">
          {/* Customer name */}
          <div className="space-y-1.5">
            <Label>Customer Name *</Label>
            <Input {...form.register("customerName", { required: true })} placeholder="Customer name" />
          </div>

          {/* Job Date */}
          <div className="space-y-1.5">
            <Label>Job Date *</Label>
            <Input type="date" {...form.register("jobDate", { required: true })} />
          </div>

          {/* Service Type */}
          <div className="space-y-1.5">
            <Label>Service Type</Label>
            <Select value={form.watch("serviceRateId")} onValueChange={v => form.setValue("serviceRateId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific service type</SelectItem>
                {serviceRates.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name} — ${parseFloat(r.defaultRate).toFixed(0)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                min="0"
                className="pl-8"
                {...form.register("amount")}
                placeholder="200.00"
              />
            </div>
          </div>

          {/* Site Location */}
          <div className="space-y-1.5">
            <Label>Site Location *</Label>
            <Input {...form.register("siteLocation", { required: true })} placeholder="e.g. Main building, Warehouse B" />
          </div>

          {/* Site Address */}
          <div className="space-y-1.5">
            <Label>Site Address <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input {...form.register("siteAddress")} placeholder="e.g. 123 Main St, Springfield" />
          </div>

          {/* Serviced Area */}
          <div className="space-y-1.5">
            <Label>Serviced Area *</Label>
            <Input {...form.register("servicedArea", { required: true })} placeholder="e.g. Kitchen, Basement, Exterior" />
          </div>

          {/* Work Performed */}
          <div className="space-y-1.5">
            <Label>Work Performed *</Label>
            <Textarea
              {...form.register("workPerformed", { required: true })}
              placeholder="Describe the work done..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Materials */}
          <EditMaterialsSection value={editMaterials} onChange={setEditMaterials} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  invoiced:  { label: "Invoiced",  color: "bg-blue-100 text-blue-700" },
  paid:      { label: "Paid",      color: "bg-purple-100 text-purple-700" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  pending:   { label: "Pending",   color: "bg-gray-100 text-gray-600" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>;
}

// ─── Main FieldHistory Component ──────────────────────────────────────────────
export default function FieldHistory() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<any>(null);
  const [lightbox, setLightbox] = useState<{ photos: JobLogPhoto[]; index: number } | null>(null);
  const [editingLog, setEditingLog] = useState<JobLog | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("fieldEmployee");
    if (!stored) { setLocation("/field"); return; }
    setEmployee(JSON.parse(stored));
  }, []);

  const { data, isLoading } = useQuery<{ success: boolean; jobLogs: JobLog[] }>({
    queryKey: ["/api/field/job-logs"],
    enabled: !!employee,
  });

  const { data: ratesData } = useQuery<{ success: boolean; rates: ServiceRate[] }>({
    queryKey: ["/api/field/service-rates"],
    enabled: !!employee,
  });

  if (!employee) return null;

  const logs = data?.jobLogs || [];
  const serviceRates = ratesData?.rates || [];

  const canEdit = (log: JobLog) => log.status !== "invoiced" && log.status !== "paid";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-lg font-bold mb-4">Job History</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No job logs yet</p>
            <p className="text-sm mt-1">Submit your first job log to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-4 pb-4">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <h3 className="font-semibold text-base leading-tight">{log.customerName}</h3>
                      <StatusBadge status={log.status} />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canEdit(log) ? (
                        <button
                          onClick={() => setEditingLog(log)}
                          className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit job log"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="p-1.5 text-muted-foreground/50" title="Cannot edit — already invoiced">
                          <Lock className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Calendar className="w-3 h-3" />
                    {displayDateTime(log.createdAt)}
                  </p>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{log.siteLocation}{log.siteAddress ? ` — ${log.siteAddress}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{log.servicedArea}</span>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Wrench className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{log.workPerformed}</span>
                    </div>
                    {log.amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium text-foreground">${parseFloat(log.amount).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Custom fields */}
                    {log.customFields && typeof log.customFields === "object" && Object.keys(log.customFields).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                        {Object.entries(log.customFields).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                            <span className="text-foreground">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <MaterialsDisplay materials={log.materials ?? null} />

                    <PhotoThumbnailRow logId={log.id} onOpenLightbox={(photos, index) => setLightbox({ photos, index })} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox photos={lightbox.photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}

      {/* Edit Modal */}
      {editingLog && (
        <EditModal
          log={editingLog}
          serviceRates={serviceRates}
          onClose={() => setEditingLog(null)}
          onSaved={() => setEditingLog(null)}
        />
      )}

      <FieldNav canManageEmployees={employee.canManageEmployees} />
    </div>
  );
}
