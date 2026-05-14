import React from "react";
import { Snapshot } from "../../model/snapshot";

interface SnapshotTimelineProps {
  snapshots: readonly Snapshot[];
  selectedPrevId: string | null;
  currentSnapshotId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const SnapshotTimeline = ({
  snapshots,
  selectedPrevId,
  currentSnapshotId,
  onSelect,
  onDelete,
}: SnapshotTimelineProps) => {
  const sorted = [...snapshots].reverse();

  return (
    <aside className="snapshot-timeline">
      <h3 className="timeline-title">Geçmiş Taramalar</h3>
      {sorted.length === 0 ? (
        <p className="timeline-empty">Henüz tarama yok</p>
      ) : (
        <ul className="timeline-list">
          {sorted.map((snap, idx) => {
            const isCurrent = snap.id === currentSnapshotId;
            const isSelected = snap.id === selectedPrevId;
            return (
              <li
                key={snap.id}
                className={`timeline-item ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => !isCurrent && onSelect(snap.id)}
                title={isCurrent ? 'Bu aktif tarama' : 'Karşılaştır'}
              >
                <div className="timeline-item-header">
                  <span className="timeline-date">{formatDate(snap.timestamp)}</span>
                  {isCurrent && <span className="timeline-badge">Şimdiki</span>}
                  {idx === 0 && !isCurrent && <span className="timeline-badge timeline-badge--latest">Son</span>}
                </div>
                <div className="timeline-stats">
                  <span>↑ {snap.following.length} takip</span>
                  <span>↓ {snap.followers.length} takipçi</span>
                </div>
                {!isCurrent && (
                  <button
                    className="timeline-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Bu taramayı silmek istediğinize emin misiniz?')) {
                        onDelete(snap.id);
                      }
                    }}
                    title="Sil"
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};
