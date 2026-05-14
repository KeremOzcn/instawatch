import React from "react";
import { Snapshot } from "../model/snapshot";
import { diffSnapshots } from "../utils/snapshot-diff";

interface StatisticsProps {
  snapshots: readonly Snapshot[];
}

const fmt = (n: number) =>
  new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(n));

const delta = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export const Statistics = ({ snapshots }: StatisticsProps) => {
  if (snapshots.length === 0) {
    return (
      <div className="iw-page-empty">
        <div className="iw-empty-icon">◎</div>
        <h3>Henüz veri yok</h3>
        <p>İstatistikleri görmek için en az bir tarama yapın.</p>
      </div>
    );
  }

  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

  const rows = sorted.map((snap, i) => {
    const prev = sorted[i - 1];
    const diff = prev ? diffSnapshots(prev, snap) : null;
    const followerDelta = prev ? snap.followers.length - prev.followers.length : null;
    const followingDelta = prev ? snap.following.length - prev.following.length : null;
    return { snap, diff, followerDelta, followingDelta };
  });

  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const totalFollowerGrowth = latest.followers.length - first.followers.length;

  return (
    <div className="iw-page">
      <div className="iw-page-header">
        <h2>İstatistikler</h2>
        <p>{sorted.length} tarama · {fmt(first.timestamp)} — {fmt(latest.timestamp)}</p>
      </div>

      <div className="iw-stat-overview">
        <div className="iw-stat-overview-card">
          <span className="iw-stat-overview-label">Toplam Tarama</span>
          <span className="iw-stat-overview-value">{sorted.length}</span>
        </div>
        <div className="iw-stat-overview-card">
          <span className="iw-stat-overview-label">Güncel Takipçi</span>
          <span className="iw-stat-overview-value">{latest.followers.length.toLocaleString()}</span>
        </div>
        <div className="iw-stat-overview-card">
          <span className="iw-stat-overview-label">Toplam Büyüme</span>
          <span className={`iw-stat-overview-value ${totalFollowerGrowth >= 0 ? 'pos' : 'neg'}`}>
            {delta(totalFollowerGrowth)}
          </span>
        </div>
        <div className="iw-stat-overview-card">
          <span className="iw-stat-overview-label">Güncel Takip</span>
          <span className="iw-stat-overview-value">{latest.following.length.toLocaleString()}</span>
        </div>
      </div>

      <div className="iw-stat-table-wrap">
        <table className="iw-stat-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Takipçi</th>
              <th>Δ Takipçi</th>
              <th>Takip</th>
              <th>Δ Takip</th>
              <th>Takipten Çıktı</th>
              <th>Yeni Takipçi</th>
              <th>Karşılıklı</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ snap, diff, followerDelta, followingDelta }) => (
              <tr key={snap.id}>
                <td className="iw-stat-date">{fmt(snap.timestamp)}</td>
                <td>{snap.followers.length.toLocaleString()}</td>
                <td className={followerDelta === null ? '' : followerDelta >= 0 ? 'pos' : 'neg'}>
                  {followerDelta === null ? '—' : delta(followerDelta)}
                </td>
                <td>{snap.following.length.toLocaleString()}</td>
                <td className={followingDelta === null ? '' : followingDelta >= 0 ? 'pos' : 'neg'}>
                  {followingDelta === null ? '—' : delta(followingDelta)}
                </td>
                <td className={diff && (diff.unfollowed_me.length + diff.mutual_unfollowed.length) > 0 ? 'neg' : ''}>
                  {diff ? diff.unfollowed_me.length + diff.mutual_unfollowed.length : '—'}
                </td>
                <td className={diff && diff.new_follower.length > 0 ? 'pos' : ''}>
                  {diff ? diff.new_follower.length : '—'}
                </td>
                <td className={diff && diff.mutual_unfollowed.length > 0 ? 'purple' : ''}>
                  {diff ? diff.mutual_unfollowed.length : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
