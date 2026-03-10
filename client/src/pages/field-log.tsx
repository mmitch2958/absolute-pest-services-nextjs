import { useState, useEffect, useRef, useCallback } from "react";
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
import { CheckCircle2, Loader2, Camera, ImagePlus, X, AlertCircle, RefreshCw, Home, Building2 } from "lucide-react";
// Offline mode imports
import { useConnectionStatus } from "@/lib/connection-monitor";
import { enqueueJobLog, isQueueFull } from "@/lib/offline-queue";
import { getLocalDateString } from "@/lib/utils";
import { runSync } from "@/lib/sync-engine";

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
  siteAddress: z.string().optional(),
  servicedArea: z.string().min(1, "Serviced area is required"),
  workPerformed: z.string().min(1, "Work performed is required"),
  jobDate: z.string().min(1, "Job date is required"),
  serviceRateId: z.number().nullable().optional(),
  amount: z.string().optional(),
});

type JobLogFormData = z.infer<typeof jobLogSchema>;

// ─── Photo Upload Types ───────────────────────────────────────────────────────
type PhotoStatus = "pending" | "uploading" | "done" | "error";

interface PhotoItem {
  id: string; // local UUID
  file: File;
  localUrl: string; // blob URL for preview
  cloudUrl?: string; // final Cloudinary URL
  caption: string;
  status: PhotoStatus;
  progress: number;
  errorMessage?: string;
}

// ─── Photo Validation ─────────────────────────────────────────────────────────
function validatePhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Only image files are allowed";
  if (file.size > 5 * 1024 * 1024) return "File must be under 5 MB";
  return null;
}

// ─── SmartField Component ─────────────────────────────────────────────────────
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
  clients: { id: number; name: string; address: string | null; propertyType?: string }[];
}

async function reAuthField(): Promise<boolean> {
  const stored = localStorage.getItem("fieldEmployee");
  if (!stored) return false;
  try {
    const pin = localStorage.getItem("fieldPin");
    if (!pin) return false;
    const res = await apiRequest("POST", "/api/field/auth", { pin });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

// ─── PhotoUploadSection Component ────────────────────────────────────────────
interface PhotoUploadSectionProps {
  photos: PhotoItem[];
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onRetryPhoto: (id: string) => void;
}

function PhotoUploadSection({ photos, onAddPhotos, onRemovePhoto, onCaptionChange, onRetryPhoto }: PhotoUploadSectionProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const MAX_PHOTOS = 5;
  const atMax = photos.length >= MAX_PHOTOS;
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announceToScreenReader = (msg: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = msg;
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const available = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, available);
    onAddPhotos(toAdd);
    // Reset the input so the same file can be reselected after error
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Aria live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <FormLabel className="text-sm font-medium">
        Photos
        <span className="text-muted-foreground font-normal ml-1">(optional, up to 5)</span>
      </FormLabel>

      {/* Camera / Gallery Buttons — hidden at max */}
      {!atMax && (
        <div className="grid grid-cols-2 gap-3">
          {/* Camera capture */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors"
            style={{ height: "88px" }}
            aria-label="Take photo with camera"
          >
            <Camera className="w-7 h-7 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Camera</span>
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="sr-only"
            onChange={handleFileInput}
            aria-label="Camera capture input"
          />

          {/* Gallery pick */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors"
            style={{ height: "88px" }}
            aria-label="Choose photo from gallery"
          >
            <ImagePlus className="w-7 h-7 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Gallery</span>
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileInput}
            aria-label="Gallery photo input"
          />
        </div>
      )}

      {/* Horizontal scrolling photo strip */}
      {photos.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          role="list"
          aria-label="Attached photos"
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              role="listitem"
              className="flex-shrink-0 relative rounded-lg overflow-hidden"
              style={{ width: "140px", scrollSnapAlign: "start" }}
            >
              {/* Thumbnail */}
              <div className="relative" style={{ height: "100px" }}>
                <img
                  src={photo.localUrl}
                  alt={photo.caption || "Job photo"}
                  className="w-full h-full object-cover rounded-lg"
                />

                {/* Uploading overlay */}
                {photo.status === "uploading" && (
                  <div className="absolute inset-0 rounded-lg bg-black/60 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span className="text-white text-xs">Uploading…</span>
                    {/* Progress bar */}
                    <div className="w-4/5 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full transition-all duration-300"
                        style={{ width: `${photo.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {photo.status === "error" && (
                  <div className="absolute inset-0 rounded-lg bg-black/60 flex flex-col items-center justify-center gap-1 p-1">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 text-xs text-center leading-tight">
                      {photo.errorMessage || "Upload failed"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        announceToScreenReader("Retrying upload");
                        onRetryPhoto(photo.id);
                      }}
                      className="text-xs text-green-400 underline flex items-center gap-1 mt-0.5"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                )}

                {/* Remove button — hidden while uploading */}
                {photo.status !== "uploading" && (
                  <button
                    type="button"
                    onClick={() => {
                      announceToScreenReader(`Removed photo${photo.caption ? ` of ${photo.caption}` : ""}`);
                      onRemovePhoto(photo.id);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    aria-label={`Remove photo${photo.caption ? ` of ${photo.caption}` : ""}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Caption input */}
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => onCaptionChange(photo.id, e.target.value)}
                placeholder="Add caption…"
                maxLength={200}
                className="w-full mt-1.5 px-2 py-1 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Photo caption"
                style={{ minHeight: "28px" }}
              />
            </div>
          ))}
        </div>
      )}

      {atMax && (
        <p className="text-xs text-muted-foreground">
          Maximum 5 photos reached.
        </p>
      )}
    </div>
  );
}

// ─── Main FieldLog Component ──────────────────────────────────────────────────
export default function FieldLog() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedLogId, setSubmittedLogId] = useState<number | null>(null);
  
  // Offline mode
  const connection = useConnectionStatus();
  const isOnline = connection.status === 'online';

  const [customerAddingNew, setCustomerAddingNew] = useState(false);
  const [locationAddingNew, setLocationAddingNew] = useState(false);
  const [areaAddingNew, setAreaAddingNew] = useState(false);
  const [customerPropertyType, setCustomerPropertyType] = useState("residential");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Photo state
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoUploadsPending, setPhotoUploadsPending] = useState(false);

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
    retry: false,
  });

  const { data: serviceRatesData } = useQuery<{ success: boolean; rates: Array<{ id: number; name: string; description: string | null; defaultRate: string }> }>({
    queryKey: ["/api/field/service-rates"],
    enabled: !!employee,
    retry: false,
  });
  const serviceRates = serviceRatesData?.rates || [];

  const form = useForm<JobLogFormData>({
    resolver: zodResolver(jobLogSchema),
    defaultValues: {
      customerName: "",
      clientId: null,
      siteLocation: "",
      siteAddress: "",
      servicedArea: "",
      workPerformed: "",
      jobDate: getLocalDateString(),
      serviceRateId: null,
      amount: "200.00",
    },
  });

  const customers: string[] = suggestions?.customers || [];
  const customerLocations: Record<string, string[]> = suggestions?.customerLocations || {};
  const locationAreas: Record<string, string[]> = suggestions?.locationAreas || {};
  const clients: Array<{ id: number; name: string; address: string | null }> = suggestions?.clients || [];

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

  // ─── Photo Handlers ─────────────────────────────────────────────────────────

  const uploadSinglePhoto = useCallback(async (photoId: string, file: File, logId: number) => {
    // Step 1: Get signature
    let signData: { signature: string; timestamp: number; folder: string; cloudName: string; apiKey: string };
    try {
      const signRes = await apiRequest("POST", "/api/field/photos/sign");
      signData = await signRes.json();
    } catch {
      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, status: "error" as PhotoStatus, errorMessage: "Failed to get upload signature" } : p
      ));
      return;
    }

    // Step 2: Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", String(signData.timestamp));
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder);
    formData.append("allowed_formats", "jpg,jpeg,png,webp,heic");

    let cloudUrl: string;
    try {
      // Use XHR to track progress
      cloudUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`);

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 90); // cap at 90 until done
            setPhotos(prev => prev.map(p =>
              p.id === photoId ? { ...p, progress: pct } : p
            ));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const result = JSON.parse(xhr.responseText);
            resolve(result.secure_url);
          } else {
            reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });
    } catch (err: any) {
      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, status: "error" as PhotoStatus, errorMessage: err.message || "Upload failed" } : p
      ));
      return;
    }

    // Step 3: Save URL to our database
    try {
      const caption = photos.find(p => p.id === photoId)?.caption ?? "";
      await apiRequest("POST", `/api/field/job-logs/${logId}/photos`, {
        url: cloudUrl,
        caption: caption || null,
      });
      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, status: "done" as PhotoStatus, cloudUrl, progress: 100 } : p
      ));
    } catch {
      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, status: "error" as PhotoStatus, cloudUrl, errorMessage: "Saved to Cloudinary but failed to save record" } : p
      ));
    }
  }, [photos]);

  const handleAddPhotos = useCallback((files: File[]) => {
    const newPhotos: PhotoItem[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const err = validatePhoto(file);
      if (err) {
        errors.push(`${file.name}: ${err}`);
        continue;
      }
      newPhotos.push({
        id: crypto.randomUUID(),
        file,
        localUrl: URL.createObjectURL(file),
        caption: "",
        status: "pending",
        progress: 0,
      });
    }

    if (errors.length > 0) {
      toast({ title: "Invalid file(s)", description: errors.join("\n"), variant: "destructive" });
    }

    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
    }
  }, [toast]);

  const handleRemovePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo?.localUrl) URL.revokeObjectURL(photo.localUrl);
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const handleCaptionChange = useCallback((id: string, caption: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
  }, []);

  const handleRetryPhoto = useCallback((id: string) => {
    if (!submittedLogId) return;
    const photo = photos.find(p => p.id === id);
    if (!photo) return;
    setPhotos(prev => prev.map(p =>
      p.id === id ? { ...p, status: "uploading", progress: 0, errorMessage: undefined } : p
    ));
    uploadSinglePhoto(id, photo.file, submittedLogId);
  }, [photos, submittedLogId, uploadSinglePhoto]);

  // After log is created, upload all pending photos
  const uploadPendingPhotos = useCallback(async (logId: number) => {
    const pending = photos.filter(p => p.status === "pending");
    if (pending.length === 0) return;

    setPhotoUploadsPending(true);
    setPhotos(prev => prev.map(p =>
      p.status === "pending" ? { ...p, status: "uploading" as PhotoStatus, progress: 0 } : p
    ));

    await Promise.all(pending.map(p => uploadSinglePhoto(p.id, p.file, logId)));
    setPhotoUploadsPending(false);
  }, [photos, uploadSinglePhoto]);

  // ─── Form Submit ─────────────────────────────────────────────────────────────

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
        serviceRateId: data.serviceRateId || null,
        amount: data.amount || "200.00",
        customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
        propertyType: customerPropertyType,
        isNewCustomer: customerAddingNew,
        newCustomerAddress: customerAddingNew ? newCustomerAddress : undefined,
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
    onSuccess: async (result) => {
      const logId: number = result.jobLog?.id;
      setSubmittedLogId(logId);

      // Upload photos if any were added
      if (photos.length > 0 && logId) {
        await uploadPendingPhotos(logId);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/field/job-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/field/suggestions"] });
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setSubmittedLogId(null);
        const first = customers[0] || "";
        const matchedClient = clients.find(c => c.name === first);
        form.reset({
          customerName: first,
          clientId: matchedClient?.id || null,
          siteLocation: "",
          siteAddress: matchedClient?.address || "",
          servicedArea: "",
          workPerformed: "",
          jobDate: getLocalDateString(),
          serviceRateId: null,
          amount: "200.00",
        });
        setCustomerAddingNew(false);
        setLocationAddingNew(false);
        setAreaAddingNew(false);
        setCustomerPropertyType(matchedClient?.propertyType ?? "residential");
        setNewCustomerAddress("");
        setCustomFieldValues({});
        // Clean up blob URLs and reset photos
        photos.forEach(p => URL.revokeObjectURL(p.localUrl));
        setPhotos([]);
      }, 2500);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to submit job log", variant: "destructive" });
    },
  });

  const onSubmit = async (data: JobLogFormData) => {
    // Validate new customer required fields
    if (customerAddingNew && !newCustomerAddress.trim()) {
      toast({ title: "Address Required", description: "Please enter the new customer's address before submitting.", variant: "destructive" });
      return;
    }

    // Check if offline and handle accordingly
    if (!isOnline) {
      try {
        // Check if queue is full
        const full = await isQueueFull();
        if (full) {
          toast({ 
            title: "Queue Full", 
            description: "Offline queue is full. Please connect to the internet to sync.", 
            variant: "destructive" 
          });
          return;
        }
        
        // Queue the job log for later sync
        await enqueueJobLog({
          employeeId: employee.id,
          customerName: data.customerName,
          clientId: data.clientId || null,
          siteLocation: data.siteLocation,
          siteAddress: data.siteAddress,
          servicedArea: data.servicedArea,
          workPerformed: data.workPerformed,
          jobDate: data.jobDate,
          serviceRateId: data.serviceRateId || null,
          amount: data.amount || "200.00",
          status: 'completed',
          customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
          photos: photos.map(p => ({
            localId: p.id,
            file: p.file,
            caption: p.caption
          }))
        });
        
        toast({ 
          title: "Saved for Later", 
          description: "Job log saved. It will sync automatically when you're back online." 
        });
        
        // Reset form
        const first = customers[0] || "";
        const matchedClient = clients.find(c => c.name === first);
        form.reset({
          customerName: first,
          clientId: matchedClient?.id || null,
          siteLocation: "",
          siteAddress: matchedClient?.address || "",
          servicedArea: "",
          workPerformed: "",
          jobDate: getLocalDateString(),
          serviceRateId: null,
          amount: "200.00",
        });
        setCustomerAddingNew(false);
        setLocationAddingNew(false);
        setAreaAddingNew(false);
        setNewCustomerAddress("");
        setCustomFieldValues({});
        photos.forEach(p => URL.revokeObjectURL(p.localUrl));
        setPhotos([]);
        
        return;
      } catch (error) {
        toast({ 
          title: "Error", 
          description: error instanceof Error ? error.message : "Failed to save job log offline", 
          variant: "destructive" 
        });
        return;
      }
    }
    
    // Online - submit normally
    submitMutation.mutate(data);
  };

  if (!employee) return null;

  if (submitted) {
    const hasPhotos = photos.length > 0;
    const allDone = photos.every(p => p.status === "done" || p.status === "error");
    const anyError = photos.some(p => p.status === "error");

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Job Logged!</h2>
          <p className="text-muted-foreground">Entry saved successfully</p>
          {hasPhotos && (
            <p className="text-sm text-muted-foreground mt-1">
              {anyError
                ? "Some photos failed to upload."
                : photoUploadsPending
                  ? "Uploading photos…"
                  : `${photos.filter(p => p.status === "done").length} photo(s) attached`}
            </p>
          )}
        </div>
        <FieldNav canManageEmployees={employee.canManageEmployees} />
      </div>
    );
  }

  const isSubmitting = submitMutation.isPending || photoUploadsPending;

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
                          if (matchedClient?.propertyType) {
                            setCustomerPropertyType(matchedClient.propertyType);
                          } else {
                            setCustomerPropertyType("residential");
                          }
                          setNewCustomerAddress("");
                          form.setValue("siteLocation", "");
                          form.setValue("servicedArea", "");
                          setLocationAddingNew(false);
                          setAreaAddingNew(false);
                        }}
                        onSelectOption={(val) => {
                          const matchedClient = clients.find(c => c.name === val);
                          if (matchedClient) {
                            form.setValue("clientId", matchedClient.id);
                            if (matchedClient.propertyType) setCustomerPropertyType(matchedClient.propertyType);
                          }
                        }}
                        placeholder="Enter new customer name"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* New Customer Details — shown when adding a brand new customer */}
                {customerAddingNew && form.watch("customerName") && (
                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm font-semibold text-primary">New Customer Details</p>
                      <span className="text-xs text-muted-foreground ml-auto">Saved to client list automatically</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Property Type <span className="text-destructive">*</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerPropertyType("residential")}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-md border-2 text-sm font-medium transition-colors ${customerPropertyType === "residential" ? "bg-blue-600 text-white border-blue-600" : "bg-background border-input hover:bg-accent"}`}
                        >
                          <Home className="w-4 h-4" />
                          Residential
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerPropertyType("commercial")}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-md border-2 text-sm font-medium transition-colors ${customerPropertyType === "commercial" ? "bg-orange-600 text-white border-orange-600" : "bg-background border-input hover:bg-accent"}`}
                        >
                          <Building2 className="w-4 h-4" />
                          Commercial
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Customer Address <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={newCustomerAddress}
                        onChange={e => {
                          setNewCustomerAddress(e.target.value);
                          form.setValue("siteAddress", e.target.value);
                        }}
                        placeholder="Street address, city, state"
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-muted-foreground">This will be stored on their client record and used as the site address.</p>
                    </div>
                  </div>
                )}

                {/* Property Type badge — shown when an existing client is selected */}
                {!customerAddingNew && form.watch("clientId") && (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${customerPropertyType === "commercial" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                      {customerPropertyType === "commercial"
                        ? <><Building2 className="w-3 h-3" /> Commercial</>
                        : <><Home className="w-3 h-3" /> Residential</>
                      }
                    </span>
                    <span className="text-xs text-muted-foreground">from client record</span>
                  </div>
                )}

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
                          // Try to pre-fill address from client data if available
                          const matchedClient = clients.find(c => c.name === selectedCustomer);
                          if (matchedClient && matchedClient.address) {
                            form.setValue("siteAddress", matchedClient.address);
                          }
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
                  name="siteAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Address <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter site address (street, suite, etc.)"
                          className="h-12 text-base"
                        />
                      </FormControl>
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

                {/* ── Service Type & Amount ── */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 space-y-1">
                    <FormLabel>Service Type</FormLabel>
                    <Select
                      value={form.watch("serviceRateId") ? String(form.watch("serviceRateId")) : "none"}
                      onValueChange={(val) => {
                        if (val === "none") {
                          form.setValue("serviceRateId", null);
                          return;
                        }
                        const rateId = parseInt(val);
                        form.setValue("serviceRateId", rateId);
                        const rate = serviceRates.find(r => r.id === rateId);
                        if (rate) form.setValue("amount", rate.defaultRate);
                      }}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select service..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No service type</SelectItem>
                        {serviceRates.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.name} — ${r.defaultRate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="200.00"
                            className="h-12 text-base text-right font-semibold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Photo Upload Section (Leia spec: below Work Performed) ── */}
                <PhotoUploadSection
                  photos={photos}
                  onAddPhotos={handleAddPhotos}
                  onRemovePhoto={handleRemovePhoto}
                  onCaptionChange={handleCaptionChange}
                  onRetryPhoto={handleRetryPhoto}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {photoUploadsPending ? "Uploading Photos…" : "Submitting…"}
                    </>
                  ) : isOnline ? (
                    "Submit Job Log"
                  ) : (
                    "Save for Later"
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
