/**
 * IndexedDB setup for offline mode using idb library
 * SC-OFFLINE-001: Offline Mode for Field Technicians
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OfflinePhoto {
  localId: string;
  blob: Blob;
  caption?: string;
  status: 'pending' | 'uploading' | 'synced' | 'photo_error';
  errorMessage?: string;
}

export interface OfflineJobLog {
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
  photos: OfflinePhoto[];
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncError?: string;
  retryCount: number;
  nextRetryAt?: string;
}

export interface ReferenceData {
  clients: Array<{ id: number; name: string; address?: string }>;
  locations: Array<{ id: number; name: string; customerId: number }>;
  areas: Array<{ id: number; name: string; locationId: number }>;
  customFields: Array<{
    id: number;
    name: string;
    label: string;
    fieldType: string;
    required: boolean;
    options: string | null;
    displayOrder: number;
  }>;
  suggestions: {
    customers: string[];
    locations: string[];
    areas: string[];
    workPerformed: string[];
  };
  fetchedAt: string;
}

export interface CachedJobLog {
  id: number;
  localId?: string;
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
  photos: Array<{ id: number; jobLogId: number; url: string; caption: string | null }>;
  createdAt: string;
  serverReceivedAt?: string;
}

interface OfflineDB extends DBSchema {
  reference_data: {
    key: string; // {type}_{employeeId}
    value: ReferenceData & { key: string };
  };
  offline_queue: {
    key: string; // localId (UUID)
    value: OfflineJobLog;
    indexes: { 'by-employee': number; 'by-status': string };
  };
  job_history_cache: {
    key: number; // server job log id
    value: CachedJobLog & { key: number };
    indexes: { 'by-employee': number };
  };
  auth_cache: {
    key: number; // employeeId
    value: {
      employeeId: number;
      pinHash: string;
      employeeName: string;
      cachedAt: string;
    };
  };
}

// ─── Database Instance ──────────────────────────────────────────────────────

let dbInstance: IDBPDatabase<OfflineDB> | null = null;

const DB_NAME = 'absolute-pest-offline';
const DB_VERSION = 1;

export async function getOfflineDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Reference data store
      if (!db.objectStoreNames.contains('reference_data')) {
        db.createObjectStore('reference_data', { keyPath: 'key' });
      }

      // Offline queue store
      if (!db.objectStoreNames.contains('offline_queue')) {
        const queueStore = db.createObjectStore('offline_queue', { keyPath: 'localId' });
        queueStore.createIndex('by-employee', 'employeeId');
        queueStore.createIndex('by-status', 'syncStatus');
      }

      // Job history cache
      if (!db.objectStoreNames.contains('job_history_cache')) {
        const historyStore = db.createObjectStore('job_history_cache', { keyPath: 'id' });
        historyStore.createIndex('by-employee', 'employeeId');
      }

      // Auth cache (PIN hash)
      if (!db.objectStoreNames.contains('auth_cache')) {
        db.createObjectStore('auth_cache', { keyPath: 'employeeId' });
      }
    },
  });

  return dbInstance;
}

// ─── Storage Utility Functions ───────────────────────────────────────────────

export async function clearAllOfflineData(): Promise<void> {
  const db = await getOfflineDB();
  await db.clear('reference_data');
  await db.clear('offline_queue');
  await db.clear('job_history_cache');
  await db.clear('auth_cache');
}

export async function clearEmployeeData(employeeId: number): Promise<void> {
  const db = await getOfflineDB();
  
  // Clear reference data for this employee
  const refTypes = ['clients', 'locations', 'areas', 'customFields', 'suggestions'];
  for (const type of refTypes) {
    await db.delete('reference_data', `${type}_${employeeId}`);
  }
  
  // Clear offline queue for this employee
  const queueTx = db.transaction('offline_queue', 'readwrite');
  const queueIndex = queueTx.store.index('by-employee');
  const queueCursor = await queueIndex.openCursor(IDBKeyRange.only(employeeId));
  while (queueCursor) {
    await queueCursor.delete();
    await queueCursor.continue();
  }
  await queueTx.done;
  
  // Clear auth cache
  await db.delete('auth_cache', employeeId);
}

export async function getStorageEstimate(): Promise<{ used: number; quota: number; percentUsed: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentUsed: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
    };
  }
  return { used: 0, quota: 0, percentUsed: 0 };
}

export async function isStorageNearQuota(thresholdPercent: number = 80): Promise<boolean> {
  const { percentUsed } = await getStorageEstimate();
  return percentUsed >= thresholdPercent;
}
