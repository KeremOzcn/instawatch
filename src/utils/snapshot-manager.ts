import { LeanUserNode, Snapshot } from "../model/snapshot";
import { UserNode } from "../model/user";
import { MAX_SNAPSHOTS, SNAPSHOTS_STORAGE_KEY } from "../constants/constants";

interface StorageSchema {
  version: 1;
  snapshots: Snapshot[];
}

export function toLeanUser(u: UserNode): LeanUserNode {
  return {
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    profile_pic_url: u.profile_pic_url,
    is_private: u.is_private,
    is_verified: u.is_verified,
  };
}

export function loadSnapshots(): readonly Snapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StorageSchema;
    if (!parsed || !Array.isArray(parsed.snapshots)) return [];
    return parsed.snapshots;
  } catch {
    return [];
  }
}

export function pruneSnapshots(snapshots: readonly Snapshot[]): readonly Snapshot[] {
  if (snapshots.length <= MAX_SNAPSHOTS) return snapshots;
  return snapshots.slice(snapshots.length - MAX_SNAPSHOTS);
}

export function saveSnapshot(snap: Snapshot): readonly Snapshot[] {
  const existing = loadSnapshots();
  const updated = pruneSnapshots([...existing, snap]);
  const schema: StorageSchema = { version: 1, snapshots: [...updated] };
  try {
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(schema));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      const trimmed = updated.slice(1);
      try {
        localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify({ version: 1, snapshots: [...trimmed] }));
        return trimmed;
      } catch {
        return existing;
      }
    }
  }
  return updated;
}

export function deleteSnapshot(id: string): readonly Snapshot[] {
  const existing = loadSnapshots();
  const updated = existing.filter(s => s.id !== id);
  const schema: StorageSchema = { version: 1, snapshots: [...updated] };
  try {
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(schema));
  } catch {
    // ignore
  }
  return updated;
}
