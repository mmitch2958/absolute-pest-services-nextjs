/**
 * Offline status banner component
 * SC-OFFLINE-001: Offline Mode for Field Technicians
 */

import { useConnectionStatus, ConnectionStatus } from './connection-monitor';
import { useEffect, useState } from 'react';
import { getPendingCount } from './offline-queue';
import { Loader2, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface OfflineBannerProps {
  employeeId?: number;
  onSyncClick?: () => void;
}

export function OfflineBanner({ employeeId, onSyncClick }: OfflineBannerProps) {
  const connection = useConnectionStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  
  useEffect(() => {
    if (employeeId) {
      getPendingCount(employeeId).then(setPendingCount);
    }
  }, [employeeId, connection.status]);
  
  const handleSync = async () => {
    setSyncing(true);
    try {
      onSyncClick?.();
    } finally {
      setTimeout(() => setSyncing(false), 2000);
    }
  };
  
  // Don't show banner when fully online and no pending items
  if (connection.status === 'online' && pendingCount === 0) {
    return null;
  }
  
  return (
    <div className="w-full">
      {connection.status === 'syncing' || syncing ? (
        // Syncing state - amber
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            Syncing {pendingCount > 0 ? `${pendingCount} job log(s)...` : '...'}
          </span>
        </div>
      ) : connection.status === 'offline' ? (
        // Offline state - red
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-800">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              You're offline. Job logs will be saved and synced when you reconnect.
            </span>
          </div>
          {pendingCount > 0 && (
            <span className="text-sm text-red-600">
              {pendingCount} pending
            </span>
          )}
        </div>
      ) : connection.status === 'online' && pendingCount > 0 ? (
        // Online but have pending items - show sync button
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {pendingCount} job log(s) pending sync
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Now
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// Compact version for use in other components
export function ConnectionIndicator({ className = '' }: { className?: string }) {
  const { status } = useConnectionStatus();
  
  if (status === 'online') {
    return (
      <div className={`flex items-center gap-1 text-green-600 ${className}`}>
        <Wifi className="h-4 w-4" />
        <span className="text-xs">Online</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-1 text-red-600 ${className}`}>
      <WifiOff className="h-4 w-4" />
      <span className="text-xs">Offline</span>
    </div>
  );
}
