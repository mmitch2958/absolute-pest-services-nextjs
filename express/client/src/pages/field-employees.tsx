import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FieldNav } from "@/components/field-nav";
import { Plus, Pencil, Trash2, User, Loader2, Shield } from "lucide-react";

export default function FieldEmployees() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formName, setFormName] = useState("");
  const [formPin, setFormPin] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formCanManage, setFormCanManage] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fieldEmployee");
    if (!stored) {
      setLocation("/field");
      return;
    }
    const emp = JSON.parse(stored);
    if (!emp.canManageEmployees) {
      setLocation("/field/log");
      return;
    }
    setEmployee(emp);
  }, []);

  const { data, isLoading } = useQuery<{ success: boolean; employees: any[] }>({
    queryKey: ["/api/field/employees"],
    enabled: !!employee,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/field/employees", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/field/employees"] });
      toast({ title: "Employee added" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add employee", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/field/employees/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/field/employees"] });
      toast({ title: "Employee updated" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/field/employees/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/field/employees"] });
      toast({ title: "Employee removed" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove", variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
    setFormName("");
    setFormPin("");
    setFormIsActive(true);
    setFormCanManage(false);
  };

  const openEdit = (emp: any) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormPin(emp.pin);
    setFormIsActive(emp.isActive);
    setFormCanManage(emp.canManageEmployees);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formName.trim() || !formPin.trim()) {
      toast({ title: "Error", description: "Name and PIN are required", variant: "destructive" });
      return;
    }
    if (formPin.length !== 4 || !/^\d{4}$/.test(formPin)) {
      toast({ title: "Error", description: "PIN must be exactly 4 digits", variant: "destructive" });
      return;
    }

    if (editingEmployee) {
      updateMutation.mutate({
        id: editingEmployee.id,
        data: { name: formName, pin: formPin, isActive: formIsActive, canManageEmployees: formCanManage },
      });
    } else {
      createMutation.mutate({ name: formName, pin: formPin, isActive: formIsActive, canManageEmployees: formCanManage });
    }
  };

  if (!employee) return null;

  const employees = data?.employees || [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">Team Members</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else { setEditingEmployee(null); setFormName(""); setFormPin(""); setFormIsActive(true); setFormCanManage(false); } setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Name</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Employee name" className="h-12 mt-1" />
                </div>
                <div>
                  <Label>PIN (4 digits)</Label>
                  <Input value={formPin} onChange={(e) => setFormPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="e.g., 1234" inputMode="numeric" maxLength={4} className="h-12 mt-1" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Can Manage Team</Label>
                  <Switch checked={formCanManage} onCheckedChange={setFormCanManage} />
                </div>
                <Button className="w-full h-12" onClick={handleSubmit} disabled={isPending}>
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingEmployee ? "Update" : "Add Employee"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((emp: any) => (
              <Card key={emp.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emp.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{emp.name}</span>
                          {emp.canManageEmployees && <Shield className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          PIN: {emp.pin} {!emp.isActive && " (Inactive)"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEdit(emp)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {emp.id !== employee.id && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => {
                          if (confirm(`Remove ${emp.name}?`)) deleteMutation.mutate(emp.id);
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <FieldNav canManageEmployees={employee.canManageEmployees} />
    </div>
  );
}
