import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FieldNav } from "@/components/field-nav";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Loader2 } from "lucide-react";

const NEW_OPTION = "__NEW__";

interface CustomFieldDef {
  id: number;
  name: string;
  label: string;
  fieldType: string;
  required: boolean;
  options: string | null;
  displayOrder: number;
  isActive: boolean;
}

const jobLogSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  clientId: z.number().nullable().optional(),
  siteLocation: z.string().min(1, "Site location is required"),
  servicedArea: z.string().min(1, "Serviced area is required"),
  workPerformed: z.string().min(1, "Work performed is required"),
  jobDate: z.string().min(1, "Job date is required"),
});

type JobLogFormData = z.infer<typeof jobLogSchema>;

interface SmartFieldProps {
  label: string;
  newLabel: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  onSelectOption?: (val: string) => void;
  isAddingNew: boolean;
  onSetAddingNew: (val: boolean) => void;
}

function SmartField({ label, newLabel, options, value, onChange, placeholder, onSelectOption, isAddingNew, onSetAddingNew }: SmartFieldProps) {
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (!isAddingNew) {
      setNewValue("");
    }
  }, [isAddingNew]);

  const selectValue = options.includes(value) ? value : isAddingNew ? NEW_OPTION : "";

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <Select
        value={selectValue}
        onValueChange={(val) => {
          if (val === NEW_OPTION) {
            onSetAddingNew(true);
            setNewValue("");
            onChange("");
          } else {
            onSetAddingNew(false);
            setNewValue("");
            onChange(val);
            onSelectOption?.(val);
          }
        }}
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
          <SelectItem value={NEW_OPTION} className="text-primary font-medium border-t mt-1 pt-1">
            + {newLabel}
          </SelectItem>
        </SelectContent>
      </Select>

      {isAddingNew && (
        <Input
          value={newValue}
          onChange={(e) => {
            setNewValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="h-12 text-base"
          autoFocus
        />
      )}
    </div>
  );
}

interface SuggestionsData {
  success: boolean;
  customers: string[];
  customerLocations: Record<string, string[]>;
  locationAreas: Record<string, string[]>;
  clients: { id: number; name: string; address: string | null }[];
}

async function reAuthField(): Promise<boolean> {
  const stored = localStorage.getItem("fieldEmployee");
  if (!stored) return false;
  try {
    const emp = JSON.parse(stored);
    const pin = localStorage.getItem("fieldPin");
    if (!pin) return false;
    const res = await apiRequest("POST", "/api/field/auth", { pin });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export default function FieldLog() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  const [customerAddingNew, setCustomerAddingNew] = useState(false);
  const [locationAddingNew, setLocationAddingNew] = useState(false);
  const [areaAddingNew, setAreaAddingNew] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  const { data: customFieldsData } = useQuery<{ success: boolean; fields: CustomFieldDef[] }>({
    queryKey: ["/api/field/custom-fields"],
    enabled: !!employee,
  });
  const customFields = customFieldsData?.fields || [];

  useEffect(() => {
    const stored = localStorage.getItem("fieldEmployee");
    if (!stored) {
      setLocation("/field");
      return;
    }
    setEmployee(JSON.parse(stored));
    const pin = localStorage.getItem("fieldPin");
    if (pin) {
      apiRequest("POST", "/api/field/auth", { pin }).catch(() => {});
    }
  }, []);

  const { data: suggestions } = useQuery<SuggestionsData>({
    queryKey: ["/api/field/suggestions"],
    enabled: !!employee,
    retry: async (_count, error: any) => {
      if (error?.message?.includes("401")) {
        return await reAuthField();
      }
      return false;
    },
  });

  const form = useForm<JobLogFormData>({
    resolver: zodResolver(jobLogSchema),
    defaultValues: {
      customerName: "",
      clientId: null,
      siteLocation: "",
      servicedArea: "",
      workPerformed: "",
      jobDate: new Date().toISOString().split("T")[0],
    },
  });

  const customers = suggestions?.customers || [];
  const customerLocations = suggestions?.customerLocations || {};
  const locationAreas = suggestions?.locationAreas || {};
  const clients = suggestions?.clients || [];

  const selectedCustomer = form.watch("customerName");
  const selectedLocation = form.watch("siteLocation");

  const locationsForCustomer = selectedCustomer
    ? customerLocations[selectedCustomer.toLowerCase()] || []
    : [];

  const areasForLocation = selectedLocation
    ? locationAreas[selectedLocation.toLowerCase()] || []
    : [];

  useEffect(() => {
    if (customers.length > 0 && !form.getValues("customerName")) {
      const first = customers[0];
      form.setValue("customerName", first);
      const matchedClient = clients.find(c => c.name === first);
      if (matchedClient) {
        form.setValue("clientId", matchedClient.id);
      }
    }
  }, [suggestions]);

  const submitMutation = useMutation({
    mutationFn: async (data: JobLogFormData) => {
      const missingRequired = customFields
        .filter(f => f.required)
        .filter(f => {
          const val = customFieldValues[f.name];
          if (f.fieldType === "checkbox") return false;
          return !val || (typeof val === "string" && !val.trim());
        });
      if (missingRequired.length > 0) {
        throw new Error(`Please fill in: ${missingRequired.map(f => f.label).join(", ")}`);
      }

      const payload = {
        ...data,
        employeeId: employee.id,
        jobDate: data.jobDate,
        customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
      };
      let response;
      try {
        response = await apiRequest("POST", "/api/field/job-logs", payload);
      } catch (err: any) {
        if (err.message?.includes("401")) {
          const reAuthed = await reAuthField();
          if (reAuthed) {
            response = await apiRequest("POST", "/api/field/job-logs", payload);
          } else {
            localStorage.removeItem("fieldEmployee");
            localStorage.removeItem("fieldPin");
            setLocation("/field");
            throw new Error("Session expired. Please log in again.");
          }
        } else {
          throw err;
        }
      }
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/field/job-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/field/suggestions"] });
      setTimeout(() => {
        setSubmitted(false);
        const first = customers[0] || "";
        const matchedClient = clients.find(c => c.name === first);
        form.reset({
          customerName: first,
          clientId: matchedClient?.id || null,
          siteLocation: "",
          servicedArea: "",
          workPerformed: "",
          jobDate: new Date().toISOString().split("T")[0],
        });
        setCustomerAddingNew(false);
        setLocationAddingNew(false);
        setAreaAddingNew(false);
        setCustomFieldValues({});
      }, 2000);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to submit job log", variant: "destructive" });
    },
  });

  const onSubmit = (data: JobLogFormData) => {
    submitMutation.mutate(data);
  };

  if (!employee) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Job Logged!</h2>
          <p className="text-muted-foreground">Entry saved successfully</p>
        </div>
        <FieldNav canManageEmployees={employee.canManageEmployees} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">Log Job</h1>
          <span className="text-sm text-muted-foreground">Hi, {employee.name}</span>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <SmartField
                        label="Customer"
                        newLabel="New Customer"
                        options={customers}
                        value={field.value}
                        isAddingNew={customerAddingNew}
                        onSetAddingNew={setCustomerAddingNew}
                        onChange={(val) => {
                          field.onChange(val);
                          const matchedClient = clients.find(c => c.name === val);
                          form.setValue("clientId", matchedClient?.id || null);
                          form.setValue("siteLocation", "");
                          form.setValue("servicedArea", "");
                          setLocationAddingNew(false);
                          setAreaAddingNew(false);
                        }}
                        onSelectOption={(val) => {
                          const matchedClient = clients.find(c => c.name === val);
                          if (matchedClient) {
                            form.setValue("clientId", matchedClient.id);
                          }
                        }}
                        placeholder="Enter new customer name"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteLocation"
                  render={({ field }) => (
                    <FormItem>
                      <SmartField
                        label="Site Location"
                        newLabel="New Site Location"
                        options={locationsForCustomer}
                        value={field.value}
                        isAddingNew={locationAddingNew}
                        onSetAddingNew={setLocationAddingNew}
                        onChange={(val) => {
                          field.onChange(val);
                          form.setValue("servicedArea", "");
                          setAreaAddingNew(false);
                        }}
                        placeholder="Enter new site location"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="servicedArea"
                  render={({ field }) => (
                    <FormItem>
                      <SmartField
                        label="Serviced Area"
                        newLabel="New Serviced Area"
                        options={areasForLocation}
                        value={field.value}
                        isAddingNew={areaAddingNew}
                        onSetAddingNew={setAreaAddingNew}
                        onChange={field.onChange}
                        placeholder="Enter new serviced area"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workPerformed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Performed</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the service performed..."
                          className="min-h-[100px] text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {customFields.map((cf) => (
                  <div key={cf.id} className="space-y-2">
                    <FormLabel>
                      {cf.label}
                      {cf.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    {cf.fieldType === "text" && (
                      <Input
                        value={customFieldValues[cf.name] || ""}
                        onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [cf.name]: e.target.value }))}
                        placeholder={`Enter ${cf.label.toLowerCase()}`}
                        className="h-12 text-base"
                      />
                    )}
                    {cf.fieldType === "textarea" && (
                      <Textarea
                        value={customFieldValues[cf.name] || ""}
                        onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [cf.name]: e.target.value }))}
                        placeholder={`Enter ${cf.label.toLowerCase()}`}
                        className="min-h-[80px] text-base"
                      />
                    )}
                    {cf.fieldType === "number" && (
                      <Input
                        type="number"
                        value={customFieldValues[cf.name] || ""}
                        onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [cf.name]: e.target.value }))}
                        placeholder={`Enter ${cf.label.toLowerCase()}`}
                        className="h-12 text-base"
                      />
                    )}
                    {cf.fieldType === "date" && (
                      <Input
                        type="date"
                        value={customFieldValues[cf.name] || ""}
                        onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [cf.name]: e.target.value }))}
                        className="h-12 text-base"
                      />
                    )}
                    {cf.fieldType === "checkbox" && (
                      <div className="flex items-center gap-2 h-12">
                        <Checkbox
                          checked={customFieldValues[cf.name] || false}
                          onCheckedChange={(checked) => setCustomFieldValues(prev => ({ ...prev, [cf.name]: !!checked }))}
                        />
                        <span className="text-sm">{cf.label}</span>
                      </div>
                    )}
                    {cf.fieldType === "select" && cf.options && (
                      <Select
                        value={customFieldValues[cf.name] || ""}
                        onValueChange={(val) => setCustomFieldValues(prev => ({ ...prev, [cf.name]: val }))}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={`Select ${cf.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {cf.options.split(",").map(opt => opt.trim()).filter(Boolean).map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}

                <FormField
                  control={form.control}
                  name="jobDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-12 text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Job Log"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <FieldNav canManageEmployees={employee.canManageEmployees} />
    </div>
  );
}
