import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ServiceRatesSection } from "./admin-field-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, FlaskConical, Boxes } from "lucide-react";

interface FieldMaterial {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

function MaterialsManager({ category, title, icon: Icon }: { category: string; title: string; icon: any }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [bulkText, setBulkText] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const { data, isLoading } = useQuery<{ success: boolean; materials: FieldMaterial[] }>({
    queryKey: ["/api/admin/field-materials", category],
    queryFn: async () => {
      const res = await fetch(`/api/admin/field-materials?category=${category}`, { credentials: "include" });
      return res.json();
    },
  });
  const materials = data?.materials || [];

  const resetForm = () => {
    setName(""); setIsActive(true); setSortOrder(0); setEditId(null); setShowForm(false);
  };

  const startEdit = (m: FieldMaterial) => {
    setEditId(m.id); setName(m.name); setIsActive(m.isActive); setSortOrder(m.sortOrder); setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { name, category, isActive, sortOrder };
      if (editId) {
        await apiRequest("PUT", `/api/admin/field-materials/${editId}`, body);
      } else {
        await apiRequest("POST", "/api/admin/field-materials", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/field-materials", category] });
      toast({ title: editId ? "Updated" : "Added" });
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to save", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/field-materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/field-materials", category] });
      toast({ title: "Deleted" });
    },
  });

  const bulkAddMutation = useMutation({
    mutationFn: async () => {
      const names = bulkText.split("\n").map(n => n.trim()).filter(Boolean);
      const existingNames = new Set(materials.map(m => m.name.toLowerCase()));
      const newNames = names.filter(n => !existingNames.has(n.toLowerCase()));
      for (let i = 0; i < newNames.length; i++) {
        await apiRequest("POST", "/api/admin/field-materials", {
          name: newNames[i], category, isActive: true, sortOrder: materials.length + i,
        });
      }
      return newNames.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/field-materials", category] });
      toast({ title: `Added ${count} new items` });
      setBulkText(""); setShowBulkAdd(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to bulk add", variant: "destructive" }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" /> {title}
            <Badge variant="secondary" className="ml-2">{materials.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setShowBulkAdd(!showBulkAdd); setShowForm(false); }}>
              Bulk Add
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setShowForm(true); setShowBulkAdd(false); }}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showBulkAdd && (
          <div className="border rounded-lg p-4 mb-4 space-y-3 bg-muted/30">
            <Label>Add multiple items (one per line)</Label>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={"Enter one item per line...\nExample Item 1\nExample Item 2"}
              rows={6}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => bulkAddMutation.mutate()} disabled={!bulkText.trim() || bulkAddMutation.isPending}>
                {bulkAddMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Add All
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowBulkAdd(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="border rounded-lg p-4 mb-4 space-y-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter name..." />
              </div>
              <div className="space-y-1">
                <Label>Sort Order</Label>
                <Input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>Active</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!name.trim() || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? "Update" : "Create"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : materials.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No items yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>
                      <Badge variant={m.isActive ? "default" : "secondary"}>
                        {m.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                          onClick={() => { if (confirm(`Delete "${m.name}"?`)) deleteMutation.mutate(m.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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

export function AdminServiceTypes() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Service Types & Materials</h1>
        <p className="text-muted-foreground">Manage service rates, products, and supplies that appear on field job logs</p>
      </div>
      <div className="space-y-6">
        <ServiceRatesSection />
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products" className="flex items-center gap-1.5">
              <FlaskConical className="h-4 w-4" /> Products / Chemicals
            </TabsTrigger>
            <TabsTrigger value="supplies" className="flex items-center gap-1.5">
              <Boxes className="h-4 w-4" /> Supplies / Equipment
            </TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4">
            <MaterialsManager category="product" title="Products & Chemicals" icon={FlaskConical} />
          </TabsContent>
          <TabsContent value="supplies" className="mt-4">
            <MaterialsManager category="supply" title="Supplies & Equipment" icon={Boxes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
