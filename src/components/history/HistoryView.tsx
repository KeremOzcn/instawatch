import React, { useState } from "react";
import { Snapshot } from "../../model/snapshot";
import { diffSnapshots } from "../../utils/snapshot-diff";
import { SnapshotTimeline } from "./SnapshotTimeline";
import { SnapshotDiffPanel } from "./SnapshotDiffPanel";

interface HistoryViewProps {
  snapshots: readonly Snapshot[];
  currentSnapshotId: string | null;
  onDelete: (id: string) => void;
}

export const HistoryView = ({ snapshots, currentSnapshotId, onDelete }: HistoryViewProps) => {
  const currentSnap = snapshots.find(s => s.id === currentSnapshotId) ?? snapshots[snapshots.length - 1] ?? null;
  const otherSnapshots = snapshots.filter(s => s.id !== currentSnap?.id);

  const defaultPrev = otherSnapshots.length > 0 ? otherSnapshots[otherSnapshots.length - 1].id : null;
  const [selectedPrevId, setSelectedPrevId] = useState<string | null>(defaultPrev);

  if (snapshots.length < 2) {
    return (
      <div className="history-view history-view--empty">
        <div className="history-empty-state">
          <h2>Geçmiş</h2>
          <p>Değişiklikleri görmek için en az <strong>2 tarama</strong> gereklidir.</p>
          <p>İlk taramanız kaydedildi. Bir sonraki taramanın ardından karşılaştırma burada görünecek.</p>
        </div>
      </div>
    );
  }

  const prevSnap = snapshots.find(s => s.id === selectedPrevId) ?? null;
  const diff = prevSnap && currentSnap ? diffSnapshots(prevSnap, currentSnap) : null;

  return (
    <div className="history-view">
      <SnapshotTimeline
        snapshots={snapshots}
        selectedPrevId={selectedPrevId}
        currentSnapshotId={currentSnap?.id ?? null}
        onSelect={setSelectedPrevId}
        onDelete={(id) => {
          if (id === selectedPrevId) {
            const remaining = snapshots.filter(s => s.id !== id && s.id !== currentSnap?.id);
            setSelectedPrevId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
          }
          onDelete(id);
        }}
      />
      <SnapshotDiffPanel diff={diff} />
    </div>
  );
};
