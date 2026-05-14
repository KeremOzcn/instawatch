import React from "react";
import { UserNode } from "../model/user";
import { exportToCSV, exportToJSON } from "../utils/utils";
import { Snapshot } from "../model/snapshot";

interface ExportPageProps {
  followingResults: readonly UserNode[];
  followersResults: readonly UserNode[];
  snapshots: readonly Snapshot[];
}

const exportSnapshotsJSON = (snapshots: readonly Snapshot[]) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshots, null, 2));
  const a = document.createElement("a");
  a.href = dataStr;
  a.download = "instawatch_snapshots.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const ExportPage = ({ followingResults, followersResults, snapshots }: ExportPageProps) => {
  return (
    <div className="iw-page">
      <div className="iw-page-header">
        <h2>Dışa Aktar</h2>
        <p>Tarama verilerini farklı formatlarda indir.</p>
      </div>

      <div className="iw-export-grid">
        <div className="iw-export-card">
          <div className="iw-export-card-header">
            <span className="iw-export-card-icon">↑</span>
            <div>
              <h3>Takip Edilenler</h3>
              <p>{followingResults.length.toLocaleString()} kullanıcı</p>
            </div>
          </div>
          <div className="iw-export-actions">
            <button className="iw-export-btn iw-export-btn--json" onClick={() => exportToJSON(followingResults)}>JSON indir</button>
            <button className="iw-export-btn iw-export-btn--csv" onClick={() => exportToCSV(followingResults)}>CSV indir</button>
          </div>
        </div>

        <div className="iw-export-card">
          <div className="iw-export-card-header">
            <span className="iw-export-card-icon">↓</span>
            <div>
              <h3>Takipçiler</h3>
              <p>{followersResults.length.toLocaleString()} kullanıcı</p>
            </div>
          </div>
          <div className="iw-export-actions">
            <button className="iw-export-btn iw-export-btn--json" onClick={() => exportToJSON(followersResults)}>JSON indir</button>
            <button className="iw-export-btn iw-export-btn--csv" onClick={() => exportToCSV(followersResults)}>CSV indir</button>
          </div>
        </div>

        <div className="iw-export-card iw-export-card--full">
          <div className="iw-export-card-header">
            <span className="iw-export-card-icon">⌚</span>
            <div>
              <h3>Geçmiş Snapshot'lar</h3>
              <p>{snapshots.length} snapshot — tüm geçmiş verisi</p>
            </div>
          </div>
          <div className="iw-export-actions">
            <button
              className="iw-export-btn iw-export-btn--json"
              onClick={() => exportSnapshotsJSON(snapshots)}
              disabled={snapshots.length === 0}
            >
              JSON indir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
