import React from "react";
import { Snapshot, SnapshotDiff } from "../../model/snapshot";

interface SnapshotStatsProps {
  prev: Snapshot;
  curr: Snapshot;
  diff: SnapshotDiff;
}

const fmt = (n: number) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(n));

export const SnapshotStats = ({ prev, curr, diff }: SnapshotStatsProps) => {
  const followerDelta = curr.followers.length - prev.followers.length;
  const followingDelta = curr.following.length - prev.following.length;

  return (
    <div className="snapshot-stats">
      <div className="snapshot-stats-dates">
        <span className="snapshot-stats-range">{fmt(prev.timestamp)} → {fmt(curr.timestamp)}</span>
      </div>
      <div className="snapshot-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Takipçi</span>
          <span className="stat-value">{curr.followers.length.toLocaleString()}</span>
          <span className={`stat-delta ${followerDelta >= 0 ? 'pos' : 'neg'}`}>
            {followerDelta >= 0 ? '+' : ''}{followerDelta}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Takip</span>
          <span className="stat-value">{curr.following.length.toLocaleString()}</span>
          <span className={`stat-delta ${followingDelta >= 0 ? 'pos' : 'neg'}`}>
            {followingDelta >= 0 ? '+' : ''}{followingDelta}
          </span>
        </div>
        <div className="stat-card stat-card--danger">
          <span className="stat-label">Takipten Çıktı</span>
          <span className="stat-value">{diff.unfollowed_me.length + diff.mutual_unfollowed.length}</span>
        </div>
        <div className="stat-card stat-card--success">
          <span className="stat-label">Yeni Takipçi</span>
          <span className="stat-value">{diff.new_follower.length}</span>
        </div>
        <div className="stat-card stat-card--warning">
          <span className="stat-label">Takipten Çıktım</span>
          <span className="stat-value">{diff.i_unfollowed.length + diff.mutual_unfollowed.length}</span>
        </div>
        <div className="stat-card stat-card--purple">
          <span className="stat-label">Karşılıklı</span>
          <span className="stat-value">{diff.mutual_unfollowed.length}</span>
        </div>
      </div>
    </div>
  );
};
