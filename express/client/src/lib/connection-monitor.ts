/**
 * Connection monitoring for offline mode
 * SC-OFFLINE-001: Offline Mode for Field Technicians
 * 
 * Two-layer detection:
 * 1. navigator.onLine + window events (fast, unreliable alone)
 * 2. Periodic heartbeat to /api/ping (authoritative)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'syncing';

interface ConnectionState {
  status: ConnectionStatus;
  isOnline: boolean;
  lastHeartbeat: Date | null;
  heartbeatFailed: boolean;
}

// Configuration
const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT_MS = 5000;   // 5 seconds
const MAX_HEARTBEAT_AGE_MS = 60000;  // 60 seconds - considered offline if no successful heartbeat in this time

let connectionStatusCallback: ((state: ConnectionState) => void) | null = null;
let lastHeartbeatSuccess = false;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let listeners: Set<(state: ConnectionState) => void> = new Set();

// ─── Heartbeat Function ─────────────────────────────────────────────────────

async function checkHeartbeat(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT_MS);
    
    const response = await fetch('/api/ping', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    const isOk = response.ok;
    lastHeartbeatSuccess = isOk;
    return isOk;
  } catch {
    lastHeartbeatSuccess = false;
    return false;
  }
}

function getConnectionState(): ConnectionState {
  const navigatorOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const now = new Date();
  
  // Consider online only if navigator says online AND we had a recent successful heartbeat
  const isOnline = navigatorOnline && lastHeartbeatSuccess;
  
  return {
    status: isOnline ? 'online' : 'offline',
    isOnline,
    lastHeartbeat: lastHeartbeatSuccess ? now : null,
    heartbeatFailed: !lastHeartbeatSuccess
  };
}

function notifyListeners() {
  const state = getConnectionState();
  listeners.forEach(callback => callback(state));
}

// ─── Start/Stop Monitoring ──────────────────────────────────────────────────

function startHeartbeat() {
  if (heartbeatTimer) return;
  
  // Initial check
  checkHeartbeat().then(notifyListeners);
  
  // Periodic heartbeat
  heartbeatTimer = setInterval(async () => {
    await checkHeartbeat();
    notifyListeners();
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// ─── React Hook ─────────────────────────────────────────────────────────────

export function useConnectionStatus() {
  const [state, setState] = useState<ConnectionState>(() => getConnectionState());

  useEffect(() => {
    const callback = (newState: ConnectionState) => {
      setState(newState);
    };
    
    listeners.add(callback);
    startHeartbeat();
    
    // Listen to browser online/offline events
    const handleOnline = () => {
      // Immediate heartbeat on online event
      checkHeartbeat().then(notifyListeners);
    };
    
    const handleOffline = () => {
      lastHeartbeatSuccess = false;
      notifyListeners();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      listeners.delete(callback);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Only stop heartbeat if no more listeners
      if (listeners.size === 0) {
        stopHeartbeat();
      }
    };
  }, []);

  return state;
}

// ─── Trigger Sync on Reconnect ──────────────────────────────────────────────

let syncOnReconnectCallback: (() => void) | null = null;

export function onReconnect(callback: () => void) {
  syncOnReconnectCallback = callback;
}

export function triggerSyncIfNeeded() {
  const state = getConnectionState();
  if (state.isOnline && syncOnReconnectCallback) {
    syncOnReconnectCallback();
  }
}

// Manual trigger for testing
export async function checkConnectionNow(): Promise<boolean> {
  const success = await checkHeartbeat();
  notifyListeners();
  return success;
}
