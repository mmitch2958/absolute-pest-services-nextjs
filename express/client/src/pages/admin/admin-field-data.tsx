import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Users, Building2, Home, MapPin, Loader2, ClipboardList, MapPinned, Settings2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { displayDateTime } from "@/lib/utils";

interface ServiceRate {
  id: number;
  name: string;
  description: string | null;
  defaultRate: string;
  isActive: boolean;
  sortOrder: number;
}

export function ServiceRatesSection() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultRate, setDefaultRate] = useState("200.00");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const { data: ratesData, isLoading } = useQuery<{ success: boolean; rates: ServiceRate[] }>({
    queryKey: ["/api/admin/service-rates"],
  });
  const rates = ratesData?.rates || [];

  const resetForm = () => {
    setName(""); setDescription(""); setDefaultRate("200.00"); setIsActive(true); setSortOrder(0);
    setEditId(null); setShowForm(false);
  };

  const startEdit = (r: ServiceRate) => {
    setEditId(r.id); setName(r.name); setDescription(r.description || "");
    setDefaultRate(r.defaultRate); setIsActive(r.isActive); setSortOrder(r.sortOrder);
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { name, description: description || null, defaultRate, isActive, sortOrder };
      if (editId) {
        await apiRequest("PUT", `/api/admin/service-rates/${editId}`, body);
      } else {
        await apiRequest("POST", "/api/admin/service-rates", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-rates"] });
      toast({ title: editId ? "Rate updated" : "Rate created" });
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to save rate", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/service-rates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-rates"] });
      toast({ title: "Rate deleted" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Service Rates & Fee Structure
          </CardTitle>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Rate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="border rounded-lg p-4 mb-4 space-y-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Service Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="General Pest Control" />
              </div>
              <div className="space-y-1">
                <Label>Default Rate ($) *</Label>
                <Input type="number" min="0" step="0.01" value={defaultRate} onChange={e => setDefaultRate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Standard interior/exterior treatment" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label>Sort Order</Label>
                <Input type="number" className="w-20" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!name || !defaultRate || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? "Update" : "Create"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : rates.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No service rates configured. Add your first rate above.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{r.name}</span>
                      {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${r.defaultRate}</TableCell>
                  <TableCell>
                    <Badge variant={r.isActive ? "default" : "secondary"}>
                      {r.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function EmployeeSection() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", pin: "", canManageEmployees: false });

  const { data, isLoading } = useQuery<{ success: boolean; employees: any[] }>({
    queryKey: ["/api/admin/field-employees"],
  });

  const employees = data?.employees || [];

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/field-employees", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/field-employees"] });
      setShowAdd(false);
      setForm({ name: "", pin: "", canManageEmployees: false });
      toast({ title: "Employee added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/field-employees/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/field-employees"] });
      setEditId(null);
      setForm({ name: "", pin: "", canManageEmployees: false });
      toast({ title: "Employee updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/field-employees/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/field-employees"] });
      toast({ title: "Employee deleted" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const startEdit = (emp: any) => {
    setEditId(emp.id);
    setShowAdd(false);
    setForm({ name: emp.name, pin: emp.pin, canManageEmployees: emp.canManageEmployees });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          Field Employees
        </CardTitle>
        <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: "", pin: "", canManageEmployees: false }); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Employee
        </Button>
      </CardHeader>
      <CardContent>
        {(showAdd || editId !== null) && (
          <div className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Employee name" className="mt-1" />
              </div>
              <div>
                <Label>PIN</Label>
                <Input value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} placeholder="4-digit PIN" maxLength={4} className="mt-1" />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.canManageEmployees} onCheckedChange={v => setForm({ ...form, canManageEmployees: v })} />
                  <Label>Can Manage Team</Label>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!form.name || !form.pin} onClick={() => editId !== null ? updateMutation.mutate({ id: editId, data: form }) : addMutation.mutate(form)}>
                {editId !== null ? "Save Changes" : "Add Employee"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp: any) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.pin}</TableCell>
                  <TableCell>{emp.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell>{emp.canManageEmployees ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(emp)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm(`Delete ${emp.name}?`)) deleteMutation.mutate(emp.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ClientsSection() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const emptyForm = { name: "", address: "", phone: "", email: "", propertyType: "residential" };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery<{ success: boolean; customers: any[] }>({
    queryKey: ["/api/admin/field-customers"],
  });
  const clients = data?.customers || [];

  const addMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/admin/field-customers", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/field-customers"] }); setShowAdd(false); setForm(emptyForm); toast({ title: "Customer added" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PATCH", `/api/admin/field-customers/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/field-customers"] }); setEditId(null); setForm(emptyForm); toast({ title: "Customer updated" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/admin/field-customers/${id}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/field-customers"] }); toast({ title: "Customer deleted" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const startEdit = (c: any) => {
    setEditId(c.id);
    setShowAdd(false);
    setForm({ name: c.name || "", address: c.address || "", phone: c.phone || "", email: c.email || "", propertyType: c.propertyType || "residential" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Customers
        </CardTitle>
        <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Customer
        </Button>
      </CardHeader>
      <CardContent>
        {(showAdd || editId !== null) && (
          <div className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label>Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" className="mt-1" /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="mt-1" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="mt-1" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Property Type <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, propertyType: "residential" })}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border-2 text-sm font-medium transition-colors ${form.propertyType === "residential" ? "bg-blue-600 text-white border-blue-600" : "bg-background border-input hover:bg-accent"}`}
                >
                  <Home className="w-4 h-4" /> Residential
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, propertyType: "commercial" })}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border-2 text-sm font-medium transition-colors ${form.propertyType === "commercial" ? "bg-orange-600 text-white border-orange-600" : "bg-background border-input hover:bg-accent"}`}
                >
                  <Building2 className="w-4 h-4" /> Commercial
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!form.name} onClick={() => editId !== null ? updateMutation.mutate({ id: editId, data: form }) : addMutation.mutate(form)}>
                {editId !== null ? "Save Changes" : "Add Customer"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${(c.propertyType || "residential") === "commercial" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                      {(c.propertyType || "residential") === "commercial" ? <><Building2 className="w-3 h-3" />Commercial</> : <><Home className="w-3 h-3" />Residential</>}
                    </span>
                  </TableCell>
                  <TableCell>{c.address || "-"}</TableCell>
                  <TableCell>{c.phone || "-"}</TableCell>
                  <TableCell>{c.email || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteMutation.mutate(c.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No customers yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function SiteLocationsSection() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", customerName: "" });

  const { data, isLoading } = useQuery<{ success: boolean; locations: any[] }>({
    queryKey: ["/api/admin/site-locations"],
  });

  const { data: clientsData } = useQuery<{ success: boolean; customers: any[] }>({
    queryKey: ["/api/admin/field-customers"],
  });

  const locations = data?.locations || [];
  const clients = clientsData?.customers || [];

  const addMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/admin/site-locations", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/site-locations"] }); setShowAdd(false); setForm({ name: "", customerName: "" }); toast({ title: "Location added" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PATCH", `/api/admin/site-locations/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/site-locations"] }); setEditId(null); setForm({ name: "", customerName: "" }); toast({ title: "Location updated" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/admin/site-locations/${id}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/site-locations"] }); toast({ title: "Location deleted" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const startEdit = (loc: any) => {
    setEditId(loc.id);
    setShowAdd(false);
    setForm({ name: loc.name || "", customerName: loc.customerName || "" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Site Locations
        </CardTitle>
        <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: "", customerName: "" }); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Location
        </Button>
      </CardHeader>
      <CardContent>
        {(showAdd || editId !== null) && (
          <div className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Location Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 123 Main St, Building A" className="mt-1" />
              </div>
              <div>
                <Label>Associated Customer</Label>
                <Select value={form.customerName} onValueChange={v => setForm({ ...form, customerName: v === "none" ? "" : v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Customer</SelectItem>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!form.name} onClick={() => editId !== null ? updateMutation.mutate({ id: editId, data: form }) : addMutation.mutate(form)}>
                {editId !== null ? "Save Changes" : "Add Location"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((loc: any) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.name}</TableCell>
                  <TableCell>{loc.customerName || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(loc)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm(`Delete ${loc.name}?`)) deleteMutation.mutate(loc.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {locations.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No site locations yet. Add locations that will appear in field employee dropdowns.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ServicedAreasSection() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", siteLocationName: "" });

  const { data, isLoading } = useQuery<{ success: boolean; areas: any[] }>({
    queryKey: ["/api/admin/serviced-areas"],
  });

  const { data: locsData } = useQuery<{ success: boolean; locations: any[] }>({
    queryKey: ["/api/admin/site-locations"],
  });

  const areas = data?.areas || [];
  const locations = locsData?.locations || [];

  const addMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/admin/serviced-areas", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-areas"] }); setShowAdd(false); setForm({ name: "", siteLocationName: "" }); toast({ title: "Serviced area added" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PATCH", `/api/admin/serviced-areas/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-areas"] }); setEditId(null); setForm({ name: "", siteLocationName: "" }); toast({ title: "Area updated" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/admin/serviced-areas/${id}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-areas"] }); toast({ title: "Area deleted" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const startEdit = (area: any) => {
    setEditId(area.id);
    setShowAdd(false);
    setForm({ name: area.name || "", siteLocationName: area.siteLocationName || "" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPinned className="w-4 h-4" />
          Serviced Areas
        </CardTitle>
        <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: "", siteLocationName: "" }); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Area
        </Button>
      </CardHeader>
      <CardContent>
        {(showAdd || editId !== null) && (
          <div className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Area Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Building Exterior, Kitchen, Basement" className="mt-1" />
              </div>
              <div>
                <Label>Associated Location</Label>
                <Select value={form.siteLocationName} onValueChange={v => setForm({ ...form, siteLocationName: v === "none" ? "" : v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select location (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Specific Location</SelectItem>
                    {locations.map((loc: any) => (
                      <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!form.name} onClick={() => editId !== null ? updateMutation.mutate({ id: editId, data: form }) : addMutation.mutate(form)}>
                {editId !== null ? "Save Changes" : "Add Area"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area: any) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{area.siteLocationName || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(area)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm(`Delete ${area.name}?`)) deleteMutation.mutate(area.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {areas.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No serviced areas yet. Add areas that will appear in field employee dropdowns.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function JobLogsSection() {
  const { toast } = useToast();
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ siteLocation: "", servicedArea: "", workPerformed: "" });

  const { data, isLoading } = useQuery<{ success: boolean; jobLogs: any[]; employees: any[] }>({
    queryKey: ["/api/admin/job-logs", "all"],
    queryFn: async () => {
      const res = await fetch("/api/admin/job-logs", { credentials: "include" });
      return res.json();
    },
  });

  const logs = data?.jobLogs || [];
  const employees = data?.employees || [];
  const employeeMap = new Map(employees.map((e: any) => [e.id, e.name]));

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/job-logs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-logs"] });
      setEditId(null);
      toast({ title: "Job log updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/job-logs/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-logs"] });
      toast({ title: "Job log deleted" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const startEdit = (log: any) => {
    setEditId(log.id);
    setEditForm({
      siteLocation: log.siteLocation || "",
      servicedArea: log.servicedArea || "",
      workPerformed: log.workPerformed || "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Job Log Submissions ({logs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">No job logs submitted yet</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Work Performed</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{displayDateTime(log.createdAt)}</TableCell>
                    <TableCell>{employeeMap.get(log.employeeId) || "Unknown"}</TableCell>
                    <TableCell>{log.customerName}</TableCell>
                    {editId === log.id ? (
                      <>
                        <TableCell>
                          <Input value={editForm.siteLocation} onChange={e => setEditForm({ ...editForm, siteLocation: e.target.value })} className="min-w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Input value={editForm.servicedArea} onChange={e => setEditForm({ ...editForm, servicedArea: e.target.value })} className="min-w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Textarea value={editForm.workPerformed} onChange={e => setEditForm({ ...editForm, workPerformed: e.target.value })} className="min-w-[200px] min-h-[60px]" />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Button size="sm" onClick={() => updateMutation.mutate({ id: log.id, data: editForm })}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{log.siteLocation}</TableCell>
                        <TableCell>{log.servicedArea}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.workPerformed}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => startEdit(log)}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Delete this job log?")) deleteMutation.mutate(log.id); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomFieldsSection() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", label: "", fieldType: "text", required: false, options: "", displayOrder: 0, isActive: true });

  const { data, isLoading } = useQuery<{ success: boolean; fields: any[] }>({
    queryKey: ["/api/admin/custom-fields"],
  });
  const fields = data?.fields || [];

  const addMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/admin/custom-fields", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-fields"] }); setShowAdd(false); resetForm(); toast({ title: "Custom field added" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PATCH", `/api/admin/custom-fields/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-fields"] }); setEditId(null); resetForm(); toast({ title: "Custom field updated" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/admin/custom-fields/${id}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-fields"] }); toast({ title: "Custom field deleted" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const resetForm = () => setForm({ name: "", label: "", fieldType: "text", required: false, options: "", displayOrder: 0, isActive: true });

  const startEdit = (f: any) => {
    setEditId(f.id);
    setShowAdd(false);
    setForm({ name: f.name || "", label: f.label || "", fieldType: f.fieldType || "text", required: f.required || false, options: f.options || "", displayOrder: f.displayOrder || 0, isActive: f.isActive !== false });
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.label.trim()) {
      toast({ title: "Error", description: "Name and label are required", variant: "destructive" });
      return;
    }
    const payload = { ...form, name: form.name.trim().toLowerCase().replace(/\s+/g, "_"), displayOrder: Number(form.displayOrder) || 0 };
    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const fieldTypeLabels: Record<string, string> = { text: "Text", textarea: "Long Text", number: "Number", select: "Dropdown", checkbox: "Checkbox", date: "Date" };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Custom Form Fields
        </CardTitle>
        <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); resetForm(); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Field
        </Button>
      </CardHeader>
      <CardContent>
        {(showAdd || editId !== null) && (
          <div className="border rounded-lg p-4 mb-4 space-y-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Field Label (what employees see)</Label>
                <Input value={form.label} onChange={(e) => {
                  const label = e.target.value;
                  setForm(f => ({ ...f, label, name: editId ? f.name : label.trim().toLowerCase().replace(/\s+/g, "_") }));
                }} placeholder="e.g. Treatment Type" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Internal Name (auto-generated)</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. treatment_type" className="mt-1" disabled={editId !== null} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Field Type</Label>
                <Select value={form.fieldType} onValueChange={(v) => setForm(f => ({ ...f, fieldType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Long Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))} className="mt-1" />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Required</Label>
                  <Switch checked={form.required} onCheckedChange={(v) => setForm(f => ({ ...f, required: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Active</Label>
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))} />
                </div>
              </div>
            </div>
            {form.fieldType === "select" && (
              <div>
                <Label className="text-xs">Dropdown Options (comma-separated)</Label>
                <Input value={form.options} onChange={(e) => setForm(f => ({ ...f, options: e.target.value }))} placeholder="Option 1, Option 2, Option 3" className="mt-1" />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={addMutation.isPending || updateMutation.isPending}>
                {editId ? "Update" : "Add"} Field
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setEditId(null); resetForm(); }}>Cancel</Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : fields.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No custom fields yet. Add fields that will appear on the employee job log form.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.label}</TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">{f.name}</TableCell>
                    <TableCell>{fieldTypeLabels[f.fieldType] || f.fieldType}</TableCell>
                    <TableCell>{f.required ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${f.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {f.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{f.displayOrder}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(f)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm(`Delete "${f.label}"?`)) deleteMutation.mutate(f.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminFieldData() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Field Service Data</h1>
        <p className="text-muted-foreground">Manage employees, customers, locations, serviced areas, custom fields, and edit job submissions</p>
      </div>
      <div className="space-y-6">
        <ServiceRatesSection />
        <EmployeeSection />
        <ClientsSection />
        <SiteLocationsSection />
        <ServicedAreasSection />
        <CustomFieldsSection />
        <JobLogsSection />
      </div>
    </div>
  );
}
