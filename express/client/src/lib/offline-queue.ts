/**
 * Offline queue management for job log submissions
 * SC-OFFLINE-001: Offline Mode for Field Technicians
 */

import { v4 as uuidv4 } from 'uuid';
import { getOfflineDB, OfflineJobLog, OfflinePhoto } from './offline-db';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_QUEUE_SIZE = 50;
const WARN_QUEUE_SIZE = 40;
const MAX_RETRY_COUNT = 5;

// Retry backoff: 30s → 2m → 5m → 15m → 1h
const RETRY_DELAYS_MS = [30000, 120000, 300000, 900000, 3600000];

// ─── Queue Operations ───────────────────────────────────────────────────────

export interface QueuedJobLog {
  localId: string;
  employeeId: number;
  customerName: string;
  clientId: number | null;
  siteLocation: string;
  siteAddress?: string;
  servicedArea: string;
  workPerformed: string;
  jobDate: string;
  status: 'pending' | 'completed' | 'callback';
  customFields?: Record<string, string | number | boolean>;
  materials?: any;
  photos: Array<{
    localId: string;
    file: File;
    caption: string;
  }>;
}

export async function enqueueJobLog(
  data: Omit<QueuedJobLog, 'localId'> & { localId?: string }
): Promise<OfflineJobLog> {
  const db = await getOfflineDB();
  
  // Check queue size
  const count = await getQueueCount();
  if (count >= MAX_QUEUE_SIZE) {
    throw new Error(`Offline queue is full (${MAX_QUEUE_SIZE} items). Please connect to the internet to sync.`);
  }
  if (count >= WARN_QUEUE_SIZE) {
    console.warn(`Offline queue is nearly full (${count}/${MAX_QUEUE_SIZE}). Consider connecting to sync.`);
  }
  
  const localId = data.localId || uuidv4();
  const now = new Date().toISOString();
  
  // Compress photos before storing
  const photos: OfflinePhoto[] = await Promise.all(
    (data.photos || []).map(async (photo) => {
      const compressed = await compressPhoto(photo.file);
      return {
        localId: uuidv4(),
        blob: compressed,
        caption: photo.caption,
        status: 'pending' as const
      };
    })
  );
  
  const offlineLog: OfflineJobLog = {
    localId,
    employeeId: data.employeeId,
    customerName: data.customerName,
    clientId: data.clientId,
    siteLocation: data.siteLocation,
    siteAddress: data.siteAddress,
    servicedArea: data.servicedArea,
    workPerformed: data.workPerformed,
    jobDate: data.jobDate,
    status: data.status,
    customFields: data.customFields,
    photos,
    createdAt: now,
    syncStatus: 'pending',
    retryCount: 0
  };
  
  await db.put('offline_queue', offlineLog);
  
  return offlineLog;
}

export async function getQueueCount(): Promise<number> {
  const db = await getOfflineDB();
  return db.count('offline_queue');
}

export async function getPendingLogs(employeeId?: number): Promise<OfflineJobLog[]> {
  const db = await getOfflineDB();
  
  if (employeeId !== undefined) {
    const index = db.transaction('offline_queue').store.index('by-employee');
    return index.getAll(IDBKeyRange.only(employeeId));
  }
  
  return db.getAll('offline_queue');
}

export async function getPendingCount(employeeId?: number): Promise<number> {
  const logs = await getPendingLogs(employeeId);
  return logs.filter(log => log.syncStatus === 'pending' || log.syncStatus === 'error').length;
}

export async function getQueueLogs(employeeId: number): Promise<OfflineJobLog[]> {
  const db = await getOfflineDB();
  const index = db.transaction('offline_queue').store.index('by-employee');
  return index.getAll(IDBKeyRange.only(employeeId));
}

export async function getLogByLocalId(localId: string): Promise<OfflineJobLog | undefined> {
  const db = await getOfflineDB();
  return db.get('offline_queue', localId);
}

export async function updateLogStatus(
  localId: string,
  status: OfflineJobLog['syncStatus'],
  error?: string
): Promise<void> {
  const db = await getOfflineDB();
  const log = await db.get('offline_queue', localId);
  
  if (!log) return;
  
  log.syncStatus = status;
  log.syncError = error;
  
  if (status === 'error') {
    log.retryCount = (log.retryCount || 0) + 1;
    if (log.retryCount < MAX_RETRY_COUNT) {
      const delay = RETRY_DELAYS_MS[Math.min(log.retryCount - 1, RETRY_DELAYS_MS.length - 1)];
      log.nextRetryAt = new Date(Date.now() + delay).toISOString();
      log.syncStatus = 'pending'; // Still pending, will retry
    }
  }
  
  await db.put('offline_queue', log);
}

export async function markLogSynced(localId: string, serverId: number): Promise<void> {
  const db = await getOfflineDB();
  const log = await db.get('offline_queue', localId);
  
  if (!log) return;
  
  log.syncStatus = 'synced';
  await db.put('offline_queue', log);
}

export async function deleteLog(localId: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete('offline_queue', localId);
}

export async function clearSyncedLogs(): Promise<number> {
  const db = await getOfflineDB();
  const tx = db.transaction('offline_queue', 'readwrite');
  const index = tx.store.index('by-status');
  const syncedLogs = await index.getAllKeys(IDBKeyRange.only('synced'));
  
  let deleted = 0;
  for (const key of syncedLogs) {
    await tx.store.delete(key);
    deleted++;
  }
  
  await tx.done;
  return deleted;
}

export async function retryFailedLogs(): Promise<void> {
  const db = await getOfflineDB();
  const index = db.transaction('offline_queue').store.index('by-status');
  const failedLogs = await index.getAll(IDBKeyRange.only('error'));
  
  for (const log of failedLogs) {
    if (log.retryCount < MAX_RETRY_COUNT) {
      log.syncStatus = 'pending';
      log.syncError = undefined;
      await db.put('offline_queue', log);
    }
  }
}

// ─── Photo Compression ───────────────────────────────────────────────────────

async function compressPhoto(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate new dimensions (max 1920px)
      const maxDim = 1920;
      let { width, height } = img;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else {
          width = (width / height) * maxDim;
          height = maxDim;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG at 80% quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.8
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// ─── Queue Status ───────────────────────────────────────────────────────────

export function isQueueFull(): Promise<boolean> {
  return getQueueCount().then(count => count >= MAX_QUEUE_SIZE);
}

export function isQueueNearLimit(): Promise<boolean> {
  return getQueueCount().then(count => count >= WARN_QUEUE_SIZE);
}

export { MAX_QUEUE_SIZE, WARN_QUEUE_SIZE, MAX_RETRY_COUNT };
