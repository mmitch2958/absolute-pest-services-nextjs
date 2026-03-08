import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit2, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Assume types are exposed correctly from the API. We will use `any` here for rapid prototyping if needed, 
// but using the shared schema if possible. 

export function ContractManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any | null>(null);

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["/api/admin/service-contracts"],
  });
  
  const { data: customers } = useQuery({
    queryKey: ["/api/field/customers"],
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/field/employees"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingContract 
        ? `/api/admin/service-contracts/${editingContract.id}` 
        : "/api/admin/service-contracts";
      const method = editingContract ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save contract");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-contracts/calendar"] });
      setIsModalOpen(false);
      setEditingContract(null);
      toast({ title: "Success", description: "Contract saved successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const res = await fetch(`/api/admin/service-contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-contracts"] });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      customerId: Number(formData.get("customerId")),
      siteLocationId: formData.get("siteLocationId") ? Number(formData.get("siteLocationId")) : undefined,
      servicedAreaId: formData.get("servicedAreaId") ? Number(formData.get("servicedAreaId")) : undefined,
      frequency: formData.get("frequency"),
      assignedEmployeeId: formData.get("assignedEmployeeId") ? Number(formData.get("assignedEmployeeId")) : undefined,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate") || undefined,
      defaultWorkTemplate: formData.get("defaultWorkTemplate") || undefined,
      isActive: formData.get("isActive") === "on",
    };
    saveMutation.mutate(data);
  };

  const openEditModal = (contract: any) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Service Contracts</h2>
        <Button onClick={() => { setEditingContract(null); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Contract
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Scheduled</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts?.map((contract: any) => {
              const customerName = customers?.find((c: any) => c.id === contract.customerId)?.name || "Unknown Customer";
              const employeeName = employees?.find((e: any) => e.id === contract.assignedEmployeeId)?.name || "Unassigned";
              
              return (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{customerName}</TableCell>
                  <TableCell className="capitalize">{contract.frequency}</TableCell>
                  <TableCell>{contract.nextScheduledDate ? format(new Date(contract.nextScheduledDate), 'MMM d, yyyy') : "Not scheduled"}</TableCell>
                  <TableCell>{employeeName}</TableCell>
                  <TableCell>
                    <Badge variant={contract.isActive ? "default" : "secondary"}>
                      {contract.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(contract)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={contract.isActive ? "destructive" : "default"} 
                      size="sm"
                      onClick={() => toggleStatusMutation.mutate({ id: contract.id, isActive: !contract.isActive })}
                    >
                      {contract.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!contracts || contracts.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No contracts found. Complete contracts to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingContract ? "Edit" : "New"} Service Contract</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select name="customerId" defaultValue={editingContract?.customerId?.toString()} required>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select name="frequency" defaultValue={editingContract?.frequency || "monthly"} required>
                  <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="bi-annual">Bi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input type="date" name="startDate" defaultValue={editingContract?.startDate ? format(new Date(editingContract.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input type="date" name="endDate" defaultValue={editingContract?.endDate ? format(new Date(editingContract.endDate), 'yyyy-MM-dd') : ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedEmployeeId">Assigned Employee</Label>
                <Select name="assignedEmployeeId" defaultValue={editingContract?.assignedEmployeeId?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {employees?.map((e: any) => (
                      <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox id="isActive" name="isActive" defaultChecked={editingContract ? editingContract.isActive : true} />
                <Label htmlFor="isActive">Contract is active</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultWorkTemplate">Default Work Details / Notes</Label>
              <Textarea 
                name="defaultWorkTemplate" 
                defaultValue={editingContract?.defaultWorkTemplate || ""} 
                placeholder="Include standard details that apply to all visits..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Contract"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
