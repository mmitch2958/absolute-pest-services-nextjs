import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FieldNav } from "@/components/field-nav";
import { displayDateTime } from "@/lib/utils";
import { MapPin, Calendar, Wrench, Building2, Loader2, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobLogPhoto {
  id: number;
  jobLogId: number;
  url: string;
  caption: string | null;
  uploadedAt: string;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
interface LightboxProps {
  photos: JobLogPhoto[];
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent(i => (i + 1) % photos.length);

  // Keyboard navigation
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
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      role="dialog"
      aria-label="Photo lightbox"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-white/60 text-sm">{current + 1} / {photos.length}</span>
        <button
          onClick={onClose}
          className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center relative px-4 min-h-0">
        {photos.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={photo.url}
          alt={photo.caption || `Photo ${current + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        />

        {photos.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption */}
      {photo.caption && (
        <div className="px-4 py-3 text-center">
          <p className="text-white/80 text-sm">{photo.caption}</p>
        </div>
      )}
    </div>
  );
}

// ─── PhotoThumbnailRow ────────────────────────────────────────────────────────
interface PhotoThumbnailRowProps {
  logId: number;
  onOpenLightbox: (photos: JobLogPhoto[], index: number) => void;
}

function PhotoThumbnailRow({ logId, onOpenLightbox }: PhotoThumbnailRowProps) {
  const { data, isLoading } = useQuery<{ success: boolean; photos: JobLogPhoto[] }>({
    queryKey: ["/api/field/job-logs", logId, "photos"],
    queryFn: async () => {
      const res = await fetch(`/api/field/job-logs/${logId}/photos`, { credentials: "include" });
      return res.json();
    },
  });

  const photos = data?.photos || [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading photos…</span>
      </div>
    );
  }

  if (photos.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      {/* Badge */}
      <div className="flex items-center gap-1 mb-2">
        <Camera className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">
          {photos.length} Photo{photos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* 3-column thumbnail grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onOpenLightbox(photos, idx)}
            className="relative rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ aspectRatio: "1 / 1" }}
            aria-label={photo.caption ? `View photo: ${photo.caption}` : `View photo ${idx + 1}`}
          >
            <img
              src={photo.url}
              alt={photo.caption || `Photo ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main FieldHistory Component ──────────────────────────────────────────────
export default function FieldHistory() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<any>(null);
  const [lightbox, setLightbox] = useState<{ photos: JobLogPhoto[]; index: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("fieldEmployee");
    if (!stored) {
      setLocation("/field");
      return;
    }
    setEmployee(JSON.parse(stored));
  }, []);

  const { data, isLoading } = useQuery<{ success: boolean; jobLogs: any[] }>({
    queryKey: ["/api/field/job-logs"],
    enabled: !!employee,
  });

  if (!employee) return null;

  const logs = data?.jobLogs || [];

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
            {logs.map((log: any) => (
              <Card key={log.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base">{log.customerName}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {displayDateTime(log.createdAt)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{log.siteLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{log.servicedArea}</span>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Wrench className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{log.workPerformed}</span>
                    </div>
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

                    {/* Photo thumbnail row — lazy-loaded per log card */}
                    <PhotoThumbnailRow
                      logId={log.id}
                      onOpenLightbox={(photos, index) => setLightbox({ photos, index })}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen lightbox */}
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      <FieldNav canManageEmployees={employee.canManageEmployees} />
    </div>
  );
}
