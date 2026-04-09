'use client';

import React, { useState, useCallback, createContext, useContext } from 'react';
import { Lock, Unlock, Shield, AlertTriangle, Eye, EyeOff, Edit3, Move, Trash2 } from 'lucide-react';

interface LockState {
  locked: boolean;
  reason?: string;
  lockedBy?: string;
  lockedAt?: Date;
  permissions: {
    canEdit: boolean;
    canMove: boolean;
    canDelete: boolean;
    canView: boolean;
  };
}

interface ContentLock {
  id: string;
  type: 'section' | 'element' | 'field';
  name: string;
  state: LockState;
}

interface LockingContextType {
  locks: Map<string, ContentLock>;
  addLock: (lock: ContentLock) => void;
  removeLock: (id: string) => void;
  updateLock: (id: string, updates: Partial<LockState>) => void;
  isLocked: (id: string) => boolean;
  getLock: (id: string) => ContentLock | undefined;
  canEdit: (id: string) => boolean;
  canMove: (id: string) => boolean;
  canDelete: (id: string) => boolean;
  canView: (id: string) => boolean;
}

const LockingContext = createContext<LockingContextType | null>(null);

export const useLocking = () => {
  const context = useContext(LockingContext);
  if (!context) {
    throw new Error('useLocking must be used within a LockingProvider');
  }
  return context;
};

export const LockingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locks, setLocks] = useState<Map<string, ContentLock>>(new Map());

  const addLock = useCallback((lock: ContentLock) => {
    setLocks(prev => new Map(prev).set(lock.id, lock));
  }, []);

  const removeLock = useCallback((id: string) => {
    setLocks(prev => {
      const newLocks = new Map(prev);
      newLocks.delete(id);
      return newLocks;
    });
  }, []);

  const updateLock = useCallback((id: string, updates: Partial<LockState>) => {
    setLocks(prev => {
      const newLocks = new Map(prev);
      const existingLock = newLocks.get(id);
      if (existingLock) {
        newLocks.set(id, {
          ...existingLock,
          state: { ...existingLock.state, ...updates }
        });
      }
      return newLocks;
    });
  }, []);

  const isLocked = useCallback((id: string) => {
    const lock = locks.get(id);
    return lock?.state.locked || false;
  }, [locks]);

  const getLock = useCallback((id: string) => {
    return locks.get(id);
  }, [locks]);

  const canEdit = useCallback((id: string) => {
    const lock = locks.get(id);
    return lock?.state.permissions.canEdit !== false;
  }, [locks]);

  const canMove = useCallback((id: string) => {
    const lock = locks.get(id);
    return lock?.state.permissions.canMove !== false;
  }, [locks]);

  const canDelete = useCallback((id: string) => {
    const lock = locks.get(id);
    return lock?.state.permissions.canDelete !== false;
  }, [locks]);

  const canView = useCallback((id: string) => {
    const lock = locks.get(id);
    return lock?.state.permissions.canView !== false;
  }, [locks]);

  const value: LockingContextType = {
    locks,
    addLock,
    removeLock,
    updateLock,
    isLocked,
    getLock,
    canEdit,
    canMove,
    canDelete,
    canView
  };

  return (
    <LockingContext.Provider value={value}>
      {children}
    </LockingContext.Provider>
  );
};

interface LockControlProps {
  id: string;
  type: 'section' | 'element' | 'field';
  name: string;
  initialLocked?: boolean;
  onLockChange?: (locked: boolean) => void;
  showReason?: boolean;
  compact?: boolean;
}

export const LockControl: React.FC<LockControlProps> = ({
  id,
  type,
  name,
  initialLocked = false,
  onLockChange,
  showReason = false,
  compact = false
}) => {
  const { addLock, removeLock, updateLock, isLocked, getLock } = useLocking();
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockReason, setLockReason] = useState('');

  React.useEffect(() => {
    if (initialLocked) {
      addLock({
        id,
        type,
        name,
        state: {
          locked: true,
          lockedBy: 'user',
          lockedAt: new Date(),
          permissions: {
            canEdit: false,
            canMove: false,
            canDelete: false,
            canView: true
          }
        }
      });
    }
  }, [id, type, name, initialLocked, addLock]);

  const handleToggleLock = useCallback(() => {
    if (isLocked(id)) {
      removeLock(id);
      onLockChange?.(false);
    } else {
      setShowLockDialog(true);
    }
  }, [id, isLocked, removeLock, onLockChange]);

  const handleConfirmLock = useCallback(() => {
    addLock({
      id,
      type,
      name,
      state: {
        locked: true,
        reason: lockReason || 'Manually locked',
        lockedBy: 'user',
        lockedAt: new Date(),
        permissions: {
          canEdit: false,
          canMove: false,
          canDelete: false,
          canView: true
        }
      }
    });
    setShowLockDialog(false);
    setLockReason('');
    onLockChange?.(true);
  }, [id, type, name, lockReason, addLock, onLockChange]);

  const locked = isLocked(id);
  const lock = getLock(id);

  if (compact) {
    return (
      <button
        onClick={handleToggleLock}
        className={`p-1.5 rounded-lg transition-all ${
          locked 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={locked ? 'Unlock content' : 'Lock content'}
      >
        {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleLock}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            locked 
              ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {locked ? 'Locked' : 'Unlocked'}
          </span>
        </button>

        {showReason && locked && lock?.state.reason && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <AlertTriangle className="w-3 h-3" />
            <span>{lock.state.reason}</span>
          </div>
        )}
      </div>

      {/* Lock Confirmation Dialog */}
      {showLockDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lock Content</h3>
                <p className="text-sm text-gray-600">
                  Lock &ldquo;{name}&rdquo; to prevent accidental changes
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Why are you locking this content?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Locked content will be:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-1">
                      <Edit3 className="w-3 h-3" />
                      <span>Not editable</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <Move className="w-3 h-3" />
                      <span>Not movable</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      <span>Not deletable</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLockDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLock}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Lock Content
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface LockedContentProps {
  id: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showOverlay?: boolean;
}

export const LockedContent: React.FC<LockedContentProps> = ({
  id,
  children,
  fallback,
  showOverlay = true
}) => {
  const { isLocked, canEdit, canMove, canDelete, canView } = useLocking();
  const locked = isLocked(id);
  const canInteract = canEdit(id) && canMove(id) && canDelete(id);

  if (!locked || canInteract) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!canView(id)) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">Content Locked</p>
          <p className="text-xs text-gray-500 mt-1">You don&apos;t have permission to view this content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {children}
      {showOverlay && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm border-2 border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <Lock className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-700 font-medium">Content Locked</p>
            <p className="text-xs text-red-600 mt-1">This content is locked and cannot be edited</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface PermissionBadgeProps {
  id: string;
  action: 'edit' | 'move' | 'delete' | 'view';
  compact?: boolean;
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({
  id,
  action,
  compact = false
}) => {
  const { canEdit, canMove, canDelete, canView } = useLocking();

  const getPermission = () => {
    switch (action) {
      case 'edit': return canEdit(id);
      case 'move': return canMove(id);
      case 'delete': return canDelete(id);
      case 'view': return canView(id);
      default: return true;
    }
  };

  const getIcon = () => {
    switch (action) {
      case 'edit': return <Edit3 className="w-3 h-3" />;
      case 'move': return <Move className="w-3 h-3" />;
      case 'delete': return <Trash2 className="w-3 h-3" />;
      case 'view': return <Eye className="w-3 h-3" />;
      default: return null;
    }
  };

  const getLabel = () => {
    switch (action) {
      case 'edit': return 'Edit';
      case 'move': return 'Move';
      case 'delete': return 'Delete';
      case 'view': return 'View';
      default: return 'Unknown';
    }
  };

  const hasPermission = getPermission();
  const icon = getIcon();

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        hasPermission 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {icon}
        {hasPermission ? 'Allowed' : 'Denied'}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
      hasPermission 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      {icon}
      <span className="font-medium">{getLabel()}</span>
      <span className="text-xs opacity-75">
        {hasPermission ? 'Allowed' : 'Denied'}
      </span>
    </div>
  );
};

interface LockStatusProps {
  id: string;
  showDetails?: boolean;
}

export const LockStatus: React.FC<LockStatusProps> = ({
  id,
  showDetails = false
}) => {
  const { isLocked, getLock } = useLocking();
  const locked = isLocked(id);
  const lock = getLock(id);

  if (!locked) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Unlock className="w-4 h-4" />
        <span className="text-sm font-medium">Unlocked</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-600">
      <Lock className="w-4 h-4" />
      <span className="text-sm font-medium">Locked</span>
      {showDetails && lock && (
        <div className="text-xs text-gray-500">
          {lock.state.reason && <span>• {lock.state.reason}</span>}
          {lock.state.lockedAt && (
            <span>• {lock.state.lockedAt.toLocaleTimeString()}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default LockingProvider;
