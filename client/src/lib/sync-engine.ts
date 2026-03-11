/**
 * Sync engine for offline job log submissions
 * SC-OFFLINE-001: Offline Mode for Field Technicians
 */

import { getOfflineDB, OfflineJobLog, ReferenceData, getStorageEstimate } from './offline-db';
import { getPendingLogs, updateLogStatus, markLogSynced, deleteLog } from './offline-queue';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SyncResult {
  localId: string;
  serverId?: number;
  status: 'synced' | 'already_synced' | 'error';
  error?: string;
}

export interface SyncProgress {
  phase: 'idle' | 'reference' | 'logs' | 'photos' | 'history' | 'complete' | 'error';
  progress: number;
  total: number;
  currentItem?: string;
  error?: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchReferenceData(employeeId: number): Promise<ReferenceData> {
  const [clients, locations, areas, customFields, suggestions] = await Promise.all([
    fetch('/api/field/clients').then(r => r.json()).catch(() => []),
    fetch('/api/field/locations').then(r => r.json()).catch(() => []),
    fetch('/api/field/areas').then(r => r.json()).catch(() => []),
    fetch('/api/field/custom-fields').then(r => r.json()).catch(() => []),
    fetch('/api/field/suggestions').then(r => r.json()).catch(() => ({ customers: [], locations: [], areas: [], workPerformed: [] }))
  ]);

  return {
    clients: Array.isArray(clients) ? clients : [],
    locations: Array.isArray(locations) ? locations : [],
    areas: Array.isArray(areas) ? areas : [],
    customFields: Array.isArray(customFields) ? customFields : [],
    suggestions: {
      customers: suggestions.customers || [],
      locations: suggestions.locations || [],
      areas: suggestions.areas || [],
      workPerformed: suggestions.workPerformed || []
    },
    fetchedAt: new Date().toISOString()
  };
}

async function saveReferenceData(employeeId: number, data: ReferenceData): Promise<void> {
  const db = await getOfflineDB();
  
  // Save each type with employee-specific key
  const types = ['clients', 'locations', 'areas', 'customFields', 'suggestions'] as const;
  for (const type of types) {
    await db.put('reference_data', {
      key: `${type}_${employeeId}`,
      ...data,
      fetchedAt: data.fetchedAt
    });
  }
}

export async function getCachedReferenceData(
  employeeId: number,
  type: 'clients' | 'locations' | 'areas' | 'customFields' | 'suggestions'
): Promise<ReferenceData[typeof type] | null> {
  const db = await getOfflineDB();
  const record = await db.get('reference_data', `${type}_${employeeId}`);
  
  if (!record) return null;
  
  // Check TTL (24 hours)
  const fetchedAt = new Date(record.fetchedAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    return null; // Cache expired
  }
  
  return record[type] as ReferenceData[typeof type];
}

export async function getReferenceDataWithFallback(
  employeeId: number,
  type: 'clients' | 'locations' | 'areas' | 'customFields' | 'suggestions'
): Promise<ReferenceData[typeof type]> {
  // Try cache first
  const cached = await getCachedReferenceData(employeeId, type);
  if (cached) return cached;
  
  // Fetch fresh data if online
  try {
    const data = await fetchReferenceData(employeeId);
    await saveReferenceData(employeeId, data);
    return data[type] as ReferenceData[typeof type];
  } catch {
    // Return empty array if offline and no cache
    return [] as ReferenceData[typeof type];
  }
}

async function syncJobLogs(employeeId: number): Promise<SyncResult[]> {
  const pendingLogs = await getPendingLogs(employeeId);
  const results: SyncResult[] = [];
  
  for (const log of pendingLogs) {
    if (log.syncStatus === 'synced') continue;
    
    try {
      // Update status to syncing
      await updateLogStatus(log.localId, 'syncing');
      
      const payload = {
        jobLogs: [{
          localId: log.localId,
          customerName: log.customerName,
          clientId: log.clientId,
          siteLocation: log.siteLocation,
          siteAddress: log.siteAddress,
          servicedArea: log.servicedArea,
          workPerformed: log.workPerformed,
          jobDate: log.jobDate,
          status: log.status,
          customFields: log.customFields,
          materials: log.materials,
          clientCreatedAt: log.createdAt
        }],
        clientTimestamp: new Date().toISOString()
      };
      
      const response = await fetch('/api/field/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      const logResult = result.results?.[0];
      
      if (logResult?.status === 'accepted' || logResult?.status === 'already_synced') {
        await markLogSynced(log.localId, logResult.serverId);
        results.push({
          localId: log.localId,
          serverId: logResult.serverId,
          status: logResult.status === 'already_synced' ? 'already_synced' : 'synced'
        });
      } else {
        throw new Error(logResult?.error || 'Unknown sync error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateLogStatus(log.localId, 'error', errorMessage);
      results.push({
        localId: log.localId,
        status: 'error',
        error: errorMessage
      });
    }
  }
  
  return results;
}

async function syncPhotos(log: OfflineJobLog, serverId: number): Promise<void> {
  for (const photo of log.photos) {
    if (photo.status === 'synced') continue;
    
    try {
      // Upload photo
      const formData = new FormData();
      formData.append('file', photo.blob, `photo_${photo.localId}.jpg`);
      formData.append('jobLogId', String(serverId));
      if (photo.caption) {
        formData.append('caption', photo.caption);
      }
      
      const response = await fetch('/api/field/photos/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Photo upload failed: ${response.status}`);
      }
      
      // Delete blob after successful upload
      photo.status = 'synced';
    } catch (error) {
      photo.status = 'photo_error';
      photo.errorMessage = error instanceof Error ? error.message : 'Upload failed';
    }
  }
  
  // Update the log with photo statuses
  const db = await getOfflineDB();
  await db.put('offline_queue', log);
}

async function fetchJobHistory(employeeId: number): Promise<void> {
  const response = await fetch(`/api/field/job-logs?employeeId=${employeeId}`);
  if (!response.ok) return;
  
  const logs = await response.json();
  const db = await getOfflineDB();
  
  // Cache the history
  for (const log of logs) {
    await db.put('job_history_cache', { ...log, key: log.id });
  }
}

// ─── Main Sync Function ─────────────────────────────────────────────────────

type ProgressCallback = (progress: SyncProgress) => void;

export async function runSync(employeeId: number, onProgress?: ProgressCallback): Promise<SyncProgress> {
  const progress: SyncProgress = {
    phase: 'idle',
    progress: 0,
    total: 4
  };
  
  const updateProgress = (update: Partial<SyncProgress>) => {
    Object.assign(progress, update);
    onProgress?.(progress);
  };
  
  try {
    // Phase 1: Refresh reference data
    updateProgress({ phase: 'reference', progress: 0, currentItem: 'Fetching reference data...' });
    await fetchReferenceData(employeeId);
    await saveReferenceData(employeeId, await fetchReferenceData(employeeId));
    updateProgress({ progress: 1 });
    
    // Phase 2: Sync job logs
    updateProgress({ phase: 'logs', progress: 1, currentItem: 'Syncing job logs...' });
    const logResults = await syncJobLogs(employeeId);
    updateProgress({ progress: 2 });
    
    // Phase 3: Upload photos (for successfully synced logs)
    updateProgress({ phase: 'photos', progress: 2, currentItem: 'Uploading photos...' });
    const db = await getOfflineDB();
    for (const result of logResults) {
      if (result.status === 'synced' && result.serverId) {
        const log = await db.get('offline_queue', result.localId);
        if (log && log.photos.length > 0) {
          await syncPhotos(log, result.serverId);
        }
      }
    }
    updateProgress({ progress: 3 });
    
    // Phase 4: Refresh history
    updateProgress({ phase: 'history', progress: 3, currentItem: 'Refreshing history...' });
    await fetchJobHistory(employeeId);
    updateProgress({ progress: 4, phase: 'complete' });
    
    return progress;
  } catch (error) {
    updateProgress({
      phase: 'error',
      error: error instanceof Error ? error.message : 'Sync failed'
    });
    return progress;
  }
}

// ─── Storage Check ─────────────────────────────────────────────────────────

export async function checkOfflineStorage(): Promise<{
  nearQuota: boolean;
  message?: string;
}> {
  const estimate = await getStorageEstimate();
  
  if (estimate.percentUsed >= 80) {
    return {
      nearQuota: true,
      message: `Storage is ${Math.round(estimate.percentUsed)}% full. Consider syncing to free up space.`
    };
  }
  
  return { nearQuota: false };
}
